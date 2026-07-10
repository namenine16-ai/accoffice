import { randomUUID, createHash } from "crypto";
import { mkdir, readFile, rm, writeFile } from "fs/promises";
import path from "path";
import type { StorageProvider, StorageSaveInput, StorageSaveResult } from "./StorageProvider";

const STORAGE_ROOT = path.join(process.cwd(), "storage", "documents");

function extensionFromFileName(fileName: string): string {
  const match = /\.([a-zA-Z0-9]+)$/.exec(fileName);
  return match ? match[1].toLowerCase() : "bin";
}

function resolveWithinRoot(relativePath: string): string {
  const resolved = path.resolve(STORAGE_ROOT, relativePath);
  if (!resolved.startsWith(STORAGE_ROOT + path.sep)) {
    throw new Error("Resolved storage path escapes the storage root");
  }
  return resolved;
}

export class LocalStorageProvider implements StorageProvider {
  async save({ buffer, customerId, year, category, fileName }: StorageSaveInput): Promise<StorageSaveResult> {
    const extension = extensionFromFileName(fileName);
    const storedName = `${randomUUID()}.${extension}`;
    const relativeDir = path.join("customers", String(customerId), String(year), category.toLowerCase());
    const relativePath = path.join(relativeDir, storedName);

    const absoluteDir = resolveWithinRoot(relativeDir);
    await mkdir(absoluteDir, { recursive: true });
    await writeFile(resolveWithinRoot(relativePath), buffer);

    const checksum = createHash("sha256").update(buffer).digest("hex");

    return { storedName, filePath: relativePath, checksum };
  }

  async read(filePath: string): Promise<Buffer> {
    return readFile(resolveWithinRoot(filePath));
  }

  async delete(filePath: string): Promise<void> {
    await rm(resolveWithinRoot(filePath), { force: true });
  }
}
