import { parse } from "https://deno.land/std@0.186.0/flags/mod.ts";
import { Args } from "./args.ts";

export const HelpText = `
Usage: 
  tree [OPTIONS] <path>

Options:
  -a, --all       List all files and/or directories, including those that start with '.'
  -d, --dirs-only List directories only
  --ascii         Use ASCII instead of extended characters
  -L level        List maximum levels deep
  -h, -?, --help  Show this text
  -v, --version   Show the version number
`;
export abstract class ArgParser {
  public static parseArgs(clargs: string[]): Args {
    const flags = parse(clargs, {
      boolean: ["h", "a", "d", "v", "ascii"],
      alias: {
        "help": ["h", "?"],
        "all": "a",
        "dirs-only": "d",
        "version": "v",
      },
      default: { "L": 0 },
    });
    if (!flags._[0]) flags._[0] = ".";
    return new Args({
      initialPath: flags._[0] as string,
      levelLimit: flags.L as number,
      showAll: flags.a,
      ascii: flags.ascii,
      dirsOnly: flags.d,
      showHelp: flags.h,
      showVersion: flags.v,
    }
  )
  }
}
