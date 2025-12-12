import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

/**
 * Sentiment Analysis Service
 * Analyzes sentiment in legal communications and documents
 * Algorithm: Lexicon-based sentiment scoring + contextual analysis
 */
@Injectable()
export class SentimentAnalysisService {
  private readonly logger = new Logger(SentimentAnalysisService.name);

  // Legal sentiment lexicon
  private readonly positiveLexicon = new Set([
    'agree', 'approved', 'favorable', 'support', 'accept', 'grant', 'sustain',
    'uphold', 'affirm', 'allow', 'permit', 'reasonable', 'fair', 'justified',
    'meritorious', 'credible', 'persuasive', 'compelling', 'strong', 'valid',
    'legitimate', 'proper', 'appropriate', 'consistent', 'clear', 'satisfied',
    'complied', 'adequate', 'sufficient', 'timely', 'cooperation', 'professional',
  ]);

  private readonly negativeLexicon = new Set([
    'deny', 'reject', 'oppose', 'object', 'overrule', 'dismiss', 'strike',
    'vacate', 'reverse', 'unreasonable', 'unfair', 'frivolous', 'meritless',
    'unsupported', 'incredible', 'weak', 'insufficient', 'improper', 'inappropriate',
    'inconsistent', 'unclear', 'failed', 'violated', 'inadequate', 'untimely',
    'uncooperative', 'unprofessional', 'prejudicial', 'harmful', 'adverse',
  ]);

  private readonly intensifiers = new Set([
    'very', 'extremely', 'highly', 'particularly', 'especially', 'clearly',
    'obviously', 'absolutely', 'completely', 'totally', 'entirely',
  ]);

  private readonly negations = new Set([
    'not', 'no', 'never', 'neither', 'nor', 'without', 'lack', 'absent',
  ]);

  constructor(
    @InjectRepository('Document') private documentRepo: Repository<any>,
    @InjectRepository('Communication') private communicationRepo: Repository<any>,
  ) {}

  /**
   * Analyze judge sentiment from court orders and rulings
   */
  async analyzeJudgeSentiment(
    caseId: string,
  ): Promise<{
    overallSentiment: 'very_favorable' | 'favorable' | 'neutral' | 'unfavorable' | 'very_unfavorable';
    sentimentScore: number; // -1 to 1
    confidence: number;
    analysis: {
      positiveIndicators: string[];
      negativeIndicators: string[];
      neutralIndicators: string[];
    };
    timeline: Array<{
      date: Date;
      documentName: string;
      sentimentScore: number;
      sentiment: string;
    }>;
    trend: 'improving' | 'stable' | 'declining';
  }> {
    try {
      this.logger.log(`Analyzing judge sentiment for case ${caseId}`);

      // Get court documents (orders, rulings, opinions)
      const courtDocuments = await this.getCourtDocuments(caseId);

      if (courtDocuments.length === 0) {
        return {
          overallSentiment: 'neutral',
          sentimentScore: 0,
          confidence: 0,
          analysis: {
            positiveIndicators: [],
            negativeIndicators: [],
            neutralIndicators: ['No court documents available for analysis'],
          },
          timeline: [],
          trend: 'stable',
        };
      }

      // Analyze each document
      const documentAnalyses = courtDocuments.map((doc) => {
        const analysis = this.analyzeSentiment(doc.text);
        return {
          date: doc.date,
          documentName: doc.name,
          sentimentScore: analysis.score,
          sentiment: analysis.sentiment,
          positiveTerms: analysis.positiveTerms,
          negativeTerms: analysis.negativeTerms,
        };
      });

      // Calculate overall sentiment
      const avgScore =
        documentAnalyses.reduce((sum, a) => sum + a.sentimentScore, 0) /
        documentAnalyses.length;

      const overallSentiment = this.classifySentiment(avgScore);

      // Extract indicators
      const allPositive = documentAnalyses.flatMap((a) => a.positiveTerms);
      const allNegative = documentAnalyses.flatMap((a) => a.negativeTerms);

      const positiveIndicators = Array.from(new Set(allPositive)).slice(0, 10);
      const negativeIndicators = Array.from(new Set(allNegative)).slice(0, 10);

      // Calculate confidence based on document count and consistency
      const variance = this.calculateVariance(
        documentAnalyses.map((a) => a.sentimentScore),
      );
      const confidence = Math.min(
        1,
        (documentAnalyses.length / 10) * (1 - Math.min(variance, 0.5)),
      );

      // Determine trend
      const trend = this.determineTrend(
        documentAnalyses.map((a) => a.sentimentScore),
      );

      return {
        overallSentiment,
        sentimentScore: Math.round(avgScore * 1000) / 1000,
        confidence: Math.round(confidence * 1000) / 1000,
        analysis: {
          positiveIndicators,
          negativeIndicators,
          neutralIndicators: [],
        },
        timeline: documentAnalyses.map((a) => ({
          date: a.date,
          documentName: a.documentName,
          sentimentScore: Math.round(a.sentimentScore * 1000) / 1000,
          sentiment: a.sentiment,
        })),
        trend,
      };
    } catch (error) {
      this.logger.error(`Error analyzing judge sentiment: ${error.message}`);
      throw error;
    }
  }

