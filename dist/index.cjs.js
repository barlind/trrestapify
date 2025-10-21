'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var fs = require('fs');
var path = require('path');
var express = require('express');
var cors = require('cors');
var http = require('http');
var chokidar = require('chokidar');
var nocache = require('nocache');
var range = require('lodash.range');
var chalk = require('chalk');
var commander = require('commander');
var boxen = require('boxen');
var jsonschema = require('jsonschema');

function _interopNamespaceDefault(e) {
  var n = Object.create(null);
  if (e) {
    Object.keys(e).forEach(function (k) {
      if (k !== 'default') {
        var d = Object.getOwnPropertyDescriptor(e, k);
        Object.defineProperty(n, k, d.get ? d : {
          enumerable: true,
          get: function () { return e[k]; }
        });
      }
    });
  }
  n.default = e;
  return Object.freeze(n);
}

var fs__namespace = /*#__PURE__*/_interopNamespaceDefault(fs);
var path__namespace = /*#__PURE__*/_interopNamespaceDefault(path);
var http__namespace = /*#__PURE__*/_interopNamespaceDefault(http);
var chokidar__namespace = /*#__PURE__*/_interopNamespaceDefault(chokidar);

function _arrayWithHoles(r) {
  if (Array.isArray(r)) return r;
}

function _iterableToArrayLimit(r, l) {
  var t = null == r ? null : "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"];
  if (null != t) {
    var e,
      n,
      i,
      u,
      a = [],
      f = true,
      o = false;
    try {
      if (i = (t = t.call(r)).next, 0 === l) {
        if (Object(t) !== t) return;
        f = !1;
      } else for (; !(f = (e = i.call(t)).done) && (a.push(e.value), a.length !== l); f = !0);
    } catch (r) {
      o = true, n = r;
    } finally {
      try {
        if (!f && null != t["return"] && (u = t["return"](), Object(u) !== u)) return;
      } finally {
        if (o) throw n;
      }
    }
    return a;
  }
}

function _arrayLikeToArray(r, a) {
  (null == a || a > r.length) && (a = r.length);
  for (var e = 0, n = Array(a); e < a; e++) n[e] = r[e];
  return n;
}

function _unsupportedIterableToArray(r, a) {
  if (r) {
    if ("string" == typeof r) return _arrayLikeToArray(r, a);
    var t = {}.toString.call(r).slice(8, -1);
    return "Object" === t && r.constructor && (t = r.constructor.name), "Map" === t || "Set" === t ? Array.from(r) : "Arguments" === t || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t) ? _arrayLikeToArray(r, a) : void 0;
  }
}

function _nonIterableRest() {
  throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
}

function _slicedToArray(r, e) {
  return _arrayWithHoles(r) || _iterableToArrayLimit(r, e) || _unsupportedIterableToArray(r, e) || _nonIterableRest();
}

function asyncGeneratorStep(n, t, e, r, o, a, c) {
  try {
    var i = n[a](c),
      u = i.value;
  } catch (n) {
    return void e(n);
  }
  i.done ? t(u) : Promise.resolve(u).then(r, o);
}
function _asyncToGenerator(n) {
  return function () {
    var t = this,
      e = arguments;
    return new Promise(function (r, o) {
      var a = n.apply(t, e);
      function _next(n) {
        asyncGeneratorStep(a, r, o, _next, _throw, "next", n);
      }
      function _throw(n) {
        asyncGeneratorStep(a, r, o, _next, _throw, "throw", n);
      }
      _next(void 0);
    });
  };
}

function _typeof$1(o) {
  "@babel/helpers - typeof";

  return _typeof$1 = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) {
    return typeof o;
  } : function (o) {
    return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o;
  }, _typeof$1(o);
}

function toPrimitive(t, r) {
  if ("object" != _typeof$1(t) || !t) return t;
  var e = t[Symbol.toPrimitive];
  if (void 0 !== e) {
    var i = e.call(t, r);
    if ("object" != _typeof$1(i)) return i;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return ("string" === r ? String : Number)(t);
}

function toPropertyKey(t) {
  var i = toPrimitive(t, "string");
  return "symbol" == _typeof$1(i) ? i : i + "";
}

function _createClass(e, r, t) {
  return Object.defineProperty(e, "prototype", {
    writable: false
  }), e;
}

function _classCallCheck(a, n) {
  if (!(a instanceof n)) throw new TypeError("Cannot call a class as a function");
}

function _defineProperty(e, r, t) {
  return (r = toPropertyKey(r)) in e ? Object.defineProperty(e, r, {
    value: t,
    enumerable: true,
    configurable: true,
    writable: true
  }) : e[r] = t, e;
}

function getDefaultExportFromCjs (x) {
	return x && x.__esModule && Object.prototype.hasOwnProperty.call(x, 'default') ? x['default'] : x;
}

var regeneratorRuntime$1 = {exports: {}};

var _typeof = {exports: {}};

var hasRequired_typeof;

function require_typeof () {
	if (hasRequired_typeof) return _typeof.exports;
	hasRequired_typeof = 1;
	(function (module) {
		function _typeof(o) {
		  "@babel/helpers - typeof";

		  return module.exports = _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) {
		    return typeof o;
		  } : function (o) {
		    return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o;
		  }, module.exports.__esModule = true, module.exports["default"] = module.exports, _typeof(o);
		}
		module.exports = _typeof, module.exports.__esModule = true, module.exports["default"] = module.exports; 
	} (_typeof));
	return _typeof.exports;
}

var hasRequiredRegeneratorRuntime;

