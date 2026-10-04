declare module '*.wasm?module' {
  const module: WebAssembly.Module;
  export default module;
}

/** Preview-build origin for social images; empty in production. */
declare const __OG_ORIGIN__: string;
