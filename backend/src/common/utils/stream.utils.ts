import { createReadStream, createWriteStream } from 'fs';
import { pipeline } from 'stream/promises';
import { Transform } from 'stream';
import { Logger } from '@nestjs/common';

/**
 * Stream Utilities for Memory-Efficient Operations
 * 
 * Enterprise-grade streaming utilities for handling large files
 * without loading them entirely into memory.
 */

const logger = new Logger('StreamUtils');

/**
 * Copy file using streams
 */
export async function streamCopyFile(
  sourcePath: string,
  destPath: string,
  chunkSize: number = 64 * 1024
): Promise<void> {
  const readStream = createReadStream(sourcePath, { highWaterMark: chunkSize });
  const writeStream = createWriteStream(destPath);

  await pipeline(readStream, writeStream);
  logger.log(`File streamed from ${sourcePath} to ${destPath}`);
}

/**
 * Process large file in chunks
 */
export async function processFileInChunks<T>(
  filePath: string,
  processor: (chunk: Buffer) => Promise<T> | T,
  chunkSize: number = 64 * 1024
): Promise<T[]> {
  const results: T[] = [];
  const readStream = createReadStream(filePath, { highWaterMark: chunkSize });

  for await (const chunk of readStream) {
    const result = await processor(chunk as Buffer);
    results.push(result);
  }

  return results;
}

/**
 * Transform stream with backpressure handling
 */
export class MemoryEfficientTransform extends Transform {
  private readonly maxBufferSize: number;
  private currentBufferSize: number = 0;

  constructor(
    private readonly transformer: (chunk: Buffer) => Buffer | Promise<Buffer>,
    maxBufferSize: number = 1024 * 1024
  ) {
    super({ highWaterMark: 64 * 1024 });
    this.maxBufferSize = maxBufferSize;
  }

  async transform(
    chunk: Buffer,
    unusedEncoding: BufferEncoding,
    callback: (error?: Error | null, data?: Buffer) => void
  ): Promise<void> {
    void unusedEncoding;
    try {
      if (this.currentBufferSize + chunk.length > this.maxBufferSize) {
        logger.warn(
          `Buffer limit approaching: ${this.currentBufferSize + chunk.length} / ${this.maxBufferSize}`
        );
      }

      this.currentBufferSize += chunk.length;
      const transformed = await this.transformer(chunk);
      this.currentBufferSize -= chunk.length;

      callback(null, transformed);
    } catch (error) {
      callback(error as Error);
    }
  }
}

/**
 * Create chunked array iterator
 */
export async function* chunkArray<T>(
  array: T[],
  chunkSize: number
): AsyncGenerator<T[], void, unknown> {
  for (let i = 0; i < array.length; i += chunkSize) {
    yield array.slice(i, i + chunkSize);
    
    await new Promise(resolve => setImmediate(resolve));
  }
}

/**
 * Process array in batches with memory management
 */
export async function processBatch<T, R>(
  items: T[],
  processor: (item: T) => Promise<R>,
  batchSize: number = 100
): Promise<R[]> {
  const results: R[] = [];

  for await (const chunk of chunkArray(items, batchSize)) {
    const batchResults = await Promise.all(chunk.map(processor));
    results.push(...batchResults);

    if (global.gc && results.length % (batchSize * 10) === 0) {
      global.gc();
    }
  }

  return results;
}

/**
 * Memory-efficient JSON parsing for large payloads
 */
export async function parseJSONStream<T>(
  stream: NodeJS.ReadableStream
): Promise<T> {
  const chunks: Buffer[] = [];
  let totalSize = 0;
  const maxSize = 50 * 1024 * 1024;

  for await (const chunk of stream) {
    const buffer = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk);
    totalSize += buffer.length;

    if (totalSize > maxSize) {
      throw new Error(`JSON payload too large: ${totalSize} bytes (max: ${maxSize})`);
    }

    chunks.push(buffer);
  }

  const fullBuffer = Buffer.concat(chunks);
  return JSON.parse(fullBuffer.toString('utf-8')) as T;
}

/**
 * Create a memory-efficient readable stream from array
 */
export function createArrayStream<T>(
  array: T[],
  chunkSize: number = 100
): NodeJS.ReadableStream {
  let index = 0;

  return new Transform({
    objectMode: true,
    read() {
      if (index >= array.length) {
        this.push(null);
        return;
      }

      const chunk = array.slice(index, index + chunkSize);
      index += chunkSize;
      this.push(chunk);
    },
  });
}

/**
 * Estimate object memory size
 */
export function estimateObjectSize(obj: unknown): number {
  const seen = new WeakSet();
  
  function sizeOf(value: unknown): number {
    if (value === null || value === undefined) {
      return 0;
    }

    if (typeof value === 'boolean') {
      return 4;
    }

    if (typeof value === 'number') {
      return 8;
    }

    if (typeof value === 'string') {
      return value.length * 2;
    }

    if (typeof value === 'object') {
      if (seen.has(value)) {
        return 0;
      }
      seen.add(value);

      if (Buffer.isBuffer(value)) {
        return value.length;
      }

      if (Array.isArray(value)) {
        return value.reduce((acc: number, item) => acc + sizeOf(item), 0);
      }

      return Object.keys(value).reduce((acc, key) => {
        return acc + key.length * 2 + sizeOf((value as Record<string, unknown>)[key]);
      }, 0);
    }

    return 0;
  }

  return sizeOf(obj);
}
