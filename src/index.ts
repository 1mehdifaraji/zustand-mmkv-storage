import type { StateStorage } from "zustand/middleware";

export interface MMKVOptions {
  id?: string;
  encryptionKey?: string;
  [key: string]: any;
}

const instanceCache = new Map<string, any>();

const getCacheKey = (options?: MMKVOptions): string => {
  const id = options?.id ?? "mmkv.default";
  const key = options?.encryptionKey;
  return `${id}:${key ?? ""}`;
};

export const createMMKVStorage = (options?: MMKVOptions): StateStorage => {
  const cacheKey = getCacheKey(options);

  let mmkvInstance: any = null;

  const initializeMMKV = async () => {
    if (mmkvInstance) return mmkvInstance;

    if (instanceCache.has(cacheKey)) {
      mmkvInstance = instanceCache.get(cacheKey);
      return mmkvInstance;
    }

    try {
      const { createMMKV } = await import("react-native-mmkv");
      const instance = createMMKV({
        id: options?.id ?? "mmkv.default",
        encryptionKey: options?.encryptionKey,
      });

      instanceCache.set(cacheKey, instance);
      mmkvInstance = instance;
      return mmkvInstance;
    } catch (e) {
      console.warn("Failed to initialize MMKV:", e);
      throw new Error(
        "react-native-mmkv is not installed or linked correctly. Install it with: npm i react-native-mmkv"
      );
    }
  };

  return {
    getItem: async (name: string) => {
      const mmkv = await initializeMMKV();
      return mmkv.getString(name) ?? null;
    },
    setItem: async (name: string, value: string) => {
      const mmkv = await initializeMMKV();
      mmkv.set(name, value);
    },
    removeItem: async (name: string) => {
      const mmkv = await initializeMMKV();
      mmkv.delete(name);
    },
  };
};

export const mmkvStorage = createMMKVStorage();
