// Temporary re-export until workspace resolution is configured
export interface CoreRoute {
  route: string
  method: string
  filename: string
}

export interface CoreLib {
  listRoutes(): CoreRoute[]
}

export function createCoreLib(): CoreLib {
  return {
    listRoutes() { return [] }
  }
}
