[< Back to Index](../../00-ENTERPRISE-TAXONOMY-INDEX.md) | [< Back to Primary Flow](../PRIMARY-FLOW.md)

# Case Law Research - SECONDARY FLOW

##  Operational Objective
Execute high-precision legal research using Retrieval-Augmented Generation (RAG), ensuring all cited authority is verified against the ground-truth database and filtered for publication status.

##  DETAILED WORKFLOW

```mermaid
graph TB
    Start([Research Query]) --> QueryParsing[NLP Query Parsing]
    QueryParsing --> Intent{Intent<br/>Type}
    
    Intent -->|Concept| VectorSearch[Vector Search (pgvector)]
    Intent -->|Specific Case| KeywordSearch[Keyword Search (BM25)]
    
    VectorSearch --> HybridRank[Hybrid Reranking]
    KeywordSearch --> HybridRank
    
    HybridRank --> ContextAssembly[Assemble Context Window]
    ContextAssembly --> LLMGen[LLM Generation]
    
    LLMGen --> Verification{Citation<br/>Verification}
    
    Verification -->|Hallucination| Prune[Prune Invalid Citation]
    Verification -->|Verified| MetaCheck{Metadata<br/>Check}
    
    MetaCheck -->|Unpublished| FlagUnpublished[Flag as Unpublished]
    MetaCheck -->|Published| Grounding[Grounding Check]
    
    FlagUnpublished --> Grounding
    Grounding --> ResultsDisplay[Display Verified Results]
    
    ResultsDisplay --> SelectCase[Select Case]
    SelectCase --> FullTextView[Full Text View]
    
    FullTextView --> CitatorAnalysis[Run Citator]
    CitatorAnalysis --> TreatmentSignals[Treatment Signals]
    
    TreatmentSignals --> SignalType{Treatment<br/>Type}
    SignalType -->|Positive| PositiveTreatment[Good Law]
    SignalType -->|Negative| NegativeTreatment[Bad Law (Overruled)]
    SignalType -->|Distinguished| DistTreatment[Distinguished]
    
    PositiveTreatment --> CitationNetwork[Citation Network Graph]
    NegativeTreatment --> CitationNetwork
    DistTreatment --> CitationNetwork
    
    CitationNetwork --> HeadnoteAnalysis[Headnote Analysis]
    HeadnoteAnalysis --> KeyPoints[Extract Key Points]
    KeyPoints --> SaveToFolder[Save to Research Folder]
    
    SaveToFolder --> CitationExport[Export Citations]
    CitationExport --> End([Research Complete])
    
    style Start fill:#4f46e5,stroke:#312e81,stroke-width:3px,color:#fff
    style VectorSearch fill:#10b981,stroke:#065f46,stroke-width:2px,color:#fff
    style Verification fill:#ef4444,stroke:#991b1b,stroke-width:2px,color:#fff
    style End fill:#6366f1,stroke:#312e81,stroke-width:3px,color:#fff
```

##  TERTIARY WORKFLOWS
- **T1:** **RAG Pipeline Execution** (Chunk retrieval, embedding generation, reranking)
- **T2:** **Citation Verification** (Regex extraction, database existence check, page range validation)
- **T3:** **Metadata Filtering** (Publication status check, jurisdiction filtering)
- **T4:** **Headnote Extraction** (NLP entity recognition, topic clustering)
