[< Back to Index](../00-ENTERPRISE-TAXONOMY-INDEX.md)

# 02. Legal Research & Intelligence - PRIMARY FLOW

## Strategic Objective
Provide an AI-powered legal research platform with "Supreme Court Grade" accuracy, utilizing Retrieval-Augmented Generation (RAG) and rigorous citation verification to compete with Westlaw Edge and LexisNexis AI.

## Competitive Positioning
- **Competes with:** Westlaw Edge, LexisNexis Advance, Bloomberg Law, Casetext (CoCounsel)
- **Differentiation:** Transparent RAG pipelines, "Hallucination-Proof" citation verification, and real-time judicial behavior modeling.

---

## CRITICAL GAPS IDENTIFIED (Post-Review)
The following architectural gaps have been identified and addressed in this revised flow:
1.  **Unpublished Opinion Handling:** Added strict filtering for publication status to prevent citing non-precedential authority.
2.  **RAG Pipeline Definition:** Replaced generic "AI Search" with a specific Vector Search + Reranking architecture.
3.  **Hallucination Prevention:** Added a mandatory "Citation Verification" step that cross-references generated text with ground-truth database records.
4.  **Temporal Validity:** Added "Pocket Part" logic to check for statutory amendments that supersede case law.

---

## PRIMARY DOMAIN FLOW

```mermaid
graph TB
    Start([Research Query]) --> PreProcess{Query<br/>Analysis}
    
    PreProcess -->|Intent| Intent[Intent Recognition]
    PreProcess -->|Entities| NER[Entity Extraction]
    
    Intent --> VectorSearch[Vector DB Search<br/>(pgvector)]
    NER --> KeywordSearch[Keyword Search<br/>(BM25)]
    
    VectorSearch --> HybridRank[Hybrid Reranking]
    KeywordSearch --> HybridRank
    
    HybridRank --> ContextWindow[Context Window<br/>Assembly]
    ContextWindow --> LLM[LLM Generation]
    
    LLM --> Verification{Citation<br/>Verification}
    
    Verification -->|Hallucination| Prune[Prune Invalid<br/>Citations]
    Verification -->|Verified| Grounding[Grounding Check]
    
    Grounding --> ResultsList[Results Display]
    
    ResultsList --> SelectCase{Select<br/>Authority}
    SelectCase --> FullText[Full Text View]
    
    FullText --> Citator[Citator Analysis]
    Citator --> TreatmentSignal{Treatment<br/>Signal}
    
    TreatmentSignal -->|Positive| Validated[Good Law]
    TreatmentSignal -->|Overruled| Negative[Bad Law]
    TreatmentSignal -->|Distinguished| Caution[Distinguished]
    TreatmentSignal -->|Superseded| Statutory[Superseded by<br/>Statute]
    
    Validated --> CitationGraph[Citation Network Graph]
    Negative --> CitationGraph
    Caution --> CitationGraph
    Statutory --> CitationGraph
    
    CitationGraph --> Strategy[Strategic Recommendation]
    
    style Start fill:#4f46e5,stroke:#312e81,stroke-width:3px,color:#fff
    style VectorSearch fill:#10b981,stroke:#065f46,stroke-width:2px,color:#fff
    style Verification fill:#ef4444,stroke:#991b1b,stroke-width:2px,color:#fff
    style Citator fill:#f59e0b,stroke:#92400e,stroke-width:2px,color:#fff
```

---

## RAG & DATA PIPELINE ARCHITECTURE

```mermaid
graph LR
    subgraph "Ingestion Pipeline"
        Raw[Raw Case Text] --> Chunking[Semantic Chunking]
        Chunking --> Embedding[Embedding Model<br/>(text-embedding-3)]
        Embedding --> VectorDB[(Vector DB<br/>pgvector)]
        Raw --> MetaDB[(Metadata DB<br/>PostgreSQL)]
    end
    
    subgraph "Retrieval Pipeline"
        Query[User Query] --> EmbedQuery[Embed Query]
        EmbedQuery --> ANN[Approximate<br/>Nearest Neighbor]
        ANN --> VectorDB
        VectorDB --> Chunks[Retrieved Chunks]
        Chunks --> Rerank[Cross-Encoder<br/>Reranking]
        Rerank --> LLM[LLM Context]
    end
    
    style VectorDB fill:#10b981,color:#fff
    style LLM fill:#8b5cf6,color:#fff
```

---

## ENTERPRISE REQUIREMENTS vs. CURRENT STATE

### Westlaw Edge Comparison
| Feature | Westlaw Edge | LexiFlow Current | LexiFlow Target | Gap |
|---------|--------------|------------------|-----------------|-----|
| **RAG Accuracy** | High (Proprietary) | Medium | High (Verified) | ️ Implement Verification Layer |
| **Citator Nuance** | KeyCite (Deep) | Basic | KeyCite Equivalent |  Add "Distinguished" logic |
| **Unpublished Filter**| Yes | No | Yes |  Add Metadata Filters |
| **Statutory Updates** | Real-time | Manual | Automated |  Link Legislative Feed |

