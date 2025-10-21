export interface EnsureResult {
    branch: string;
    worktreePath: string;
    created: boolean;
}
export interface BranchWorktreeManagerOptions {
    remoteName?: string;
}
export declare class BranchWorktreeManager {
    private repoRoot;
    private baseDir;
    private lru;
    private remoteName;
    private max;
    private gitExtraArgs;
    constructor(repoRoot: string, baseDir: string, max?: number, options?: BranchWorktreeManagerOptions);
    private sanitize;
    private worktreePath;
    ensure(branch: string): EnsureResult;
    private track;
    private evictIfNeeded;
}
//# sourceMappingURL=BranchWorktreeManager.d.ts.map