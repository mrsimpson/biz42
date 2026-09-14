import { access, readdir, readFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import {
  getElementsFromDocuments,
  loadWorkspaceFromDocuments,
  parseBusinessDocument,
  validateDocuments,
} from "@biz42/core";
import type {
  DocumentAst,
  GetDocumentsOptions,
  GetResult,
  ValidationContext,
  ValidateResult,
  WorkspacePayload,
} from "@biz42/core";

export async function discoverFiles(dir: string): Promise<string[]> {
  const files: string[] = [];
  async function walk(current: string): Promise<void> {
    const entries = (await readdir(current, { withFileTypes: true })).sort((a, b) =>
      a.name.localeCompare(b.name),
    );
    for (const entry of entries) {
      const path = resolve(current, entry.name);
      if (entry.isDirectory()) await walk(path);
      else if (entry.isFile() && entry.name.endsWith(".biz42.md")) files.push(path);
    }
  }
  await walk(resolve(dir));
  return files;
}

export async function readWorkspaceDocuments(dir: string): Promise<DocumentAst[]> {
  const files = await discoverFiles(dir);
  return Promise.all(
    files.map(async (file) => parseBusinessDocument(file, await readFile(file, "utf8"))),
  );
}

async function findRepositoryRoot(dir: string): Promise<string> {
  let current = resolve(dir);
  while (true) {
    try {
      await access(resolve(current, ".git"));
      return current;
    } catch {
      const parent = dirname(current);
      if (parent === current) return resolve(dir);
      current = parent;
    }
  }
}

export async function loadWorkspace(dir: string): Promise<WorkspacePayload> {
  const documents = await readWorkspaceDocuments(dir);
  return loadWorkspaceFromDocuments(documents);
}

export async function validateWorkspace(
  dir: string,
  _context?: ValidationContext,
): Promise<ValidateResult> {
  const documents = await readWorkspaceDocuments(dir);
  return validateDocuments(documents);
}

export async function getElements(opts: {
  dir: string;
  query: GetDocumentsOptions["query"];
}): Promise<GetResult> {
  const documents = await readWorkspaceDocuments(opts.dir);
  return getElementsFromDocuments({ documents, query: opts.query });
}

export { findRepositoryRoot };
