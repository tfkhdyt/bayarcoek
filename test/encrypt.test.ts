import { describe, it, expect, beforeEach, afterEach } from "vitest";
import {
  existsSync,
  mkdirSync,
  writeFileSync,
  readdirSync,
  unlinkSync,
  rmdirSync,
  readFileSync,
} from "fs";
import { join } from "path";
import encrypt from "../src/lib/utils/encrypt";

describe("encrypt", () => {
  const testDir = "./test/fixtures";
  const testContent = "This is a test file for encryption";

  // Helper to generate unique file names per test
  const getTestFile = (suffix: string) => join(testDir, `test-${suffix}.txt`);

  beforeEach(() => {
    // Create test directory if it doesn't exist
    if (!existsSync(testDir)) {
      mkdirSync(testDir, { recursive: true });
    }
  });

  afterEach(() => {
    // Clean up test files
    if (existsSync(testDir)) {
      const files = readdirSync(testDir);
      files.forEach((file: string) => {
        try {
          unlinkSync(join(testDir, file));
        } catch {
          // Ignore errors during cleanup
        }
      });
      try {
        rmdirSync(testDir);
      } catch {
        // Ignore errors during cleanup
      }
    }
  });

  it("should create an encrypted file with correct extension", () => {
    return new Promise<void>((resolve, reject) => {
      const testFile = getTestFile("create-encrypted");
      writeFileSync(testFile, testContent);

      const ext = "bayarcoek";
      encrypt(testFile, ext, "test-key");

      const encryptedFile = testFile + "." + ext;

      // Poll for encrypted file to exist
      const waitForEncryption = setInterval(() => {
        if (existsSync(encryptedFile)) {
          clearInterval(waitForEncryption);
          resolve();
        }
      }, 100);

      setTimeout(() => {
        clearInterval(waitForEncryption);
        reject(new Error("Encryption timed out - encrypted file not found"));
      }, 3000);
    });
  });

  it("should remove original file after encryption", () => {
    return new Promise<void>((resolve, reject) => {
      const testFile = getTestFile("remove-original");
      writeFileSync(testFile, testContent);

      const ext = "bayarcoek";
      encrypt(testFile, ext, "test-key");

      const encryptedFile = testFile + "." + ext;

      // Poll for encrypted file and original file removal
      const waitForEncryption = setInterval(() => {
        if (existsSync(encryptedFile) && !existsSync(testFile)) {
          clearInterval(waitForEncryption);
          resolve();
        }
      }, 100);

      setTimeout(() => {
        clearInterval(waitForEncryption);
        reject(new Error("Encryption timed out or original file not removed"));
      }, 3000);
    });
  });

  it("should create encrypted file with custom extension", () => {
    return new Promise<void>((resolve, reject) => {
      const testFile = getTestFile("custom-ext");
      writeFileSync(testFile, testContent);

      const ext = "myenc";
      encrypt(testFile, ext, "test-key");

      const encryptedFile = testFile + "." + ext;

      const waitForEncryption = setInterval(() => {
        if (existsSync(encryptedFile)) {
          clearInterval(waitForEncryption);
          resolve();
        }
      }, 100);

      setTimeout(() => {
        clearInterval(waitForEncryption);
        reject(new Error("Encryption timed out"));
      }, 3000);
    });
  });

  it("should prepend IV to encrypted file", () => {
    return new Promise<void>((resolve, reject) => {
      const testFile = getTestFile("prepend-iv");
      writeFileSync(testFile, testContent);

      const ext = "bayarcoek";
      encrypt(testFile, ext, "test-key");

      const encryptedFile = testFile + "." + ext;

      const waitForEncryption = setInterval(() => {
        if (existsSync(encryptedFile)) {
          clearInterval(waitForEncryption);
          try {
            const fileBuffer = readFileSync(encryptedFile);
            // Encrypted file should be larger than original due to IV and compression overhead
            expect(fileBuffer.length).toBeGreaterThan(16);
            resolve();
          } catch (err) {
            reject(err);
          }
        }
      }, 100);

      setTimeout(() => {
        clearInterval(waitForEncryption);
        reject(new Error("Encryption timed out"));
      }, 3000);
    });
  });
});
