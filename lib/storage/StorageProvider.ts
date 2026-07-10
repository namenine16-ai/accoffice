import type { DocumentCategory } from "@prisma/client";

export interface StorageSaveInput {
  buffer: Buffer;
  customerId: number;
  year: number;
  category: DocumentCategory;
  fileName: string;
}

export interface StorageSaveResult {
  storedName: string;
  filePath: string;
  checksum: string;
}

export interface StorageProvider {
  save(input: StorageSaveInput): Promise<StorageSaveResult>;
  read(filePath: string): Promise<Buffer>;
  delete(filePath: string): Promise<void>;
}
