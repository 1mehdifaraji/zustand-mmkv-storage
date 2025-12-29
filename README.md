# zustand-mmkv-storage

[![npm version](https://badge.fury.io/js/%401mehdifaraji%2Fzustand-mmkv-storage.svg)](https://badge.fury.io/js/%401mehdifaraji%2Fzustand-mmkv-storage)
[![npm downloads](https://img.shields.io/npm/dm/%401mehdifaraji%2Fzustand-mmkv-storage.svg)](https://www.npmjs.com/package/%401mehdifaraji%2Fzustand-mmkv-storage)
[![License](https://img.shields.io/npm/l/%401mehdifaraji%2Fzustand-mmkv-storage.svg)](https://github.com/1mehdifaraji/zustand-mmkv-storage/blob/main/LICENSE)

A fast, lightweight adapter to use [react-native-mmkv](https://github.com/mrousavy/react-native-mmkv) as the storage backend for [Zustand's persist middleware](https://github.com/pmndrs/zustand#persist-middleware).

MMKV is a high-performance key-value store (~30x faster than AsyncStorage), making this the ideal choice for persisting Zustand state in React Native apps. This adapter supports lazy loading, instance caching, and best practices like hydration detection to prevent the "flash of initial state" on app startup.

## Features

- **Blazing Fast**: Leverages MMKV for synchronous, native performance.
- **Lazy Loading**: Dynamically imports MMKV only when needed.
- **Instance Caching**: Reuses the MMKV instance across calls for efficiency.
- **Hydration Handling**: Built-in example for `hasHydrated` to avoid UI flashes.
- **Zero Dependencies**: Besides peers (Zustand and react-native-mmkv).
- **TypeScript Support**: Fully typed with declarations.
- **Tested**: 100% coverage with Vitest.
- **Small Size**: <1KB minified.
- **Compatible**: Works with bare React Native and Expo (with proper setup).

## Installation

Install the package along with its peer dependencies:

```bash
npm install zustand-mmkv-storage zustand react-native-mmkv
# or
pnpm add zustand-mmkv-storage zustand react-native-mmkv
# or
yarn add zustand-mmkv-storage zustand react-native-mmkv
```

## After installation:

For bare React Native: Run pod install in /ios (auto-links on Android).

For Expo: Use with expo prebuild or ensure MMKV is configured.
Refer to react-native-mmkv docs for full setup.

## Basic Example

```typescript
// src/stores/bearStore.ts
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { mmkvStorage } from "zustand-mmkv-storage";

interface BearState {
  bears: number;
  increase: () => void;
  hasHydrated: boolean;
}

export const useBearStore = create<BearState>()(
  persist(
    (set) => ({
      bears: 0,
      increase: () => set((state) => ({ bears: state.bears + 1 })),
      hasHydrated: false,
    }),
    {
      name: "bear-storage", // Unique key for MMKV
      storage: createJSONStorage(() => mmkvStorage),
      // Prevents flash of initial state on app startup
      onRehydrateStorage: () => (state) => {
        if (state) {
          state.hasHydrated = true;
        }
      },
    }
  )
);
```

In your component:

```tsx
// src/components/BearCounter.tsx
import { View, Text, Button, ActivityIndicator } from "react-native";
import { useBearStore } from "../stores/bearStore";

const BearCounter = () => {
  const { bears, increase, hasHydrated } = useBearStore();

  if (!hasHydrated) return <ActivityIndicator size="large" />;

  return (
    <View>
      <Text>Bears: {bears}</Text>
      <Button title="Add bear" onPress={increase} />
    </View>
  );
};

export default BearCounter;
```

## Advanced: Custom MMKV Instance

Custom MMKV Instance (e.g., encryption or multi-process ID)

```TypeScript
import { createMMKVStorage } from 'zustand-mmkv-storage';
import { MMKV } from 'react-native-mmkv';

const encryptedStorage = createMMKVStorage({
  id: 'secure-storage',
  encryptionKey: 'secret',
});
```

### Multiple Stores

Each store can use the default singleton or its own custom instance:

```TypeScript
const userStorage = createMMKVStorage({ id: 'user' });
const settingsStorage = createMMKVStorage({ id: 'settings', encryptionKey: 'secret' });
```

### Partial Persistence & Migration

Use Zustand's built-in options:

```TypeScript
persist(
  // ...
  {
    name: 'large-store',
    partialize: (state) => ({ importantPart: state.importantPart }), // persist only subset
    storage: createJSONStorage(() => mmkvStorage),
    migrate: (persistedState, version) => {
      // handle state migrations
    },
    version: 1,
  }
)
```

## Error Handling

If `react-native-mmkv` is missing or not linked, the adapter throws a helpful error with installation instructions.

## API

`mmkvStorage`: Pre-created singleton (recommended for most cases).
`createMMKVStorage(options?)`: Create a custom `StateStorage` instance (options passed to `new MMKV()`).

Returned storage implements Zustand's `StateStorage` interface (async promises for compatibility, but sync under the hood for speed).

## Testing

The package includes full test coverage using Vitest.

`npm run test` or with coverage `npm run test:coverage`.

Tests mock `react-native-mmkv` and verify set/get/remove operations, including caching.

## Contributing

Contributions welcome! Fork, branch, commit, PR. Ensure tests and build pass.
We use Vitest + Rollup.

## License

MIT © Mehdi Faraji
If you find this useful, ⭐ the repo on GitHub!
Thanks for using `zustand-mmkv-storage` 🚀 Issues & suggestions welcome.