function requireRegeneratorRuntime () {
	if (hasRequiredRegeneratorRuntime) return regeneratorRuntime$1.exports;
	hasRequiredRegeneratorRuntime = 1;
	(function (module) {
		var _typeof = require_typeof()["default"];
		function _regeneratorRuntime() {
		  module.exports = _regeneratorRuntime = function _regeneratorRuntime() {
		    return e;
		  }, module.exports.__esModule = true, module.exports["default"] = module.exports;
		  var t,
		    e = {},
		    r = Object.prototype,
		    n = r.hasOwnProperty,
		    o = Object.defineProperty || function (t, e, r) {
		      t[e] = r.value;
		    },
		    i = "function" == typeof Symbol ? Symbol : {},
		    a = i.iterator || "@@iterator",
		    c = i.asyncIterator || "@@asyncIterator",
		    u = i.toStringTag || "@@toStringTag";
		  function define(t, e, r) {
		    return Object.defineProperty(t, e, {
		      value: r,
		      enumerable: true,
		      configurable: true,
		      writable: true
		    }), t[e];
		  }
		  try {
		    define({}, "");
		  } catch (t) {
		    define = function define(t, e, r) {
		      return t[e] = r;
		    };
		  }
		  function wrap(t, e, r, n) {
		    var i = e && e.prototype instanceof Generator ? e : Generator,
		      a = Object.create(i.prototype),
		      c = new Context(n || []);
		    return o(a, "_invoke", {
		      value: makeInvokeMethod(t, r, c)
		    }), a;
		  }
		  function tryCatch(t, e, r) {
		    try {
		      return {
		        type: "normal",
		        arg: t.call(e, r)
		      };
		    } catch (t) {
		      return {
		        type: "throw",
		        arg: t
		      };
		    }
		  }
		  e.wrap = wrap;
		  var h = "suspendedStart",
		    l = "suspendedYield",
		    f = "executing",
		    s = "completed",
		    y = {};
		  function Generator() {}
		  function GeneratorFunction() {}
		  function GeneratorFunctionPrototype() {}
		  var p = {};
		  define(p, a, function () {
		    return this;
		  });
		  var d = Object.getPrototypeOf,
		    v = d && d(d(values([])));
		  v && v !== r && n.call(v, a) && (p = v);
		  var g = GeneratorFunctionPrototype.prototype = Generator.prototype = Object.create(p);
		  function defineIteratorMethods(t) {
		    ["next", "throw", "return"].forEach(function (e) {
		      define(t, e, function (t) {
		        return this._invoke(e, t);
		      });
		    });
		  }
		  function AsyncIterator(t, e) {
		    function invoke(r, o, i, a) {
		      var c = tryCatch(t[r], t, o);
		      if ("throw" !== c.type) {
		        var u = c.arg,
		          h = u.value;
		        return h && "object" == _typeof(h) && n.call(h, "__await") ? e.resolve(h.__await).then(function (t) {
		          invoke("next", t, i, a);
		        }, function (t) {
		          invoke("throw", t, i, a);
		        }) : e.resolve(h).then(function (t) {
		          u.value = t, i(u);
		        }, function (t) {
		          return invoke("throw", t, i, a);
		        });
		      }
		      a(c.arg);
		    }
		    var r;
		    o(this, "_invoke", {
		      value: function value(t, n) {
		        function callInvokeWithMethodAndArg() {
		          return new e(function (e, r) {
		            invoke(t, n, e, r);
		          });
		        }
		        return r = r ? r.then(callInvokeWithMethodAndArg, callInvokeWithMethodAndArg) : callInvokeWithMethodAndArg();
		      }
		    });
		  }
		  function makeInvokeMethod(e, r, n) {
		    var o = h;
		    return function (i, a) {
		      if (o === f) throw Error("Generator is already running");
		      if (o === s) {
		        if ("throw" === i) throw a;
		        return {
		          value: t,
		          done: true
		        };
		      }
		      for (n.method = i, n.arg = a;;) {
		        var c = n.delegate;
		        if (c) {
		          var u = maybeInvokeDelegate(c, n);
		          if (u) {
		            if (u === y) continue;
		            return u;
		          }
		        }
		        if ("next" === n.method) n.sent = n._sent = n.arg;else if ("throw" === n.method) {
		          if (o === h) throw o = s, n.arg;
		          n.dispatchException(n.arg);
		        } else "return" === n.method && n.abrupt("return", n.arg);
		        o = f;
		        var p = tryCatch(e, r, n);
		        if ("normal" === p.type) {
		          if (o = n.done ? s : l, p.arg === y) continue;
		          return {
		            value: p.arg,
		            done: n.done
		          };
		        }
		        "throw" === p.type && (o = s, n.method = "throw", n.arg = p.arg);
		      }
		    };
		  }
		  function maybeInvokeDelegate(e, r) {
		    var n = r.method,
		      o = e.iterator[n];
		    if (o === t) return r.delegate = null, "throw" === n && e.iterator["return"] && (r.method = "return", r.arg = t, maybeInvokeDelegate(e, r), "throw" === r.method) || "return" !== n && (r.method = "throw", r.arg = new TypeError("The iterator does not provide a '" + n + "' method")), y;
		    var i = tryCatch(o, e.iterator, r.arg);
		    if ("throw" === i.type) return r.method = "throw", r.arg = i.arg, r.delegate = null, y;
		    var a = i.arg;
		    return a ? a.done ? (r[e.resultName] = a.value, r.next = e.nextLoc, "return" !== r.method && (r.method = "next", r.arg = t), r.delegate = null, y) : a : (r.method = "throw", r.arg = new TypeError("iterator result is not an object"), r.delegate = null, y);
		  }
		  function pushTryEntry(t) {
		    var e = {
		      tryLoc: t[0]
		    };
		    1 in t && (e.catchLoc = t[1]), 2 in t && (e.finallyLoc = t[2], e.afterLoc = t[3]), this.tryEntries.push(e);
		  }
		  function resetTryEntry(t) {
		    var e = t.completion || {};
		    e.type = "normal", delete e.arg, t.completion = e;
		  }
		  function Context(t) {
		    this.tryEntries = [{
		      tryLoc: "root"
		    }], t.forEach(pushTryEntry, this), this.reset(true);
		  }
		  function values(e) {
		    if (e || "" === e) {
		      var r = e[a];
		      if (r) return r.call(e);
		      if ("function" == typeof e.next) return e;
		      if (!isNaN(e.length)) {
		        var o = -1,
		          i = function next() {
		            for (; ++o < e.length;) if (n.call(e, o)) return next.value = e[o], next.done = false, next;
		            return next.value = t, next.done = true, next;
		          };
		        return i.next = i;
		      }
		    }
		    throw new TypeError(_typeof(e) + " is not iterable");
		  }
		  return GeneratorFunction.prototype = GeneratorFunctionPrototype, o(g, "constructor", {
		    value: GeneratorFunctionPrototype,
		    configurable: true
		  }), o(GeneratorFunctionPrototype, "constructor", {
		    value: GeneratorFunction,
		    configurable: true
		  }), GeneratorFunction.displayName = define(GeneratorFunctionPrototype, u, "GeneratorFunction"), e.isGeneratorFunction = function (t) {
		    var e = "function" == typeof t && t.constructor;
		    return !!e && (e === GeneratorFunction || "GeneratorFunction" === (e.displayName || e.name));
		  }, e.mark = function (t) {
		    return Object.setPrototypeOf ? Object.setPrototypeOf(t, GeneratorFunctionPrototype) : (t.__proto__ = GeneratorFunctionPrototype, define(t, u, "GeneratorFunction")), t.prototype = Object.create(g), t;
		  }, e.awrap = function (t) {
		    return {
		      __await: t
		    };
		  }, defineIteratorMethods(AsyncIterator.prototype), define(AsyncIterator.prototype, c, function () {
		    return this;
		  }), e.AsyncIterator = AsyncIterator, e.async = function (t, r, n, o, i) {
		    void 0 === i && (i = Promise);
		    var a = new AsyncIterator(wrap(t, r, n, o), i);
		    return e.isGeneratorFunction(r) ? a : a.next().then(function (t) {
		      return t.done ? t.value : a.next();
		    });
		  }, defineIteratorMethods(g), define(g, u, "Generator"), define(g, a, function () {
		    return this;
		  }), define(g, "toString", function () {
		    return "[object Generator]";
		  }), e.keys = function (t) {
		    var e = Object(t),
		      r = [];
		    for (var n in e) r.push(n);
		    return r.reverse(), function next() {
		      for (; r.length;) {
		        var t = r.pop();
		        if (t in e) return next.value = t, next.done = false, next;
		      }
		      return next.done = true, next;
		    };
		  }, e.values = values, Context.prototype = {
		    constructor: Context,
		    reset: function reset(e) {
		      if (this.prev = 0, this.next = 0, this.sent = this._sent = t, this.done = false, this.delegate = null, this.method = "next", this.arg = t, this.tryEntries.forEach(resetTryEntry), !e) for (var r in this) "t" === r.charAt(0) && n.call(this, r) && !isNaN(+r.slice(1)) && (this[r] = t);
		    },
		    stop: function stop() {
		      this.done = true;
		      var t = this.tryEntries[0].completion;
		      if ("throw" === t.type) throw t.arg;
		      return this.rval;
		    },
		    dispatchException: function dispatchException(e) {
		      if (this.done) throw e;
		      var r = this;
		      function handle(n, o) {
		        return a.type = "throw", a.arg = e, r.next = n, o && (r.method = "next", r.arg = t), !!o;
		      }
		      for (var o = this.tryEntries.length - 1; o >= 0; --o) {
		        var i = this.tryEntries[o],
		          a = i.completion;
		        if ("root" === i.tryLoc) return handle("end");
		        if (i.tryLoc <= this.prev) {
		          var c = n.call(i, "catchLoc"),
		            u = n.call(i, "finallyLoc");
		          if (c && u) {
		            if (this.prev < i.catchLoc) return handle(i.catchLoc, true);
		            if (this.prev < i.finallyLoc) return handle(i.finallyLoc);
		          } else if (c) {
		            if (this.prev < i.catchLoc) return handle(i.catchLoc, true);
		          } else {
		            if (!u) throw Error("try statement without catch or finally");
		            if (this.prev < i.finallyLoc) return handle(i.finallyLoc);
		          }
		        }
		      }
		    },
		    abrupt: function abrupt(t, e) {
		      for (var r = this.tryEntries.length - 1; r >= 0; --r) {
		        var o = this.tryEntries[r];
		        if (o.tryLoc <= this.prev && n.call(o, "finallyLoc") && this.prev < o.finallyLoc) {
		          var i = o;
		          break;
		        }
		      }
		      i && ("break" === t || "continue" === t) && i.tryLoc <= e && e <= i.finallyLoc && (i = null);
		      var a = i ? i.completion : {};
		      return a.type = t, a.arg = e, i ? (this.method = "next", this.next = i.finallyLoc, y) : this.complete(a);
		    },
		    complete: function complete(t, e) {
		      if ("throw" === t.type) throw t.arg;
		      return "break" === t.type || "continue" === t.type ? this.next = t.arg : "return" === t.type ? (this.rval = this.arg = t.arg, this.method = "return", this.next = "end") : "normal" === t.type && e && (this.next = e), y;
		    },
		    finish: function finish(t) {
		      for (var e = this.tryEntries.length - 1; e >= 0; --e) {
		        var r = this.tryEntries[e];
		        if (r.finallyLoc === t) return this.complete(r.completion, r.afterLoc), resetTryEntry(r), y;
		      }
		    },
		    "catch": function _catch(t) {
		      for (var e = this.tryEntries.length - 1; e >= 0; --e) {
		        var r = this.tryEntries[e];
		        if (r.tryLoc === t) {
		          var n = r.completion;
		          if ("throw" === n.type) {
		            var o = n.arg;
		            resetTryEntry(r);
		          }
		          return o;
		        }
		      }
		      throw Error("illegal catch attempt");
		    },
		    delegateYield: function delegateYield(e, r, n) {
		      return this.delegate = {
		        iterator: values(e),
		        resultName: r,
		        nextLoc: n
		      }, "next" === this.method && (this.arg = t), y;
		    }
		  }, e;
		}
		module.exports = _regeneratorRuntime, module.exports.__esModule = true, module.exports["default"] = module.exports; 
	} (regeneratorRuntime$1));
	return regeneratorRuntime$1.exports;
}

