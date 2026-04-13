function readFlag(args: string[], flag: string): string | undefined {
  const index = args.indexOf(flag);
  if (index === -1) return undefined;
  return args[index + 1];
}

export function hasFlag(args: string[], flag: string): boolean {
  return args.includes(flag);
}

export function requireFlag(args: string[], flag: string): string {
  const value = readFlag(args, flag);
  if (!value || value.startsWith("--")) {
    throw new Error(`missing required ${flag}`);
  }
  return value;
}

export function optionalFlag(
  args: string[],
  flag: string,
  fallback: string,
): string {
  const value = readFlag(args, flag);
  if (!value || value.startsWith("--")) return fallback;
  return value;
}
