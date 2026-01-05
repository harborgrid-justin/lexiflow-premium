/**
 * AI Prompt Library - Legal intelligence and document generation
 * Production-grade prompt templates for legal workflows and AI-powered legal research
 * 
 * @module services/ai/prompts
 * @description Comprehensive AI prompt library providing:
 * - **Document generation** (pleadings, motions, contracts, engagement letters)
 * - **Legal analysis** (risk assessment, contract review, clause detection)
 * - **Research assistance** (case law, statutes, Shepardizing, KeyCite-style citation analysis)
 * - **Workflow automation** (task generation, deadline calculation, strategy planning)
 * - **Docket parsing** (OCR-friendly JSON extraction from court dockets)
 * - **Billing refinement** (ABA-compliant entry rewriting, value-oriented descriptions)
 * - **Litigation strategy** (graph-based planning, decision trees, milestone tracking)
 * - **Intent mapping** (NLU command routing to system modules)
 * - **Error resolution** (developer-friendly debugging, user-friendly explanations)
 * 
 * @architecture
 * - Pattern: Functional Prompt Factory (functions returning prompt strings)
 * - AI Model: Google Gemini API (configured in geminiService.ts)
 * - Context: Prompts receive domain-specific context (case IDs, document content, user queries)
 * - Output: Most prompts request structured JSON for type-safe parsing
 * - Content limits: Text truncation for large documents (8K-20K char limits)
 * - HTML output: Draft() returns HTML-formatted content for rich rendering
 * 
 * @prompts
 * **Core Legal Operations:**
 * 1. **Draft(context, type)** - Generate legal documents (motions, briefs, contracts)
 *    - Output: HTML-formatted document (paragraphs, bold text)
 *    - Use cases: Engagement letters, demand letters, discovery responses
 * 
 * 2. **Analysis(content)** - Risk scoring and document summarization
 *    - Output: Summary + Risk Score (0-100)
 *    - Use cases: Contract review, compliance checks, due diligence
 * 
 * 3. **Review(content)** - Contract analysis (risks, missing clauses, unusual terms)
 *    - Output: Structured risk report with recommendations
 *    - Use cases: M&A contracts, vendor agreements, employment contracts
 * 
 * 4. **Critique(text)** - Senior partner-level brief critique
 *    - Output: JSON { score, strengths[], weaknesses[], suggestions[], missingAuthority[] }
 *    - Use cases: Brief review before filing, associate training, quality control
 * 
 * **Legal Research:**
 * 5. **Research(query)** - General legal research queries
 *    - Output: Research summary with authorities
 *    - Use cases: Case law searches, statute interpretation, procedural rules
 * 
 * 6. **Shepardize(citation)** - Citation history and treatment analysis (KeyCite/Shepard's-style)
 *    - Output: JSON with citation history, negative treatment, positive citations
 *    - Use cases: Cite-checking briefs, validating authority, research verification
 * 
 * **Workflow & Automation:**
 * 7. **Workflow(desc)** - Generate legal workflow steps
 *    - Output: Task list with dependencies and deadlines
 *    - Use cases: Discovery plans, trial prep, compliance audits
 * 
 * 8. **Strategy(prompt)** - Litigation strategy graph generation
 *    - Output: JSON graph with nodes (Start, End, Task, Decision, Milestone, Event, Phase)
 *    - Use cases: Trial strategy, settlement roadmap, appellate planning
 * 
 * 9. **Lint(graphData)** - Strategy graph validation and suggestions
 *    - Output: JSON { warnings[], suggestions[], nodeId references }
 *    - Use cases: Strategy review, completeness checks, logical consistency
 * 
 * **Data Processing:**
 * 10. **Docket(text)** - OCR-friendly docket parsing
 *     - Output: JSON { caseInfo, parties, docketEntries[] }
 *     - Use cases: PACER docket ingestion, ECF automation, case tracking
 * 
 * 11. **Intent(query)** - NLU command routing
 *     - Output: Module name + action + parameters
 *     - Modules: DASHBOARD, CASES, DOCKET, WORKFLOWS, MESSAGES, DISCOVERY, EVIDENCE, etc.
 *     - Use cases: Voice commands, chatbot routing, keyboard shortcuts
 * 
 * 12. **Refine(raw)** - ABA-compliant billing entry rewriting
 *     - Output: Professional billing description
 *     - Use cases: Time entry cleanup, client presentation, ethical compliance
 * 
 * 13. **ErrorResolution(errorMessage)** - User-friendly error explanations
 *     - Output: Plain text (technical cause + user-friendly suggestion)
 *     - Use cases: Error handling, support automation, user education
 * 
 * @security
 * - Input sanitization: All user inputs passed to AI should be validated first
 * - Content truncation: Large documents truncated to prevent token overflow
 * - XSS prevention: HTML output from Draft() should be rendered via dangerouslySetInnerHTML with sanitization
 * - Context isolation: Case IDs and user data in prompts should be sanitized
 * - API key protection: Gemini API key stored in localStorage (demo mode) or backend secrets (production)
 * 
 * @performance
 * - Prompt length: Optimized to minimize token usage
 * - Context limits: 8K-20K char truncation for large documents
 * - Caching: Consider prompt result caching in queryClient for repeated queries
 * - Streaming: Future enhancement for real-time draft generation
 * 
 * @usage
 * ```typescript
 * import { Prompts } from './prompts';
 * import { generateAIContent } from '../geminiService';
 * 
 * // Generate legal document
 * const engagementLetter = await generateAIContent(
 *   Prompts.Draft('Client: Acme Corp, Matter: Contract Review', 'engagement letter')
 * );
 * // Returns: HTML-formatted engagement letter
 * 
 * // Analyze contract risk
 * const analysis = await generateAIContent(
 *   Prompts.Analysis(contractText)
 * );
 * // Returns: "Summary: ... Risk Score: 72/100"
 * 
 * // Shepardize citation (KeyCite-style)
 * const citationReport = await generateAIContent(
 *   Prompts.Shepardize('Marbury v. Madison, 5 U.S. 137 (1803)')
 * );
 * // Returns: JSON { history, treatment, citations[] }
 * 
 * // Generate litigation strategy graph
 * const strategy = await generateAIContent(
 *   Prompts.Strategy('Breach of contract case with damages exceeding $1M')
 * );
 * // Returns: JSON { nodes[], connections[] } for strategy visualization
 * 
 * // Route user command
 * const intent = await generateAIContent(
 *   Prompts.Intent('Show me all cases for Martinez')
 * );
 * // Returns: { module: 'CASES', action: 'filter', params: { client: 'Martinez' } }
 * ```
 * 
 * @integration
 * - AI Service: geminiService.ts (Google Gemini API)
 * - Document Editor: Draft() output rendered in rich text editors
 * - Strategy Builder: Strategy() + Lint() power LitigationBuilder component
 * - Research: Research() + Shepardize() integrated with Research module
 * - Billing: Refine() used in TimeTracking and BillingDomain
 * - Docket: Docket() used in DocketIngestion workflow
 * 
 * @testing
 * **Test Coverage:**
 * - Prompt completeness: All parameters correctly interpolated
 * - JSON parsing: Structured outputs parse successfully
 * - Token limits: Large documents truncated properly
 * - Edge cases: Empty context, special characters, code injection attempts
 * - Output validation: AI responses match expected schema
 */

