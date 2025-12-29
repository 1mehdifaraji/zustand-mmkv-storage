import typescript from "rollup-plugin-typescript2";

export default {
  input: "src/index.ts",
  output: [
    { file: "dist/index.js", format: "cjs", exports: "named", sourcemap: true },
    { file: "dist/index.esm.js", format: "esm", sourcemap: true },
  ],
  plugins: [
    typescript({
      tsconfig: "./tsconfig.json",
      useTsconfigDeclarationDir: true,
    }),
  ],
  external: ["zustand/middleware", "react-native-mmkv"],
};
