import * as fs from 'fs';
import * as path from 'path';
import { BOOLEAN_CAST_INDICATOR, CASTING_OPERATORS, HTTP_VERBS, NUMBER_CAST_INDICATOR } from './const';
export const getDirs = (p) => fs.readdirSync(p).filter(f => fs.statSync(path.join(p, f)).isDirectory());
export const getFiles = (p) => fs.readdirSync(p).filter(f => fs.statSync(path.join(p, f)).isFile());
export const replaceAll = (str, find, replace) => str.split(find).join(replace);
export const getVarsInPath = (pathParam) => {
    const vars = [];
    if (pathParam.endsWith('.json'))
        pathParam = pathParam.slice(0, -'.json'.length);
    pathParam.split('/').forEach(part => { if (part.startsWith('[') && part.endsWith(']'))
        vars.push(part.slice(1, -1)); });
    return vars;
};
export const isHttpVerb = (str) => HTTP_VERBS.includes(str);
export const isStateVariable = (str) => str.startsWith('{') && str.endsWith('}');
export const isNumeric = (str) => !Number.isNaN(str) && !Number.isNaN(parseFloat(str));
export const routeResolve = (...routes) => {
    let final = '';
    routes.forEach((r, i) => {
        const prevSlash = !!routes[i - 1]?.endsWith('/');
        const curFirst = r.startsWith('/');
        if (prevSlash && curFirst)
            final += r.slice(1);
        else if (!prevSlash && !curFirst)
            final += '/' + r;
        else
            final += r;
    });
    return final;
};
export const getRoutesByFileOrder = (routes) => {
    const ordered = [];
    let links = [];
    HTTP_VERBS.forEach(m => { links = [...links, ...Object.keys(routes[m] || {})]; });
    links = [...new Set(links)].sort();
    links.forEach(link => { HTTP_VERBS.forEach(m => { if (routes[m]?.[link])
        ordered.push({ method: m, route: link }); }); });
    return ordered;
};
export const getRouteFiles = (rootDir, files = {}) => {
    getFiles(rootDir).forEach(fn => { if (fn.endsWith('.json')) {
        const fp = path.resolve(rootDir, fn);
        files[fp] = fs.readFileSync(fp, 'utf8');
    } });
    getDirs(rootDir).forEach(d => getRouteFiles(path.resolve(rootDir, d), files));
    return files;
};
export const getVarCastSyntax = (variable, type) => {
    const map = { number: NUMBER_CAST_INDICATOR, boolean: BOOLEAN_CAST_INDICATOR };
    return `"${map[type]}[${variable}]"`;
};
export const replaceAllCastedVar = (content, variable, value) => {
    CASTING_OPERATORS.forEach(op => { content = replaceAll(content, getVarCastSyntax(variable, op), value); });
    return content;
};
//# sourceMappingURL=utils.js.map