export const Prompts = {
  Draft: (context: string, type: string) => 
    `You are an expert legal aide. Draft a professional ${type}. 
    Context: ${context}. 
    Output only the document content, formatted in HTML (paragraphs, bolding). Do not include markdown code blocks.`,
  
  Intent: (query: string) => 
    `Analyze the user command and map it to system actions.
    Available Modules: DASHBOARD, CASES, DOCKET, WORKFLOWS, MESSAGES, DISCOVERY, EVIDENCE, JURISDICTION, RESEARCH, BILLING, CRM, DOCUMENTS, LIBRARY, ADMIN, WAR_ROOM.
    Known Case IDs (Context): C-2024-001 (Martinez), C-2024-112 (OmniGlobal).
    
    User Query: "${query}"`,
    
  Analysis: (content: string) => 
    `Analyze legal doc. Summary & Risk (0-100). Content: ${content.substring(0, 8000)}`,
    
  Research: (query: string) => 
    `Legal research: ${query}`,
    
  Workflow: (desc: string) => 
    `Create legal workflow: ${desc}`,
    
  Review: (content: string) => 
    `Review contract. Identify risks, missing clauses, and unusual terms. Content: ${content.substring(0, 10000)}`,
    
  Refine: (raw: string) => 
    `Rewrite this legal billing entry to be professional, specific, and value-oriented (ABA compliant): "${raw}"`,
    
  Docket: (text: string) => 
    `Parse docket text to JSON. Extract caseInfo, parties, docketEntries. Text: ${text.substring(0, 15000)}`,

  Critique: (text: string) => `
    Act as a Senior Litigation Partner reviewing a brief. 
    Critique the argument structure, logic, and authority usage.
    
    Text to Review: "${text.substring(0, 20000)}"
    
    Output strictly in JSON format:
    {
      "score": number (0-100),
      "strengths": ["point 1", "point 2"],
      "weaknesses": ["point 1", "point 2"],
      "suggestions": ["specific advice 1", "specific advice 2"],
      "missingAuthority": ["Suggested Case 1", "Suggested Statute 2"]
    }
  `,

  ErrorResolution: (errorMessage: string) => 
    `An enterprise legal React application built with TypeScript threw an error: "${errorMessage}". 
    Explain the likely technical cause in 1-2 sentences. 
    Then, provide a concise, user-friendly suggestion for what might be happening and what they could try. 
    Format the output as plain text. Do not use markdown.`,
    
  Shepardize: (citation: string) => `
    You are an expert legal research assistant similar to Westlaw's KeyCite or LexisNexis's Shepard's.
    Analyze the provided legal citation and generate a comprehensive report on its history and treatment by other courts.
    
    Citation to Analyze: "${citation}"
    
    Return a structured JSON object.
  `,
  
  // --- NEW FOR LITIGATION BUILDER ---
  Strategy: (prompt: string) => `
    You are a master litigator and strategist. Generate a litigation strategy graph based on the user's prompt.
    User Prompt: "${prompt}"
    
    Nodes can be of type: 'Start', 'End', 'Task', 'Decision', 'Milestone', 'Event', 'Phase'.
    Connections should link nodes logically. Use the 'label' field for connections from 'Decision' nodes (e.g., 'Granted', 'Denied').
    Generate IDs for all nodes and connections.
    Output a structured JSON object.
  `,

  Lint: (graphData: string) => `
    You are an AI Strategy Linter. Analyze this litigation graph for logical errors, missing steps, or strategic weaknesses.
    Graph Data (JSON): ${graphData}

    Provide concise, actionable suggestions. For each suggestion, identify the relevant nodeId if applicable.
    Example: "Warning: The 'Trial' phase has no preceding 'Discovery Cutoff' event."
    Output a structured JSON object.
  `,
};
