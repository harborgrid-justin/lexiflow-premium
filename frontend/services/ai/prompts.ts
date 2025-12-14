
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