var regenerator;
var hasRequiredRegenerator;

function requireRegenerator () {
	if (hasRequiredRegenerator) return regenerator;
	hasRequiredRegenerator = 1;
	// TODO(Babel 8): Remove this file.

	var runtime = requireRegeneratorRuntime()();
	regenerator = runtime;

	// Copied from https://github.com/facebook/regenerator/blob/main/packages/runtime/runtime.js#L736=
	try {
	  regeneratorRuntime = runtime;
	} catch (accidentalStrictMode) {
	  if (typeof globalThis === "object") {
	    globalThis.regeneratorRuntime = runtime;
	  } else {
	    Function("r", "regeneratorRuntime = r")(runtime);
	  }
	}
	return regenerator;
}

var regeneratorExports = requireRegenerator();
var _regeneratorRuntime = /*@__PURE__*/getDefaultExportFromCjs(regeneratorExports);

var CURRENT_LOCATION_ROUTE_SELECTOR = '_';
var HTTP_VERBS = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'];
var INTERNAL_BASEURL = '/restapify';
var INTERNAL_API_BASEURL = "".concat(INTERNAL_BASEURL, "/api");
var CASTING_OPERATORS = ['number', 'boolean'];
var NUMBER_CAST_INDICATOR = 'n:';
var BOOLEAN_CAST_INDICATOR = 'b:';
var EMPTY_BODY_SYNTAX = [null];
var HEADER_SYNTAX = '#header';
var BODY_SYNTAX = '#body';
var QUERY_STRING_VAR_MATCHER = /\[q:(.*?)\]/g;
var QS_VAR_DEFAULT_SEPARATOR = '|';

// eslint-disable-next-line max-len
var FOR_LOOP_SYNTAX_MATCHER = /"#for ((?:(?!"#for .*? in .*?",|"#endfor").)*?) in ((?:(?!"#for .*? in .*?",|"#endfor").)*?)",((?:(?!#for .*? in .*?",|"#endfor").)*?),"#endfor"/g;
var FOR_LOOP_SYNTAX_PREFIX = '#for';
var FOR_LOOP_SYNTAX_SUFFIX = '#endfor';

function _arrayWithoutHoles(r) {
  if (Array.isArray(r)) return _arrayLikeToArray(r);
}

function _iterableToArray(r) {
  if ("undefined" != typeof Symbol && null != r[Symbol.iterator] || null != r["@@iterator"]) return Array.from(r);
}

function _nonIterableSpread() {
  throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
}

function _toConsumableArray(r) {
  return _arrayWithoutHoles(r) || _iterableToArray(r) || _unsupportedIterableToArray(r) || _nonIterableSpread();
}

var getDirs = function getDirs(p) {
  return fs__namespace.readdirSync(p).filter(function (f) {
    return fs__namespace.statSync(path__namespace.join(p, f)).isDirectory();
  });
};
var getFiles = function getFiles(p) {
  return fs__namespace.readdirSync(p).filter(function (f) {
    return fs__namespace.statSync(path__namespace.join(p, f)).isFile();
  });
};
var replaceAll = function replaceAll(str, find, replace) {
  return str.split(find).join(replace);
};
var getVarsInPath = function getVarsInPath(pathParam) {
  var vars = [];
  if (pathParam.endsWith('.json')) {
    pathParam = pathParam.slice(0, -'.json'.length);
  }
  var explodedPath = pathParam.split('/');
  explodedPath.forEach(function (pathElement) {
    var isVar = pathElement.startsWith('[') && pathElement.endsWith(']');
    if (isVar) {
      vars.push(pathElement.slice(1, -1));
    }
  });
  return vars;
};
var isHttpVerb = function isHttpVerb(str) {
  // @ts-ignore
  return HTTP_VERBS.includes(str);
};
var isStateVariable = function isStateVariable(str) {
  return str.startsWith('{') && str.endsWith('}');
};
var isNumeric = function isNumeric(str) {
  return !Number.isNaN(str) // use type coercion to parse the _entirety_ of the string (`parseFloat` alone does not do this)...
  && !Number.isNaN(parseFloat(str)); // ...and ensure strings of whitespace fail
};
var routeResolve = function routeResolve() {
  for (var _len = arguments.length, routes = new Array(_len), _key = 0; _key < _len; _key++) {
    routes[_key] = arguments[_key];
  }
  var finalRoute = '';
  routes.forEach(function (route, routeId) {
    var _routes;
    var hasPreviousRouteFinalSlash = !!((_routes = routes[routeId - 1]) !== null && _routes !== void 0 && _routes.endsWith('/'));
    var hasRouteFirstSlash = route.startsWith('/');
    if (hasPreviousRouteFinalSlash && hasRouteFirstSlash) {
      finalRoute += route.slice(1);
    } else if (!hasPreviousRouteFinalSlash && !hasRouteFirstSlash) {
      finalRoute += '/' + route;
    } else {
      finalRoute += route;
    }
  });
  return finalRoute;
};
var withoutUndefinedFromObject = function withoutUndefinedFromObject(obj) {
  // @ts-ignore
  Object.keys(obj).forEach(function (key) {
    return obj[key] === undefined && delete obj[key];
  });
  return obj;
};
var getRoutesByFileOrder = function getRoutesByFileOrder(routes) {
  var orderedRoutes = [];
  var routesLink = [];
  HTTP_VERBS.forEach(function (method) {
    routesLink = [].concat(_toConsumableArray(routesLink), _toConsumableArray(Object.keys(routes[method])));
  });

  // remove duplicates and sort
  routesLink = _toConsumableArray(new Set(routesLink)).sort();
  routesLink.forEach(function (routeLink) {
    HTTP_VERBS.forEach(function (method) {
      if (routes[method][routeLink]) {
        orderedRoutes.push({
          method: method,
          route: routeLink
        });
      }
    });
  });
  return orderedRoutes;
};
var _getRouteFiles = function getRouteFiles(rootDir) {
  var files = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
  var dirNames = getDirs(rootDir);
  var fileNames = getFiles(rootDir);
  fileNames.forEach(function (filename) {
    var isJson = filename.endsWith('.json');
    if (isJson) {
      var filePath = path__namespace.resolve(rootDir, filename);
      files[filePath] = fs__namespace.readFileSync(filePath, 'utf8');
    }
  });
  dirNames.forEach(function (dir) {
    return _getRouteFiles(path__namespace.resolve(rootDir, dir), files);
  });
  return files;
};
var isJsonString = function isJsonString(str) {
  try {
    JSON.parse(str);
  } catch (e) {
    return e.message;
  }
  return true;
};
var getVarCastSyntax = function getVarCastSyntax(variable, type) {
  var typeCastIndicator = {
    number: NUMBER_CAST_INDICATOR,
    "boolean": BOOLEAN_CAST_INDICATOR
  };
  return "\"".concat(typeCastIndicator[type], "[").concat(variable, "]\"");
};
var replaceAllCastedVar = function replaceAllCastedVar(content, variable, value) {
  CASTING_OPERATORS.forEach(function (operator) {
    content = replaceAll(content, getVarCastSyntax(variable, operator), value);
  });
  return content;
};
var getSortedRoutesSlug = function getSortedRoutesSlug(routesSlug) {
  // By alphabetical order, a specific route comes before a route that contains a variable:
  // ex: ['/animals/hedgehog', '/animals/[name]']
  // But we want the route with the variable at the end
  routesSlug.sort(function (a, b) {
    var splittedA = a.split('/');
    var splittedB = b.split('/');
    var lastASlugPart = splittedA[splittedA.length - 1];
    var lastBSlugPart = splittedB[splittedB.length - 1];
    var aPrefix = a.slice(0, a.length - lastASlugPart.length);
    var bPrefix = b.slice(0, b.length - lastBSlugPart.length);
    var areSlugsOnSameDeepness = splittedA.length === splittedB.length && aPrefix === bPrefix;
    if (areSlugsOnSameDeepness) {
      var isAFinalSlugVar = lastASlugPart.endsWith(']');
      var isBFinalSlugVar = lastBSlugPart.endsWith(']');
      var isBMoreDeep = splittedA.length < splittedB.length;
      if (!isAFinalSlugVar && isBFinalSlugVar || isBMoreDeep) {
        return -1;
      }
    }
    return 0;
  });
  return routesSlug;
};

var ELMT_BETWEEN_PARENTHESES_MATCHER = /\(([^)]+)\)/g;

// I N T E R F A C E S
/*
Object containing for loop syntax component like:
for x in sequence:
     statements
*/

