import { describe, it, expect, beforeAll } from 'vitest'
import request from 'supertest'
import path from 'path'
import fs from 'fs'
import { app, branchCache } from '../src/server'

// Helper to create mock worktree folder structure emulating BranchWorktreeManager output.
// Since BranchWorktreeManager actually shells out to git, tests will rely on pre-created folder
// and a manual injection into cache by simulating ensure logic indirectly via server middleware.

const WORKTREES_DIR = path.join(process.cwd(), '.worktrees')
const BRANCH_A = 'featureA'
const BRANCH_B = 'featureB'

function writeRoute(root: string, routePath: string, content: object) {
  const fullPath = path.join(root, routePath)
  fs.mkdirSync(path.dirname(fullPath), { recursive: true })
  fs.writeFileSync(fullPath, JSON.stringify(content), 'utf8')
}

beforeAll(() => {
  // Ensure tests ignore any external branch allow list
  process.env.ALLOWED_BRANCHES = ''
  // Create worktree mimicking structure with www-dev subdir
  fs.mkdirSync(WORKTREES_DIR, { recursive: true })
  const branchADir = path.join(WORKTREES_DIR, BRANCH_A.replace(/\//g, '__'))
  const branchBDir = path.join(WORKTREES_DIR, BRANCH_B.replace(/\//g, '__'))
  fs.mkdirSync(branchADir, { recursive: true })
  fs.mkdirSync(branchBDir, { recursive: true })
  const branchASub = path.join(branchADir, 'www-dev')
  const branchBSub = path.join(branchBDir, 'www-dev')
  fs.mkdirSync(branchASub, { recursive: true })
  fs.mkdirSync(branchBSub, { recursive: true })
  writeRoute(branchASub, 'hello.json', { message: 'hello A' })
  writeRoute(branchBSub, 'hello.json', { message: 'hello B' })
})

describe('branch selection', () => {
  it('serves route from featureA branch', async () => {
    const res = await request(app).get('/hello').set('x-target-branch', BRANCH_A)
    expect(res.status).toBe(200)
    expect(res.body.route.body.message).toBe('hello A')
    expect(res.headers['x-branch-served']).toBe(BRANCH_A)
  })
  it('serves route from featureB branch', async () => {
    const res = await request(app).get('/hello').set('x-target-branch', BRANCH_B)
    expect(res.status).toBe(200)
    expect(res.body.route.body.message).toBe('hello B')
    expect(res.headers['x-branch-served']).toBe(BRANCH_B)
  })
})

describe('branch refresh header', () => {
  it('refreshes branch cache when x-branch-refresh=true', async () => {
    // Initial request to populate cache
    const first = await request(app).get('/hello').set('x-target-branch', BRANCH_A)
    expect(first.status).toBe(200)
    const cacheEntryBefore = branchCache.get(BRANCH_A)
    expect(cacheEntryBefore).toBeTruthy()

    // Modify underlying file
  const branchADir = path.join(WORKTREES_DIR, BRANCH_A.replace(/\//g, '__'))
  const branchASub = path.join(branchADir, 'www-dev')
  writeRoute(branchASub, 'hello.json', { message: 'hello A updated' })

    // Without refresh header we still get old cached content (since core-lib snapshot was not reloaded)
    const withoutRefresh = await request(app).get('/hello').set('x-target-branch', BRANCH_A)
    expect(withoutRefresh.body.route.body.message).toBe('hello A')

    // With refresh header we expect updated content
    const withRefresh = await request(app).get('/hello').set('x-target-branch', BRANCH_A).set('x-branch-refresh', 'true')
    expect(withRefresh.body.route.body.message).toBe('hello A updated')
  })
})
