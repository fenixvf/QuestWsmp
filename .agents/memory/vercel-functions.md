---
name: Vercel function discovery
description: Vercel's function discovery and TypeScript emitter behavior in this workspace
---

Vercel may discover API functions inside nested artifact directories, not only the repository-root api directory. A remaining `api/[...path].ts` can keep triggering `Emit skipped` even after the root handler is converted.

**Why:** The deployment build scans the monorepo after the frontend build and invokes its TypeScript emitter for discovered Functions; this happens before runtime environment variables are read.

**How to apply:** When Vercel reports `api/[...path].ts: Emit skipped`, search the entire repository for matching TypeScript handlers and convert/remove every deployed copy. Then validate the generated JavaScript bundles and frozen lockfile.

For JavaScript catch-all handlers in this monorepo, import the shared Express app from its actual `.ts` source with a static import; importing a non-existent emitted `.js` source can prevent the function from serving routes.

**Why:** The API server is bundled separately for local execution, but Vercel bundles the function entrypoint directly and does not receive `artifacts/api-server/dist` as its source tree.

**How to apply:** Keep the root and nested artifact Vercel handlers aligned, and compile each handler through the Vercel/esbuild path before publishing.