import * as path from 'path';
import { CURRENT_LOCATION_ROUTE_SELECTOR, HEADER_SYNTAX, BODY_SYNTAX, EMPTY_BODY_SYNTAX } from './const';
import { getVarsInPath, isHttpVerb, isNumeric, replaceAll, replaceAllCastedVar } from './utils';
import { getContentWithReplacedForLoopsSyntax } from './forLoopHelpers';
const getFilenameFromFilePath = (filePath) => { filePath = filePath.replace(/\\/g, '/'); const [filename] = filePath.split('/').slice(-1); return filename; };
const getRouteFromFilePath = (filePath) => { filePath = filePath.replace(/\\/g, '/'); const filename = getFilenameFromFilePath(filePath); const routeWithoutFilename = filePath.replace(filename, ''); const first = filename.split('.')[0]; if (first === CURRENT_LOCATION_ROUTE_SELECTOR)
    return routeWithoutFilename.slice(0, -1); return routeWithoutFilename + first; };
const getNormalizedRoute = (route, vars = []) => { vars.forEach(v => { route = replaceAll(route, `[${v}]`, `:${v}`); }); return route; };
const isStructureExtended = (jsonContent) => jsonContent[HEADER_SYNTAX] !== undefined || jsonContent[BODY_SYNTAX] !== undefined;
const isBodyEmpty = (body) => { const empty = JSON.stringify(EMPTY_BODY_SYNTAX); if (JSON.stringify(body) === empty)
    return true; if (body[BODY_SYNTAX]) {
    return JSON.stringify(body[BODY_SYNTAX]) === empty || body[BODY_SYNTAX] === empty;
} return false; };
const getResponseStatusCodeInFilename = (filename) => { const parts = filename.split('.'); let potential = parts.slice(1, -1); while (potential.length) {
    const test = potential[0];
    if (isHttpVerb(test))
        potential = potential.slice(1);
    else {
        if (isNumeric(test))
            return Number(test);
        potential = potential.slice(1);
    }
} return 200; };
const getHttpMethodInFilename = (filename) => { const parts = filename.split('.'); let potential = parts.slice(1, -1); let verb = 'GET'; potential.forEach(p => { if (isHttpVerb(p))
    verb = p; }); return verb; };
export const getRoute = (filePath, entryFolderPath, fileContent) => { const relativeFilePath = filePath.replace(entryFolderPath, ''); const filename = getFilenameFromFilePath(relativeFilePath); const route = getRouteFromFilePath(relativeFilePath); const routeVars = getVarsInPath(route); const normalizedRoute = getNormalizedRoute(route, routeVars); const jsonContent = JSON.parse(fileContent); const statusCode = getResponseStatusCodeInFilename(filename); const method = getHttpMethodInFilename(filename); const directoryPath = path.dirname(filePath); const isExtended = isStructureExtended(jsonContent); const header = jsonContent[HEADER_SYNTAX]; const body = isBodyEmpty(jsonContent) ? undefined : (isExtended ? jsonContent[BODY_SYNTAX] : jsonContent); const getBody = (vars, queryStringVars) => { if (body) {
    let bodyStr = JSON.stringify(body);
    if (vars) {
        Object.keys(vars).forEach(variable => { bodyStr = replaceAllCastedVar(bodyStr, variable, vars[variable]); bodyStr = replaceAll(bodyStr, `[${variable}]`, vars[variable]); });
    }
    bodyStr = getContentWithReplacedForLoopsSyntax(bodyStr);
    return JSON.parse(bodyStr);
} return undefined; }; return { directoryPath, route, routeVars, normalizedRoute, isExtended, filename, fileContent, statusCode, method, body, header, getBody }; };
//# sourceMappingURL=getRoute.js.map