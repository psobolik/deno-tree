import * as mod from "https://deno.land/std@0.186.0/path/mod.ts";
import { Args } from "./args.ts";
import { Counts } from "./counts.ts";
import { ArgParser, HelpText } from "./argParser.ts";

const args = ArgParser.parseArgs(Deno.args);

if (args.showHelp) {
  console.log(HelpText);
  Deno.exit(0);
}
try {
  const fileInfo = await Deno.stat(args.initialPath);
  if (!fileInfo.isDirectory) {
    console.error(`${args.initialPath} is not a directory`);
    Deno.exit(1);
  }
} catch (error) {
  if (error instanceof Deno.errors.NotFound) {
    console.error(`${args.initialPath} was not found.`);
    Deno.exit(2);
  } else {
    throw error;
  }
}

const counts = printTree(args)
console.log(counts.toString());

async function printTree(args: Args): Promise<Counts> {
  console.log(args.initialPath);
  const levelFlags = new Array<boolean>();
  levelFlags.push(true);
  const counts = new Counts();
  await printTreeLevel(args.initialPath, counts, args, levelFlags);
  return counts;
}
async function printTreeLevel(
  path: string,
  counts: Counts,
  args: Args,
  levelFlags: boolean[],
  level = 1,
): Promise<void> {
  const entries = await fetchDirEntries(path, args.showAll, args.dirsOnly);
  const upperBound = entries.length - 1;
  for (let i = 0; i <= upperBound; ++i) {
    const entry = entries[i];
    console.log(`${getPrefixString(levelFlags, i < upperBound)}${entry.name}`);
    if (entry.isDirectory) {
      ++counts.dirs;
      if (i === upperBound) levelFlags[levelFlags.length - 1] = false;
      levelFlags.push(true);
      if (args.levelLimit == 0 || level <= args.levelLimit) {
        await printTreeLevel(
          mod.join(path, entry.name),
          counts,
          args,
          levelFlags,
          level + 1,
        );
      }
      levelFlags.pop();
    } else {
      ++counts.files;
    }
  }
}
function getPrefixString(levelFlags: boolean[], currentFlag: boolean): string {
  let result = "";
  const upperBound = levelFlags.length - 1;
  for (let i = 0; i < upperBound; ++i) {
    result += levelFlags[i] ? "│   " : "    ";
  }
  result += currentFlag ? "├── " : "└── ";
  return result;
}
async function fetchDirEntries(
  dir: string,
  showAll: boolean,
  dirsOnly: boolean,
): Promise<Deno.DirEntry[]> {
  const result = new Array<Deno.DirEntry>();
  try {
    for await (const dirEntry of Deno.readDir(dir)) {
      if (
        (showAll || !dirEntry.name.startsWith(".")) &&
        (!dirsOnly || dirEntry.isDirectory)
      ) {
        result.push(dirEntry);
      }
    }
  } catch (_) {
    // eat it!
  }
  return result.sort((a, b) => {
    return a.name.localeCompare(b.name);
  });
}
