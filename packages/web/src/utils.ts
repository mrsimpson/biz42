/** Return the bare filename (last path segment, with extension) */
export function filename(filePath: string): string {
  const parts = filePath.replace(/\\/g, "/").split("/");
  return parts[parts.length - 1] ?? filePath;
}
