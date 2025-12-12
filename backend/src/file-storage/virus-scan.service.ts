import { Injectable, Logger } from '@nestjs/common';
import { exec } from 'child_process';
import { promisify } from 'util';
import * as fs from 'fs/promises';
import * as path from 'path';
import * as os from 'os';

const execAsync = promisify(exec);

export interface ScanResult {
  clean: boolean;
  threats: string[];
  scanEngine: string;
  scanTime: number;
  fileSize: number;
  fileName: string;
  signature?: string;
}

export interface ScanStatistics {
  totalScans: number;
  cleanFiles: number;
  infectedFiles: number;
  failedScans: number;
  averageScanTime: number;
}

/**
 * Virus Scanning Service
 * Integrates with ClamAV for malware detection:
 * - Real-time file scanning
 * - Signature-based detection
 * - Heuristic analysis
 * - Quarantine management
 * - Batch scanning
 * - Automatic signature updates
 */
@Injectable()
export class VirusScanService {
  private readonly logger = new Logger(VirusScanService.name);

  // Statistics tracking
  private statistics: ScanStatistics = {
    totalScans: 0,
    cleanFiles: 0,
    infectedFiles: 0,
    failedScans: 0,
    averageScanTime: 0,
  };

  // Common malware signatures (simplified for demo)
  private readonly knownMalwareSignatures = [
    'X5O!P%@AP[4\\PZX54(P^)7CC)7}$EICAR-STANDARD-ANTIVIRUS-TEST-FILE!$H+H*', // EICAR test file
  ];

  // Suspicious file patterns
  private readonly suspiciousPatterns = [
    Buffer.from('eval('),
    Buffer.from('exec('),
    Buffer.from('system('),
    Buffer.from('<script'),
    Buffer.from('javascript:'),
    Buffer.from('vbscript:'),
    Buffer.from('onload='),
    Buffer.from('onerror='),
  ];

  /**
   * Scan file for viruses
   */
  async scanFile(filePath: string, fileName: string): Promise<ScanResult> {
    const startTime = Date.now();

    try {
      this.logger.log(`Scanning file: ${fileName}`);

      // Get file size
      const stats = await fs.stat(filePath);
      const fileSize = stats.size;

      // Try ClamAV first if available
      let result: ScanResult;

      if (await this.isClamAvAvailable()) {
        result = await this.scanWithClamAV(filePath, fileName, fileSize);
      } else {
        // Fall back to heuristic scanning
        this.logger.warn('ClamAV not available, using heuristic scanning');
        result = await this.scanWithHeuristics(filePath, fileName, fileSize);
      }

      // Update statistics
      this.updateStatistics(result, startTime);

      return result;

    } catch (error) {
      this.logger.error(`Virus scan failed for ${fileName}: ${error.message}`, error.stack);

      this.statistics.totalScans++;
      this.statistics.failedScans++;

      return {
        clean: false,
        threats: [`Scan error: ${error.message}`],
        scanEngine: 'error',
        scanTime: Date.now() - startTime,
        fileSize: 0,
        fileName,
      };
    }
  }

  /**
   * Scan buffer for viruses
   */
  async scanBuffer(buffer: Buffer, fileName: string): Promise<ScanResult> {
    const startTime = Date.now();

    try {
      // Write buffer to temporary file
      const tempDir = os.tmpdir();
      const tempPath = path.join(tempDir, `scan_${Date.now()}_${fileName}`);

      await fs.writeFile(tempPath, buffer);

      try {
        const result = await this.scanFile(tempPath, fileName);
        return result;
      } finally {
        // Clean up temp file
        await fs.unlink(tempPath).catch(() => {});
      }

    } catch (error) {
      this.logger.error(`Buffer scan failed: ${error.message}`);

      return {
        clean: false,
        threats: [`Scan error: ${error.message}`],
        scanEngine: 'error',
        scanTime: Date.now() - startTime,
        fileSize: buffer.length,
        fileName,
      };
    }
  }

  /**
   * Scan with ClamAV
   */
  private async scanWithClamAV(
    filePath: string,
    fileName: string,
    fileSize: number,
  ): Promise<ScanResult> {
    const startTime = Date.now();

    try {
      // Run clamscan command
      const { stdout, stderr } = await execAsync(`clamscan --no-summary "${filePath}"`);

      const output = stdout + stderr;
      const scanTime = Date.now() - startTime;

      // Parse ClamAV output
      const isClean = output.includes('OK') && !output.includes('FOUND');
      const threats: string[] = [];

      if (!isClean) {
        // Extract threat names
        const threatMatches = output.match(/: (.+) FOUND/g);
        if (threatMatches) {
          for (const match of threatMatches) {
            const threat = match.replace(/: (.+) FOUND/, '$1').trim();
            threats.push(threat);
          }
        }
      }

      return {
        clean: isClean,
        threats,
        scanEngine: 'ClamAV',
        scanTime,
        fileSize,
        fileName,
      };

    } catch (error) {
      // ClamAV returns non-zero exit code for infected files
      if (error.stdout && error.stdout.includes('FOUND')) {
        const threats: string[] = [];
        const threatMatches = error.stdout.match(/: (.+) FOUND/g);

        if (threatMatches) {
          for (const match of threatMatches) {
            const threat = match.replace(/: (.+) FOUND/, '$1').trim();
            threats.push(threat);
          }
        }

        return {
          clean: false,
          threats,
          scanEngine: 'ClamAV',
          scanTime: Date.now() - startTime,
          fileSize,
          fileName,
        };
      }

      throw error;
    }
  }

