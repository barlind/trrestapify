import { describe, it, expect } from 'vitest'
import { createCoreLib } from '../src'
import * as path from 'path'

// Use existing fixture directory if available (fallback to test/api from root)
const fixturesDir = path.resolve(__dirname, '../../../test/api')

describe('loadRoutes', () => {
  it('loads basic routes without throwing', () => {
    const core = createCoreLib(fixturesDir)
    const routes = core.listRoutes()
    expect(routes.length).toBeGreaterThan(0)
    const pets = routes.find(r => r.route.includes('/pets'))
    expect(pets).toBeDefined()
  })

  it('parses method and status code', () => {
    const core = createCoreLib(fixturesDir)
    const anyRoute = core.listRoutes()[0]
    expect(anyRoute.method).toMatch(/GET|POST|PUT|PATCH|DELETE/)
    expect(anyRoute.statusCode).toBeGreaterThan(0)
  })
})
