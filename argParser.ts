import { parse } from "https://deno.land/std@0.186.0/flags/mod.ts";
import { Args } from "./args.ts";

export const HelpText = `
usage: tree [-ad] [-L level] [--help] <path>

OPTIONS
-a       List all files.
-d       List directories only.
-L level List maximum levels deep.
--help   Show this text.
`;
export abstract class ArgParser {
  public static parseArgs(clargs: string[]): Args {
    const flags = parse(clargs, {
      boolean: ["h", "a", "d"],
      alias: {
        "help": "h",
        "all": "a",
        "dirs-only": "d",
      },
      default: { "L": 0 },
    });
    if (!flags._[0]) flags._[0] = ".";
    return {
      initialPath: flags._[0] as string,
      levelLimit: flags.L as number,
      showAll: flags.a,
      dirsOnly: flags.d,
      showHelp: flags.h,
    };
  }
}
