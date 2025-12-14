/**
 * commandHistory.ts
 * 
 * Command pattern implementation for undo/redo functionality.
 * Maintains history stack with automatic pruning.
 * 
 * @module services/commandHistory
 */

import { CANVAS_CONSTANTS } from '../components/litigation/canvasConstants';
import { TypedWorkflowNode } from '../components/litigation/nodeTypes';
import { WorkflowConnection } from '../components/workflow/builder/types';

/**
 * Base command interface
 */
export interface Command {
  execute(): void;
  undo(): void;
  description: string;
}

/**
 * Graph state snapshot
 */
export interface GraphSnapshot {
  nodes: TypedWorkflowNode[];
  connections: WorkflowConnection[];
}

/**
 * Command History Manager
 */
export class CommandHistory {
  private undoStack: Command[] = [];
  private redoStack: Command[] = [];
  private maxSize: number;

  constructor(maxSize: number = CANVAS_CONSTANTS.MAX_HISTORY_SIZE) {
    this.maxSize = maxSize;
  }

  /**
   * Execute a command and add to history
   */
  execute(command: Command): void {
    command.execute();
    this.undoStack.push(command);
    this.redoStack = []; // Clear redo stack on new command

    // Prune history if exceeds max size
    if (this.undoStack.length > this.maxSize) {
      this.undoStack.shift();
    }
  }

  /**
   * Undo last command
   */
  undo(): boolean {
    const command = this.undoStack.pop();
    if (!command) return false;

    command.undo();
    this.redoStack.push(command);
    return true;
  }

  /**
   * Redo last undone command
   */
  redo(): boolean {
    const command = this.redoStack.pop();
    if (!command) return false;

    command.execute();
    this.undoStack.push(command);
    return true;
  }

  /**
   * Check if undo is available
   */
  canUndo(): boolean {
    return this.undoStack.length > 0;
  }

  /**
   * Check if redo is available
   */
  canRedo(): boolean {
    return this.redoStack.length > 0;
  }

  /**
   * Get undo stack size
   */
  getUndoCount(): number {
    return this.undoStack.length;
  }

  /**
   * Get redo stack size
   */
  getRedoCount(): number {
    return this.redoStack.length;
  }

  /**
   * Clear all history
   */
  clear(): void {
    this.undoStack = [];
    this.redoStack = [];
  }

  /**
   * Get last command description
   */
  getLastCommandDescription(): string | null {
    const lastCommand = this.undoStack[this.undoStack.length - 1];
    return lastCommand ? lastCommand.description : null;
  }
}

/**
 * Concrete Commands for Graph Operations
 */

/**
 * Add Node Command
 */
export class AddNodeCommand implements Command {
  description: string;

  constructor(
    private node: TypedWorkflowNode,
    private addFn: (node: TypedWorkflowNode) => void,
    private removeFn: (id: string) => void
  ) {
    this.description = `Add ${node.type} node "${node.label}"`;
  }

  execute(): void {
    this.addFn(this.node);
  }

  undo(): void {
    this.removeFn(this.node.id);
  }
}

/**
 * Delete Node Command
 */
export class DeleteNodeCommand implements Command {
  description: string;

  constructor(
    private node: TypedWorkflowNode,
    private relatedConnections: WorkflowConnection[],
    private addFn: (node: TypedWorkflowNode) => void,
    private removeFn: (id: string) => void,
    private addConnectionFn: (conn: WorkflowConnection) => void,
    private removeConnectionFn: (id: string) => void
  ) {
    this.description = `Delete ${node.type} node "${node.label}"`;
  }

  execute(): void {
    // Remove connections first
    this.relatedConnections.forEach(conn => this.removeConnectionFn(conn.id));
    this.removeFn(this.node.id);
  }

  undo(): void {
    this.addFn(this.node);
    // Restore connections
    this.relatedConnections.forEach(conn => this.addConnectionFn(conn));
  }
}

/**
 * Update Node Command
 */
export class UpdateNodeCommand implements Command {
  description: string;

  constructor(
    private nodeId: string,
    private oldState: Partial<TypedWorkflowNode>,
    private newState: Partial<TypedWorkflowNode>,
    private updateFn: (id: string, updates: Partial<TypedWorkflowNode>) => void
  ) {
    this.description = `Update node "${nodeId}"`;
  }

  execute(): void {
    this.updateFn(this.nodeId, this.newState);
  }

  undo(): void {
    this.updateFn(this.nodeId, this.oldState);
  }
}

/**
 * Add Connection Command
 */
export class AddConnectionCommand implements Command {
  description: string;

  constructor(
    private connection: WorkflowConnection,
    private addFn: (conn: WorkflowConnection) => void,
    private removeFn: (id: string) => void
  ) {
    this.description = `Add connection from ${connection.from} to ${connection.to}`;
  }

  execute(): void {
    this.addFn(this.connection);
  }

  undo(): void {
    this.removeFn(this.connection.id);
  }
}

/**
 * Delete Connection Command
 */
export class DeleteConnectionCommand implements Command {
  description: string;

  constructor(
    private connection: WorkflowConnection,
    private addFn: (conn: WorkflowConnection) => void,
    private removeFn: (id: string) => void
  ) {
    this.description = `Delete connection from ${connection.from} to ${connection.to}`;
  }

  execute(): void {
    this.removeFn(this.connection.id);
  }

  undo(): void {
    this.addFn(this.connection);
  }
}

/**
 * Batch Command - Execute multiple commands as one
 */
export class BatchCommand implements Command {
  description: string;

  constructor(
    private commands: Command[],
    description?: string
  ) {
    this.description = description || `Batch operation (${commands.length} commands)`;
  }

  execute(): void {
    this.commands.forEach(cmd => cmd.execute());
  }

  undo(): void {
    // Undo in reverse order
    [...this.commands].reverse().forEach(cmd => cmd.undo());
  }
}

/**
 * Move Node Command
 */
export class MoveNodeCommand implements Command {
  description: string;

  constructor(
    private nodeId: string,
    private oldPosition: { x: number; y: number },
    private newPosition: { x: number; y: number },
    private updateFn: (id: string, updates: Partial<TypedWorkflowNode>) => void
  ) {
    this.description = `Move node "${nodeId}"`;
  }

  execute(): void {
    this.updateFn(this.nodeId, this.newPosition);
  }

  undo(): void {
    this.updateFn(this.nodeId, this.oldPosition);
  }
}

/**
 * Restore Graph State Command - for bulk operations
 */
export class RestoreGraphCommand implements Command {
  description: string;

  constructor(
    private oldSnapshot: GraphSnapshot,
    private newSnapshot: GraphSnapshot,
    private restoreFn: (snapshot: GraphSnapshot) => void,
    description?: string
  ) {
    this.description = description || 'Restore graph state';
  }

  execute(): void {
    this.restoreFn(this.newSnapshot);
  }

  undo(): void {
    this.restoreFn(this.oldSnapshot);
  }
}