---

## RECOMMENDED ENHANCEMENTS

### Phase 1: Core RAG & Verification (Q1 2026)
1.  **Vector Infrastructure**
    -   Implement `pgvector` in PostgreSQL for storing case law embeddings.
    -   Develop semantic chunking strategy (e.g., chunking by legal headnote rather than fixed token count).
2.  **Citation Verification Service**
    -   Build a post-processing layer that regex-extracts citations from LLM output.
    -   Query the `Metadata DB` to verify the case exists and the page number is within range.
    -   **Hard Rule:** If a case cannot be verified, it is removed from the response or flagged as "Unverified".

### Phase 2: Advanced Citator (Q2 2026)
3.  **Nuanced Signals**
    -   Move beyond Positive/Negative. Implement:
        -   *Distinguished*: Case is valid but factually distinct.
        -   *Superseded by Statute*: Legislative action has rendered the holding obsolete.
        -   *Split Authority*: Circuit split identification.
4.  **Temporal "Pocket Part" Check**
    -   When a statute is cited, automatically check the "Effective Date" against the current date and flag any pending legislation.

---

## TECHNICAL ARCHITECTURE

### Database Schema (Enhanced)

```typescript
// Vector Store Schema (pgvector)
interface CaseChunk {
  id: string;
  caseId: string;
  content: string; // The actual text chunk
  embedding: number[]; // Vector representation (e.g., 1536 dims)
  metadata: {
    jurisdiction: string;
    year: number;
    published: boolean; // CRITICAL: Filter for unpublished opinions
    judge: string;
    areaOfLaw: string[];
  };
}

interface CitationVerification {
  citationString: string;
  isVerified: boolean;
  verifiedCaseId?: string;
  confidenceScore: number;
  verificationSource: 'internal-db' | 'external-api';
}

interface ResearchQuery {
  id: string;
  userId: string;
  queryText: string;
  ragConfig: {
    topK: number;
    threshold: number;
    includeUnpublished: boolean;
  };
  results: VerifiedResult[];
}
```

### API Endpoints
```
POST   /api/research/vector-search    - Perform hybrid search (Vector + Keyword)
POST   /api/research/verify-citation  - Check validity of a specific citation
POST   /api/research/shepardize       - Get full treatment history
GET    /api/research/statute-updates  - Check for recent amendments
```

### Integration Points
-   **Vector Database**: PostgreSQL with `pgvector` extension.
-   **Embedding Service**: OpenAI `text-embedding-3-small` or locally hosted `bge-m3`.
-   **Orchestrator**: LangChain or custom TypeScript RAG pipeline in `services/research/ragService.ts`.

---

## SUCCESS METRICS

| Metric | Current | Target | Industry Benchmark |
|--------|---------|--------|-------------------|
| **Hallucination Rate** | 15% | < 0.1% | < 1% (CoCounsel) |
| **Citation Precision** | 85% | 99.9% | 99.9% (Westlaw) |
| **Retrieval Latency** | 2.5s | < 800ms | < 1s |
| **Unpublished Filter** | N/A | 100% | 100% |

---

## IMPLEMENTATION PRIORITY

**Priority 1 (Critical - "The Engineer"):**
- [ ] Deploy `pgvector` migration.
- [ ] Implement "Hallucination Guardrails" (Verification Service).
- [ ] Build Ingestion Pipeline for Case Law (Chunking + Embedding).

**Priority 2 (High - "The Scholar"):**
- [ ] "Unpublished Opinion" metadata tagging.
- [ ] "Superseded by Statute" logic.
- [ ] Advanced Citator Signals (Distinguished, Split Authority).

**See secondary module flows in subdirectories:**
- [01-SECONDARY-case-law-research](./01-SECONDARY-case-law-research/SECONDARY-FLOW.md)
- [02-SECONDARY-statutory-research](./02-SECONDARY-statutory-research/SECONDARY-FLOW.md)
- [03-SECONDARY-citation-management](./03-SECONDARY-citation-management/SECONDARY-FLOW.md)
- [04-SECONDARY-predictive-analytics](./04-SECONDARY-predictive-analytics/SECONDARY-FLOW.md)

## Secondary Flows
- [Case Law Research](./01-SECONDARY-case-law-research/SECONDARY-FLOW.md)
- [Statutory Research](./02-SECONDARY-statutory-research/SECONDARY-FLOW.md)
- [Citation Management](./03-SECONDARY-citation-management/SECONDARY-FLOW.md)
- [Predictive Analytics](./04-SECONDARY-predictive-analytics/SECONDARY-FLOW.md)
