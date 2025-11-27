import { Transform, TransformCallback } from "stream";

/**
 * Transform stream that prepends initialization vector to encrypted data
 * The IV is prepended only once at the beginning of the stream
 */
export class AppendInitVect extends Transform {
  private initVect: Buffer;
  private appended: boolean;

  /**
   * Create an AppendInitVect transform stream
   * @param initVect - Initialization vector to prepend
   * @param opts - Stream options
   */
  constructor(initVect: Buffer, opts?: object) {
    super(opts);
    this.initVect = initVect;
    this.appended = false;
  }

  /**
   * Transform method called for each chunk of data
   * Prepends IV before first chunk, then passes through all data
   */
  _transform(chunk: Buffer, encoding: string, cb: TransformCallback): void {
    if (!this.appended) {
      this.push(this.initVect);
      this.appended = true;
    }
    this.push(chunk);
    cb();
  }
}

export default AppendInitVect;

