import cliProgress from "cli-progress";
import { readdirSync, statSync } from "fs";
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
  const items = readdirSync(dir);

  for (const item of items) {
    const itemPath = join(dir, item);
    const stat = statSync(itemPath);

    if (stat.isDirectory()) {
      count += countFilesInDirectory(itemPath);
    } else {
      count++;
    }
  }

  return count;
}
