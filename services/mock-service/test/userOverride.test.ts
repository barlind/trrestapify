import { describe, it, expect, beforeAll } from 'vitest'
import request from 'supertest'
import path from 'path'
import fs from 'fs'
import { app } from '../src/server'

const WORKTREES_DIR = path.join(process.cwd(), '.worktrees')
const BRANCH = 'featureUser'

function writeJSON(base: string, rel: string, content: object) {
  const full = path.join(base, rel)
  fs.mkdirSync(path.dirname(full), { recursive: true })
  fs.writeFileSync(full, JSON.stringify(content), 'utf8')
}

// Lightweight unsigned JWT-like token generator (header.payload.signature)
function makeFakeJwt(sub: string): string {
  const header = Buffer.from(JSON.stringify({ alg: 'none', typ: 'JWT' })).toString('base64url')
  const payload = Buffer.from(JSON.stringify({ sub })).toString('base64url')
  return `${header}.${payload}.` // signature empty
}

beforeAll(() => {
  process.env.ALLOWED_BRANCHES = ''
  const branchDir = path.join(WORKTREES_DIR, BRANCH.replace(/\//g, '__'))
  const subDir = path.join(branchDir, 'www-dev')
  fs.mkdirSync(subDir, { recursive: true })
  // Base file
  writeJSON(subDir, 'profile/_.json', { name: 'anonymous', role: 'guest' })
  // Override file for user id 12345
  writeJSON(path.join(subDir, 'profile'), '12345.json', { name: 'Alice', role: 'member' })
})

describe('user-specific override', () => {
  it('serves base file without auth', async () => {
    const res = await request(app).get('/profile') .set('x-target-branch', BRANCH)
    expect(res.status).toBe(200)
    expect(res.body.route.body.name).toBe('anonymous')
    expect(res.headers['x-user-override']).toBeUndefined()
  })
  it('serves override file when JWT sub matches file', async () => {
    const token = makeFakeJwt('12345')
    const res = await request(app).get('/profile')
      .set('x-target-branch', BRANCH)
      .set('Authorization', `Bearer ${token}`)
    expect(res.status).toBe(200)
    expect(res.body.route.body.name).toBe('Alice')
    expect(res.headers['x-user-override']).toBe('true')
    expect(res.headers['x-user-id']).toBe('12345')
  })
})
