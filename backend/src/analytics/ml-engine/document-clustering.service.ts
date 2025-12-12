import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

/**
 * Document Clustering Service
 * Automatically groups documents using K-Means clustering
 * Algorithm: K-Means with TF-IDF vectorization and Silhouette score optimization
 */
@Injectable()
export class DocumentClusteringService {
  private readonly logger = new Logger(DocumentClusteringService.name);

  constructor(
    @InjectRepository('Document') private documentRepo: Repository<any>,
  ) {}

  /**
   * Cluster documents using K-Means algorithm
   * Automatically determines optimal number of clusters using elbow method
   */
  async clusterDocuments(
    caseId: string,
    maxClusters?: number,
  ): Promise<{
    clusters: Array<{
      clusterId: number;
      label: string;
      documentCount: number;
      documents: Array<{
        id: string;
        name: string;
        distanceFromCenter: number;
      }>;
      keywords: string[];
      summary: string;
    }>;
    optimalK: number;
    silhouetteScore: number;
    inertia: number;
  }> {
    try {
      this.logger.log(`Clustering documents for case ${caseId}`);

      // Get all documents for the case
      const documents = await this.getDocumentsForClustering(caseId);

      if (documents.length < 3) {
        throw new Error('Need at least 3 documents to perform clustering');
      }

      // Vectorize documents using TF-IDF
      const vectors = this.vectorizeDocuments(documents);

      // Determine optimal number of clusters
      const optimalK = maxClusters || this.determineOptimalClusters(
        vectors,
        Math.min(Math.floor(Math.sqrt(documents.length / 2)), 10),
      );

      this.logger.log(`Using ${optimalK} clusters`);

      // Perform K-Means clustering
      const { assignments, centroids, inertia } = this.kMeansClustering(
        vectors,
        optimalK,
      );

      // Calculate silhouette score
      const silhouetteScore = this.calculateSilhouetteScore(
        vectors,
        assignments,
        centroids,
      );

      // Group documents by cluster
      const clusters = this.organizeIntoClusters(
        documents,
        vectors,
        assignments,
        centroids,
        optimalK,
      );

      return {
        clusters,
        optimalK,
        silhouetteScore,
        inertia,
      };
    } catch (error) {
      this.logger.error(`Error clustering documents: ${error.message}`);
      throw error;
    }
  }

  /**
   * K-Means clustering algorithm
   * 1. Initialize K centroids randomly
   * 2. Assign each point to nearest centroid
   * 3. Update centroids as mean of assigned points
   * 4. Repeat until convergence
   */
  private kMeansClustering(
    vectors: Map<string, Map<string, number>>,
    k: number,
    maxIterations: number = 100,
  ): {
    assignments: Map<string, number>;
    centroids: Map<string, number>[];
    inertia: number;
  } {
    const documentIds = Array.from(vectors.keys());
    const vocabulary = this.buildVocabulary(vectors);

    // Initialize centroids randomly (K-Means++)
    let centroids = this.initializeCentroids(vectors, vocabulary, k);

    let assignments = new Map<string, number>();
    let previousAssignments = new Map<string, number>();
    let iterations = 0;

    // Iterate until convergence or max iterations
    while (iterations < maxIterations) {
      previousAssignments = new Map(assignments);

      // Assignment step: assign each document to nearest centroid
      assignments = new Map();
      documentIds.forEach((docId) => {
        const vector = vectors.get(docId)!;
        let minDistance = Infinity;
        let assignedCluster = 0;

        centroids.forEach((centroid, clusterIdx) => {
          const distance = this.euclideanDistance(vector, centroid, vocabulary);
          if (distance < minDistance) {
            minDistance = distance;
            assignedCluster = clusterIdx;
          }
        });

        assignments.set(docId, assignedCluster);
      });

      // Check for convergence
      if (this.assignmentsEqual(assignments, previousAssignments)) {
        this.logger.log(`K-Means converged after ${iterations} iterations`);
        break;
      }

      // Update step: recalculate centroids
      centroids = this.updateCentroids(vectors, assignments, vocabulary, k);

      iterations++;
    }

    // Calculate inertia (sum of squared distances to centroids)
    const inertia = this.calculateInertia(vectors, assignments, centroids, vocabulary);

    return { assignments, centroids, inertia };
  }

