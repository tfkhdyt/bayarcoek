import { existsSync, readFileSync } from "fs";
import { join, relative } from "path";
import ignore from "ignore";

/**
 * Load patterns from .gitignore file
 */
export function loadGitignore(rootDir: string) {
  const gitignorePath = join(rootDir, ".gitignore");
  if (!existsSync(gitignorePath)) {
    return null;
  }

  try {
    const gitignoreContent = readFileSync(gitignorePath, "utf-8");
    return ignore().add(gitignoreContent);
  } catch (err) {
    console.warn(`Warning: Failed to read .gitignore: ${(err as Error).message}`);
    return null;
  }
}

/**
 * Check if a path should be ignored
 */
export function shouldIgnore(
  filePath: string,
  basePath: string,
  ignoreInstance: ReturnType<typeof ignore> | null
): boolean {
  if (!ignoreInstance) return false;
  const relativePath = relative(basePath, filePath);
  return ignoreInstance.ignores(relativePath);
}

/**
 * Create a filter function for file paths
 */
export function createFilterFunction(
  rootDir: string,
  customPatterns: string[] = []
): (file: string) => boolean {
  const gitignore = loadGitignore(rootDir);
  const whitelist = ["bayarcoek.js", "node_modules", ".git"];
  const customIgnore = ignore().add(customPatterns);

  return function filter(file: string): boolean {
    // Check whitelist first
    if (whitelist.includes(file)) return false;

    // Check hidden files
    if (/(^|\/)\.[^]/g.test(file)) return false;

    // Check custom patterns
    if (customIgnore.ignores(file)) return false;

    // Check gitignore
    if (gitignore && gitignore.ignores(file)) return false;

    return true;
  };
}

