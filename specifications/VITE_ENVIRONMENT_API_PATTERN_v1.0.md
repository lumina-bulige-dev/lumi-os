# Vite Environment API Pattern Reference v1.0

**Status:** Canonical Reference  
**Category:** Web Framework Build Patterns  
**Source:** React Router Vite Plugin Migration  
**Reference:** https://github.com/remix-run/react-router/commit/b88eb692514436e8c2bfe30b6d15e6a05fd13233

## Overview

This document captures a canonical pattern for migrating Vite plugin configurations from conditional SSR/client builds to Vite's new Environment API (Vite 6+).

## Pattern: From Discriminated Union to Environment API

### Before (Discriminated Union Pattern)

```typescript
type ReactRouterPluginSsrBuildContext =
  | {
      isSsrBuild: false;
      getReactRouterServerManifest?: never;
      serverBundleBuildConfig?: never;
    }
  | {
      isSsrBuild: true;
      getReactRouterServerManifest: () => Promise<ReactRouterManifest>;
      serverBundleBuildConfig: ServerBundleBuildConfig | null;
    };

// Conditional context creation
let ssrBuildCtx: ReactRouterPluginSsrBuildContext =
  viteConfigEnv.isSsrBuild && viteCommand === "build"
    ? {
        isSsrBuild: true,
        getReactRouterServerManifest: async () =>
          (await generateReactRouterManifestsForBuild())
            .reactRouterServerManifest,
        serverBundleBuildConfig: getServerBundleBuildConfig(viteUserConfig),
      }
    : { isSsrBuild: false };

// Conditional build configuration
...(viteCommand === "build"
  ? {
      build: {
        cssMinify: viteUserConfig.build?.cssMinify ?? true,
        ...(!viteConfigEnv.isSsrBuild
          ? {
              // Client build config
              manifest: true,
              outDir: getClientBuildDirectory(ctx.reactRouterConfig),
              // ... client-specific settings
            }
          : {
              // SSR build config
              ssrEmitAssets: true,
              outDir: getServerBuildDirectory(ctx),
              // ... SSR-specific settings
            }),
      },
    }
  : undefined)
```

### After (Environment API Pattern)

```typescript
type ReactRouterPluginSsrBuildContext = {
  getReactRouterServerManifest: () => Promise<ReactRouterManifest>;
  serverBundleBuildConfig: ServerBundleBuildConfig | null;
};

// Simplified context - always available
let ssrBuildCtx: ReactRouterPluginSsrBuildContext = {
  getReactRouterServerManifest: async () =>
    (await generateReactRouterManifestsForBuild())
      .reactRouterServerManifest,
  serverBundleBuildConfig: getServerBundleBuildConfig(viteUserConfig),
};

// Environment-based configuration
builder: {
  sharedConfigBuild: true,
  sharedPlugins: true,
  async buildApp(builder) {
    await builder.build(builder.environments.client);
    await builder.build(builder.environments.ssr);
  },
},

environments: {
  client: {
    build: {
      manifest: true,
      outDir: getClientBuildDirectory(ctx.reactRouterConfig),
      // ... client-specific settings
    },
    resolve: {
      dedupe: ["react", "react-dom", "react-router", "react-router-dom"],
      conditions:
        viteCommand === "build"
          ? viteClientConditions
          : ["development", ...viteClientConditions],
    },
  },
  ssr: {
    build: {
      ssrEmitAssets: true,
      copyPublicDir: false,
      manifest: true,
      outDir: getServerBuildDirectory(ctx),
      // ... SSR-specific settings
    },
    resolve: {
      external: ssrExternals,
      conditions:
        viteCommand === "build"
          ? viteServerConditions
          : ["development", ...viteServerConditions],
    },
  },
}
```

## Key Changes

### 1. Type Simplification
- **Removed:** Discriminated union with `isSsrBuild` flag
- **Added:** Simple object type with always-available properties
- **Benefit:** Eliminates runtime flag checks and type narrowing complexity

### 2. Build Environment Separation
- **Removed:** Conditional build config based on `isSsrBuild` flag
- **Added:** Explicit `environments.client` and `environments.ssr` configurations
- **Benefit:** Clear separation of concerns, easier to maintain

### 3. Builder Pattern
- **Removed:** Implicit SSR build behavior based on Vite flags
- **Added:** Explicit `builder.buildApp()` that orchestrates both builds
- **Benefit:** Predictable build order and control flow

### 4. Runtime Environment Detection
- **Changed:** From `if (!ctx.isSsrBuild)` to `if (this.environment.name !== "ssr")`
- **Benefit:** Uses Vite's native environment system

## Benefits

1. **Type Safety:** Simplified types without conditional properties
2. **Clarity:** Explicit environment configurations over conditional logic
3. **Maintainability:** Each environment config is self-contained
4. **Future-proof:** Aligns with Vite's modern environment API
5. **Scalability:** Easy to add more environments (e.g., preview, edge)

## Application Guidelines

When implementing multi-environment builds with Vite 6+:

1. **Avoid discriminated unions for build contexts** - Use simple, always-available types
2. **Use `environments` config** - Separate client, SSR, and other environments explicitly
3. **Implement `builder.buildApp()`** - Control build orchestration explicitly
4. **Use `this.environment.name`** - For runtime environment detection in plugins
5. **Share common config** - Use `sharedConfigBuild` and `sharedPlugins` where appropriate

## References

- React Router Vite Plugin Migration: https://github.com/remix-run/react-router/commit/b88eb692514436e8c2bfe30b6d15e6a05fd13233
- Vite Environment API Documentation: https://vitejs.dev/guide/api-environment.html

## Version History

- v1.0 (2026-01-10): Initial canonical reference

---

**Canonical Status:** This pattern is officially recognized by LUMINA BULIGE as a best practice for Vite-based build configurations. All future web framework implementations should reference this pattern when implementing multi-environment builds.

**Maintenance:** A：HQ only
**Access:** B／C／D／E - Reference only (no modification)
