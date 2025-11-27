#!/usr/bin/env node

import { fileURLToPath } from "url";
import { dirname, join } from "path";
import { readFileSync } from "fs";
import { Command } from "commander";
import encrypt from "../lib/utils/encrypt.js";
import decrypt from "../lib/utils/decrypt.js";

interface EncryptOptions {
  extension: string;
  secretKey: string;
  dryRun?: boolean;
  verbose?: boolean;
  quiet?: boolean;
  logFile?: string;
  backup?: boolean;
  customPatterns?: string[];
}

interface DecryptOptions {
  secretKey: string;
  overwrite?: boolean;
  dryRun?: boolean;
  verbose?: boolean;
  quiet?: boolean;
  logFile?: string;
  backup?: boolean;
  customPatterns?: string[];
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const packagePath = join(__dirname, "../../package.json");
const info = JSON.parse(readFileSync(packagePath, "utf-8"));

const program = new Command();

// Program information
program
  .name("bayarcoek")
  .usage("<command> [options]")
  .version(info.version, "-v, --version", "Menampilkan versi")
  .showSuggestionAfterError()
  .helpOption("-h, --help", "Menampilkan bantuan");

// Encrypt command
program
  .command("encrypt [path...]")
  .description("Mengenkripsi file atau folder")
  .option(
    "-x, --extension <ext>",
    "Pilih custom extension untuk hasil enkripsi",
    "bayarcoek"
  )
  .option(
    "-k, --secret-key <key>",
    "Secret key untuk enkripsi dan dekripsi",
    "N7wKWb5434FLD"
  )
  .option("--dry-run", "Preview operation tanpa mengeksekusi")
  .option("-v, --verbose", "Tampilkan output detail")
  .option("-q, --quiet", "Supresi output kecuali error")
  .option("--log-file <path>", "Simpan log ke file")
  .option("-b, --backup", "Buat backup sebelum enkripsi")
  .action((paths: string[], options: EncryptOptions) => {
    if (paths.length === 0) paths.push("");
    try {
      paths.forEach((p: string) => {
        encrypt(p, options.extension, options.secretKey, {
          dryRun: options.dryRun,
          verbose: options.verbose,
          quiet: options.quiet,
          logFile: options.logFile,
          backup: options.backup,
          customPatterns: options.customPatterns,
        });
      });
    } catch (err) {
      process.exit(1);
    }
  });

// Decrypt command
program
  .command("decrypt [path...]")
  .description("Mendekripsi file atau folder")
  .option(
    "-k, --secret-key <key>",
    "Secret key untuk enkripsi dan dekripsi",
    "N7wKWb5434FLD"
  )
  .option("-o, --overwrite", "Timpa file hasil decrypt")
  .option("--dry-run", "Preview operation tanpa mengeksekusi")
  .option("-v, --verbose", "Tampilkan output detail")
  .option("-q, --quiet", "Supresi output kecuali error")
  .option("--log-file <path>", "Simpan log ke file")
  .option("-b, --backup", "Buat backup sebelum dekripsi")
  .action((paths: string[], options: DecryptOptions) => {
    if (paths.length === 0) paths.push("");
    try {
      paths.forEach((p: string) => {
        decrypt(p, options.secretKey, options.overwrite ?? false, {
          dryRun: options.dryRun,
          verbose: options.verbose,
          quiet: options.quiet,
          logFile: options.logFile,
          backup: options.backup,
          customPatterns: options.customPatterns,
        });
      });
    } catch (err) {
      process.exit(1);
    }
  });

program.parse(process.argv);
