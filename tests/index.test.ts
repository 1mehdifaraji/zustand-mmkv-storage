import { describe, it, expect, vi, beforeEach } from "vitest";
import type { StateStorage } from "zustand/middleware";

const mockCreateMMKV = vi.fn();

vi.mock("react-native-mmkv", async () => {
  return {
    createMMKV: mockCreateMMKV,
  };
});

let createMMKVStorage: (options?: any) => StateStorage;
let mmkvStorage: StateStorage;

beforeEach(async () => {
  mockCreateMMKV.mockReset();

  mockCreateMMKV.mockImplementation((config: any) => {
    const storage = new Map<string, string>();

    return {
      config,
      set: (key: string, value: string) => storage.set(key, value),
      getString: (key: string) => storage.get(key) ?? null,
      delete: (key: string) => storage.delete(key),
      __storage: storage,
    };
  });

  vi.resetModules();

  const mod = await import("../src");
  createMMKVStorage = mod.createMMKVStorage;
  mmkvStorage = mod.mmkvStorage;
});

describe("zustand-mmkv-storage", () => {
  it("basic set/get/remove works with default mmkvStorage", async () => {
    await mmkvStorage.setItem("count", "42");
    const value = await mmkvStorage.getItem("count");
    expect(value).toBe("42");

    await mmkvStorage.removeItem("count");
    const removed = await mmkvStorage.getItem("count");
    expect(removed).toBeNull();
  });

  it("createMMKVStorage() with no options works", async () => {
    const storage = createMMKVStorage();
    await storage.setItem("test", "hello");
    const value = await storage.getItem("test");
    expect(value).toBe("hello");
  });

  it("default mmkvStorage and createMMKVStorage() share the same instance", async () => {
    await mmkvStorage.setItem("shared", "from-singleton");

    const custom = createMMKVStorage(); // no options
    const value = await custom.getItem("shared");

    expect(value).toBe("from-singleton");

    expect(mockCreateMMKV).toHaveBeenCalledTimes(1);
    expect(mockCreateMMKV).toHaveBeenCalledWith({ id: "mmkv.default" });
  });

  it("two createMMKVStorage() calls with same config share instance", async () => {
    const config = { id: "user-profile", encryptionKey: "secret" };

    const storage1 = createMMKVStorage(config);
    await storage1.setItem("name", "Alice");

    const storage2 = createMMKVStorage(config);
    const value = await storage2.getItem("name");

    expect(value).toBe("Alice");

    expect(mockCreateMMKV).toHaveBeenCalledTimes(1);
    expect(mockCreateMMKV).toHaveBeenCalledWith({
      id: "user-profile",
      encryptionKey: "secret",
    });
  });

  it("different id creates separate instances", async () => {
    const storageA = createMMKVStorage({ id: "store-a" });
    const storageB = createMMKVStorage({ id: "store-b" });

    await storageA.setItem("key", "valueA");
    await storageB.setItem("key", "valueB");

    expect(await storageA.getItem("key")).toBe("valueA");
    expect(await storageB.getItem("key")).toBe("valueB");

    expect(mockCreateMMKV).toHaveBeenCalledTimes(2);
  });

  it("different encryptionKey creates separate instances (same id)", async () => {
    const storage1 = createMMKVStorage({ id: "secure", encryptionKey: "key1" });
    const storage2 = createMMKVStorage({ id: "secure", encryptionKey: "key2" });

    await storage1.setItem("token", "abc");

    expect(await storage2.getItem("token")).toBeNull();

    expect(mockCreateMMKV).toHaveBeenCalledTimes(2);
  });

  it("no encryptionKey vs undefined encryptionKey share instance", async () => {
    const storage1 = createMMKVStorage({ id: "app" });
    const storage2 = createMMKVStorage({ id: "app", encryptionKey: undefined });

    await storage1.setItem("test", "shared");

    const value = await storage2.getItem("test");
    expect(value).toBe("shared");

    expect(mockCreateMMKV).toHaveBeenCalledTimes(1);
  });

  it("passes encryptionKey correctly when provided", async () => {
    createMMKVStorage({ id: "vault", encryptionKey: "hunter2" });

    const storage = createMMKVStorage({
      id: "vault",
      encryptionKey: "hunter2",
    });
    await storage.setItem("x", "y");

    expect(mockCreateMMKV).toHaveBeenCalledWith({
      id: "vault",
      encryptionKey: "hunter2",
    });
  });

  it("uses 'mmkv.default' when no id provided", async () => {
    const storage = createMMKVStorage();
    await storage.setItem("init", "trigger");

    expect(mockCreateMMKV).toHaveBeenCalledWith({ id: "mmkv.default" });
  });
});