  /**
   * Initialize centroids using K-Means++ algorithm
   * Selects initial centroids that are far apart from each other
   */
  private initializeCentroids(
    vectors: Map<string, Map<string, number>>,
    vocabulary: Set<string>,
    k: number,
  ): Map<string, number>[] {
    const documentIds = Array.from(vectors.keys());
    const centroids: Map<string, number>[] = [];

    // Select first centroid randomly
    const firstIdx = Math.floor(Math.random() * documentIds.length);
    centroids.push(new Map(vectors.get(documentIds[firstIdx])));

    // Select remaining centroids
    for (let i = 1; i < k; i++) {
      const distances: number[] = [];

      // Calculate distance to nearest existing centroid for each point
      documentIds.forEach((docId) => {
        const vector = vectors.get(docId)!;
        let minDistance = Infinity;

        centroids.forEach((centroid) => {
          const distance = this.euclideanDistance(vector, centroid, vocabulary);
          minDistance = Math.min(minDistance, distance);
        });

        distances.push(minDistance);
      });

      // Select next centroid with probability proportional to distance
      const totalDistance = distances.reduce((a, b) => a + b, 0);
      let random = Math.random() * totalDistance;
      let selectedIdx = 0;

      for (let j = 0; j < distances.length; j++) {
        random -= distances[j];
        if (random <= 0) {
          selectedIdx = j;
          break;
        }
      }

      centroids.push(new Map(vectors.get(documentIds[selectedIdx])));
    }

    return centroids;
  }

  /**
   * Update centroids as mean of assigned documents
   */
  private updateCentroids(
    vectors: Map<string, Map<string, number>>,
    assignments: Map<string, number>,
    vocabulary: Set<string>,
    k: number,
  ): Map<string, number>[] {
    const centroids: Map<string, number>[] = [];

    for (let clusterId = 0; clusterId < k; clusterId++) {
      const clusterDocs = Array.from(assignments.entries())
        .filter(([_, cluster]) => cluster === clusterId)
        .map(([docId, _]) => docId);

      if (clusterDocs.length === 0) {
        // Empty cluster - reinitialize randomly
        const randomDocId = Array.from(vectors.keys())[
          Math.floor(Math.random() * vectors.size)
        ];
        centroids.push(new Map(vectors.get(randomDocId)));
        continue;
      }

      // Calculate mean vector
      const centroid = new Map<string, number>();

      vocabulary.forEach((term) => {
        const sum = clusterDocs.reduce((acc, docId) => {
          const vector = vectors.get(docId)!;
          return acc + (vector.get(term) || 0);
        }, 0);

        centroid.set(term, sum / clusterDocs.length);
      });

      centroids.push(centroid);
    }

    return centroids;
  }

  /**
   * Calculate Euclidean distance between two vectors
   */
  private euclideanDistance(
    vector1: Map<string, number>,
    vector2: Map<string, number>,
    vocabulary: Set<string>,
  ): number {
    let sumSquaredDiff = 0;

    vocabulary.forEach((term) => {
      const v1 = vector1.get(term) || 0;
      const v2 = vector2.get(term) || 0;
      sumSquaredDiff += Math.pow(v1 - v2, 2);
    });

    return Math.sqrt(sumSquaredDiff);
  }

  /**
   * Check if two assignment maps are equal
   */
  private assignmentsEqual(
    assignments1: Map<string, number>,
    assignments2: Map<string, number>,
  ): boolean {
    if (assignments1.size !== assignments2.size) return false;

    for (const [docId, cluster] of assignments1.entries()) {
      if (assignments2.get(docId) !== cluster) return false;
    }

    return true;
  }

  /**
   * Calculate inertia (within-cluster sum of squares)
   */
  private calculateInertia(
    vectors: Map<string, Map<string, number>>,
    assignments: Map<string, number>,
    centroids: Map<string, number>[],
    vocabulary: Set<string>,
  ): number {
    let inertia = 0;

    vectors.forEach((vector, docId) => {
      const clusterId = assignments.get(docId)!;
      const centroid = centroids[clusterId];
      const distance = this.euclideanDistance(vector, centroid, vocabulary);
      inertia += distance * distance;
    });

    return inertia;
  }

  /**
   * Calculate Silhouette score to measure cluster quality
   * Score ranges from -1 to 1, higher is better
   */
  private calculateSilhouetteScore(
    vectors: Map<string, Map<string, number>>,
    assignments: Map<string, number>,
    centroids: Map<string, number>[],
  ): number {
    const vocabulary = this.buildVocabulary(vectors);
    const documentIds = Array.from(vectors.keys());

    if (centroids.length < 2) return 0;

    let totalScore = 0;

    documentIds.forEach((docId) => {
      const vector = vectors.get(docId)!;
      const clusterId = assignments.get(docId)!;

      // Calculate a(i): mean distance to points in same cluster
      const sameClusterDocs = documentIds.filter(
        (id) => assignments.get(id) === clusterId && id !== docId,
      );

      const a = sameClusterDocs.length > 0
        ? sameClusterDocs.reduce((sum, otherId) => {
            const otherVector = vectors.get(otherId)!;
            return sum + this.euclideanDistance(vector, otherVector, vocabulary);
          }, 0) / sameClusterDocs.length
        : 0;

      // Calculate b(i): mean distance to points in nearest other cluster
      let minB = Infinity;

      centroids.forEach((_, otherClusterId) => {
        if (otherClusterId === clusterId) return;

        const otherClusterDocs = documentIds.filter(
          (id) => assignments.get(id) === otherClusterId,
        );

        if (otherClusterDocs.length > 0) {
          const b = otherClusterDocs.reduce((sum, otherId) => {
            const otherVector = vectors.get(otherId)!;
            return sum + this.euclideanDistance(vector, otherVector, vocabulary);
          }, 0) / otherClusterDocs.length;

          minB = Math.min(minB, b);
        }
      });

      const b = minB;

      // Silhouette score for this point
      const s = (b - a) / Math.max(a, b);
      totalScore += s;
    });

    return totalScore / documentIds.length;
  }

