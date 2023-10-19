import { isAbsolute, join } from "https://deno.land/std@0.204.0/path/mod.ts";
import { PrefixSet } from "./prefixSet.ts";

export type ArgsType = {
  initialPath: string;
  levelLimit: number;
  showAll: boolean;
  ascii: boolean;
  dirsOnly: boolean;
  showHelp: boolean;
  showVersion: boolean;
};

export class Args {
  public args: ArgsType;
  public initialPathAbsolute: string;
  public prefixSet: PrefixSet;

  public constructor(args: ArgsType) {
    this.args = args;
    this.initialPathAbsolute = isAbsolute(args.initialPath) ? args.initialPath : join(Deno.cwd(), args.initialPath);
    this.prefixSet = this.ascii
    ? {
      parentPrefix: "|   ",
      noParentPrefix: "    ",
      childPrefix: "+-- ",
      lastChildPrefix: "\\-- ",
    }
    : {
      parentPrefix: "│   ",
      noParentPrefix: "    ",
      childPrefix: "├── ",
      lastChildPrefix: "└── ",
    };
  }

  public get initialPath() { return this.args.initialPath; }
  public get levelLimit() { return this.args.levelLimit; }
  public get showAll() { return this.args.showAll; }
  public get dirsOnly() { return this.args.dirsOnly; }
  public get showHelp() { return this.args.showHelp; }
  public get showVersion() { return this.args.showVersion; }
  public get ascii() { return this.args.ascii; }
}