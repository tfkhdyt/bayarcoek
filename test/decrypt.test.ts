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

  it("should decrypt an encrypted file back to original content", async () => {
    const testFile = getTestFile("decrypt-basic");
    // Create test file
    writeFileSync(testFile, testContent);

    // Encrypt it
    await encrypt(testFile, "bayarcoek", secretKey);

    const encryptedFile = testFile + ".bayarcoek";
    expect(existsSync(encryptedFile)).toBe(true);

    // Decrypt it
    await decrypt(encryptedFile, secretKey, false);

    expect(existsSync(testFile)).toBe(true);
    const decryptedContent = readFileSync(testFile, "utf-8");
    expect(decryptedContent).toBe(testContent);
  });

  it("should keep encrypted file when overwrite is false", async () => {
    const testFile = getTestFile("keep-encrypted");
    writeFileSync(testFile, testContent);
    await encrypt(testFile, "bayarcoek", secretKey);

    const encryptedFile = testFile + ".bayarcoek";
    expect(existsSync(encryptedFile)).toBe(true);

    await decrypt(encryptedFile, secretKey, false);

    expect(existsSync(testFile)).toBe(true);
    expect(existsSync(encryptedFile)).toBe(true);
  });

  it("should delete encrypted file when overwrite is true", async () => {
    const testFile = getTestFile("delete-encrypted");
    writeFileSync(testFile, testContent);
    await encrypt(testFile, "bayarcoek", secretKey);

    const encryptedFile = testFile + ".bayarcoek";
    expect(existsSync(encryptedFile)).toBe(true);

    await decrypt(encryptedFile, secretKey, true);

    expect(existsSync(testFile)).toBe(true);
    expect(existsSync(encryptedFile)).toBe(false);
  });

  it("should handle wrong secret key gracefully", async () => {
    const testFile = getTestFile("wrong-key");
    writeFileSync(testFile, testContent);
    await encrypt(testFile, "bayarcoek", secretKey);

    const encryptedFile = testFile + ".bayarcoek";
    expect(existsSync(encryptedFile)).toBe(true);

    // Try to decrypt with wrong key - this should fail silently
    await decrypt(encryptedFile, "wrong-key", false);

    // When decryption fails with wrong key, the original file should not be recreated
    expect(existsSync(testFile)).toBe(false);
  });
});
