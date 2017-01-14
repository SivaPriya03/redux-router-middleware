'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Match = exports.Link = exports.RouterProvider = exports.replace = exports.push = exports.historyMiddleWare = exports.routing = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _reactRedux = require('react-redux');

var _history = require('history');

var _simpleNormalizr = require('simple-normalizr');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var urlsSchema = (0, _simpleNormalizr.arrayOf)((0, _simpleNormalizr.schema)("urls", { id: "name" }));

function escapeRegExp(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
var CompiledPatternsCache = Object.create(null);
function _compilePattern(pattern) {
  var regexpSource = '';
  var paramNames = [];
  var tokens = [];

  var match = void 0,
      lastIndex = 0,
      matcher = /:([a-zA-Z_$][a-zA-Z0-9_$]*)|\*\*|\*|\(|\)/g;
  while (match = matcher.exec(pattern)) {
    if (match.index !== lastIndex) {
      tokens.push(pattern.slice(lastIndex, match.index));
      regexpSource += escapeRegExp(pattern.slice(lastIndex, match.index));
    }

    if (match[1]) {
      regexpSource += '([^/]+)';
      paramNames.push(match[1]);
    } else if (match[0] === '**') {
      regexpSource += '(.*)';
      paramNames.push('splat');
    } else if (match[0] === '*') {
      regexpSource += '(.*?)';
      paramNames.push('splat');
    } else if (match[0] === '(') {
      regexpSource += '(?:';
    } else if (match[0] === ')') {
      regexpSource += ')?';
    }

    tokens.push(match[0]);

    lastIndex = matcher.lastIndex;
  }

  if (lastIndex !== pattern.length) {
    tokens.push(pattern.slice(lastIndex, pattern.length));
    regexpSource += escapeRegExp(pattern.slice(lastIndex, pattern.length));
  }

  return {
    pattern: pattern,
    regexpSource: regexpSource,
    paramNames: paramNames,
    tokens: tokens
  };
}
function compilePattern(pattern) {
  if (!CompiledPatternsCache[pattern]) CompiledPatternsCache[pattern] = _compilePattern(pattern);

  return CompiledPatternsCache[pattern];
}
function matchPattern(pattern, pathname) {
  // Ensure pattern starts with leading slash for consistency with pathname.
  if (pattern.charAt(0) !== '/') {
    pattern = '/' + pattern;
  }

  var _compilePattern2 = compilePattern(pattern),
      regexpSource = _compilePattern2.regexpSource,
      paramNames = _compilePattern2.paramNames,
      tokens = _compilePattern2.tokens;

  if (pattern.charAt(pattern.length - 1) !== '/') {
    regexpSource += '/?'; // Allow optional path separator at end.
  }

  // Special-case patterns like '*' for catch-all routes.
  if (tokens[tokens.length - 1] === '*') {
    regexpSource += '$';
  }

  var match = pathname.match(new RegExp('^' + regexpSource, 'i'));
  if (match == null) {
    return null;
  }

  var matchedPath = match[0];
  var remainingPathname = pathname.substr(matchedPath.length);

  if (remainingPathname) {
    // Require that the match ends at a path separator, if we didn't match
    // the full path, so any remaining pathname is a new path segment.
    if (matchedPath.charAt(matchedPath.length - 1) !== '/') {
      return null;
    }

    // If there is a remaining pathname, treat the path separator as part of
    // the remaining pathname for properly continuing the match.
    remainingPathname = '/' + remainingPathname;
  }
  var paramMap = {};
  match.slice(1).forEach(function (v, i) {
    return paramMap[paramNames[i]] = v && decodeURIComponent(v);
  });
  return {
    remainingPathname: remainingPathname,
    paramMap: paramMap
  };
}

/*
  routing:{
    location:{
      pathname:,
      state,
      query,
    },
    urls:{
      entity:{
        "url1":{
          name:
          pattern:
          match:
          tokens:
        }
      },
      order:["url1",..],
    },
    currentParams:{
      
    }
  }
  */
var MATCH = 1;
var EXACT_MATCH = 2;
var NOT_MATCH = 0;

var initialStateWithTokens = function initialStateWithTokens(initialState) {
  return Object.keys(initialState).reduce(function (result, next) {
    result[next] = Object.assign({}, initialState[next], {
      tokens: compilePattern(initialState[next].pattern).tokens
    });
    return result;
  }, {});
};

var routing = exports.routing = function routing(urls) {
  var urlNormalizer = (0, _simpleNormalizr.normalize)(urls, urlsSchema);
  console.log(urlNormalizer);
  var urls = initialStateWithTokens(urlNormalizer.entities.urls);
  var order = urlNormalizer.result;

  return function () {
    var state = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : { urls: urls, order: order, location: location };
    var action = arguments[1];

    var currentParams;
    if (action.type == "URL_CHANGE") {
      return {
        urls: state.order.reduce(function (result, next) {
          console.log(state.urls[next], next);
          var obj = matchPattern(state.urls[next].pattern, action.data.location.pathname);
          var match = NOT_MATCH;
          if (obj) {
            currentParams = obj;
            if (obj.remainingPathname == "") {
              match = EXACT_MATCH;
            } else {
              match = MATCH;
            }
          }
          result[next] = url(state.urls[next], action, match);
          return result;
        }, {}),
        order: state.order,
        paramMap: currentParams && currentParams.paramMap || {},
        location: location(state.location, action) };
    }
    return state;
  };
};

var url = function url() {
  var state = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
  var action = arguments[1];
  var matchType = arguments[2];

  return Object.assign({}, state, { match: matchType });
};
var location = function location() {
  var state = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
  var action = arguments[1];

  if (action.type == "URL_CHANGE") {
    return action.data.location;
  }
  return state;
};

var historyMiddleWare = exports.historyMiddleWare = function historyMiddleWare(history) {
  return function (store) {

    store.dispatch({
      type: "URL_CHANGE",
      from: "history", data: { location: history1.getCurrentLocation() }
    });
    var unlisten = history.listen(function (location, action) {
      store.dispatch({
        type: "URL_CHANGE",
        from: "history", data: { location: location }
      });
    });
    return function (next) {
      return function (action) {
        if (action.type == "URL_CHANGE" && action.from == "history") {
          return next(Object.assign(action, { from: null }));
        } else {
          if (action.data.location.action == "POP") {
            //no idea some issue there
            history.go(-1);
          } else {
            console.log(action.data);
            history[action.data.location.action.toLowerCase()](action.data.location);
          }
        }
      };
    };
  };
};

var historyAction = function historyAction(action) {
  return function (location) {
    return { type: "URL_CHANGE", data: { location: Object.assign({}, location, { action: action }) } };
  };
};

var push = exports.push = historyAction("PUSH");
var replace = exports.replace = historyAction("REPLACE");

var RouterProvider = function (_React$Component) {
  _inherits(RouterProvider, _React$Component);

  function RouterProvider(props) {
    _classCallCheck(this, RouterProvider);

    var _this = _possibleConstructorReturn(this, (RouterProvider.__proto__ || Object.getPrototypeOf(RouterProvider)).call(this, props));

    _this.action = _this.action.bind(_this);
    return _this;
  }

  _createClass(RouterProvider, [{
    key: 'getChildContext',
    value: function getChildContext() {
      return {
        action: this.action
      };
    }
  }, {
    key: 'action',
    value: function action(name) {
      var params = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
      var query = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
      var state = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : {};

      var _action = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : "PUSH";

      var isDispatch = arguments.length > 5 && arguments[5] !== undefined ? arguments[5] : true;
      var _props$routing = this.props.routing,
          paramMap = _props$routing.paramMap,
          urls = _props$routing.urls;
      var _props = this.props,
          push = _props.push,
          replace = _props.replace;

      var url = urls[name];
      var tokens = url.tokens;
      var href = tokens.reduce(function (result, next) {
        if (!next.startsWith(":")) result += next;else {
          var key = next.substring(1);
          result += params[key] || paramMap[key];
        }
        return result;
      }, "");
      if (isDispatch) {
        if (_action == "PUSH") {
          console.log(push);
          this.props.push({
            pathname: href,
            state: state,
            query: query
          });
        } else if (_action == "REPLACE") {
          replace({
            pathname: href,
            state: state,
            query: query
          });
        }
      }
      return href;
    }
  }, {
    key: 'render',
    value: function render() {
      var children = this.props.children;

      return _react2.default.Children.only(children);
    }
  }]);

  return RouterProvider;
}(_react2.default.Component);

exports.RouterProvider = RouterProvider;

RouterProvider.childContextTypes = {
  action: _react2.default.PropTypes.func
};
exports.RouterProvider = RouterProvider = (0, _reactRedux.connect)(function (state) {
  return {
    routing: state.routing
  };
}, { push: push, replace: replace })(RouterProvider);

var Link = exports.Link = function (_React$Component2) {
  _inherits(Link, _React$Component2);

  function Link(props) {
    _classCallCheck(this, Link);

    var _this2 = _possibleConstructorReturn(this, (Link.__proto__ || Object.getPrototypeOf(Link)).call(this, props));

    _this2.onClick = _this2.onClick.bind(_this2);
    return _this2;
  }

  _createClass(Link, [{
    key: 'onClick',
    value: function onClick(e) {
      e.preventDefault();
      var _props2 = this.props,
          name = _props2.name,
          params = _props2.params,
          query = _props2.query,
          state = _props2.state,
          action = _props2.action;

      this.context.action(name, params, query, state, action);
    }
  }, {
    key: 'render',
    value: function render() {
      var children = this.props.children;


      return _react2.default.createElement(
        'a',
        { href: '', onClick: this.onClick },
        children
      );
    }
  }]);

  return Link;
}(_react2.default.Component);

Link.contextTypes = {
  action: _react2.default.PropTypes.func
};

var Match = exports.Match = function (_React$Component3) {
  _inherits(Match, _React$Component3);

  function Match() {
    _classCallCheck(this, Match);

    return _possibleConstructorReturn(this, (Match.__proto__ || Object.getPrototypeOf(Match)).apply(this, arguments));
  }

  _createClass(Match, [{
    key: 'render',
    value: function render() {
      var _props3 = this.props,
          children = _props3.children,
          isMatch = _props3.isMatch;

      return isMatch && _react2.default.Children.only(children) || null;
    }
  }]);

  return Match;
}(_react2.default.Component);

exports.Match = Match = (0, _reactRedux.connect)(function (state, props) {
  var url = state.routing.urls[props.name];
  return {
    isMatch: props.isExactly && url.match == 2 || url.match
  };
})(Match);