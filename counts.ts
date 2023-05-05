export class Counts {
  dirs = 0;
  files = 0;

  toString() {
    return `\n${this.comma(this.dirs)} ${this.dirs != 1 ? "directories" : "directory"}, ${this.comma(this.files)} ${this.files != 1 ? "files" : "file"}`;
  }
  comma(value: number) {
    let result = "";
    let val = value.toString();
    while (val.length > 3) {
      result = "," + val.substring(val.length - 3) + result;
      val = val.substring(0, val.length - 3);
    }
    result = val + result;
    return result;
  }
}
