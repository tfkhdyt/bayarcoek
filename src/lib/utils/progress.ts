import cliProgress from "cli-progress";
import { readdirSync, lstatSync } from "fs";
import { join } from "path";

/**
 * Create a progress bar for file operations
 */
export function createProgressBar(
  label: string,
  total: number
): cliProgress.SingleBar {
  const bar = new cliProgress.SingleBar({
    format: `${label} |{bar}| {percentage}% || {value}/{total}`,
    barCompleteChar: "\u2588",
    barIncompleteChar: "\u2591",
    hideCursor: true,
  });
  bar.start(total, 0);
  return bar;
}

/**
 * Count files in a directory recursively
 */
export function countFilesInDirectory(dir: string): number {
  let count = 0;

  try {
    const items = readdirSync(dir);

    for (const item of items) {
      const itemPath = join(dir, item);

      try {
        const stat = lstatSync(itemPath);

        // Skip symlinks to avoid infinite recursion
        if (stat.isSymbolicLink()) {
          continue;
        }

        if (stat.isDirectory()) {
          count += countFilesInDirectory(itemPath);
        } else {
          count++;
        }
      } catch (error) {
        // Skip items that cannot be accessed
        continue;
      }
    }
  } catch (error) {
    // Return 0 if the directory cannot be read
    return 0;
  }

  return count;
}
