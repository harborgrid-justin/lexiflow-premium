/**
 * Examination Service
 * Handles examination and transcript operations for discovery management
 *
 * @module ExaminationService
 * @description Manages examinations and transcript records
 */

import { discoveryApi } from "@/api/domains/discovery.api";
import { OperationError, ValidationError } from "@/services/core/errors";
import { apiClient } from "@/services/infrastructure/apiClient";
import type { Examination, Transcript } from "@/types";
import { validateCaseId } from "../shared/validation";

/**
 * Examination Service Class
 * Manages examination and transcript data operations
 */
export class ExaminationService {
  /**
   * Get all examinations, optionally filtered by case
   *
   * @param caseId - Optional case ID filter
   * @returns Promise<Examination[]> Array of examinations
   * @throws Error if caseId is invalid
   */
  async getExaminations(caseId?: string): Promise<Examination[]> {
    validateCaseId(caseId, "getExaminations");

    try {
      return (await discoveryApi.examinations.getAll(
        caseId ? { caseId } : undefined
      )) as unknown as Examination[];
    } catch (error) {
      console.error("[ExaminationService.getExaminations] Error:", error);
      return [];
    }
  }

  /**
   * Add a new examination
   *
   * @param examination - Examination data
   * @returns Promise<Examination> Created examination
   * @throws ValidationError if examination data is invalid
   * @throws OperationError if create fails
   */
  async addExamination(examination: Examination): Promise<Examination> {
    if (!examination || typeof examination !== "object") {
      throw new ValidationError(
        "[ExaminationService.addExamination] Invalid examination data"
      );
    }

    try {
      return await discoveryApi.examinations.create(examination);
    } catch (error) {
      console.error("[ExaminationService.addExamination] Error:", error);
      throw new OperationError("addExamination", "Failed to add examination");
    }
  }

  /**
   * Get all transcripts, optionally filtered by case
   *
   * @param caseId - Optional case ID filter
   * @returns Promise<Transcript[]> Array of transcripts
   * @throws Error if caseId is invalid
   */
  async getTranscripts(caseId?: string): Promise<Transcript[]> {
    validateCaseId(caseId, "getTranscripts");

    try {
      return await apiClient.get<Transcript[]>("/discovery/transcripts", {
        { params: { caseId } }
      });
    } catch (error) {
      console.error("[ExaminationService.getTranscripts] Error:", error);
      return [];
    }
  }

  /**
   * Add a new transcript
   *
   * @param transcript - Transcript data
   * @returns Promise<Transcript> Created transcript
   * @throws ValidationError if transcript data is invalid
   * @throws OperationError if create fails
   */
  async addTranscript(transcript: Transcript): Promise<Transcript> {
    if (!transcript || typeof transcript !== "object") {
      throw new ValidationError(
        "[ExaminationService.addTranscript] Invalid transcript data"
      );
    }

    try {
      return await apiClient.post<Transcript>(
        "/discovery/transcripts",
        transcript
      );
    } catch (error) {
      console.error("[ExaminationService.addTranscript] Error:", error);
      throw new OperationError("addTranscript", "Failed to add transcript");
    }
  }
}

export const examinationService = new ExaminationService();