var isStatementObjectValid = function isStatementObjectValid(obj) {
  return Object.keys(obj).every(function (key) {
    return typeof obj[key] === 'string' || typeof obj[key] === 'number' || typeof obj[key] === 'boolean';
  });
};
var getForLoopSyntax = function getForLoopSyntax(forLoopObject) {
  var x = forLoopObject.x,
    sequence = forLoopObject.sequence,
    statement = forLoopObject.statement;
  return "\"".concat(FOR_LOOP_SYNTAX_PREFIX, " ").concat(x, " in ").concat(sequence, "\",").concat(statement, ",\"").concat(FOR_LOOP_SYNTAX_SUFFIX, "\"");
};
var getForLoopSyntaxInContent = function getForLoopSyntaxInContent(content) {
  var matches = _toConsumableArray(content.matchAll(FOR_LOOP_SYNTAX_MATCHER));
  if (matches.length <= 0) {
    return undefined;
  }
  return matches.map(function (m) {
    return {
      x: m[1],
      sequence: m[2],
      statement: m[3]
    };
  });
};
var getStringifiedRangeFunctionParams = function getStringifiedRangeFunctionParams(stringifiedRange) {
  var paramsMatch = stringifiedRange.match(ELMT_BETWEEN_PARENTHESES_MATCHER);
  if (paramsMatch === null) return null;
  var paramsMatchString = paramsMatch[0];
  var splitedParams = paramsMatchString.substring(1, paramsMatchString.length - 1).split(',');
  return {
    start: Number(splitedParams[0]),
    end: splitedParams[1] ? Number(splitedParams[1]) : undefined,
    step: splitedParams[2] ? Number(splitedParams[2]) : undefined
  };
};
var getArrayFromRangeString = function getArrayFromRangeString(stringifiedRange) {
  var rangeParams = getStringifiedRangeFunctionParams(stringifiedRange);
  if (rangeParams) {
    var start = rangeParams.start,
      end = rangeParams.end,
      step = rangeParams.step;
    return range(start, end, step);
  }
  return [];
};

// eslint-disable-next-line max-len
var getSequenceArrayAsArray = function getSequenceArrayAsArray(sequence) {
  sequence = replaceAll(sequence, '\'', '"');
  return JSON.parse(sequence);
};
var getSequenceArray = function getSequenceArray(sequence) {
  var isSequenceAnArray = sequence.startsWith('[') && sequence.endsWith(']');
  var isSequenceRange = sequence.startsWith('range(') && sequence.endsWith(')');
  if (isSequenceAnArray) {
    return getSequenceArrayAsArray(sequence);
  }
  if (isSequenceRange) {
    return getArrayFromRangeString(sequence);
  }
  return [];
};
var getForLoopSyntaxResult = function getForLoopSyntaxResult(forLoopSyntax) {
  var sequenceArray = getSequenceArray(forLoopSyntax.sequence);
  var resultArray = [];
  sequenceArray.forEach(function (i) {
    var forLoopResult = forLoopSyntax.statement;
    if (_typeof$1(i) === 'object') {
      var isStatementValid = isStatementObjectValid(i);
      if (!isStatementValid) {
        var error = 'INV:SYNTAX';
        var errorObject = {
          error: error,
          message: "The object syntax ".concat(JSON.stringify(i), " is not valid! Please refer to the documentation https://restapify.vercel.app/docs#for-loops-array-sequence")
        };
        throw new Error(JSON.stringify(errorObject));
      } else {
        Object.keys(i).forEach(function (key) {
          forLoopResult = replaceAllCastedVar(forLoopResult, "".concat(forLoopSyntax.x, ".").concat(key), i[key].toString());
          forLoopResult = replaceAll(forLoopResult, "[".concat(forLoopSyntax.x, ".").concat(key, "]"), i[key].toString());
        });
      }
    } else {
      forLoopResult = replaceAllCastedVar(forLoopResult, forLoopSyntax.x, i.toString());
      forLoopResult = replaceAll(forLoopResult, "[".concat(forLoopSyntax.x, "]"), i.toString());
    }
    resultArray.push(forLoopResult);
  });
  return resultArray.join(',');
};
var _getContentWithReplacedForLoopsSyntax = function getContentWithReplacedForLoopsSyntax(content) {
  var forLoops = getForLoopSyntaxInContent(content);
  if (!forLoops) {
    return content;
  }
  forLoops.forEach(function (forLoop) {
    var forLoopSyntax = getForLoopSyntax(forLoop);
    content = content.replace(forLoopSyntax, getForLoopSyntaxResult(forLoop));
  });
  return _getContentWithReplacedForLoopsSyntax(content);
};

// I N T E R F A C E S

var getQueryStringVarSyntax = function getQueryStringVarSyntax(data) {
  var variable = data.variable,
    defaultValue = data.defaultValue;
  if (defaultValue) return "[q:".concat(variable, "|").concat(defaultValue, "]");
  return "[q:".concat(variable, "]");
};
var getFilenameFromFilePath = function getFilenameFromFilePath(filePath) {
  filePath = filePath.replace(/\\/g, '/');
  var _filePath$split$slice = filePath.split('/').slice(-1),
    _filePath$split$slice2 = _slicedToArray(_filePath$split$slice, 1),
    filename = _filePath$split$slice2[0];
  return filename;
};
var getRouteFromFilePath = function getRouteFromFilePath(filePath) {
  filePath = filePath.replace(/\\/g, '/');
  var filename = getFilenameFromFilePath(filePath);
  var routeWithoutFilename = filePath.replace(filename, '');
  var firstParamInFilename = filename.split('.')[0];
  if (firstParamInFilename === CURRENT_LOCATION_ROUTE_SELECTOR) {
    // remove last char which is a `/`
    return routeWithoutFilename.slice(0, -1);
  }
  return routeWithoutFilename + firstParamInFilename;
};
var getNormalizedRoute = function getNormalizedRoute(route) {
  var vars = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : [];
  vars.forEach(function (variable) {
    route = replaceAll(route, "[".concat(variable, "]"), ":".concat(variable));
  });
  return route;
};
var getResponseStatusCodeInFilename = function getResponseStatusCodeInFilename(filename) {
  var filenameElmts = filename.split('.');
  var potentialStatusCodeElement = filenameElmts.slice(1, -1); // remove local indicator and file extension

  while (potentialStatusCodeElement.length > 0) {
    var elmtToTest = potentialStatusCodeElement[0];
    if (isHttpVerb(elmtToTest) || isStateVariable(elmtToTest)) {
      potentialStatusCodeElement = potentialStatusCodeElement.slice(1);
    } else {
      if (isNumeric(elmtToTest)) {
        return Number(elmtToTest);
      }
      potentialStatusCodeElement = potentialStatusCodeElement.slice(1);
    }
  }
  return 200;
};
var getStateVariableInFilename = function getStateVariableInFilename(filename) {
  var stateVariable;
  var explodedFilename = filename.split('.');
  explodedFilename.forEach(function (filenameElement) {
    var isStateVar = filenameElement.startsWith('{') && filenameElement.endsWith('}');
    if (isStateVar) {
      stateVariable = filenameElement.slice(1, -1);
    }
  });
  return stateVariable;
};
var getHttpMethodInFilename = function getHttpMethodInFilename(filename) {
  var filenameElmts = filename.split('.');
  var potentialHttpVerbElement = filenameElmts.slice(1, -1); // remove local indicator and file extension
  var httpVerb = 'GET';
  potentialHttpVerbElement.forEach(function (elmt) {
    if (isHttpVerb(elmt)) {
      httpVerb = elmt;
    }
  });
  return httpVerb;
};
var getQueryStringVarData = function getQueryStringVarData(queryStringSyntax) {
  var _queryStringSyntax$sp = queryStringSyntax.split(QS_VAR_DEFAULT_SEPARATOR),
    _queryStringSyntax$sp2 = _slicedToArray(_queryStringSyntax$sp, 2),
    variable = _queryStringSyntax$sp2[0],
    defaultValue = _queryStringSyntax$sp2[1];
  return {
    variable: variable,
    defaultValue: defaultValue
  };
};
var getQueryStringVarsInContent = function getQueryStringVarsInContent(content) {
  // In string `[q:startIndex|0], [q:size]` it will find `['startIndex|0', 'size']`
  var matchingVars = Array.from(content.matchAll(QUERY_STRING_VAR_MATCHER), function (m) {
    return m[1];
  });
  return matchingVars.map(function (variable) {
    return getQueryStringVarData(variable);
  });
};
var getContentWithReplacedVars = function getContentWithReplacedVars(content, vars, queryStringVars) {
  var getEscapedVar = function getEscapedVar(variable) {
    return "`[".concat(variable, "]`");
  };
  var getVarsToEscape = function getVarsToEscape() {
    return Object.keys(vars).filter(function (variable) {
      return content.includes(getEscapedVar(variable));
    });
  };
  var varsToEscape = getVarsToEscape();
  var getContentWithSanitizedEscapedVars = function getContentWithSanitizedEscapedVars(contentToSanitize) {
    varsToEscape.forEach(function (escapedVar) {
      contentToSanitize = replaceAll(contentToSanitize, getEscapedVar(escapedVar), getEscapedVar("__".concat(escapedVar, "__")));
    });
    return contentToSanitize;
  };
  var getContentWithUnsanitizedEscapedVars = function getContentWithUnsanitizedEscapedVars(contentToUnsanitize) {
    varsToEscape.forEach(function (escapedVar) {
      contentToUnsanitize = replaceAll(contentToUnsanitize, getEscapedVar("__".concat(escapedVar, "__")), "[".concat(escapedVar, "]"));
    });
    return contentToUnsanitize;
  };

  // sanitize variables to escape
  content = getContentWithSanitizedEscapedVars(content);
  Object.keys(vars).forEach(function (variable) {
    // replace casted variables
    content = replaceAllCastedVar(content, variable, vars[variable]);
    // replace simple variables
    content = replaceAll(content, "[".concat(variable, "]"), vars[variable]);
  });
  if (queryStringVars) {
    var queryStringVarsInContent = getQueryStringVarsInContent(content);
    queryStringVarsInContent.forEach(function (_ref) {
      var variable = _ref.variable,
        defaultValue = _ref.defaultValue;
      var replaceValue = queryStringVars[variable] || defaultValue;

      // if there is no query string in request and no default value for it
      // don't replace anything
      if (replaceValue) {
        content = replaceAll(content, getQueryStringVarSyntax({
          variable: variable,
          defaultValue: defaultValue
        }), replaceValue);
      }
    });
  }

  // unsanitize variables to escape
  content = getContentWithUnsanitizedEscapedVars(content);
  return content;
};
var isStructureExtended = function isStructureExtended(jsonContent) {
  return jsonContent[HEADER_SYNTAX] !== undefined || jsonContent[BODY_SYNTAX] !== undefined;
};
var isBodyEmpty = function isBodyEmpty(body) {
  var stringifiedEmptyBodySyntax = JSON.stringify(EMPTY_BODY_SYNTAX);
  if (JSON.stringify(body) === stringifiedEmptyBodySyntax) return true;
  if (body[BODY_SYNTAX]) {
    return JSON.stringify(body[BODY_SYNTAX]) === stringifiedEmptyBodySyntax || body[BODY_SYNTAX] === stringifiedEmptyBodySyntax;
  }
  return false;
};
var getRoute$1 = function getRoute(filePath, entryFolderPath, fileContent) {
  // relative to the entry folder
  var relativeFilePath = filePath.replace(entryFolderPath, '');
  var filename = getFilenameFromFilePath(relativeFilePath);
  var route = getRouteFromFilePath(relativeFilePath);
  var routeVars = getVarsInPath(route);
  var normalizedRoute = getNormalizedRoute(route, routeVars);
  var jsonContent = JSON.parse(fileContent);
  var stateVariable = getStateVariableInFilename(filename);
  var statusCode = getResponseStatusCodeInFilename(filename);
  var method = getHttpMethodInFilename(filename);
  var directoryPath = path__namespace.dirname(filePath);
  var isExtended = isStructureExtended(jsonContent);
  var header = jsonContent[HEADER_SYNTAX];
  var getBodyValue = function getBodyValue() {
    if (isBodyEmpty(jsonContent)) return undefined;
    return isExtended ? jsonContent[BODY_SYNTAX] : jsonContent;
  };
  var body = getBodyValue();
  var getBody = function getBody(varsToReplace, queryStringVarsToReplace) {
    if (body) {
      var bodyAsString = JSON.stringify(body);
      if (varsToReplace) {
        bodyAsString = getContentWithReplacedVars(bodyAsString, varsToReplace, queryStringVarsToReplace);
      }
      bodyAsString = _getContentWithReplacedForLoopsSyntax(bodyAsString);
      return JSON.parse(bodyAsString);
    }
    return undefined;
  };
  return {
    directoryPath: directoryPath,
    route: route,
    routeVars: routeVars,
    normalizedRoute: normalizedRoute,
    isExtended: isExtended,
    filename: filename,
    fileContent: fileContent,
    stateVariable: stateVariable,
    statusCode: statusCode,
    method: method,
    body: body,
    header: header,
    getBody: getBody
  };
};

