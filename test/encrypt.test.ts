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

  it("should create an encrypted file with correct extension", async () => {
    const testFile = getTestFile("create-encrypted");
    writeFileSync(testFile, testContent);

    const ext = "bayarcoek";
    await encrypt(testFile, ext, "test-key");

    const encryptedFile = testFile + "." + ext;
    expect(existsSync(encryptedFile)).toBe(true);
  });

  it("should remove original file after encryption", async () => {
    const testFile = getTestFile("remove-original");
    writeFileSync(testFile, testContent);

    const ext = "bayarcoek";
    await encrypt(testFile, ext, "test-key");

    const encryptedFile = testFile + "." + ext;
    expect(existsSync(encryptedFile)).toBe(true);
    expect(existsSync(testFile)).toBe(false);
  });

  it("should create encrypted file with custom extension", async () => {
    const testFile = getTestFile("custom-ext");
    writeFileSync(testFile, testContent);

    const ext = "myenc";
    await encrypt(testFile, ext, "test-key");

    const encryptedFile = testFile + "." + ext;
    expect(existsSync(encryptedFile)).toBe(true);
  });

  it("should prepend IV to encrypted file", async () => {
    const testFile = getTestFile("prepend-iv");
    writeFileSync(testFile, testContent);

    const ext = "bayarcoek";
    await encrypt(testFile, ext, "test-key");

    const encryptedFile = testFile + "." + ext;
    expect(existsSync(encryptedFile)).toBe(true);
    const fileBuffer = readFileSync(encryptedFile);
    // Encrypted file should be larger than original due to IV and compression overhead
    expect(fileBuffer.length).toBeGreaterThan(16);
  });
});
