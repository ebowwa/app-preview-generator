/**
 * Storage Manager - Single Responsibility: Managing temporary file storage
 */
import fs from 'fs/promises';
import path from 'path';
import os from 'os';
import crypto from 'crypto';

export class StorageManager {
  constructor() {
    this.tempFiles = new Set();
  }

  async saveImage(base64Data) {
    const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'mcp-preview-'));
    const fileName = `screenshot-${crypto.randomBytes(4).toString('hex')}.png`;
    const filePath = path.join(tempDir, fileName);
    
    const buffer = Buffer.from(base64Data, 'base64');
    await fs.writeFile(filePath, buffer);
    
    this.tempFiles.add(filePath);
    
    return {
      path: filePath,
      dir: tempDir,
      cleanup: () => this.removeFile(filePath, tempDir)
    };
  }

  async removeFile(filePath, tempDir) {
    try {
      await fs.unlink(filePath);
      await fs.rmdir(tempDir);
      this.tempFiles.delete(filePath);
    } catch (error) {
      console.error('Cleanup error:', error);
    }
  }

  async cleanup() {
    // Clean up all temp files on shutdown
    for (const file of this.tempFiles) {
      try {
        await fs.unlink(file);
      } catch (error) {
        // File might already be deleted
      }
    }
    this.tempFiles.clear();
  }

  async readImage(filePath) {
    const buffer = await fs.readFile(filePath);
    return buffer.toString('base64');
  }
}