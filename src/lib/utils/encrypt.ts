import { randomBytes, createHash, createCipheriv } from "crypto";
import {
  createReadStream,
  createWriteStream,
  statSync,
  readdirSync,
  renameSync,
  unlinkSync,
  unlink,
  copyFileSync,
} from "fs";
import { join, parse } from "path";
import { createGzip } from "zlib";
import { AppendInitVect } from "./appendInitVect.js";
import { Logger } from "./logger.js";
import { createFilterFunction } from "./patterns.js";

const algorithm = "aes-256-ctr";

export interface EncryptOptions {
  dryRun?: boolean;
  verbose?: boolean;
  quiet?: boolean;
  logFile?: string;
  backup?: boolean;
  customPatterns?: string[];
}

/**
 * Encrypt files or directories
 */
export default function encrypt(
  _path: string,
  extension: string,
  secretKey: string,
  options: EncryptOptions = {}
): void {
  const logger = new Logger({
    verbose: options.verbose,
    quiet: options.quiet,
    logFile: options.logFile,
  });

  let key = process.env.BAYARCOEK_KEY || secretKey;
  key = createHash("sha256")
    .update(String(key))
    .digest("base64")
    .substring(0, 32);

  const encryptFile = (file: string): void => {
    if (options.dryRun) {
      logger.info(`[DRY RUN] Would encrypt: ${file}`);
      const stat = statSync(file);
      logger.trackFile(stat.size);
      return;
    }

    try {
      // Create backup if requested
      if (options.backup) {
        const backupFile = file + ".backup";
        copyFileSync(file, backupFile);
        logger.verbose_msg(`Backup created: ${backupFile}`);
      }

      const iv = randomBytes(16);
      const readStream = createReadStream(file);
      const gzip = createGzip();
      const cipher = createCipheriv(algorithm, Buffer.from(key), iv);
      const appendInitVect = new AppendInitVect(iv);
      const writeStream = createWriteStream(join(file + `.${extension}`));

      readStream.on("error", (err: Error) => {
        logger.error(`Failed to read file "${file}"`);
        logger.error(err.message);
      });

      writeStream.on("error", (err: Error) => {
        logger.error("Failed to write encrypted file");
        logger.error(err.message);
        try {
          unlinkSync(file + `.${extension}`);
        } catch (e) {
          // Ignore if file doesn't exist
        }
      });

      cipher.on("error", (err: Error) => {
        logger.error("Encryption failed");
        logger.error(err.message);
        try {
          unlinkSync(file + `.${extension}`);
        } catch (e) {
          // Ignore if file doesn't exist
        }
      });

      readStream.pipe(gzip).pipe(cipher).pipe(appendInitVect).pipe(writeStream);
      writeStream.on("finish", () => {
        const stat = statSync(file);
        logger.trackFile(stat.size);
        unlink(file, (err: NodeJS.ErrnoException | null) => {
          if (err) {
            logger.warn(`Failed to delete original file: ${err.message}`);
          } else {
            logger.success(`${parse(file).base} has been Encrypted!`);
          }
        });
      });
    } catch (err) {
      logger.error((err as Error).message);
      throw err;
    }
  };

  const main = (_path: string, extension: string): void => {
    const filter = createFilterFunction(
      join(process.cwd(), _path),
      options.customPatterns || []
    );
    let files;
    try {
      files = statSync(_path);
    } catch (err) {
      const error = err as NodeJS.ErrnoException;
      if (error.code === "ENOENT") {
        logger.error(`File/folder named "${parse(_path).base}" not found!`);
      } else if (error.code === "EACCES") {
        logger.error(`Permission denied accessing "${_path}"`);
      } else {
        logger.error(error.message);
      }
      throw error;
    }
    if (files.isFile()) {
      encryptFile(_path);
    } else {
      try {
        const items = readdirSync(_path).filter(filter);
        items.forEach((file: string) => {
          const oldPath = join(_path, file);
          const item = statSync(oldPath);
          if (item.isDirectory()) {
            if (!options.dryRun) {
              renameSync(oldPath, oldPath + `.${extension}`);
            } else {
              logger.info(
                `[DRY RUN] Would rename: ${oldPath} -> ${oldPath}.${extension}`
              );
            }
            return main(oldPath + `.${extension}`, extension);
          }
          encryptFile(oldPath);
        });
      } catch (err) {
        const error = err as NodeJS.ErrnoException;
        if (error.code === "EACCES") {
          logger.error(`Permission denied reading directory "${_path}"`);
        } else {
          logger.error(error.message);
        }
        throw error;
      }
    }
  };

  main(join(process.cwd(), _path), extension);

  // Log summary if not in quiet mode
  if (!options.quiet) {
    setTimeout(() => {
      if (options.verbose) {
        logger.logSummary();
      }
    }, 100);
  }
}
