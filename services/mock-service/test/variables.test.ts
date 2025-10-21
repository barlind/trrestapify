import { describe, it, expect, beforeAll } from 'vitest'
import request from 'supertest'
import fs from 'fs'
import path from 'path'
import { app } from '../src/server'

const WORKTREES_DIR = path.join(process.cwd(), '.worktrees')
const BRANCH = 'featureVars'

function writeRoute(root: string, routePath: string, content: object) {
  const fullPath = path.join(root, routePath)
  fs.mkdirSync(path.dirname(fullPath), { recursive: true })
  fs.writeFileSync(fullPath, JSON.stringify(content), 'utf8')
}

beforeAll(() => {
  process.env.ALLOWED_BRANCHES = ''
  const branchDir = path.join(WORKTREES_DIR, BRANCH.replace(/\//g, '__'))
  fs.mkdirSync(branchDir, { recursive: true })
  const branchSub = path.join(branchDir, 'www-dev')
  fs.mkdirSync(branchSub, { recursive: true })
  writeRoute(branchSub, 'users/[id].json', { id: '[id]', name: 'User [id]' })
})

describe('variable route matching', () => {
  it('matches /users/123 via [id] pattern', async () => {
    const res = await request(app).get('/users/123').set('x-target-branch', BRANCH)
    expect(res.status).toBe(200)
    expect(res.body.route.body.name).toBe('User 123')
  })
})
