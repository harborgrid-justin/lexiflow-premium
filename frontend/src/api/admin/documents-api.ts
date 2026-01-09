/**
 * Documents API Service - Re-export from modular structure
 * @module api/admin/documents-api
 * @deprecated Import from './documents' instead
 */

import * as annotations from "./documents/annotations";
import * as crud from "./documents/crud";
import * as fileOps from "./documents/fileOps";
import * as queries from "./documents/queries";
import * as versions from "./documents/versions";

export { DOCUMENTS_QUERY_KEYS } from "./documents";

/** Documents API Service Class */
export class DocumentsApiService {
  constructor() {
    console.log(
      "[DocumentsApiService] Initialized with Backend API (PostgreSQL)"
    );
  }

  // CRUD Operations
  getAll = crud.getAll;
  getById = crud.getById;
  add = crud.add;
  update = crud.update;
  delete = crud.deleteDoc;

  // File Operations
  upload = fileOps.upload;
  bulkUpload = fileOps.bulkUpload;
  download = fileOps.download;
  preview = fileOps.preview;

  // Version Operations
  redact = versions.redact;
  getVersions = versions.getVersions;
  restoreVersion = versions.restoreVersion;
  compareVersions = versions.compareVersions;

  // Query Operations
  getByCaseId = queries.getByCaseId;
  getFolders = queries.getFolders;
  getContent = queries.getContent;
  getStats = queries.getStats;

  // Annotation Operations
  getAnnotations = annotations.getAnnotations;
  addAnnotation = annotations.addAnnotation;
  deleteAnnotation = annotations.deleteAnnotation;
  updateAnnotation = annotations.updateAnnotation;
}
