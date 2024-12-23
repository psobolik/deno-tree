import * as path_mod from "https://deno.land/std@0.186.0/path/mod.ts";
import { Args } from "./args.ts";
import { Counts } from "./counts.ts";
import { ArgParser, HelpText } from "./argParser.ts";
import { Version } from "./version.ts";
import { PrefixSet } from "./prefixSet.ts";

const args = ArgParser.parseArgs(Deno.args);

if (args.showVersion) {
  console.log(`tree ${Version} (Deno)`);
  Deno.exit(0);
}
if (args.showHelp) {
  console.log(HelpText);
  Deno.exit(0);
}
try {
  const fileInfo = await Deno.stat(args.initialPathAbsolute);
  if (!fileInfo.isDirectory) {
    console.error(`Path is not a directory: '${args.initialPathAbsolute}'.`);
    Deno.exit(1);
  }
} catch (error) {
  if (error instanceof Deno.errors.NotFound) {
    console.error(`Path not found: '${args.initialPathAbsolute}'.`);
    Deno.exit(2);
  } else {
    console.dir(`Invalid path: '${args.initialPathAbsolute}'.`);
    Deno.exit(100);
  }
}

printTree(args)
  .then((counts) => console.log(counts.toString()));

async function printTree(args: Args): Promise<Counts> {
  console.log(args.initialPathAbsolute);
  const levelFlags = new Array<boolean>();
  levelFlags.push(true);
  const counts = new Counts();
  await printTreeLevel(args.initialPathAbsolute, counts, args, levelFlags);
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
    console.log(
      `${
        getPrefixString(levelFlags, i == upperBound, args.prefixSet)
      }${entry.name}${entry.isDirectory ? path_mod.SEP : ""}`,
    );
    if (entry.isDirectory) {
      ++counts.dirs;
      if (i === upperBound) levelFlags[levelFlags.length - 1] = false;
      levelFlags.push(true);
      if (args.levelLimit == 0 || level < args.levelLimit) {
        await printTreeLevel(
          path_mod.join(path, entry.name),
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

function getPrefixString(
  levelFlags: boolean[],
  isLastChild: boolean,
  prefixSet: PrefixSet,
): string {
  let result = "";
  const levels = levelFlags.length - 1;
  for (let i = 0; i < levels; ++i) {
    result += levelFlags[i] ? prefixSet.parentPrefix : prefixSet.noParentPrefix;
  }
  result += isLastChild ? prefixSet.lastChildPrefix : prefixSet.childPrefix;
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