  /**
   * Determine optimal number of clusters using elbow method
   */
  private determineOptimalClusters(
    vectors: Map<string, Map<string, number>>,
    maxK: number,
  ): number {
    const inertias: number[] = [];

    // Try different values of k
    for (let k = 2; k <= maxK; k++) {
      const { inertia } = this.kMeansClustering(vectors, k, 50);
      inertias.push(inertia);
    }

    // Find elbow using rate of decrease
    let optimalK = 2;
    let maxDecrease = 0;

    for (let i = 1; i < inertias.length - 1; i++) {
      const decrease1 = inertias[i - 1] - inertias[i];
      const decrease2 = inertias[i] - inertias[i + 1];
      const changeInDecrease = decrease1 - decrease2;

      if (changeInDecrease > maxDecrease) {
        maxDecrease = changeInDecrease;
        optimalK = i + 2; // +2 because we start at k=2
      }
    }

    return optimalK;
  }

  /**
   * Organize documents into cluster objects
   */
  private organizeIntoClusters(
    documents: any[],
    vectors: Map<string, Map<string, number>>,
    assignments: Map<string, number>,
    centroids: Map<string, number>[],
    k: number,
  ): Array<any> {
    const vocabulary = this.buildVocabulary(vectors);
    const clusters = [];

    for (let clusterId = 0; clusterId < k; clusterId++) {
      const clusterDocs = documents.filter(
        (doc) => assignments.get(doc.id) === clusterId,
      );

      if (clusterDocs.length === 0) continue;

      const centroid = centroids[clusterId];

      // Calculate distance from center for each document
      const docsWithDistance = clusterDocs.map((doc) => {
        const vector = vectors.get(doc.id)!;
        const distance = this.euclideanDistance(vector, centroid, vocabulary);

        return {
          id: doc.id,
          name: doc.name,
          distanceFromCenter: Math.round(distance * 1000) / 1000,
        };
      });

      // Sort by distance from center
      docsWithDistance.sort((a, b) => a.distanceFromCenter - b.distanceFromCenter);

      // Extract keywords (top terms in centroid)
      const keywords = this.extractKeywords(centroid, 5);

      // Generate cluster label and summary
      const label = this.generateClusterLabel(keywords, clusterDocs);
      const summary = this.generateClusterSummary(clusterDocs, keywords);

      clusters.push({
        clusterId,
        label,
        documentCount: clusterDocs.length,
        documents: docsWithDistance,
        keywords,
        summary,
      });
    }

    return clusters;
  }

  /**
   * Extract top keywords from centroid
   */
  private extractKeywords(
    centroid: Map<string, number>,
    topN: number,
  ): string[] {
    const terms = Array.from(centroid.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, topN)
      .map(([term, _]) => term);

    return terms;
  }

  /**
   * Generate human-readable label for cluster
   */
  private generateClusterLabel(keywords: string[], documents: any[]): string {
    // Use top keyword as primary label
    const primaryKeyword = keywords[0];

    // Determine document type from file extensions
    const extensions = documents.map((d) => {
      const parts = d.name.split('.');
      return parts.length > 1 ? parts[parts.length - 1].toLowerCase() : '';
    });

    const mostCommonExt = this.findMostCommon(extensions);

    const typeLabels: Record<string, string> = {
      pdf: 'Documents',
      doc: 'Word Documents',
      docx: 'Word Documents',
      xls: 'Spreadsheets',
      xlsx: 'Spreadsheets',
      jpg: 'Images',
      png: 'Images',
      eml: 'Emails',
    };

    const typeLabel = typeLabels[mostCommonExt] || 'Documents';

    return `${primaryKeyword} - ${typeLabel}`;
  }

  /**
   * Generate cluster summary
   */
  private generateClusterSummary(documents: any[], keywords: string[]): string {
    const count = documents.length;
    const keywordList = keywords.slice(0, 3).join(', ');

    return `${count} document(s) related to ${keywordList}`;
  }

