import { LocalStorageProvider } from "./LocalStorageProvider";
import type { StorageProvider } from "./StorageProvider";

export const storageProvider: StorageProvider = new LocalStorageProvider();

export type { StorageProvider, StorageSaveInput, StorageSaveResult } from "./StorageProvider";
