export interface StorageFile {
  filename: string;
  originalname: string;
  path: string;
  size: number;
  mimetype: string;
  checksum: string;
}

export interface FileUploadResult {
  filename: string;
  path: string;
  size: number;
  mimetype: string;
  checksum: string;
  uploadedAt: Date;
}