  /**
   * Find most common element in array
   */
  private findMostCommon(arr: string[]): string {
    const counts = new Map<string, number>();

    arr.forEach((item) => {
      counts.set(item, (counts.get(item) || 0) + 1);
    });

    let maxCount = 0;
    let mostCommon = '';

    counts.forEach((count, item) => {
      if (count > maxCount) {
        maxCount = count;
        mostCommon = item;
      }
    });

    return mostCommon;
  }

  /**
   * Get documents and prepare for clustering
   */
  private async getDocumentsForClustering(caseId: string): Promise<any[]> {
    const documents = await this.documentRepo
      .createQueryBuilder('doc')
      .where('doc.caseId = :caseId', { caseId })
      .andWhere('doc.extractedText IS NOT NULL')
      .getMany();

    return documents.map((doc) => ({
      id: doc.id,
      name: doc.name,
      text: doc.extractedText || '',
      type: doc.type,
    }));
  }

  /**
   * Vectorize documents using TF-IDF
   */
  private vectorizeDocuments(
    documents: any[],
  ): Map<string, Map<string, number>> {
    const vectors = new Map<string, Map<string, number>>();

    // Tokenize all documents
    const tokenizedDocs = documents.map((doc) => ({
      id: doc.id,
      tokens: this.tokenize(doc.text),
    }));

    // Build vocabulary
    const vocabulary = new Set<string>();
    tokenizedDocs.forEach((doc) => {
      doc.tokens.forEach((token) => vocabulary.add(token));
    });

    // Calculate IDF for each term
    const idf = this.calculateIDF(tokenizedDocs, vocabulary);

    // Calculate TF-IDF vectors
    tokenizedDocs.forEach((doc) => {
      const tfidf = new Map<string, number>();

      // Calculate term frequency
      const termFreq = new Map<string, number>();
      doc.tokens.forEach((term) => {
        termFreq.set(term, (termFreq.get(term) || 0) + 1);
      });

      // Calculate TF-IDF
      vocabulary.forEach((term) => {
        const tf = (termFreq.get(term) || 0) / doc.tokens.length;
        const idfValue = idf.get(term) || 0;
        tfidf.set(term, tf * idfValue);
      });

      vectors.set(doc.id, tfidf);
    });

    return vectors;
  }

  /**
   * Calculate IDF (Inverse Document Frequency) for all terms
   */
  private calculateIDF(
    documents: Array<{ id: string; tokens: string[] }>,
    vocabulary: Set<string>,
  ): Map<string, number> {
    const idf = new Map<string, number>();
    const numDocs = documents.length;

    vocabulary.forEach((term) => {
      // Count documents containing this term
      const docsWithTerm = documents.filter((doc) =>
        doc.tokens.includes(term),
      ).length;

      // IDF = log(N / df)
      idf.set(term, Math.log(numDocs / (1 + docsWithTerm)));
    });

    return idf;
  }

  /**
   * Tokenize text into terms
   */
  private tokenize(text: string): string[] {
    const cleaned = text
      .toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();

    const tokens = cleaned.split(' ').filter((t) => t.length > 2);

    // Remove stop words
    const stopWords = new Set([
      'the', 'and', 'for', 'are', 'but', 'not', 'you', 'all', 'can', 'her',
      'was', 'one', 'our', 'out', 'day', 'get', 'has', 'him', 'his', 'how',
      'its', 'may', 'now', 'old', 'see', 'two', 'who', 'boy', 'did', 'she',
      'that', 'this', 'with', 'have', 'from', 'they', 'been', 'said', 'will',
    ]);

    return tokens.filter((t) => !stopWords.has(t));
  }

  /**
   * Build vocabulary from vectors
   */
  private buildVocabulary(
    vectors: Map<string, Map<string, number>>,
  ): Set<string> {
    const vocabulary = new Set<string>();

    vectors.forEach((vector) => {
      vector.forEach((_, term) => vocabulary.add(term));
    });

    return vocabulary;
  }

  /**
   * Suggest document organization based on clusters
   */
  async suggestDocumentOrganization(
    caseId: string,
  ): Promise<{
    suggestions: Array<{
      action: 'create_folder' | 'move_document' | 'tag_document';
      target: string;
      reason: string;
    }>;
  }> {
    const { clusters } = await this.clusterDocuments(caseId);

    const suggestions = [];

    // Suggest folder creation for each cluster
    clusters.forEach((cluster) => {
      if (cluster.documentCount >= 3) {
        suggestions.push({
          action: 'create_folder' as const,
          target: cluster.label,
          reason: `Group ${cluster.documentCount} related documents: ${cluster.summary}`,
        });

        // Suggest moving documents into folders
        cluster.documents.forEach((doc) => {
          suggestions.push({
            action: 'move_document' as const,
            target: `${doc.name} → ${cluster.label}`,
            reason: `Document related to ${cluster.keywords.join(', ')}`,
          });
        });
      }
    });

    return { suggestions };
  }
}
