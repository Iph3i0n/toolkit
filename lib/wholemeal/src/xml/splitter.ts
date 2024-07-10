const pattern =
  /((?:<script(?:\s+on="[a-zA-Z0-9]+")?\s*>)(?:.|\n)*?(?:<\/script>)|(?<=<style>)(?:.|\n)*(?=<\/style>)|"[^"]*"|<\/|\/>|<|>|\s|=)/gm;

export function SplitCode(code: string) {
  return code
    .trim()
    .split(pattern)
    .filter((t) => t);
}