  /**
   * Heuristic scanning (fallback when ClamAV not available)
   */
  private async scanWithHeuristics(
    filePath: string,
    fileName: string,
    fileSize: number,
  ): Promise<ScanResult> {
    const startTime = Date.now();
    const threats: string[] = [];

    try {
      // Read file content
      const buffer = await fs.readFile(filePath);

      // Check for known malware signatures
      const content = buffer.toString('utf-8', 0, Math.min(buffer.length, 65536)); // First 64KB

      for (const signature of this.knownMalwareSignatures) {
        if (content.includes(signature)) {
          threats.push('EICAR-Test-File (malware test signature)');
          break;
        }
      }

      // Check for suspicious patterns
      for (const pattern of this.suspiciousPatterns) {
        if (buffer.includes(pattern)) {
          threats.push(`Suspicious pattern detected: ${pattern.toString().substring(0, 20)}`);
        }
      }

      // Check file extension against content type
      const extensionThreats = this.checkFileExtension(fileName, buffer);
      threats.push(...extensionThreats);

      // Check for executable code in non-executable files
      if (this.isNonExecutableFile(fileName) && this.containsExecutableCode(buffer)) {
        threats.push('Executable code in non-executable file');
      }

      // Check for suspicious entropy (encrypted/packed files)
      const entropy = this.calculateEntropy(buffer);
      if (entropy > 7.5) { // High entropy threshold
        threats.push('High entropy detected (possibly encrypted/packed malware)');
      }

      const scanTime = Date.now() - startTime;

      return {
        clean: threats.length === 0,
        threats,
        scanEngine: 'Heuristic',
        scanTime,
        fileSize,
        fileName,
      };

    } catch (error) {
      throw new Error(`Heuristic scan failed: ${error.message}`);
    }
  }

  /**
   * Check if file extension matches content
   */
  private checkFileExtension(fileName: string, buffer: Buffer): string[] {
    const threats: string[] = [];
    const ext = path.extname(fileName).toLowerCase();

    // Check magic bytes
    const magicBytes = buffer.slice(0, 4);

    // PDF should start with %PDF
    if (ext === '.pdf' && !buffer.slice(0, 4).toString().startsWith('%PDF')) {
      threats.push('File extension mismatch: Not a valid PDF file');
    }

    // ZIP files (also DOCX, XLSX, etc.)
    if (['.zip', '.docx', '.xlsx', '.pptx'].includes(ext)) {
      const zipMagic = Buffer.from([0x50, 0x4B, 0x03, 0x04]);
      if (!magicBytes.equals(zipMagic.slice(0, 4))) {
        threats.push('File extension mismatch: Not a valid ZIP-based file');
      }
    }

    // JPEG
    if (['.jpg', '.jpeg'].includes(ext)) {
      const jpegMagic = Buffer.from([0xFF, 0xD8, 0xFF]);
      if (!magicBytes.slice(0, 3).equals(jpegMagic)) {
        threats.push('File extension mismatch: Not a valid JPEG file');
      }
    }

    // PNG
    if (ext === '.png') {
      const pngMagic = Buffer.from([0x89, 0x50, 0x4E, 0x47]);
      if (!magicBytes.equals(pngMagic)) {
        threats.push('File extension mismatch: Not a valid PNG file');
      }
    }

    return threats;
  }

  /**
   * Check if file is non-executable type
   */
  private isNonExecutableFile(fileName: string): boolean {
    const ext = path.extname(fileName).toLowerCase();
    const nonExecutableExts = ['.pdf', '.txt', '.jpg', '.jpeg', '.png', '.gif', '.docx', '.xlsx'];
    return nonExecutableExts.includes(ext);
  }

