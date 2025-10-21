import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import request from 'supertest'
import http from 'http'
import { app } from '../src/server'
import path from 'path'
import fs from 'fs'

// We will spin up a tiny http server to act as proxy target, returning JSON.
// Then set PROXY_BASE_URL to that server URL and verify fallback when route not found.

let proxyServer: http.Server
let proxyPort: number

beforeAll(async () => {
  process.env.ALLOWED_BRANCHES = ''
  // Dynamic port
  proxyPort = 5100 + Math.floor(Math.random() * 1000)
  proxyServer = http.createServer((req, res) => {
    res.setHeader('Content-Type', 'application/json')
    if (req.url === '/hello-external') {
      res.end(JSON.stringify({ external: true, path: req.url }))
    } else if (req.url === '/api/settings/public') {
      res.end(JSON.stringify({ theme: 'dark', features: ['a','b'] }))
    } else {
      res.statusCode = 404
      res.end(JSON.stringify({ error: 'proxy_not_found' }))
    }
  })
  await new Promise<void>(resolve => proxyServer.listen(proxyPort, resolve))
  process.env.PROXY_BASE_URL = `http://localhost:${proxyPort}`
  process.env.LOG_LEVEL = 'error' // keep test output clean
  process.env.FALLBACK_BRANCH = '___no_fallback___'
  // Create empty worktree folder for rewriteBranch so branch load succeeds but contains no routes
  const worktreesRoot = path.join(process.cwd(), '.worktrees')
  const rewriteDir = path.join(worktreesRoot, 'rewriteBranch')
  const rewriteSub = path.join(rewriteDir, 'www-dev')
  fs.mkdirSync(rewriteSub, { recursive: true })
})

afterAll(async () => {
  await new Promise<void>(resolve => proxyServer.close(() => resolve()))
})

describe('proxy fallback', () => {
  it('forwards to proxy when no local route', async () => {
    const res = await request(app).get('/hello-external').set('x-target-branch', 'main')
    expect(res.status).toBe(200)
    expect(res.headers['x-proxied']).toBe('true')
    expect(res.body.external).toBe(true)
  })
  it('applies local rewrite when USE_LOCAL_PROXY=true', async () => {
    process.env.USE_LOCAL_PROXY = 'true'
    // Use a path guaranteed not to exist locally so proxy is used
  const res = await request(app).get('/content/settings/content').set('x-target-branch', 'rewriteBranch')
    expect(res.status).toBe(200)
    expect(res.headers['x-proxied']).toBe('true')
    // local rewrite wraps settings response under epiSettings
    expect(res.body.epiSettings).toBeTruthy()
    expect(res.body.epiSettings.theme).toBe('dark')
  })
})
