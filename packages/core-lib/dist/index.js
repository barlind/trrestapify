import { getRouteFiles } from './utils';
import { getRoute } from './getRoute';
export const loadRoutes = (rootDir) => {
    const files = getRouteFiles(rootDir);
    const byMethod = {
        GET: {}, POST: {}, PUT: {}, PATCH: {}, DELETE: {}
    };
    const all = [];
    Object.keys(files).forEach(fp => {
        try {
            const r = getRoute(fp, rootDir, files[fp]);
            all.push(r);
            // key by original route slug
            if (!byMethod[r.method][r.route])
                byMethod[r.method][r.route] = r;
        }
        catch (e) {
            // ignore broken json for now
        }
    });
    return { byMethod, all };
};
function routeToRegex(normalizedRoute) {
    // Convert :var segments to a capturing group
    const pattern = '^' + normalizedRoute.replace(/:[^/]+/g, '([^/]+)') + '$';
    return new RegExp(pattern);
}
export function createCoreLib(rootDir) {
    const loaded = loadRoutes(rootDir);
    // Precompute normalized regex per route
    const methodRegexIndex = {
        GET: [], POST: [], PUT: [], PATCH: [], DELETE: []
    };
    loaded.all.forEach(r => {
        methodRegexIndex[r.method].push({ route: r, regex: routeToRegex(r.normalizedRoute) });
    });
    function getMatchedRoute(method, requestPath) {
        const entries = methodRegexIndex[method];
        for (const entry of entries) {
            if (entry.regex.test(requestPath))
                return entry.route;
        }
        return undefined;
    }
    return {
        listRoutes() { return loaded.all; },
        getRouteByPath(method, route) { return loaded.byMethod[method][route]; },
        getMatchedRoute
    };
}
export * from './types';
export * from './getRoute';
export * from './utils';
export * from './git/BranchWorktreeManager';
//# sourceMappingURL=index.js.map