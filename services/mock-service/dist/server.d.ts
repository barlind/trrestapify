import { BranchWorktreeManager, createCoreLib } from '../../../packages/core-lib/dist/index.js';
import type { Application } from 'express';
declare const app: Application;
declare const manager: BranchWorktreeManager;
interface BranchCacheEntry {
    loadedAt: number;
    core: ReturnType<typeof createCoreLib>;
}
declare const branchCache: Map<string, BranchCacheEntry>;
export { app, manager, branchCache };
//# sourceMappingURL=server.d.ts.map