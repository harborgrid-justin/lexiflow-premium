import{r as n,j as l}from"./vendor-core-V-oW58GW.js";import{u as x}from"./ThemeContext-OPG61qw5.js";import{S as k}from"./SyncContext-B5_p5hCg.js";import{D as c,c as p}from"./dataService-BWLMkXM4.js";import{V as E,q as I,c as y}from"./useQueryHooks-Oyt-TMLP.js";const z=500,G=5e3;function K(){const r=n.useContext(k);if(!r)throw new Error("useSync must be used within a SyncProvider");return r}function j(r,t){if(r.trim().length===0)throw new E(`[SearchService.${t}] Query cannot be empty`)}function A(r){return r.trim().length>0}async function q(){const[r,t,s,i,a,u,o,d,h,m]=await Promise.all([c.cases.getAll().catch(()=>[]),c.clients.getAll().catch(()=>[]),c.tasks.getAll().catch(()=>[]),c.evidence.getAll().catch(()=>[]),c.users.getAll().catch(()=>[]),c.documents.getAll().catch(()=>[]),c.docket.getAll().catch(()=>[]),c.motions.getAll().catch(()=>[]),c.clauses.getAll().catch(()=>[]),c.rules.getAll().catch(()=>[])]);return[...r.map(e=>({id:e.id,type:"case",title:e.title,subtitle:`${e.id} - ${e.client}`,data:e})),...t.map(e=>({id:e.id,type:"client",title:e.name,subtitle:`Client - ${e.industry}`,data:e})),...s.map(e=>({id:e.id,type:"task",title:e.title,subtitle:`Task - Due: ${e.dueDate}`,data:e})),...i.map(e=>({id:e.id,type:"evidence",title:e.title,subtitle:`Evidence - ${e.type}`,data:e})),...a.map(e=>({id:e.id,type:"user",title:e.name,subtitle:`${e.role} - ${e.office}`,data:e})),...u.map(e=>({id:e.id,type:"document",title:e.title,subtitle:`Doc - ${e.type}`,data:e})),...o.map(e=>({id:e.id,type:"docket",title:e.title,subtitle:`Docket #${e.sequenceNumber}`,data:e})),...d.map(e=>({id:e.id,type:"motion",title:e.title,subtitle:`Motion - ${e.status}`,data:e})),...h.map(e=>({id:e.id,type:"clause",title:e.name,subtitle:`Clause - ${e.category}`,data:e})),...m.map(e=>({id:e.id,type:"rule",title:`${e.code} - ${e.name}`,subtitle:`Rule - ${e.type}`,data:e}))]}const C=()=>{if(typeof Worker>"u")return console.warn("[SearchWorker] Worker API not available (SSR mode)"),null;const r=`
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
    `;try{const t=new Blob([r],{type:"application/javascript"}),s=URL.createObjectURL(t),i=new Worker(s);return URL.revokeObjectURL(s),i}catch(t){return console.error("[SearchWorker] Failed to create worker:",t),null}},R={create:C};class T{worker=null;requestId=0;isHydrated=!1;hydrationPromise=null;pendingRequests=new Map;constructor(){if(typeof Worker<"u"){const t=R.create();t&&(this.worker=t,this.worker.onmessage=this.handleWorkerMessage.bind(this),console.log("[GlobalSearchEngine] Worker initialized"))}else console.warn("[GlobalSearchEngine] Worker API not available (SSR mode)")}handleWorkerMessage(t){try{const{results:s,requestId:i}=t.data,a=this.pendingRequests.get(i);a&&(a(s),this.pendingRequests.delete(i))}catch(s){console.error("[GlobalSearchEngine.handleWorkerMessage] Error:",s)}}async hydrate(){if(!this.isHydrated)return this.hydrationPromise?this.hydrationPromise:(this.hydrationPromise=(async()=>{const t=performance.now(),s=await q();if(!this.worker){console.warn("[GlobalSearchEngine] Worker not available, skipping indexing"),this.isHydrated=!0;return}this.worker.postMessage({type:"UPDATE",payload:{items:s,fields:["title","subtitle","type"]}}),console.log(`[GlobalSearchEngine] Hydration complete: ${s.length} items in ${(performance.now()-t).toFixed(2)}ms`),this.isHydrated=!0})(),this.hydrationPromise)}async search(t){return j(t,"search"),this.worker?(await this.hydrate(),new Promise(s=>{const i=++this.requestId;this.pendingRequests.set(i,s),this.worker.postMessage({type:"SEARCH",payload:{query:t,requestId:i}})})):[]}isReady(){return this.isHydrated}}const g="lexiflow_search_history",H=10;function L(r){if(A(r))try{const t=p.get(g,[]),s=[r,...t.filter(i=>i!==r)].slice(0,H);p.set(g,s),console.debug(`[SearchService] Saved to history: "${r}"`)}catch(t){console.error("[SearchService.saveHistory] Error:",t)}}function $(){try{return p.get(g,[])}catch(r){return console.error("[SearchService.getHistory] Error:",r),[]}}const b=new T,Q={search:r=>b.search(r),saveHistory:L,getHistory:$,isReady:()=>b.isReady()};function V(r,t){const s=n.useRef(t);n.useEffect(()=>{s.current=t},[t]),n.useEffect(()=>{const i=a=>{!r.current||r.current.contains(a.target)||s.current(a)};return document.addEventListener("mousedown",i),document.addEventListener("touchstart",i),()=>{document.removeEventListener("mousedown",i),document.removeEventListener("touchstart",i)}},[r])}const f={passive:!0};function M(r,t){const[s,i]=n.useState(0),[a,u]=n.useState(!1),o=n.useRef(Date.now()),d=n.useRef(null),h=n.useRef(null),m=n.useRef(!1);n.useEffect(()=>{m.current=a},[a]),n.useEffect(()=>{i(0),o.current=Date.now(),u(!1)},[r,t,s]);const e=n.useCallback(()=>{h.current||(h.current=requestAnimationFrame(()=>{o.current=Date.now(),m.current&&u(!1),h.current=null}))},[]);return n.useEffect(()=>(window.addEventListener("mousemove",e,f),window.addEventListener("keydown",e,f),()=>{window.removeEventListener("mousemove",e,f),window.removeEventListener("keydown",e,f),h.current&&cancelAnimationFrame(h.current)}),[e]),n.useEffect(()=>{let v=!0;return d.current=setInterval(()=>{if(!v)return;Date.now()-o.current>6e4?u(!0):i(S=>S+1)},1e3),()=>{v=!1,d.current&&clearInterval(d.current)}},[]),{activeTime:s,isIdle:a}}function N(){const[r,t]=n.useState(!1);return n.useEffect(()=>{const s=I.subscribeToGlobalUpdates(i=>{t(i.isFetching>0)});return()=>s()},[]),{isFetching:r}}const w=n.memo(({activeView:r,selectedCaseId:t})=>{const{activeTime:s,isIdle:i}=M(r,t);return s===0?null:l.jsx("div",{className:y("absolute top-0 right-0 h-0.5 bg-green-500 transition-all duration-1000 z-[60] pointer-events-none",i?"opacity-0":"opacity-100"),style:{width:`${Math.min(s%60/60*100,100)}%`}})});w.displayName="PassiveTimeTracker";const P=n.memo(({sidebar:r,headerContent:t,children:s,activeView:i,onNavigate:a,selectedCaseId:u})=>{const{theme:o}=x(),{isFetching:d}=N();return l.jsxs("div",{className:y("flex h-[100dvh] w-screen font-sans overflow-hidden transition-colors duration-200 relative",o.background,o.text.primary),children:[l.jsx("div",{className:y("absolute top-0 left-0 right-0 h-0.5 z-[9000] bg-blue-500 transition-opacity duration-300",d?"opacity-100":"opacity-0"),children:l.jsx("div",{className:"absolute inset-0 bg-inherit opacity-50 animate-pulse"})}),r,l.jsxs("div",{className:"flex-1 flex flex-col h-full w-full min-w-0 relative",children:[l.jsx(w,{activeView:i||"unknown",selectedCaseId:u||null}),l.jsx("header",{className:y("h-16 flex items-center justify-between px-4 md:px-6 shadow-sm z-40 shrink-0 border-b",o.surface.default,o.border.default),children:t}),l.jsx("main",{className:"flex-1 flex flex-col min-h-0 overflow-hidden relative isolate pb-0",style:{contain:"strict"},children:s})]})]})});P.displayName="AppShell";export{P as A,G as N,Q as S,z as T,V as a,R as b,M as c,N as d,K as u};
