import{r as i,j as l}from"./vendor-core-V-oW58GW.js";import{u as k}from"./ThemeContext-OPG61qw5.js";import{S as j}from"./SyncContext-DYD5yPAv.js";import{D as c,c as w}from"./dataService-75QCl8KS.js";import{V as I,q,c as g}from"./useQueryHooks-BdeOvP9e.js";const G=500,U=5e3;function z(){const t=i.useContext(j);if(!t)throw new Error("useSync must be used within a SyncProvider");return t}const A=()=>{const t=`
      let itemsCache = [];
      let fieldsCache = [];
      let idKeyCache = 'id';

      // Advanced Levenshtein Distance for fuzzy matching
      // Implemented in Worker to avoid main-thread blocking during matrix calculation
      function levenshtein(a, b) {
        if (a.length === 0) return b.length;
        if (b.length === 0) return a.length;

        const matrix = [];

        for (let i = 0; i <= b.length; i++) {
          matrix[i] = [i];
        }

        for (let j = 0; j <= a.length; j++) {
          matrix[0][j] = j;
        }

        for (let i = 1; i <= b.length; i++) {
          for (let j = 1; j <= a.length; j++) {
            if (b.charAt(i - 1) === a.charAt(j - 1)) {
              matrix[i][j] = matrix[i - 1][j - 1];
            } else {
              matrix[i][j] = Math.min(
                matrix[i - 1][j - 1] + 1,
                Math.min(
                  matrix[i][j - 1] + 1,
                  matrix[i - 1][j] + 1
                )
              );
            }
          }
        }
        return matrix[b.length][a.length];
      }

      function calculateScore(text, query) {
          const t = String(text).toLowerCase();
          const q = query.toLowerCase();
          
          if (t === q) return 100; // Exact match
          if (t.startsWith(q)) return 80; // Prefix match
          if (t.includes(q)) return 60; // Substring match
          
          // Only run expensive Levenshtein if lengths are somewhat close
          if (Math.abs(t.length - q.length) > 5) return 0;
          
          const dist = levenshtein(t, q);
          if (dist <= 2) return 40; // Fuzzy match
          
          return 0;
      }

      self.onmessage = function(e) {
        const { type, payload } = e.data;

        // 1. Data Ingestion (Heavy, Infrequent)
        if (type === 'UPDATE') {
            // Flatten or prepare data if necessary
            itemsCache = payload.items || [];
            fieldsCache = payload.fields || [];
            idKeyCache = payload.idKey || 'id';
            return;
        }
        
        // 2. Query Execution (Light, Frequent)
        if (type === 'SEARCH') {
            const { query, requestId } = payload;
            
            if (!query || itemsCache.length === 0) {
                // If query empty, return all (up to limit) or empty depending on UX requirement.
                // Here we return top 20 unsorted.
                self.postMessage({ results: itemsCache.slice(0, 20), requestId });
                return;
            }
    
            const results = [];
            const len = itemsCache.length;
            
            for (let i = 0; i < len; i++) {
                const item = itemsCache[i];
                let maxScore = 0;
        
                // Search strategy: Check specific fields if provided, else check all own properties
                const searchFields = fieldsCache.length > 0 ? fieldsCache : Object.keys(item);
                
                for (let j = 0; j < searchFields.length; j++) {
                    const field = searchFields[j];
                    const val = item[field];
                    if (val) {
                        const score = calculateScore(val, query);
                        if (score > maxScore) maxScore = score;
                        if (maxScore === 100) break; // Optimization: early exit
                    }
                }
        
                if (maxScore > 0) {
                    // Inject score into result for sorting later
                    results.push({ ...item, _score: maxScore });
                }
            }
            
            // Sort by score descending
            results.sort((a, b) => b._score - a._score);
    
            self.postMessage({ results: results.slice(0, 50), requestId });
        }
      };
    `,r=new Blob([t],{type:"application/javascript"}),s=URL.createObjectURL(r),n=new Worker(s);return URL.revokeObjectURL(s),n},C={create:A},S="lexiflow_search_history",R=10;function T(t,r){if(t.trim().length===0)throw new I(`[SearchService.${r}] Query cannot be empty`)}function $(t){return t.trim().length>0}class L{worker;requestId=0;isHydrated=!1;hydrationPromise=null;pendingRequests=new Map;constructor(){this.worker=C.create(),this.worker.onmessage=this.handleWorkerMessage.bind(this),console.log("[GlobalSearchEngine] Worker initialized")}handleWorkerMessage(r){try{const{results:s,requestId:n}=r.data,a=this.pendingRequests.get(n);a&&(a(s),this.pendingRequests.delete(n),console.debug(`[GlobalSearchEngine] Request ${n} completed (${s.length} results)`))}catch(s){console.error("[GlobalSearchEngine.handleWorkerMessage] Error:",s)}}async hydrate(){if(!this.isHydrated)return this.hydrationPromise?this.hydrationPromise:(this.hydrationPromise=(async()=>{try{console.log("[GlobalSearchEngine] Starting hydration...");const r=performance.now(),[s,n,a,u,o,d,h,m,f,y]=await Promise.all([c.cases.getAll().catch(e=>(console.warn("Cases fetch failed:",e),[])),c.clients.getAll().catch(e=>(console.warn("Clients fetch failed:",e),[])),c.tasks.getAll().catch(e=>(console.warn("Tasks fetch failed:",e),[])),c.evidence.getAll().catch(e=>(console.warn("Evidence fetch failed:",e),[])),c.users.getAll().catch(e=>(console.warn("Users fetch failed:",e),[])),c.documents.getAll().catch(e=>(console.warn("Documents fetch failed:",e),[])),c.docket.getAll().catch(e=>(console.warn("Docket fetch failed:",e),[])),c.motions.getAll().catch(e=>(console.warn("Motions fetch failed:",e),[])),c.clauses.getAll().catch(e=>(console.warn("Clauses fetch failed:",e),[])),c.rules.getAll().catch(e=>(console.warn("Rules fetch failed:",e),[]))]),v=[...s.map(e=>({id:e.id,type:"case",title:e.title,subtitle:`${e.id} • ${e.client}`,data:e})),...n.map(e=>({id:e.id,type:"client",title:e.name,subtitle:`Client • ${e.industry}`,data:e})),...a.map(e=>({id:e.id,type:"task",title:e.title,subtitle:`Task • Due: ${e.dueDate}`,data:e})),...u.map(e=>({id:e.id,type:"evidence",title:e.title,subtitle:`Evidence • ${e.type}`,data:e})),...o.map(e=>({id:e.id,type:"user",title:e.name,subtitle:`${e.role} • ${e.office}`,data:e})),...d.map(e=>({id:e.id,type:"document",title:e.title,subtitle:`Doc • ${e.type}`,data:e})),...h.map(e=>({id:e.id,type:"docket",title:e.title,subtitle:`Docket #${e.sequenceNumber}`,data:e})),...m.map(e=>({id:e.id,type:"motion",title:e.title,subtitle:`Motion • ${e.status}`,data:e})),...f.map(e=>({id:e.id,type:"clause",title:e.name,subtitle:`Clause • ${e.category}`,data:e})),...y.map(e=>({id:e.id,type:"rule",title:`${e.code} - ${e.name}`,subtitle:`Rule • ${e.type}`,data:e}))];this.worker.postMessage({type:"UPDATE",payload:{items:v,fields:["title","subtitle","type"]}});const b=performance.now()-r;console.log(`[GlobalSearchEngine] Hydration complete: ${v.length} items indexed in ${b.toFixed(2)}ms`),this.isHydrated=!0}catch(r){throw console.error("[GlobalSearchEngine.hydrate] Fatal error:",r),r}})(),this.hydrationPromise)}async search(r){T(r,"search");try{return await this.hydrate(),new Promise(s=>{const n=++this.requestId;this.pendingRequests.set(n,s),this.worker.postMessage({type:"SEARCH",payload:{query:r,requestId:n}}),console.debug(`[GlobalSearchEngine] Search request ${n}: "${r}"`)})}catch(s){throw console.error("[GlobalSearchEngine.search] Error:",s),s}}isReady(){return this.isHydrated}}const x=new L,W={search:t=>x.search(t),saveHistory(t){if($(t))try{const r=w.get(S,[]),s=[t,...r.filter(n=>n!==t)].slice(0,R);w.set(S,s),console.debug(`[SearchService] Saved to history: "${t}"`)}catch(r){console.error("[SearchService.saveHistory] Error:",r)}},getHistory(){try{return w.get(S,[])}catch(t){return console.error("[SearchService.getHistory] Error:",t),[]}},isReady(){return x.isReady()}};function K(t,r){const s=i.useRef(r);i.useEffect(()=>{s.current=r},[r]),i.useEffect(()=>{const n=a=>{!t.current||t.current.contains(a.target)||s.current(a)};return document.addEventListener("mousedown",n),document.addEventListener("touchstart",n),()=>{document.removeEventListener("mousedown",n),document.removeEventListener("touchstart",n)}},[t])}const p={passive:!0};function M(t,r){const[s,n]=i.useState(0),[a,u]=i.useState(!1),o=i.useRef(Date.now()),d=i.useRef(null),h=i.useRef(null),m=i.useRef(!1);i.useEffect(()=>{m.current=a},[a]),i.useEffect(()=>{n(0),o.current=Date.now(),u(!1)},[t,r,s]);const f=i.useCallback(()=>{h.current||(h.current=requestAnimationFrame(()=>{o.current=Date.now(),m.current&&u(!1),h.current=null}))},[]);return i.useEffect(()=>(window.addEventListener("mousemove",f,p),window.addEventListener("keydown",f,p),()=>{window.removeEventListener("mousemove",f,p),window.removeEventListener("keydown",f,p),h.current&&cancelAnimationFrame(h.current)}),[f]),i.useEffect(()=>{let y=!0;return d.current=setInterval(()=>{if(!y)return;Date.now()-o.current>6e4?u(!0):n(b=>b+1)},1e3),()=>{y=!1,d.current&&clearInterval(d.current)}},[]),{activeTime:s,isIdle:a}}function D(){const[t,r]=i.useState(!1);return i.useEffect(()=>{const s=q.subscribeToGlobalUpdates(n=>{r(n.isFetching>0)});return()=>s()},[]),{isFetching:t}}const E=i.memo(({activeView:t,selectedCaseId:r})=>{const{activeTime:s,isIdle:n}=M(t,r);return s===0?null:l.jsx("div",{className:g("absolute top-0 right-0 h-0.5 bg-green-500 transition-all duration-1000 z-[60] pointer-events-none",n?"opacity-0":"opacity-100"),style:{width:`${Math.min(s%60/60*100,100)}%`}})});E.displayName="PassiveTimeTracker";const H=i.memo(({sidebar:t,headerContent:r,children:s,activeView:n,onNavigate:a,selectedCaseId:u})=>{const{theme:o}=k(),{isFetching:d}=D();return l.jsxs("div",{className:g("flex h-[100dvh] w-screen font-sans overflow-hidden transition-colors duration-200 relative",o.background,o.text.primary),children:[l.jsx("div",{className:g("absolute top-0 left-0 right-0 h-0.5 z-[9000] bg-blue-500 transition-opacity duration-300",d?"opacity-100":"opacity-0"),children:l.jsx("div",{className:"absolute inset-0 bg-inherit opacity-50 animate-pulse"})}),t,l.jsxs("div",{className:"flex-1 flex flex-col h-full w-full min-w-0 relative",children:[l.jsx(E,{activeView:n||"unknown",selectedCaseId:u||null}),l.jsx("header",{className:g("h-16 flex items-center justify-between px-4 md:px-6 shadow-sm z-40 shrink-0 border-b",o.surface.default,o.border.default),children:r}),l.jsx("main",{className:"flex-1 flex flex-col min-h-0 overflow-hidden relative isolate pb-0",style:{contain:"strict"},children:s})]})]})});H.displayName="AppShell";export{H as A,U as N,W as S,G as T,K as a,C as b,M as c,D as d,z as u};