  /**
   * Analyze opposing counsel sentiment from communications
   */
  async analyzeOpposingCounselSentiment(
    caseId: string,
  ): Promise<{
    overallSentiment: 'cooperative' | 'neutral' | 'adversarial' | 'hostile';
    sentimentScore: number;
    cooperationLevel: number; // 0-1
    professionalismScore: number; // 0-1
    indicators: {
      cooperativeSignals: string[];
      adversarialSignals: string[];
    };
    communicationAnalysis: Array<{
      date: Date;
      type: string;
      sentiment: string;
      score: number;
      summary: string;
    }>;
  }> {
    try {
      this.logger.log(`Analyzing opposing counsel sentiment for case ${caseId}`);

      // Get communications with opposing counsel
      const communications = await this.getOpposingCounselCommunications(caseId);

      if (communications.length === 0) {
        return {
          overallSentiment: 'neutral',
          sentimentScore: 0,
          cooperationLevel: 0.5,
          professionalismScore: 0.5,
          indicators: {
            cooperativeSignals: [],
            adversarialSignals: [],
          },
          communicationAnalysis: [],
        };
      }

      // Analyze each communication
      const analyses = communications.map((comm) => {
        const sentiment = this.analyzeSentiment(comm.text);
        const cooperation = this.assessCooperation(comm.text);
        const professionalism = this.assessProfessionalism(comm.text);

        return {
          date: comm.date,
          type: comm.type,
          sentiment: sentiment.sentiment,
          score: sentiment.score,
          cooperation,
          professionalism,
          summary: this.generateCommSummary(sentiment, cooperation, professionalism),
        };
      });

      // Calculate overall metrics
      const avgScore =
        analyses.reduce((sum, a) => sum + a.score, 0) / analyses.length;
      const cooperationLevel =
        analyses.reduce((sum, a) => sum + a.cooperation, 0) / analyses.length;
      const professionalismScore =
        analyses.reduce((sum, a) => sum + a.professionalism, 0) / analyses.length;

      // Classify overall sentiment
      let overallSentiment: 'cooperative' | 'neutral' | 'adversarial' | 'hostile';
      if (avgScore > 0.3 && cooperationLevel > 0.6) {
        overallSentiment = 'cooperative';
      } else if (avgScore < -0.3 || cooperationLevel < 0.3) {
        overallSentiment = avgScore < -0.5 ? 'hostile' : 'adversarial';
      } else {
        overallSentiment = 'neutral';
      }

      // Extract indicators
      const cooperativeSignals = this.extractCooperativeSignals(communications);
      const adversarialSignals = this.extractAdversarialSignals(communications);

      return {
        overallSentiment,
        sentimentScore: Math.round(avgScore * 1000) / 1000,
        cooperationLevel: Math.round(cooperationLevel * 1000) / 1000,
        professionalismScore: Math.round(professionalismScore * 1000) / 1000,
        indicators: {
          cooperativeSignals,
          adversarialSignals,
        },
        communicationAnalysis: analyses,
      };
    } catch (error) {
      this.logger.error(`Error analyzing opposing counsel sentiment: ${error.message}`);
      throw error;
    }
  }

