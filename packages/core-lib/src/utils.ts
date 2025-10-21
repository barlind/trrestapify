import * as fs from 'fs'
import * as path from 'path'
import { BOOLEAN_CAST_INDICATOR, CASTING_OPERATORS, HTTP_VERBS, NUMBER_CAST_INDICATOR } from './const'
import { HttpVerb } from './types'

export const getDirs = (p: string): string[] => fs.readdirSync(p).filter(f => fs.statSync(path.join(p, f)).isDirectory())
export const getFiles = (p: string): string[] => fs.readdirSync(p).filter(f => fs.statSync(path.join(p, f)).isFile())
export const replaceAll = (str: string, find: string, replace: string): string => str.split(find).join(replace)
export const getVarsInPath = (pathParam: string): string[] => {
  const vars: string[] = []
  if (pathParam.endsWith('.json')) pathParam = pathParam.slice(0, -'.json'.length)
  pathParam.split('/').forEach(part => { if (part.startsWith('[') && part.endsWith(']')) vars.push(part.slice(1, -1)) })
  return vars
}
export const isHttpVerb = (str: string): boolean => HTTP_VERBS.includes(str as HttpVerb)
export const isStateVariable = (str: string): boolean => str.startsWith('{') && str.endsWith('}')
export const isNumeric = (str: string): boolean => !Number.isNaN(str) && !Number.isNaN(parseFloat(str))
export const routeResolve = (...routes: string[]): string => {
  let final = ''
  routes.forEach((r, i) => {
    const prevSlash = !!routes[i - 1]?.endsWith('/')
    const curFirst = r.startsWith('/')
    if (prevSlash && curFirst) final += r.slice(1)
    else if (!prevSlash && !curFirst) final += '/' + r
    else final += r
  })
  return final
}
interface OrderedRoutes { route: string; method: HttpVerb }
export const getRoutesByFileOrder = (routes: Record<HttpVerb, Record<string, any>>): OrderedRoutes[] => {
  const ordered: OrderedRoutes[] = []
  let links: string[] = []
  HTTP_VERBS.forEach(m => { links = [...links, ...Object.keys(routes[m] || {})] })
  links = [...new Set(links)].sort()
  links.forEach(link => { HTTP_VERBS.forEach(m => { if (routes[m]?.[link]) ordered.push({ method: m, route: link }) }) })
  return ordered
}
export const getRouteFiles = (rootDir: string, files: { [filename: string]: string } = {}): { [filename: string]: string } => {
  getFiles(rootDir).forEach(fn => { if (fn.endsWith('.json')) { const fp = path.resolve(rootDir, fn); files[fp] = fs.readFileSync(fp, 'utf8') } })
  getDirs(rootDir).forEach(d => getRouteFiles(path.resolve(rootDir, d), files))
  return files
}
export const getVarCastSyntax = (variable: string, type: 'number' | 'boolean'): string => {
  const map = { number: NUMBER_CAST_INDICATOR, boolean: BOOLEAN_CAST_INDICATOR }
  return `"${map[type]}[${variable}]"`
}
export const replaceAllCastedVar = (content: string, variable: string, value: string): string => {
  CASTING_OPERATORS.forEach(op => { content = replaceAll(content, getVarCastSyntax(variable, op), value) })
  return content
}
