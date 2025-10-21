// Archived legacy utils.ts (full copy 2025-10-20)
import * as fs from 'fs'
import * as path from 'path'
import { BOOLEAN_CAST_INDICATOR, CASTING_OPERATORS, HTTP_VERBS, NUMBER_CAST_INDICATOR } from './const'
import { HttpVerb } from './types'
import { Routes } from './Restapify'
export const getDirs = (p: string): string[] => fs.readdirSync(p).filter(f => fs.statSync(path.join(p, f)).isDirectory())
export const getFiles = (p: string): string[] => fs.readdirSync(p).filter(f => fs.statSync(path.join(p, f)).isFile())
export const replaceAll = (str: string, find: string, replace: string): string => str.split(find).join(replace)
export const getVarsInPath = (pathParam: string): string[] => { const vars: string[] = []; if (pathParam.endsWith('.json')) { pathParam = pathParam.slice(0, -'.json'.length) } const explodedPath = pathParam.split('/'); explodedPath.forEach(pathElement => { const isVar = pathElement.startsWith('[') && pathElement.endsWith(']'); if (isVar) { vars.push(pathElement.slice(1, -1)) } }); return vars }
export const isHttpVerb = (str: string): boolean => { return (HTTP_VERBS as string[]).includes(str) }
export const isStateVariable = (str: string): boolean => str.startsWith('{') && str.endsWith('}')
export const isNumeric = (str:string):boolean=> { return !Number.isNaN(str) && !Number.isNaN(parseFloat(str)) }
export const routeResolve = (...routes: string[]): string => { let finalRoute = ''; routes.forEach((route, routeId) => { const hasPreviousRouteFinalSlash = !!routes[routeId - 1]?.endsWith('/'); const hasRouteFirstSlash = route.startsWith('/'); if (hasPreviousRouteFinalSlash && hasRouteFirstSlash) finalRoute += route.slice(1); else if (!hasPreviousRouteFinalSlash && !hasRouteFirstSlash) finalRoute += '/' + route; else finalRoute += route }); return finalRoute }
export const withoutUndefinedFromObject = (obj: Object): Object => { Object.keys(obj).forEach(key => (obj as any)[key] === undefined && delete (obj as any)[key]); return obj }
interface OrderedRoutes { route: string, method: HttpVerb }
export const getRoutesByFileOrder = (routes: Routes): OrderedRoutes[] => { const orderedRoutes: OrderedRoutes[] = []; let routesLink: string[] = []; HTTP_VERBS.forEach(method => { routesLink = [...routesLink, ...Object.keys(routes[method])] }); routesLink = [...new Set(routesLink)].sort(); routesLink.forEach(routeLink => { HTTP_VERBS.forEach(method => { if (routes[method][routeLink]) orderedRoutes.push({ method, route: routeLink }) }) }); return orderedRoutes }
export const getRouteFiles = ( rootDir: string, files: {[filename: string]: string} = {}): {[filename: string]: string} => { const dirNames = getDirs(rootDir); const fileNames = getFiles(rootDir); fileNames.forEach(filename => { const isJson = filename.endsWith('.json'); if (isJson) { const filePath = path.resolve(rootDir, filename); files[filePath] = fs.readFileSync(filePath, 'utf8') } }); dirNames.forEach(dir => getRouteFiles(path.resolve(rootDir, dir), files)); return files }
export const isJsonString = (str: string): true | string => { try { JSON.parse(str) } catch (e:any) { return e.message } return true }
export const getVarCastSyntax = (variable: string, type: 'number' | 'boolean'):string => { const typeCastIndicator = { number: NUMBER_CAST_INDICATOR, boolean: BOOLEAN_CAST_INDICATOR }; return `"${typeCastIndicator[type]}[${variable}]"` }
export const replaceAllCastedVar = (content: string, variable: string, value: string): string => { CASTING_OPERATORS.forEach((operator) => { content = replaceAll(content, getVarCastSyntax(variable, operator), value) }); return content }
export const getSortedRoutesSlug = (routesSlug: string[]): string[] => { routesSlug.sort((a, b) => { const splittedA = a.split('/'); const splittedB = b.split('/'); const lastASlugPart = splittedA[splittedA.length - 1]; const lastBSlugPart = splittedB[splittedB.length - 1]; const aPrefix = a.slice(0, a.length - lastASlugPart.length); const bPrefix = b.slice(0, b.length - lastBSlugPart.length); const areSlugsOnSameDeepness = splittedA.length === splittedB.length && aPrefix === bPrefix; if (areSlugsOnSameDeepness) { const isAFinalSlugVar = lastASlugPart.endsWith(']'); const isBFinalSlugVar = lastBSlugPart.endsWith(']'); const isBMoreDeep = splittedA.length < splittedB.length; if ((!isAFinalSlugVar && isBFinalSlugVar) || isBMoreDeep) { return -1 } } return 0 }); return routesSlug }
