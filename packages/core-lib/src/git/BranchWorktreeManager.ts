import * as path from 'path'
import * as fs from 'fs'
import { execFileSync } from 'child_process'

export interface EnsureResult {
  branch: string
  worktreePath: string
  created: boolean
}

export interface BranchWorktreeManagerOptions {
  remoteName?: string // default 'origin'
}

export class BranchWorktreeManager {
  private repoRoot: string
  private baseDir: string
  private lru: string[] = []
  private remoteName: string
  private max: number
  private gitExtraArgs: string[] = []
  constructor(repoRoot: string, baseDir: string, max = 10, options: BranchWorktreeManagerOptions = {}) {
    this.repoRoot = repoRoot
    this.baseDir = baseDir
    this.remoteName = options.remoteName || 'origin'
    this.max = max
    const pat = process.env.AZDO_PAT
    if (pat) {
      // Basic auth header = base64(:PAT)
      const header = Buffer.from(`:${pat}`, 'utf8').toString('base64')
      this.gitExtraArgs = ['-c', `http.extraheader=Authorization: Basic ${header}`]
    }
    fs.mkdirSync(this.baseDir, { recursive: true })
  }
  private sanitize(branch: string): string {
    if (!/^[A-Za-z0-9._\-\/]+$/.test(branch)) throw new Error(`Invalid branch name: ${branch}`)
    return branch
  }
  private worktreePath(branch: string): string { return path.join(this.baseDir, branch.replace(/\//g, '__')) }
  ensure(branch: string): EnsureResult {
    branch = this.sanitize(branch)
    const wtPath = this.worktreePath(branch)
    const exists = fs.existsSync(wtPath)
    let created = false
    if (!exists) {
      // fetch and create shallow worktree
      try { execFileSync('git', [...this.gitExtraArgs, '-C', this.repoRoot, 'fetch', '--depth=1', this.remoteName, branch], { stdio: 'ignore' }) } catch {/* ignore */}
      try {
        execFileSync('git', [...this.gitExtraArgs, '-C', this.repoRoot, 'worktree', 'add', '--force', wtPath, `${this.remoteName}/${branch}`], { stdio: 'ignore' })
        created = true
      } catch (e) {
        // fallback: try branch directly
        execFileSync('git', [...this.gitExtraArgs, '-C', this.repoRoot, 'worktree', 'add', '--force', wtPath, branch], { stdio: 'ignore' })
        created = true
      }
      this.track(branch)
      this.evictIfNeeded()
    } else {
      this.track(branch)
    }
    return { branch, worktreePath: wtPath, created }
  }
  private track(branch: string) {
    this.lru = this.lru.filter(b => b !== branch)
    this.lru.push(branch)
  }
  private evictIfNeeded() {
    while (this.lru.length > this.max) {
      const victim = this.lru.shift()
      if (!victim) break
      const victimPath = this.worktreePath(victim)
  try { execFileSync('git', [...this.gitExtraArgs, '-C', this.repoRoot, 'worktree', 'remove', '--force', victimPath], { stdio: 'ignore' }) } catch {/* ignore */}
      fs.rmSync(victimPath, { recursive: true, force: true })
    }
  }
}