// I N T E R F A C E S

var getRoute = function getRoute(route) {
  return INTERNAL_API_BASEURL + route;
};
var getInitialisedInternalApi = function getInitialisedInternalApi(app, params) {
  var port = params.port,
    baseUrl = params.baseUrl,
    states = params.states,
    routes = params.routes,
    setState = params.setState;
  var getSortedRoutes = function getSortedRoutes() {
    var finalRoutes = {};
    var sortedRoutes = getRoutesByFileOrder(routes);
    sortedRoutes.forEach(function (sortedRoute) {
      var route = sortedRoute.route,
        method = sortedRoute.method;
      if (finalRoutes[route] === undefined) {
        finalRoutes[route] = {};
      }
      finalRoutes[route][method] = routes[method][route];
    });
    return finalRoutes;
  };
  var sortedRoutes = getSortedRoutes();
  app.get(getRoute('/api'), function (req, res) {
    res.json({
      port: port,
      baseUrl: baseUrl,
      routes: sortedRoutes
    });
  });
  app.get(getRoute('/states'), function (req, res) {
    res.json(states);
  });
  app.put(getRoute('/states'), function (req, res) {
    var _req$body = req.body,
      route = _req$body.route,
      state = _req$body.state,
      _req$body$method = _req$body.method,
      method = _req$body$method === void 0 ? 'GET' : _req$body$method;
    var isMethodValid = HTTP_VERBS.includes(method);
    if (!route || !isMethodValid) {
      res.status(401).end();
    }
    setState({
      route: route,
      state: state,
      method: method
    });
    res.status(204).end();
  });
  return app;
};