  /**
   * Core sentiment analysis using lexicon-based approach
   */
  private analyzeSentiment(text: string): {
    score: number;
    sentiment: string;
    positiveTerms: string[];
    negativeTerms: string[];
  } {
    const tokens = this.tokenize(text.toLowerCase());
    let score = 0;
    const positiveTerms: string[] = [];
    const negativeTerms: string[] = [];

    for (let i = 0; i < tokens.length; i++) {
      const token = tokens[i];
      let tokenScore = 0;

      // Check for sentiment words
      if (this.positiveLexicon.has(token)) {
        tokenScore = 1;
        positiveTerms.push(token);
      } else if (this.negativeLexicon.has(token)) {
        tokenScore = -1;
        negativeTerms.push(token);
      }

      // Apply intensifiers
      if (i > 0 && this.intensifiers.has(tokens[i - 1])) {
        tokenScore *= 1.5;
      }

      // Apply negations
      if (i > 0 && this.negations.has(tokens[i - 1])) {
        tokenScore *= -1;
      }

      score += tokenScore;
    }

    // Normalize score to [-1, 1] range
    const normalizedScore = Math.tanh(score / 10);

    const sentiment = this.classifySentiment(normalizedScore);

    return {
      score: normalizedScore,
      sentiment,
      positiveTerms,
      negativeTerms,
    };
  }

  /**
   * Classify sentiment score into category
   */
  private classifySentiment(score: number): string {
    if (score > 0.5) return 'very_favorable';
    if (score > 0.15) return 'favorable';
    if (score < -0.5) return 'very_unfavorable';
    if (score < -0.15) return 'unfavorable';
    return 'neutral';
  }

  /**
   * Assess cooperation level in communication
   */
  private assessCooperation(text: string): number {
    const cooperativeTerms = [
      'agree', 'willing', 'accommodate', 'stipulate', 'consent', 'cooperate',
      'work together', 'compromise', 'reasonable', 'extension', 'continuance',
    ];

    const adversarialTerms = [
      'refuse', 'deny', 'oppose', 'object', 'reject', 'unreasonable',
      'uncooperative', 'will not', 'cannot agree',
    ];

    const lowerText = text.toLowerCase();
    let score = 0.5; // Start neutral

    cooperativeTerms.forEach((term) => {
      if (lowerText.includes(term)) score += 0.1;
    });

    adversarialTerms.forEach((term) => {
      if (lowerText.includes(term)) score -= 0.1;
    });

    return Math.max(0, Math.min(1, score));
  }

  /**
   * Assess professionalism in communication
   */
  private assessProfessionalism(text: string): number {
    const professionalTerms = [
      'respectfully', 'please', 'thank you', 'appreciate', 'understand',
      'professional courtesy', 'best regards', 'sincerely',
    ];

    const unprofessionalTerms = [
      'ridiculous', 'absurd', 'outrageous', 'incompetent', 'dishonest',
      'bad faith', 'harassment', 'threatening',
    ];

    const lowerText = text.toLowerCase();
    let score = 0.7; // Assume professional unless indicated otherwise

    professionalTerms.forEach((term) => {
      if (lowerText.includes(term)) score += 0.05;
    });

    unprofessionalTerms.forEach((term) => {
      if (lowerText.includes(term)) score -= 0.15;
    });

    return Math.max(0, Math.min(1, score));
  }

  /**
   * Get court documents for sentiment analysis
   */
  private async getCourtDocuments(caseId: string): Promise<any[]> {
    const documents = await this.documentRepo
      .createQueryBuilder('doc')
      .where('doc.caseId = :caseId', { caseId })
      .andWhere('doc.type IN (:...types)', {
        types: ['order', 'ruling', 'opinion', 'decision'],
      })
      .andWhere('doc.extractedText IS NOT NULL')
      .orderBy('doc.date', 'ASC')
      .getMany();

    return documents.map((doc) => ({
      id: doc.id,
      name: doc.name,
      text: doc.extractedText,
      date: doc.date,
      type: doc.type,
    }));
  }

  /**
   * Get opposing counsel communications
   */
  private async getOpposingCounselCommunications(caseId: string): Promise<any[]> {
    const communications = await this.communicationRepo
      .createQueryBuilder('comm')
      .where('comm.caseId = :caseId', { caseId })
      .andWhere('comm.fromOpposingCounsel = true')
      .andWhere('comm.content IS NOT NULL')
      .orderBy('comm.date', 'ASC')
      .getMany();

    return communications.map((comm) => ({
      id: comm.id,
      text: comm.content,
      date: comm.date,
      type: comm.type || 'email',
    }));
  }

  private tokenize(text: string): string[] {
    return text
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter((t) => t.length > 0);
  }

  private calculateVariance(values: number[]): number {
    const mean = values.reduce((a, b) => a + b, 0) / values.length;
    const squaredDiffs = values.map((v) => Math.pow(v - mean, 2));
    return squaredDiffs.reduce((a, b) => a + b, 0) / values.length;
  }

