/**
 * graphValidationService.ts
 * 
 * Validation service for strategy graph structure before deployment.
 * Checks for graph integrity, cycles, disconnected nodes, and business rules.
 * 
 * @module services/graphValidationService
 */

import { TypedWorkflowNode, WorkflowConnection } from '@/types/workflow-types';
import { VALIDATION_MESSAGES, CANVAS_CONSTANTS } from '@/types/canvas-constants';

/**
 * Validation result interface
 */
export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
}

/**
 * Validation error interface
 */
export interface ValidationError {
  code: string;
  message: string;
  nodeId?: string;
  connectionId?: string;
}

/**
 * Validation warning interface
 */
export interface ValidationWarning {
  code: string;
  message: string;
  nodeId?: string;
}

/**
 * Graph Validation Service
 */
export class GraphValidationService {
  /**
   * Validate entire graph before deployment
   */
  static validateGraph(
    nodes: TypedWorkflowNode[],
    connections: WorkflowConnection[]
  ): ValidationResult {
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];

    // Run all validation checks
    this.validateNodeCount(nodes, errors);
    this.validateConnectionCount(connections, errors);
    this.validateStartAndEndNodes(nodes, errors);
    this.validateConnectivity(nodes, connections, errors, warnings);
    this.validateCircularDependencies(nodes, connections, errors);
    this.validateDecisionNodes(nodes, connections, warnings);
    this.validatePhaseStructure(nodes, warnings);

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
    };
  }

  /**
   * Validate node count doesn't exceed limits
   */
  private static validateNodeCount(
    nodes: TypedWorkflowNode[],
    errors: ValidationError[]
  ): void {
    if (nodes.length > CANVAS_CONSTANTS.MAX_NODES) {
      errors.push({
        code: 'MAX_NODES_EXCEEDED',
        message: VALIDATION_MESSAGES.MAX_NODES_EXCEEDED,
      });
    }
  }

  /**
   * Validate connection count doesn't exceed limits
   */
  private static validateConnectionCount(
    connections: WorkflowConnection[],
    errors: ValidationError[]
  ): void {
    if (connections.length > CANVAS_CONSTANTS.MAX_CONNECTIONS) {
      errors.push({
        code: 'MAX_CONNECTIONS_EXCEEDED',
        message: VALIDATION_MESSAGES.MAX_CONNECTIONS_EXCEEDED,
      });
    }
  }

  /**
   * Validate presence of Start and End nodes
   */
  private static validateStartAndEndNodes(
    nodes: TypedWorkflowNode[],
    errors: ValidationError[]
  ): void {
    const hasStart = nodes.some(n => n.type === 'Start');
    const hasEnd = nodes.some(n => n.type === 'End');

    if (!hasStart) {
      errors.push({
        code: 'NO_START_NODE',
        message: VALIDATION_MESSAGES.NO_START_NODE,
      });
    }

    if (!hasEnd) {
      errors.push({
        code: 'NO_END_NODE',
        message: VALIDATION_MESSAGES.NO_END_NODE,
      });
    }
  }

  /**
   * Validate graph connectivity - check for orphaned nodes
   */
  private static validateConnectivity(
    nodes: TypedWorkflowNode[],
    connections: WorkflowConnection[],
    errors: ValidationError[],
    warnings: ValidationWarning[]
  ): void {
    const startNode = nodes.find(n => n.type === 'Start');
    if (!startNode) return; // Already flagged by validateStartAndEndNodes

    // Build adjacency list
    const adjacencyList = new Map<string, string[]>();
    for (const conn of connections) {
      if (!adjacencyList.has(conn.from)) {
        adjacencyList.set(conn.from, []);
      }
      adjacencyList.get(conn.from)!.push(conn.to);
    }

    // BFS to find reachable nodes
    const reachable = new Set<string>();
    const queue: string[] = [startNode.id];
    reachable.add(startNode.id);

    while (queue.length > 0) {
      const current = queue.shift()!;
      const neighbors = adjacencyList.get(current) || [];

      for (const neighbor of neighbors) {
        if (!reachable.has(neighbor)) {
          reachable.add(neighbor);
          queue.push(neighbor);
        }
      }
    }

    // Check for unreachable nodes (excluding Comments which can be standalone)
    const unreachableNodes = nodes.filter(
      n => !reachable.has(n.id) && n.type !== 'Comment' && n.type !== 'Start'
    );

    if (unreachableNodes.length > 0) {
      warnings.push({
        code: 'DISCONNECTED_NODES',
        message: `${unreachableNodes.length} node(s) are not connected to the main workflow`,
        nodeId: unreachableNodes[0].id,
      });
    }
  }

  /**
   * Detect circular dependencies using DFS
   */
  private static validateCircularDependencies(
    nodes: TypedWorkflowNode[],
    connections: WorkflowConnection[],
    errors: ValidationError[]
  ): void {
    const adjacencyList = new Map<string, string[]>();
    for (const conn of connections) {
      if (!adjacencyList.has(conn.from)) {
        adjacencyList.set(conn.from, []);
      }
      adjacencyList.get(conn.from)!.push(conn.to);
    }

    const visited = new Set<string>();
    const recursionStack = new Set<string>();

    const hasCycle = (nodeId: string): boolean => {
      visited.add(nodeId);
      recursionStack.add(nodeId);

      const neighbors = adjacencyList.get(nodeId) || [];
      for (const neighbor of neighbors) {
        if (!visited.has(neighbor)) {
          if (hasCycle(neighbor)) {
            return true;
          }
        } else if (recursionStack.has(neighbor)) {
          return true; // Cycle detected
        }
      }

      recursionStack.delete(nodeId);
      return false;
    };

    for (const node of nodes) {
      if (!visited.has(node.id)) {
        if (hasCycle(node.id)) {
          errors.push({
            code: 'CIRCULAR_DEPENDENCY',
            message: VALIDATION_MESSAGES.CIRCULAR_DEPENDENCY,
            nodeId: node.id,
          });
          break; // One error is enough
        }
      }
    }
  }

  /**
   * Validate decision nodes have proper ports and connections
   */
  private static validateDecisionNodes(
    nodes: TypedWorkflowNode[],
    connections: WorkflowConnection[],
    warnings: ValidationWarning[]
  ): void {
    const decisionNodes = nodes.filter(n => n.type === 'Decision');

    for (const node of decisionNodes) {
      const outgoingConnections = connections.filter(c => c.from === node.id);

      if (outgoingConnections.length < 2) {
        warnings.push({
          code: 'DECISION_MISSING_BRANCHES',
          message: `Decision node "${node.label}" should have at least 2 outgoing connections`,
          nodeId: node.id,
        });
      }

      // Check if all ports are used
      const ports = node.config.ports || [];
      const usedPorts = new Set(outgoingConnections.map(c => c.fromPort).filter(Boolean));

      if (ports.length > 0 && usedPorts.size < ports.length) {
        warnings.push({
          code: 'DECISION_UNUSED_PORTS',
          message: `Decision node "${node.label}" has unused outcome ports`,
          nodeId: node.id,
        });
      }
    }
  }

  /**
   * Validate phase structure and containment
   */
  private static validatePhaseStructure(
    nodes: TypedWorkflowNode[],
    warnings: ValidationWarning[]
  ): void {
    const phaseNodes = nodes.filter(n => n.type === 'Phase');

    for (const phase of phaseNodes) {
      const childNodes = phase.config.childNodes || [];

      if (childNodes.length === 0) {
        warnings.push({
          code: 'EMPTY_PHASE',
          message: `Phase "${phase.label}" contains no child nodes`,
          nodeId: phase.id,
        });
      }

      // Validate child nodes exist
      const existingNodeIds = new Set(nodes.map(n => n.id));
      const missingChildren = childNodes.filter((id: string) => !existingNodeIds.has(id));

      if (missingChildren.length > 0) {
        warnings.push({
          code: 'PHASE_MISSING_CHILDREN',
          message: `Phase "${phase.label}" references non-existent child nodes`,
          nodeId: phase.id,
        });
      }
    }
  }

  /**
   * Validate individual connection
   */
  static validateConnection(
    connection: WorkflowConnection,
    nodes: TypedWorkflowNode[],
    existingConnections: WorkflowConnection[]
  ): ValidationError | null {
    const fromNode = nodes.find(n => n.id === connection.from);
    const toNode = nodes.find(n => n.id === connection.to);

    if (!fromNode || !toNode) {
      return {
        code: 'INVALID_CONNECTION',
        message: VALIDATION_MESSAGES.INVALID_CONNECTION,
        connectionId: connection.id,
      };
    }

    // Check for duplicate connections
    const duplicate = existingConnections.some(
      c => c.from === connection.from && c.to === connection.to && c.id !== connection.id
    );

    if (duplicate) {
      return {
        code: 'DUPLICATE_CONNECTION',
        message: VALIDATION_MESSAGES.DUPLICATE_CONNECTION,
        connectionId: connection.id,
      };
    }

    // Prevent self-loops
    if (connection.from === connection.to) {
      return {
        code: 'SELF_LOOP',
        message: 'Nodes cannot connect to themselves',
        connectionId: connection.id,
      };
    }

    return null;
  }

  /**
   * Quick validation for real-time feedback
   */
  static quickValidate(
    nodes: TypedWorkflowNode[],
    connections: WorkflowConnection[]
  ): { hasErrors: boolean; errorCount: number } {
    const result = this.validateGraph(nodes, connections);
    return {
      hasErrors: !result.isValid,
      errorCount: result.errors.length,
    };
  }
}