function ownKeys$1(e, r) { var t = Object.keys(e); if (Object.getOwnPropertySymbols) { var o = Object.getOwnPropertySymbols(e); r && (o = o.filter(function (r) { return Object.getOwnPropertyDescriptor(e, r).enumerable; })), t.push.apply(t, o); } return t; }
function _objectSpread$1(e) { for (var r = 1; r < arguments.length; r++) { var t = null != arguments[r] ? arguments[r] : {}; r % 2 ? ownKeys$1(Object(t), true).forEach(function (r) { _defineProperty(e, r, t[r]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys$1(Object(t)).forEach(function (r) { Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r)); }); } return e; }
var DEFAULT_PORT = 4001;
var Restapify = /*#__PURE__*/_createClass(function Restapify(_ref) {
  var _this = this;
  var rootDir = _ref.rootDir,
    _ref$port = _ref.port,
    _port = _ref$port === void 0 ? DEFAULT_PORT : _ref$port,
    _ref$baseUrl = _ref.baseUrl,
    _baseUrl = _ref$baseUrl === void 0 ? '/' : _ref$baseUrl,
    _ref$states = _ref.states,
    _states = _ref$states === void 0 ? [] : _ref$states,
    _ref$hotWatch = _ref.hotWatch,
    _hotWatch = _ref$hotWatch === void 0 ? true : _ref$hotWatch,
    _ref$proxyBaseUrl = _ref.proxyBaseUrl,
    proxyBaseUrl = _ref$proxyBaseUrl === void 0 ? '' : _ref$proxyBaseUrl,
    _ref$useLocal = _ref.useLocal,
    useLocal = _ref$useLocal === void 0 ? false : _ref$useLocal;
  _classCallCheck(this, Restapify);
  _defineProperty(this, "eventCallbacksStore", {});
  _defineProperty(this, "app", void 0);
  _defineProperty(this, "server", void 0);
  _defineProperty(this, "chokidarWatcher", void 0);
  _defineProperty(this, "listedRouteFiles", {});
  _defineProperty(this, "routes", {
    GET: {},
    POST: {},
    DELETE: {},
    PUT: {},
    PATCH: {}
  });
  _defineProperty(this, "rootDir", void 0);
  _defineProperty(this, "port", void 0);
  _defineProperty(this, "publicPath", void 0);
  _defineProperty(this, "states", []);
  _defineProperty(this, "hotWatch", void 0);
  _defineProperty(this, "proxyBaseUrl", void 0);
  _defineProperty(this, "useLocal", void 0);
  _defineProperty(this, "listRouteFiles", function () {
    _this.listedRouteFiles = _getRouteFiles(_this.rootDir);
  });
  _defineProperty(this, "configHotWatch", function () {
    if (_this.hotWatch) {
      _this.chokidarWatcher = chokidar__namespace.watch(_this.rootDir, {
        ignoreInitial: true
      });
      var events = ['change', 'unlink'];
      events.forEach(function (event) {
        _this.chokidarWatcher.on(event, function () {
          _this.restartServer({
            hard: true
          });
        });
      });
    }
  });
  _defineProperty(this, "configServer", function () {
    _this.app = express();
    _this.server = http__namespace.createServer(_this.app);

    // Add middleware to parse request's body
    _this.app.use(express.json());
    _this.app.use(nocache());
    _this.app.set('etag', false);

    // Handle CORS
    _this.app.use(cors());
    _this.app.use(function (req, res, next) {
      res.set('Cache-Control', 'no-store');
      next();
    });
    _this.handleHttpServerErrors();
    _this.configRoutesFromListedFiles();
    _this.serveRoutes();
    _this.app.use(function (req, res, next) {
      _asyncToGenerator(/*#__PURE__*/_regeneratorRuntime.mark(function _callee() {
        var proxyUrl, forwardedHeaders, proxyResponse, proxyText, proxyData;
        return _regeneratorRuntime.wrap(function _callee$(_context) {
          while (1) switch (_context.prev = _context.next) {
            case 0:
              if (!(req.originalUrl === "/" || req.originalUrl === "/favicon.ico")) {
                _context.next = 2;
                break;
              }
              return _context.abrupt("return", next());
            case 2:
              _context.prev = 2;
              if (_this.useLocal) {
                process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
                _this.proxyBaseUrl = 'https://localhost:44319';
                console.log("Using local proxy base URL: ".concat(_this.proxyBaseUrl));

                // we rewrite to fit local api paths
                if (req.originalUrl.startsWith('/content')) {
                  req.originalUrl = req.originalUrl.replace('/content', '');
                }
                if (req.originalUrl.startsWith('/settings/content')) {
                  req.originalUrl = req.originalUrl.replace('/settings/content', '/api/settings/public');
                }
              }
              if (!(_this.proxyBaseUrl != '')) {
                _context.next = 26;
                break;
              }
              console.log("No matching local route for ".concat(req.method, " ").concat(chalk.blue(req.originalUrl), ", forwarding..."));
              proxyUrl = "".concat(_this.proxyBaseUrl).concat(req.originalUrl);
              forwardedHeaders = Object.entries(req.headers).reduce(function (acc, _ref3) {
                var _ref4 = _slicedToArray(_ref3, 2),
                  key = _ref4[0],
                  value = _ref4[1];
                if (typeof value === "string") {
                  acc[key] = value;
                } else if (Array.isArray(value)) {
                  acc[key] = value.join(", ");
                }
                return acc;
              }, {});
              _context.next = 10;
              return fetch(proxyUrl, {
                method: req.method,
                // we add accept header to the forwarded headers to ensure we get json back
                headers: _objectSpread$1(_objectSpread$1({}, forwardedHeaders), {}, {
                  "Accept": "application/json"
                }),
                body: ["GET", "HEAD"].includes(req.method) ? undefined : req.body
              });
            case 10:
              proxyResponse = _context.sent;
              res.appendHeader("response-was-proxied", "true");
              _context.next = 14;
              return proxyResponse.text();
            case 14:
              proxyText = _context.sent;
              _context.prev = 15;
              proxyData = JSON.parse(proxyText);
              //if the url points to /api/settings/public, we need to wrap the data in an object
              if (req.originalUrl.startsWith('/api/settings/public')) {
                proxyData = {
                  epiSettings: proxyData
                };
              }
              _context.next = 24;
              break;
            case 20:
              _context.prev = 20;
              _context.t0 = _context["catch"](15);
              console.error("Failed to parse JSON from proxy ".concat(_this.proxyBaseUrl, " for ").concat(req.originalUrl, ":"), _context.t0);
              return _context.abrupt("return", res.status(500).send("Invalid JSON received from proxy ".concat(_this.proxyBaseUrl, " request to ").concat(req.originalUrl, ". Response was: '").concat(proxyText, "'")));
            case 24:
              res.status(proxyResponse.status).json(proxyData);
              console.log("Served ".concat(chalk.italic("forwarded content"), " for ").concat(chalk.blue(req.originalUrl), " with status ").concat(proxyResponse.status, " from ").concat(_this.proxyBaseUrl, "."));
            case 26:
              _context.next = 32;
              break;
            case 28:
              _context.prev = 28;
              _context.t1 = _context["catch"](2);
              console.error("Proxy request failed:", _context.t1);
              res.status(500).send("Failed to get result from proxy request to ".concat(req.originalUrl, ". Error was ").concat(_context.t1));
            case 32:
            case "end":
              return _context.stop();
          }
        }, _callee, null, [[2, 28], [15, 20]]);
      }))()["catch"](next);
    });
  });
  _defineProperty(this, "configInternalApi", function () {
    var routes = _this.routes,
      states = _this.states,
      port = _this.port,
      baseUrl = _this.publicPath;
    _this.app = getInitialisedInternalApi(_this.app, {
      port: port,
      baseUrl: baseUrl,
      routes: routes,
      states: states,
      setState: _this.setState
    });
  });
  _defineProperty(this, "handleHttpServerErrors", function () {
    _this.server.on('error', function (e) {
      if (e.code === 'EADDRINUSE') {
        var error = 'MISS:PORT';
        _this.executeCallbacksForSingleEvent('error', {
          error: error
        });
      } else {
        console.log("Unknown error ".concat(e.code));
      }
    });
  });
  _defineProperty(this, "restartServer", function (options) {
    _this.executeCallbacks('server:restart');
    _this.closeServer();
    _this.customRun(_objectSpread$1(_objectSpread$1({}, options), {}, {
      hard: false
    }));
  });
  _defineProperty(this, "checkpublicPath", function () {
    if (_this.publicPath.startsWith(INTERNAL_BASEURL)) {
      var error = 'INV:API_BASEURL';
      var errorObject = {
        error: error
      };
      throw new Error(JSON.stringify(errorObject));
    }
  });
  _defineProperty(this, "checkRootDirectory", function () {
    var folderExists = fs__namespace.existsSync(_this.rootDir);
    if (!folderExists) {
      var error = 'MISS:ROOT_DIR';
      var errorObject = {
        error: error
      };
      throw new Error(JSON.stringify(errorObject));
    }
  });
  _defineProperty(this, "checkJsonFiles", function () {
    Object.keys(_this.listedRouteFiles).forEach(function (routeFilePath) {
      var routeFileContent = _this.listedRouteFiles[routeFilePath];
      var isJsonValidResponse = isJsonString(routeFileContent);
      // eslint-disable-next-line max-len
      if (isJsonValidResponse !== true) {
        var error = 'INV:JSON_FILE';
        var errorObject = {
          error: error,
          message: "Invalid json file ".concat(routeFilePath, ": ").concat(isJsonValidResponse)
        };
        throw new Error(JSON.stringify(errorObject));
      }
    });
  });
  _defineProperty(this, "configRoutesFromListedFiles", function () {
    Object.keys(_this.listedRouteFiles).forEach(function (routeFilePath) {
      var routeData = getRoute$1(routeFilePath, _this.rootDir, _this.listedRouteFiles[routeFilePath]);
      var route = routeData.route,
        method = routeData.method,
        stateVariable = routeData.stateVariable,
        body = routeData.body,
        getBody = routeData.getBody,
        header = routeData.header,
        isExtended = routeData.isExtended,
        statusCode = routeData.statusCode,
        fileContent = routeData.fileContent;
      routeData.directoryPath = path__namespace.dirname(routeFilePath);
      var routeExist = _this.routes[method][route] !== undefined;
      if (!routeExist) {
        _this.routes[method][route] = {};
      }
      if (stateVariable) {
        if (_this.routes[method][route] === undefined) {
          _this.routes[method][route] = {};
        }
        if (_this.routes[method][route].states === undefined) {
          _this.routes[method][route].states = {};
        }

        // @ts-ignore
        _this.routes[method][route].states[stateVariable] = withoutUndefinedFromObject({
          body: body,
          fileContent: fileContent,
          header: header,
          isExtended: isExtended,
          statusCode: statusCode,
          getBody: getBody
        });
      } else {
        _this.routes[method][route] = _objectSpread$1(_objectSpread$1({}, _this.routes[method][route]), routeData);
      }
    });
  });
  _defineProperty(this, "getRouteData", function (method, route) {
    if (!_this.routes[method][route]) {
      return null;
    }
    var routeData = _this.routes[method][route];
    var matchingState = _this.states.find(function (state) {
      return state.route === route && (state.method === method || state.method === undefined && method === 'GET');
    });
    if (matchingState && routeData.states) {
      var state = matchingState.state;
      return _objectSpread$1(_objectSpread$1({}, routeData), routeData.states[state]);
    }
    return routeData;
  });
  _defineProperty(this, "serveRoutes", function () {
    Object.keys(_this.routes).forEach(function (method) {
      var routesSlug = Object.keys(_this.routes[method]);
      var sortedRoutesSlug = getSortedRoutesSlug(routesSlug);
      sortedRoutesSlug.forEach(function (route) {
        var routeData = _this.getRouteData(method, route);
        if (routeData) {
          _this.serveRoute(routeData);
        }
      });
    });
  });
  _defineProperty(this, "getUserId", function (authzValue) {
    try {
      authzValue = authzValue.replace("Bearer ", "");
      var base64Url = authzValue.split('.')[1];
      var base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      var jsonPayload = decodeURIComponent(atob(base64).split('').map(function (c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
      }).join(''));
      return JSON.parse(jsonPayload).sub;
    } catch (error) {
      return "";
    }
  });
  _defineProperty(this, "serveRoute", function (routeData) {
    var normalizedRoute = routeData.normalizedRoute,
      routeVars = routeData.routeVars,
      statusCode = routeData.statusCode,
      header = routeData.header;
    normalizedRoute = routeResolve(_this.publicPath, normalizedRoute);
    var responseCallback = /*#__PURE__*/function () {
      var _ref5 = _asyncToGenerator(/*#__PURE__*/_regeneratorRuntime.mark(function _callee2(req, res) {
        var _req$headers$authoriz;
        var userId, customJsonFilename, customFilePath, customFileContent, vars, queryStringVarsToReplace, responseBody;
        return _regeneratorRuntime.wrap(function _callee2$(_context2) {
          while (1) switch (_context2.prev = _context2.next) {
            case 0:
              res.status(statusCode);
              res.header('Content-Type', 'application/json; charset=utf-8');
              if (header) {
                res.header(header);
              }

              // 1. Check for custom header
              userId = _this.getUserId((_req$headers$authoriz = req.headers['authorization']) !== null && _req$headers$authoriz !== void 0 ? _req$headers$authoriz : ''); // or whatever header key
              if (!(userId && routeData.directoryPath)) {
                _context2.next = 11;
                break;
              }
              // 2. See if a file like "user-id-guid.json" exists
              customJsonFilename = "".concat(userId, ".json");
              customFilePath = path__namespace.join(routeData.directoryPath, customJsonFilename);
              if (!fs__namespace.existsSync(customFilePath)) {
                _context2.next = 11;
                break;
              }
              // 3. Serve that file’s content
              customFileContent = JSON.parse(fs__namespace.readFileSync(customFilePath, 'utf8'));
              res.send(JSON.stringify(customFileContent));
              return _context2.abrupt("return");
            case 11:
              vars = {};
              routeVars.forEach(function (variable) {
                vars[variable] = req.params[variable];
              });
              queryStringVarsToReplace = Object.fromEntries(Object.entries(req.query).map(function (_ref6) {
                var _ref7 = _slicedToArray(_ref6, 2),
                  key = _ref7[0],
                  value = _ref7[1];
                return [key, String(value)];
              }));
              responseBody = routeData.getBody(vars, queryStringVarsToReplace);
              if (responseBody) {
                res.send(JSON.stringify(responseBody));
              } else {
                res.end();
              }
              console.log("Served content for ".concat(chalk.blue(normalizedRoute), " ").concat(userId ? 'for user ' + userId : ''));
            case 17:
            case "end":
              return _context2.stop();
          }
        }, _callee2);
      }));
      return function responseCallback(_x, _x2) {
        return _ref5.apply(this, arguments);
      };
    }();
    _this.listenRoute(routeData.method, normalizedRoute, responseCallback);
  });
  _defineProperty(this, "listenRoute", function (method, route, callback) {
    switch (method) {
      case 'POST':
        _this.app.post(route, callback);
        break;
      case 'DELETE':
        _this.app["delete"](route, callback);
        break;
      case 'PUT':
        _this.app.put(route, callback);
        break;
      case 'PATCH':
        _this.app.patch(route, callback);
        break;
      case 'GET':
      default:
        _this.app.get(route, callback);
        break;
    }
  });
  _defineProperty(this, "startServer", function () {
    _this.server.listen(_this.port);
  });
  _defineProperty(this, "customRun", function () {
    var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
    var _options$hard = options.hard,
      hard = _options$hard === void 0 ? true : _options$hard,
      _options$startServer = options.startServer,
      startServer = _options$startServer === void 0 ? true : _options$startServer,
      _options$hotWatch = options.hotWatch,
      hotWatch = _options$hotWatch === void 0 ? true : _options$hotWatch;
    try {
      if (hard) {
        _this.configEventsCallbacks();
        _this.checkpublicPath();
        _this.checkRootDirectory();
      }
      _this.listRouteFiles();
      _this.checkJsonFiles();
      _this.configRoutesFromListedFiles();
      if (startServer) {
        _this.configServer();
        _this.configInternalApi();
      }
      if (hard && hotWatch) _this.configHotWatch();
      if (hard && startServer) _this.executeCallbacks('server:start');
      if (startServer) _this.startServer();
      if (hard) _this.executeCallbacks('start');
    } catch (error) {
      if (isJsonString(error.message)) {
        var _JSON$parse = JSON.parse(error.message),
          errorId = _JSON$parse.error,
          message = _JSON$parse.message;
        _this.executeCallbacks('error', {
          error: errorId,
          message: message
        });
      } else {
        _this.executeCallbacks('error', {
          error: 'ERR',
          message: error.message
        });
      }
    }
  });
  _defineProperty(this, "configEventsCallbacks", function () {
    _this.onError(function (_ref8) {
      var error = _ref8.error;
      if (error === 'MISS:PORT') {
        _this.port += 1;
        _this.restartServer({
          hard: true
        });
      }
    });
  });
  _defineProperty(this, "removeState", function (route, method) {
    _this.states = _this.states.filter(function (state) {
      return state.route !== route && state.method !== method;
    });
  });
  _defineProperty(this, "createSingleEventStoreIfMissing", function (eventName) {
    if (_this.eventCallbacksStore[eventName] === undefined) {
      _this.eventCallbacksStore[eventName] = [];
    }
  });
  _defineProperty(this, "addSingleEventCallbackToStore", function (event, callback) {
    _this.createSingleEventStoreIfMissing(event);

    // @ts-ignore
    _this.eventCallbacksStore[event].push(callback);
  });
  _defineProperty(this, "addEventCallbackToStore", function (event, callback) {
    if (Array.isArray(event)) {
      event.forEach(function (eventName) {
        _this.addSingleEventCallbackToStore(eventName, callback);
      });
    } else {
      _this.addSingleEventCallbackToStore(event, callback);
    }
  });
  _defineProperty(this, "executeCallbacksForSingleEvent", function (event, params) {
    var callbacks = _this.eventCallbacksStore[event];
    if (callbacks) {
      callbacks.forEach(function (callback) {
        if (params) {
          callback(params);
        } else {
          callback();
        }
      });
    }
  });
  _defineProperty(this, "executeCallbacks", function (event, params) {
    if (Array.isArray(event)) {
      event.forEach(function (eventName) {
        _this.executeCallbacksForSingleEvent(eventName, params);
      });
    } else {
      _this.executeCallbacksForSingleEvent(event, params);
    }
  });
  _defineProperty(this, "closeServer", function () {
    _this.server.close();
  });
  _defineProperty(this, "closeChokidarWatcher", function () {
    _this.chokidarWatcher.close();
  });
  _defineProperty(this, "setState", function (newState) {
    if (newState.state) {
      var actualStateIndex = _this.states.findIndex(function (state) {
        return state.route === newState.route && state.method === newState.method;
      });
      var stateExist = actualStateIndex !== -1;
      if (stateExist) {
        _this.states[actualStateIndex] = newState;
      } else {
        _this.states.push(newState);
      }
    } else {
      _this.removeState(newState.route, newState.method);
    }
    _this.restartServer();
  });
  _defineProperty(this, "getServedRoutes", function () {
    _this.customRun({
      startServer: false,
      hotWatch: false,
      hard: false
    });
    return getRoutesByFileOrder(_this.routes);
  });
  _defineProperty(this, "close", function () {
    if (_this.server) _this.closeServer();
    if (_this.hotWatch && _this.chokidarWatcher) _this.closeChokidarWatcher();
  });
  _defineProperty(this, "on", function (event, callback) {
    _this.addEventCallbackToStore(event, callback);
  });
  _defineProperty(this, "onError", function (callback) {
    _this.addSingleEventCallbackToStore('error', callback);
  });
  _defineProperty(this, "run", function () {
    _this.customRun();
  });
  this.rootDir = rootDir;
  this.port = _port;
  this.publicPath = _baseUrl;
  this.hotWatch = _hotWatch;
  this.proxyBaseUrl = proxyBaseUrl;
  this.useLocal = useLocal;
  this.states = _states.filter(function (state) {
    return state.state !== undefined;
  });
});

// I N T E R F A C E S

const version = "2.3.4";

var getMethodOutput = function getMethodOutput(method) {
  var methodOutput;
  switch (method) {
    case 'DELETE':
      methodOutput = chalk.red;
      break;
    case 'POST':
      methodOutput = chalk.yellow;
      break;
    case 'PUT':
      methodOutput = chalk.blue;
      break;
    case 'PATCH':
      methodOutput = chalk.gray;
      break;
    default:
    case 'GET':
      methodOutput = chalk.green;
      break;
  }
  var methodName = method;
  var methodNameLength = method.length;
  for (var index = 0; index < 6 - methodNameLength; index += 1) {
    methodName += ' ';
  }
  methodOutput = methodOutput.bold("".concat(methodName));
  return methodOutput;
};
var consoleError = function consoleError(message) {
  var errorPrepend = chalk.red.bold.underline('❌ERROR:');
  console.log("".concat(errorPrepend, " ").concat(message));
};
var getInstanceOverviewOutput = function getInstanceOverviewOutput(port, publicPath, proxyBaseUrl) {
  if (!publicPath.startsWith('/')) {
    publicPath = "/".concat(publicPath);
  }
  var runningTitle = chalk.magenta('🚀 Restapify is running:');
  var publicPathTitle = chalk.bold('- 📦API entry point:');
  var publicPathLink = chalk.blueBright("http://localhost:".concat(port).concat(publicPath));
  var publicPathOutput = "".concat(publicPathTitle, " ").concat(publicPathLink);
  var proxyBaseUrlOutput = proxyBaseUrl != '' ? "\n- Fallback proxy: ".concat(chalk.blueBright(proxyBaseUrl)) : '';
  var killProcessInfo = chalk.yellowBright('Use Ctrl+C to quit this process');
  return boxen("".concat(runningTitle, "\n\n").concat(publicPathOutput).concat(proxyBaseUrlOutput, "\n\n").concat(killProcessInfo), {
    padding: 1,
    borderColor: 'magenta'
  });
};
var onRestapifyInstanceError = function onRestapifyInstanceError(errorObject, instanceData) {
  var error = errorObject.error,
    message = errorObject.message;
  var rootDir = instanceData.rootDir,
    port = instanceData.port,
    publicPath = instanceData.publicPath;
  if (error.startsWith('MISS:ROOT_DIR')) {
    consoleError("The given folder ".concat(rootDir, " doesn't exist!"));
  } else if (error.startsWith('MISS:PORT')) {
    consoleError("port ".concat(port, " is already in use!"));
  } else if (error.startsWith('INV:API_BASEURL')) {
    consoleError("Impossible to use ".concat(publicPath, " as the API base URL since it's already needed for internal purposes!"));
  } else if (error.startsWith('INV:JSON_FILE')) {
    consoleError(message);
  }
};
var getRoutesListOutput = function getRoutesListOutput(routesList, publicPath) {
  var output = '';
  routesList.forEach(function (servedRoute) {
    var methodOutput = getMethodOutput(servedRoute.method);
    output += "\n".concat(methodOutput, " ").concat(servedRoute.route);
  });
  return output;
};
var runServer = function runServer(config) {
  var rpfy = new Restapify(config);
  rpfy.on('server:start', function () {
    console.log("\n\uD83C\uDFD7 Try to serve on port ".concat(rpfy.port));
  });
  rpfy.onError(function (error) {
    onRestapifyInstanceError(error, {
      rootDir: rpfy.rootDir,
      publicPath: rpfy.publicPath,
      port: rpfy.port
    });
  });
  rpfy.on('start', function () {
    var servedRoutesOutput = getRoutesListOutput(rpfy.getServedRoutes(), rpfy.publicPath);
    console.log(servedRoutesOutput);
    console.log('\n');
    console.log(getInstanceOverviewOutput(rpfy.port, rpfy.publicPath, rpfy.proxyBaseUrl));
  });
  rpfy.on('server:restart', function () {
    console.log(chalk.green('✅ API updated!'));
  });
  rpfy.run();
};
var validateConfig = function validateConfig(config) {
  var jsonValidor = new jsonschema.Validator();
  var CONFIG_FILE_SCHEMA = {
    type: 'object',
    rootDir: {
      type: 'string'
    },
    publicPath: {
      type: 'string'
    },
    port: {
      type: 'number'
    },
    states: {
      properties: {
        route: 'string',
        method: 'string',
        state: 'string'
      },
      required: ['route', 'method', 'state']
    },
    required: ['rootDir']
  };
  return jsonValidor.validate(config, CONFIG_FILE_SCHEMA);
};

var listRoutes = function listRoutes(rootDir) {
  var rpfy = new Restapify({
    rootDir: rootDir,
    hotWatch: false
  });
  rpfy.onError(function (error) {
    onRestapifyInstanceError(error, {
      rootDir: rpfy.rootDir,
      publicPath: rpfy.publicPath,
      port: rpfy.port
    });
  });
  var servedRoutesOutput = getRoutesListOutput(rpfy.getServedRoutes(), rpfy.publicPath);
  console.log(servedRoutesOutput);
};

var startServer = function startServer(options) {
  runServer(options);
};

function _objectWithoutPropertiesLoose(r, e) {
  if (null == r) return {};
  var t = {};
  for (var n in r) if ({}.hasOwnProperty.call(r, n)) {
    if (-1 !== e.indexOf(n)) continue;
    t[n] = r[n];
  }
  return t;
}

function _objectWithoutProperties(e, t) {
  if (null == e) return {};
  var o,
    r,
    i = _objectWithoutPropertiesLoose(e, t);
  if (Object.getOwnPropertySymbols) {
    var n = Object.getOwnPropertySymbols(e);
    for (r = 0; r < n.length; r++) o = n[r], -1 === t.indexOf(o) && {}.propertyIsEnumerable.call(e, o) && (i[o] = e[o]);
  }
  return i;
}

var _excluded = ["rootDir"];
function ownKeys(e, r) { var t = Object.keys(e); if (Object.getOwnPropertySymbols) { var o = Object.getOwnPropertySymbols(e); r && (o = o.filter(function (r) { return Object.getOwnPropertyDescriptor(e, r).enumerable; })), t.push.apply(t, o); } return t; }
function _objectSpread(e) { for (var r = 1; r < arguments.length; r++) { var t = null != arguments[r] ? arguments[r] : {}; r % 2 ? ownKeys(Object(t), true).forEach(function (r) { _defineProperty(e, r, t[r]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function (r) { Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r)); }); } return e; }
var outputInvalidFilePathError = function outputInvalidFilePathError(filePath) {
  consoleError("The given path ".concat(filePath, " is not a valid configuration file!"));
};
var outputConfigErrors = function outputConfigErrors(errors) {
  consoleError('Invalid configuration file:');
  errors.forEach(function (error) {
    console.log("- ".concat(error.message));
  });
};
var startServerFromConfig = function startServerFromConfig(configFilePath, config) {
  try {
    var validatedConfig = validateConfig(config);
    if (!validatedConfig.valid) {
      outputConfigErrors(validatedConfig.errors);
      return;
    }
    var rootDir = config.rootDir,
      configsRest = _objectWithoutProperties(config, _excluded);
    runServer(_objectSpread({
      rootDir: path__namespace.join(path__namespace.dirname(configFilePath), rootDir)
    }, configsRest));
  } catch (error) {
    outputInvalidFilePathError(configFilePath);
  }
};

var cli = function cli(cliArgs) {
  var program = new commander.Command();
  program.version(version, '-v, --version', 'output the current version').option('-p, --port <number>', 'port to serve Restapify instance').option('-b, --baseUrl <string>', 'base url to serve the API');
  program.command('serve <rootDir> [proxyBaseUrl]').description('serve a mocked API from folder <rootDir> with an optional [proxyBaseUrl]').action(function (rootDir) {
    var proxyBaseUrl = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 'https://public-web-api-dev.trr.se';
    startServer({
      rootDir: path__namespace.resolve(rootDir),
      baseUrl: '/',
      port: 4001,
      proxyBaseUrl: proxyBaseUrl
    });
  });
  program.command('local').description('acts as a proxy to the local Opti host at https://localhost:44319 ').action(function () {
    startServer({
      rootDir: './temp',
      baseUrl: '/',
      port: 4001,
      useLocal: true
    });
  });
  program.command('list <rootDir>').description('list all routes to serve from folder <rootDir>').action(function (rootDir) {
    listRoutes(path__namespace.resolve(rootDir));
  });
  program.arguments('[pathToConfig]').action(function () {
    var pathToConfig = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : './restapify.config.json';
    var configPath = path__namespace.resolve(pathToConfig);
    var configFileExists = fs__namespace.existsSync(configPath);
    if (!configFileExists) {
      consoleError("The given configuration file ".concat(pathToConfig, " doesn't exist!"));
      return;
    }
    var isConfigJs = pathToConfig.endsWith('.js');
    if (isConfigJs) {
      // eslint-disable-next-line global-require
      var config = require(configPath);
      startServerFromConfig(configPath, config);
      return;
    }
    try {
      startServerFromConfig(configPath, JSON.parse(fs__namespace.readFileSync(path__namespace.resolve(pathToConfig), 'utf-8')));
    } catch (error) {
      outputInvalidFilePathError(configPath);
    }
  });
  program.parse(cliArgs);
};

var restapify = new Restapify({
  rootDir: './routes',
  port: 4001,
  baseUrl: '/',
  states: [],
  hotWatch: true,
  proxyBaseUrl: ''
});
restapify.run();

exports.Routes = Restapify;
exports.cli = cli;
exports.default = Restapify;
//# sourceMappingURL=index.cjs.js.map
