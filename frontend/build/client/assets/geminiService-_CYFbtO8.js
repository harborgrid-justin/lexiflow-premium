import{ae as p}from"./vendor-misc-Dwkhvdtg.js";import{D as m,L as g,S as d,a as h,I as y,B as f,A as w}from"./schemas-B2_dy3tf.js";import{w as o,s as c}from"./dataService-BWLMkXM4.js";const a={Draft:(e,t)=>`You are an expert legal aide. Draft a professional ${t}. 
    Context: ${e}. 
    Output only the document content, formatted in HTML (paragraphs, bolding). Do not include markdown code blocks.`,Intent:e=>`Analyze the user command and map it to system actions.
    Available Modules: DASHBOARD, CASES, DOCKET, WORKFLOWS, MESSAGES, DISCOVERY, EVIDENCE, JURISDICTION, RESEARCH, BILLING, CRM, DOCUMENTS, LIBRARY, ADMIN, WAR_ROOM.
    Known Case IDs (Context): C-2024-001 (Martinez), C-2024-112 (OmniGlobal).
    
    User Query: "${e}"`,Analysis:e=>`Analyze legal doc. Summary & Risk (0-100). Content: ${e.substring(0,8e3)}`,Research:e=>`Legal research: ${e}`,Workflow:e=>`Create legal workflow: ${e}`,Review:e=>`Review contract. Identify risks, missing clauses, and unusual terms. Content: ${e.substring(0,1e4)}`,Refine:e=>`Rewrite this legal billing entry to be professional, specific, and value-oriented (ABA compliant): "${e}"`,Docket:e=>`Parse docket text to JSON. Extract caseInfo, parties, docketEntries. Text: ${e.substring(0,15e3)}`,Critique:e=>`
    Act as a Senior Litigation Partner reviewing a brief. 
    Critique the argument structure, logic, and authority usage.
    
    Text to Review: "${e.substring(0,2e4)}"
    
    Output strictly in JSON format:
    {
      "score": number (0-100),
      "strengths": ["point 1", "point 2"],
      "weaknesses": ["point 1", "point 2"],
      "suggestions": ["specific advice 1", "specific advice 2"],
      "missingAuthority": ["Suggested Case 1", "Suggested Statute 2"]
    }
  `,ErrorResolution:e=>`An enterprise legal React application built with TypeScript threw an error: "${e}". 
    Explain the likely technical cause in 1-2 sentences. 
    Then, provide a concise, user-friendly suggestion for what might be happening and what they could try. 
    Format the output as plain text. Do not use markdown.`,Shepardize:e=>`
    You are an expert legal research assistant similar to Westlaw's KeyCite or LexisNexis's Shepard's.
    Analyze the provided legal citation and generate a comprehensive report on its history and treatment by other courts.
    
    Citation to Analyze: "${e}"
    
    Return a structured JSON object.
  `,Strategy:e=>`
    You are a master litigator and strategist. Generate a litigation strategy graph based on the user's prompt.
    User Prompt: "${e}"
    
    Nodes can be of type: 'Start', 'End', 'Task', 'Decision', 'Milestone', 'Event', 'Phase'.
    Connections should link nodes logically. Use the 'label' field for connections from 'Decision' nodes (e.g., 'Granted', 'Denied').
    Generate IDs for all nodes and connections.
    Output a structured JSON object.
  `,Lint:e=>`
    You are an AI Strategy Linter. Analyze this litigation graph for logical errors, missing steps, or strategic weaknesses.
    Graph Data (JSON): ${e}

    Provide concise, actionable suggestions. For each suggestion, identify the relevant nodeId if applicable.
    Example: "Warning: The 'Trial' phase has no preceding 'Discovery Cutoff' event."
    Output a structured JSON object.
  `},s=()=>{const e=typeof localStorage<"u"?localStorage.getItem("gemini_api_key"):null;if(!e)throw new Error("Gemini API key not configured. Please set VITE_GEMINI_API_KEY environment variable or gemini_api_key in storage.");return new p(e)},G={async analyzeDocument(e){return o(async()=>{try{const i=(await s().getGenerativeModel({model:"gemini-2.0-flash-exp",generationConfig:{responseMimeType:"application/json",responseSchema:w}}).generateContent(a.Analysis(e))).response.text();if(!i)throw new Error("No response text from Gemini");return c(i,{summary:"Analysis failed to parse",riskScore:0})}catch(t){return console.error("Gemini Analysis Error:",t),{summary:"Analysis unavailable due to service error.",riskScore:0}}})},async critiqueBrief(e){return o(async()=>{try{const n=(await s().getGenerativeModel({model:"gemini-2.0-flash-exp",generationConfig:{responseMimeType:"application/json",responseSchema:f}}).generateContent(a.Critique(e))).response.text();if(!n)throw new Error("No response text from Gemini");return c(n,{score:0,strengths:[],weaknesses:["Analysis unavailable"],suggestions:[],missingAuthority:[]})}catch(t){return console.error("Gemini Critique Error:",t),{score:0,strengths:[],weaknesses:["Service Error"],suggestions:[],missingAuthority:[]}}})},async reviewContract(e){return o(async()=>{try{return(await s().getGenerativeModel({model:"gemini-2.0-flash-exp"}).generateContent(a.Review(e))).response.text()||"Error reviewing contract."}catch{return"Contract review service unavailable."}})},async*streamDraft(e,t){try{const n=await s().getGenerativeModel({model:"gemini-2.0-flash-exp"}).generateContentStream(a.Draft(e,t));for await(const i of n.stream){const l=i.text();l&&(yield l)}}catch{yield"Error streaming content."}},async refineTimeEntry(e){return o(async()=>{try{return(await s().getGenerativeModel({model:"gemini-2.0-flash-exp"}).generateContent(a.Refine(e))).response.text()||e}catch{return e}})},async generateDraft(e,t){return o(async()=>{try{return(await s().getGenerativeModel({model:"gemini-2.0-flash-exp"}).generateContent(a.Draft(e,t))).response.text()||"Error generating content."}catch{return"Generation failed."}})},async predictIntent(e){return o(async()=>{try{const n=(await s().getGenerativeModel({model:"gemini-2.0-flash-exp",generationConfig:{responseMimeType:"application/json",responseSchema:y}}).generateContent(a.Intent(e))).response.text();if(!n)throw new Error("No response text from Gemini");return c(n,{action:"UNKNOWN",confidence:0})}catch{return{action:"UNKNOWN",confidence:0}}})},async parseDocket(e){return o(async()=>{try{const n=(await s().getGenerativeModel({model:"gemini-2.0-flash-exp",generationConfig:{responseMimeType:"application/json",responseSchema:m}}).generateContent(a.Docket(e))).response.text();if(!n)throw new Error("No response text from Gemini");return c(n,{})}catch(t){return console.error("Docket Parse Error",t),{}}})},async conductResearch(e){return o(async()=>{try{const n=(await s().getGenerativeModel({model:"gemini-2.0-flash-exp",tools:[{googleSearch:{}}]}).generateContent(a.Research(e))).response,i=[],l=n.candidates;return l&&l[0]?.groundingMetadata?.groundingChunks&&l[0].groundingMetadata.groundingChunks.forEach(u=>{u.web&&i.push({id:crypto.randomUUID(),type:"web",title:u.web.title,score:1,url:u.web.uri})}),{text:n.text()||"No text response.",sources:i}}catch{return{text:"Research service unavailable.",sources:[]}}})},async generateReply(e,t){return o(async()=>{try{return(await s().getGenerativeModel({model:"gemini-2.0-flash-exp"}).generateContent(`Draft a professional reply to this message from a ${t}: "${e}"`)).response.text()||""}catch{return"Unable to generate reply."}})},async shepardizeCitation(e){return o(async()=>{try{const n=(await s().getGenerativeModel({model:"gemini-2.0-flash-exp",generationConfig:{responseMimeType:"application/json",responseSchema:h}}).generateContent(a.Shepardize(e))).response.text();return n?c(n,{caseName:"",citation:"",summary:"",history:[],treatment:[]}):null}catch{return null}})},async generateStrategyFromPrompt(e){return o(async()=>{try{const n=(await s().getGenerativeModel({model:"gemini-2.0-flash-exp",generationConfig:{responseMimeType:"application/json",responseSchema:d}}).generateContent(a.Strategy(e))).response.text();return n?c(n,{nodes:[],connections:[]}):null}catch(t){return console.error("Gemini Strategy Generation Error:",t),null}})},async lintStrategy(e){return o(async()=>{try{const n=(await s().getGenerativeModel({model:"gemini-2.0-flash-exp",generationConfig:{responseMimeType:"application/json",responseSchema:g}}).generateContent(a.Lint(JSON.stringify(e)))).response.text();return n?c(n,{suggestions:[]}):null}catch(t){return console.error("Gemini Strategy Linter Error:",t),null}})},async extractCaseData(e){return o(async()=>{try{const n=(await s().getGenerativeModel({model:"gemini-2.0-flash-exp",generationConfig:{responseMimeType:"application/json",responseSchema:m}}).generateContent(`Extract structured case data from the following text. Include all parties, attorneys, dates, court information, case numbers, and any other relevant case details:

${e.slice(0,15e3)}`)).response.text();if(!n)throw new Error("No response text from Gemini");return c(n,{})}catch(t){return console.error("Extract Case Data Error:",t),{}}})},async legalResearch(e,t){return this.conductResearch(e)},async validateCitations(e){if(e.length===0)return{caseName:"No citations provided",citation:"",summary:"No citations to validate",history:[],treatment:[]};const t=e[0];if(!t)return{caseName:"Unknown Case",citation:"",summary:"No citation found",history:[],treatment:[]};const r=await this.shepardizeCitation(t);return r||{caseName:"Unknown Case",citation:t,summary:"Analysis unavailable",history:[],treatment:[]}},async draftDocument(e,t){const r=this.streamDraft(e,"document");for await(const n of r)t(n)},async suggestReply(e){const t=e[e.length-1]||"";return this.generateReply(t,"professional")}};export{G};
