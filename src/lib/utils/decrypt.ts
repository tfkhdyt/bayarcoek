import { createHash, createDecipheriv } from "crypto";
import {
  createReadStream,
  createWriteStream,
  statSync,
  readdirSync,
  renameSync,
  unlinkSync,
  unlink,
  promises as fsPromises,
  copyFileSync,
} from "fs";
import { join, parse } from "path";
import { createUnzip } from "zlib";
import { Logger } from "./logger.js";
import { createFilterFunction } from "./patterns.js";

const algorithm = "aes-256-ctr";

export interface DecryptOptions {
  dryRun?: boolean;
  verbose?: boolean;
  quiet?: boolean;
  logFile?: string;
  backup?: boolean;
  customPatterns?: string[];
}

/**
 * Decrypt files or directories
 */
export default async function decrypt(
  _path: string,
  secretKey: string,
  overwrite: boolean,
  options: DecryptOptions = {}
) {
  const logger = new Logger({
    verbose: options.verbose,
    quiet: options.quiet,
    logFile: options.logFile,
  });

  const key = process.env.BAYARCOEK_KEY || secretKey;
  const keyBuffer = createHash("sha256").update(String(key)).digest();

  const decryptFile = async (file: string): Promise<void> => {
    if (options.dryRun) {
      logger.info(`[DRY RUN] Would decrypt: ${file}`);
      const stat = statSync(file);
      logger.trackFile(stat.size);
      return;
    }

    let filehandle;
    let initVect;

    try {
      filehandle = await fsPromises.open(file, "r");
      initVect = Buffer.alloc(16);
      const readResult = await filehandle.read(initVect, 0, 16, 0);

      if (readResult.bytesRead !== 16) {
        throw new Error(
          `Failed to read IV: expected 16 bytes, but got ${readResult.bytesRead} bytes`
        );
      }
    } catch (err) {
      throw new Error(`Error reading IV from file: ${(err as Error).message}`);
    } finally {
      if (filehandle) {
        await filehandle.close();
      }
    }

    // Create backup if requested
    if (options.backup) {
      try {
        const backupFile = file + ".backup";
        copyFileSync(file, backupFile);
        logger.verbose_msg(`Backup created: ${backupFile}`);
      } catch (err) {
        logger.warn(`Failed to create backup: ${(err as Error).message}`);
      }
    }

    return new Promise<void>((resolve, reject) => {
      const readStream = createReadStream(file, {
        start: 16,
      });
      const decipher = createDecipheriv(algorithm, keyBuffer, initVect);
      const unzip = createUnzip();
      const outputPath = parse(file).dir + "/" + parse(file).name;
      const writeStream = createWriteStream(outputPath);

      readStream.on("error", (err: Error) => {
        logger.error("Failed to read encrypted file");
        logger.error(err.message);
        try {
          unlinkSync(outputPath);
        } catch (e) {
          // Ignore if file doesn't exist
        }
        reject(err);
      });

      writeStream.on("error", (err: Error) => {
        logger.error("Failed to write decrypted file");
        logger.error(err.message);
        try {
          unlinkSync(outputPath);
        } catch (e) {
          // Ignore if file doesn't exist
        }
        reject(err);
      });

      readStream
        .pipe(decipher)
        .pipe(unzip)
        .on("error", () => {
          logger.error(
            "Decryption failed - you may be using an incorrect secret key"
          );
          try {
            unlinkSync(outputPath);
          } catch (e) {
            // Ignore if file doesn't exist
          }
          // Resolve instead of reject to handle wrong key gracefully
          resolve();
        })
        .pipe(writeStream);

      writeStream.on("finish", () => {
        const stat = statSync(file);
        logger.trackFile(stat.size);
        if (overwrite) {
          unlink(file, (err: NodeJS.ErrnoException | null) => {
            if (err) {
              logger.warn(`Failed to delete encrypted file: ${err.message}`);
            } else {
              logger.success(`${parse(file).base} has been Decrypted!`);
            }
            resolve();
          });
        } else {
          logger.success(`${parse(file).base} has been Decrypted!`);
          resolve();
        }
      });
    });
  };

  const main = async (_path: string): Promise<void> => {
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
      await decryptFile(_path);
    } else {
      try {
        const items = readdirSync(_path).filter(filter);
        for (const file of items) {
          const oldPath = join(_path, file);
          const newPath = parse(oldPath).dir + "/" + parse(oldPath).name;
          const item = statSync(oldPath);
          if (item.isDirectory()) {
            if (!options.dryRun) {
              renameSync(oldPath, newPath);
            } else {
              logger.info(`[DRY RUN] Would rename: ${oldPath} -> ${newPath}`);
            }
            await main(newPath);
            continue;
          }
          await decryptFile(oldPath);
        }
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

  await main(join(process.cwd(), _path));

  // Log summary if not in quiet mode
  if (!options.quiet && options.verbose) {
    logger.logSummary();
  }
}
