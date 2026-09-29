import { isBusinessModelDocument } from "@biz42/core";
import { readCommitFiles as readFiles, readDocumentBlob } from "@cli42/lib/git";

export { isBusinessModelDocument };

/**
 * Read the business model documents of the workspace at one commit, as
 * repository-relative path → git blob id. Takes a full commit id only — never
 * a branch or other reference. Git failures are raised.
 */
export function readCommitFiles(dir: string, commit: string): Record<string, string> {
  return readFiles(dir, commit, isBusinessModelDocument).files;
}

/**
 * Read one business model document by its blob id. Only a blob that is a
 * document of the workspace in one of `commits` is read; any other id — any
 * other file of the repository — is refused, so serving blobs never exposes
 * the rest of the repository.
 */
export function readBusinessModelBlob(dir: string, commits: readonly string[], id: string): string {
  return readDocumentBlob(
    dir,
    commits,
    id,
    isBusinessModelDocument,
    "Not a business model document of this history",
  );
}
