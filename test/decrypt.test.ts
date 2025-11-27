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
import decrypt from "../src/lib/utils/decrypt";

describe("decrypt", () => {
  const testDir = "./test/decrypt-fixtures";
  const testContent = "This is a test file for encryption and decryption";
  const secretKey = "test-secret-key";

  // Helper to generate unique file names per test and ensure directory exists
  const getTestFile = (suffix: string) => {
    // Ensure directory exists right before returning the path
    if (!existsSync(testDir)) {
      mkdirSync(testDir, { recursive: true });
    }
    return join(testDir, `test-${suffix}.txt`);
  };

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

  it("should decrypt an encrypted file back to original content", () => {
    return new Promise<void>((resolve, reject) => {
      const testFile = getTestFile("decrypt-basic");
      // Create test file
      writeFileSync(testFile, testContent);

      // Encrypt it
      encrypt(testFile, "bayarcoek", secretKey);

      const encryptedFile = testFile + ".bayarcoek";

      // Poll for encrypted file to exist (encryption is async)
      const waitForEncryption = setInterval(() => {
        if (existsSync(encryptedFile)) {
          clearInterval(waitForEncryption);

          // Decrypt it
          decrypt(encryptedFile, secretKey, false);

          // Poll for decrypted file to exist (decryption is async)
          const waitForDecryption = setInterval(() => {
            if (existsSync(testFile)) {
              clearInterval(waitForDecryption);
              try {
                const decryptedContent = readFileSync(testFile, "utf-8");
                expect(decryptedContent).toBe(testContent);
                resolve();
              } catch (err) {
                reject(err);
              }
            }
          }, 100);

          // Timeout for decryption
          setTimeout(() => {
            clearInterval(waitForDecryption);
            reject(
              new Error("Decryption timed out - decrypted file not found")
            );
          }, 3000);
        }
      }, 100);

      // Timeout for encryption
      setTimeout(() => {
        clearInterval(waitForEncryption);
        reject(new Error("Encryption timed out - encrypted file not found"));
      }, 3000);
    });
  });

  it("should keep encrypted file when overwrite is false", () => {
    return new Promise<void>((resolve, reject) => {
      const testFile = getTestFile("keep-encrypted");
      writeFileSync(testFile, testContent);
      encrypt(testFile, "bayarcoek", secretKey);

      const encryptedFile = testFile + ".bayarcoek";

      const waitForEncryption = setInterval(() => {
        if (existsSync(encryptedFile)) {
          clearInterval(waitForEncryption);
          decrypt(encryptedFile, secretKey, false);

          const waitForDecryption = setInterval(() => {
            if (existsSync(testFile)) {
              clearInterval(waitForDecryption);
              try {
                expect(existsSync(encryptedFile)).toBe(true);
                resolve();
              } catch (err) {
                reject(err);
              }
            }
          }, 100);

          setTimeout(() => {
            clearInterval(waitForDecryption);
            reject(new Error("Decryption timed out"));
          }, 3000);
        }
      }, 100);

      setTimeout(() => {
        clearInterval(waitForEncryption);
        reject(new Error("Encryption timed out"));
      }, 3000);
    });
  });

  it("should delete encrypted file when overwrite is true", () => {
    return new Promise<void>((resolve, reject) => {
      const testFile = getTestFile("delete-encrypted");
      writeFileSync(testFile, testContent);
      encrypt(testFile, "bayarcoek", secretKey);

      const encryptedFile = testFile + ".bayarcoek";

      const waitForEncryption = setInterval(() => {
        if (existsSync(encryptedFile)) {
          clearInterval(waitForEncryption);
          decrypt(encryptedFile, secretKey, true);

          const waitForDecryption = setInterval(() => {
            if (existsSync(testFile)) {
              clearInterval(waitForDecryption);
              // Wait a bit more for the encrypted file deletion
              setTimeout(() => {
                try {
                  expect(existsSync(encryptedFile)).toBe(false);
                  expect(existsSync(testFile)).toBe(true);
                  resolve();
                } catch (err) {
                  reject(err);
                }
              }, 200);
            }
          }, 100);

          setTimeout(() => {
            clearInterval(waitForDecryption);
            reject(new Error("Decryption timed out"));
          }, 3000);
        }
      }, 100);

      setTimeout(() => {
        clearInterval(waitForEncryption);
        reject(new Error("Encryption timed out"));
      }, 3000);
    });
  });

  it("should handle wrong secret key gracefully", () => {
    return new Promise<void>((resolve, reject) => {
      const testFile = getTestFile("wrong-key");
      writeFileSync(testFile, testContent);
      encrypt(testFile, "bayarcoek", secretKey);

      const encryptedFile = testFile + ".bayarcoek";

      const waitForEncryption = setInterval(() => {
        if (existsSync(encryptedFile)) {
          clearInterval(waitForEncryption);
          // Try to decrypt with wrong key - this should fail silently
          decrypt(encryptedFile, "wrong-key", false);

          // Wait for decryption attempt to complete (it should fail)
          setTimeout(() => {
            try {
              // The decrypted file should not match the original content
              // or may not exist at all due to decryption failure
              if (existsSync(testFile)) {
                const content = readFileSync(testFile, "utf-8");
                // If file exists, content should not match (corrupted due to wrong key)
                expect(content).not.toBe(testContent);
              }
              // Either way, the test passes - wrong key should fail gracefully
              resolve();
            } catch (err) {
              reject(err);
            }
          }, 1500);
        }
      }, 100);

      setTimeout(() => {
        clearInterval(waitForEncryption);
        reject(new Error("Encryption timed out"));
      }, 3000);
    });
  });
});