  private determineTrend(scores: number[]): 'improving' | 'stable' | 'declining' {
    if (scores.length < 3) return 'stable';

    // Compare first half vs second half
    const midPoint = Math.floor(scores.length / 2);
    const firstHalf = scores.slice(0, midPoint);
    const secondHalf = scores.slice(midPoint);

    const firstAvg = firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length;
    const secondAvg = secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length;

    const change = secondAvg - firstAvg;

    if (change > 0.15) return 'improving';
    if (change < -0.15) return 'declining';
    return 'stable';
  }

  private generateCommSummary(
    sentiment: any,
    cooperation: number,
    professionalism: number,
  ): string {
    const sentimentDesc = sentiment.sentiment;
    const coopDesc = cooperation > 0.6 ? 'cooperative' : cooperation < 0.4 ? 'adversarial' : 'neutral';
    const profDesc = professionalism > 0.7 ? 'professional' : 'concerning tone';

    return `${sentimentDesc} sentiment, ${coopDesc}, ${profDesc}`;
  }

  private extractCooperativeSignals(communications: any[]): string[] {
    const signals = new Set<string>();

    communications.forEach((comm) => {
      const lowerText = comm.text.toLowerCase();

      if (lowerText.includes('agree')) signals.add('Expressed agreement');
      if (lowerText.includes('stipulate')) signals.add('Willing to stipulate');
      if (lowerText.includes('extension')) signals.add('Granted extensions');
      if (lowerText.includes('cooperate')) signals.add('Indicated cooperation');
      if (lowerText.includes('work together')) signals.add('Collaborative approach');
    });

    return Array.from(signals);
  }

  private extractAdversarialSignals(communications: any[]): string[] {
    const signals = new Set<string>();

    communications.forEach((comm) => {
      const lowerText = comm.text.toLowerCase();

      if (lowerText.includes('oppose')) signals.add('Opposes requests');
      if (lowerText.includes('object')) signals.add('Frequent objections');
      if (lowerText.includes('refuse')) signals.add('Refuses cooperation');
      if (lowerText.includes('unreasonable')) signals.add('Claims unreasonableness');
      if (lowerText.includes('bad faith')) signals.add('Allegations of bad faith');
    });

    return Array.from(signals);
  }

  /**
   * Analyze sentiment trends over time
   */
  async analyzeSentimentTrends(
    caseId: string,
    entityType: 'judge' | 'opposing_counsel',
  ): Promise<{
    trend: 'improving' | 'stable' | 'declining';
    changeRate: number;
    prediction: {
      nextMonth: number;
      confidence: number;
    };
  }> {
    const analysis =
      entityType === 'judge'
        ? await this.analyzeJudgeSentiment(caseId)
        : await this.analyzeOpposingCounselSentiment(caseId);

    const scores =
      entityType === 'judge'
        ? analysis.timeline.map((t: any) => t.sentimentScore)
        : (analysis as any).communicationAnalysis.map((c: any) => c.score);

    if (scores.length < 2) {
      return {
        trend: 'stable',
        changeRate: 0,
        prediction: {
          nextMonth: scores[0] || 0,
          confidence: 0.5,
        },
      };
    }

    // Simple linear regression to predict next value
    const n = scores.length;
    const x = Array.from({ length: n }, (_, i) => i);
    const y = scores;

    const sumX = x.reduce((a, b) => a + b, 0);
    const sumY = y.reduce((a, b) => a + b, 0);
    const sumXY = x.reduce((sum, xi, i) => sum + xi * y[i], 0);
    const sumX2 = x.reduce((sum, xi) => sum + xi * xi, 0);

    const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;

    const nextMonthPrediction = slope * n + intercept;

    const trend = analysis.trend || 'stable';
    const changeRate = Math.abs(slope);

    // Calculate confidence based on R-squared
    const meanY = sumY / n;
    const ssTotal = y.reduce((sum, yi) => sum + Math.pow(yi - meanY, 2), 0);
    const ssResidual = y.reduce(
      (sum, yi, i) => sum + Math.pow(yi - (slope * x[i] + intercept), 2),
      0,
    );
    const rSquared = 1 - ssResidual / ssTotal;
    const confidence = Math.max(0, Math.min(1, rSquared));

    return {
      trend,
      changeRate: Math.round(changeRate * 1000) / 1000,
      prediction: {
        nextMonth: Math.round(nextMonthPrediction * 1000) / 1000,
        confidence: Math.round(confidence * 1000) / 1000,
      },
    };
  }
}