  /**
   * Check if buffer contains executable code
   */
  private containsExecutableCode(buffer: Buffer): boolean {
    // Check for PE header (Windows executables)
    if (buffer.includes(Buffer.from('MZ')) && buffer.includes(Buffer.from('PE'))) {
      return true;
    }

    // Check for ELF header (Linux executables)
    const elfMagic = Buffer.from([0x7F, 0x45, 0x4C, 0x46]);
    if (buffer.slice(0, 4).equals(elfMagic)) {
      return true;
    }

    // Check for Mach-O header (macOS executables)
    const machoMagic = Buffer.from([0xCF, 0xFA, 0xED, 0xFE]);
    if (buffer.slice(0, 4).equals(machoMagic)) {
      return true;
    }

    return false;
  }

  /**
   * Calculate Shannon entropy of data (measure of randomness)
   */
  private calculateEntropy(buffer: Buffer): number {
    const frequency = new Map<number, number>();

    // Count byte frequencies
    for (const byte of buffer) {
      frequency.set(byte, (frequency.get(byte) || 0) + 1);
    }

    // Calculate entropy
    let entropy = 0;
    const length = buffer.length;

    for (const count of frequency.values()) {
      const probability = count / length;
      entropy -= probability * Math.log2(probability);
    }

    return entropy;
  }

  /**
   * Check if ClamAV is available
   */
  private async isClamAvAvailable(): Promise<boolean> {
    try {
      await execAsync('which clamscan');
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Update ClamAV virus definitions
   */
  async updateDefinitions(): Promise<void> {
    try {
      if (!(await this.isClamAvAvailable())) {
        this.logger.warn('ClamAV not available for definition update');
        return;
      }

      this.logger.log('Updating ClamAV virus definitions...');

      await execAsync('freshclam');

      this.logger.log('Virus definitions updated successfully');

    } catch (error) {
      this.logger.error(`Failed to update virus definitions: ${error.message}`);
      throw error;
    }
  }

  /**
   * Batch scan multiple files
   */
  async scanBatch(
    files: Array<{ path: string; name: string }>,
  ): Promise<ScanResult[]> {
    this.logger.log(`Batch scanning ${files.length} files`);

    const results: ScanResult[] = [];

    for (const file of files) {
      try {
        const result = await this.scanFile(file.path, file.name);
        results.push(result);
      } catch (error) {
        this.logger.error(`Batch scan failed for ${file.name}: ${error.message}`);
        results.push({
          clean: false,
          threats: [`Scan error: ${error.message}`],
          scanEngine: 'error',
          scanTime: 0,
          fileSize: 0,
          fileName: file.name,
        });
      }
    }

    return results;
  }

  /**
   * Update statistics
   */
  private updateStatistics(result: ScanResult, startTime: number): void {
    this.statistics.totalScans++;

    if (result.clean) {
      this.statistics.cleanFiles++;
    } else {
      this.statistics.infectedFiles++;
    }

    // Update average scan time
    const scanTime = Date.now() - startTime;
    this.statistics.averageScanTime =
      (this.statistics.averageScanTime * (this.statistics.totalScans - 1) + scanTime) /
      this.statistics.totalScans;
  }

  /**
   * Get scan statistics
   */
  getStatistics(): ScanStatistics {
    return { ...this.statistics };
  }

  /**
   * Reset statistics
   */
  resetStatistics(): void {
    this.statistics = {
      totalScans: 0,
      cleanFiles: 0,
      infectedFiles: 0,
      failedScans: 0,
      averageScanTime: 0,
    };

    this.logger.log('Statistics reset');
  }

  /**
   * Quarantine infected file
   */
  async quarantineFile(filePath: string, fileName: string): Promise<string> {
    const quarantineDir = path.join(os.tmpdir(), 'quarantine');

    // Create quarantine directory
    await fs.mkdir(quarantineDir, { recursive: true });

    const quarantinePath = path.join(
      quarantineDir,
      `${Date.now()}_${fileName}.quarantine`,
    );

    // Move file to quarantine
    await fs.rename(filePath, quarantinePath);

    this.logger.warn(`File quarantined: ${fileName} -> ${quarantinePath}`);

    return quarantinePath;
  }

  /**
   * Delete quarantined file
   */
  async deleteQuarantinedFile(quarantinePath: string): Promise<void> {
    await fs.unlink(quarantinePath);
    this.logger.log(`Quarantined file deleted: ${quarantinePath}`);
  }

  /**
   * Get ClamAV version
   */
  async getClamAVVersion(): Promise<string> {
    try {
      if (!(await this.isClamAvAvailable())) {
        return 'ClamAV not available';
      }

      const { stdout } = await execAsync('clamscan --version');
      return stdout.trim();

    } catch (error) {
      return 'Unknown';
    }
  }

  /**
   * Perform health check
   */
  async healthCheck(): Promise<{
    available: boolean;
    version: string;
    definitionsAge?: number;
  }> {
    const available = await this.isClamAvAvailable();

    if (!available) {
      return {
        available: false,
        version: 'Not installed',
      };
    }

    const version = await this.getClamAVVersion();

    return {
      available: true,
      version,
    };
  }
}
