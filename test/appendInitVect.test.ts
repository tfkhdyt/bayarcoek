import { describe, it, expect } from "vitest";
import { Transform } from "stream";
import AppendInitVect from "../src/lib/utils/appendInitVect";

describe("AppendInitVect", () => {
  it("should be a Transform stream", () => {
    const iv = Buffer.alloc(16);
    const transform = new AppendInitVect(iv);
    expect(transform).toBeInstanceOf(Transform);
  });

  it("should append init vector to the beginning of stream", () => {
    return new Promise<void>((resolve) => {
      const iv = Buffer.from("0123456789abcdef");
      const transform = new AppendInitVect(iv);
      const chunks: Buffer[] = [];

      transform.on("data", (chunk: Buffer) => {
        chunks.push(chunk);
      });

      transform.on("end", () => {
        const result = Buffer.concat(chunks);
        expect(result.subarray(0, 16)).toEqual(iv);
        resolve();
      });

      transform.write(Buffer.from("test data"));
      transform.end();
    });
  });

  it("should preserve data after IV", () => {
    return new Promise<void>((resolve) => {
      const iv = Buffer.from("0123456789abcdef");
      const testData = Buffer.from("hello world");
      const transform = new AppendInitVect(iv);
      const chunks: Buffer[] = [];

      transform.on("data", (chunk: Buffer) => {
        chunks.push(chunk);
      });

      transform.on("end", () => {
        const result = Buffer.concat(chunks);
        expect(result.subarray(16)).toEqual(testData);
        resolve();
      });

      transform.write(testData);
      transform.end();
    });
  });

  it("should only append IV once for multiple writes", () => {
    return new Promise<void>((resolve) => {
      const iv = Buffer.from("0123456789abcdef");
      const transform = new AppendInitVect(iv);
      const chunks: Buffer[] = [];

      transform.on("data", (chunk: Buffer) => {
        chunks.push(chunk);
      });

      transform.on("end", () => {
        const result = Buffer.concat(chunks);
        // IV length + two pieces of data
        expect(result.length).toBe(16 + 5 + 6);
        expect(result.subarray(0, 16)).toEqual(iv);
        resolve();
      });

      transform.write(Buffer.from("hello"));
      transform.write(Buffer.from(" world"));
      transform.end();
    });
  });
});
