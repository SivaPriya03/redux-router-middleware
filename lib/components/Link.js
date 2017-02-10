'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Link = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _reactRedux = require('react-redux');

var _actions = require('../actions');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Link = exports.Link = function (_React$Component) {
  _inherits(Link, _React$Component);

  function Link(props) {
    _classCallCheck(this, Link);

    var _this = _possibleConstructorReturn(this, (Link.__proto__ || Object.getPrototypeOf(Link)).call(this, props));

    _this.onClick = _this.onClick.bind(_this);
    return _this;
  }

  _createClass(Link, [{
    key: 'onClick',
    value: function onClick(e) {
      var _props = this.props,
          push = _props.push,
          replace = _props.replace,
          action = _props.action,
          pathname = _props.pathname,
          state = _props.state,
          query = _props.query;

      if (!this.props.isReload) {
        e.preventDefault();
        if (action == "PUSH") {
          this.props.push({
            pathname: pathname,
            state: state,
            query: query
          });
        } else if (action == "REPLACE") {
          replace({
            pathname: pathname,
            state: state,
            query: query
          });
        }
      }
      //var {name,params,query,state,action} = this.props;
      //this.context.action(name,params,query,state,action)
    }
  }, {
    key: 'render',
    value: function render() {
      var _props2 = this.props,
          children = _props2.children,
          href = _props2.href,
          isActive = _props2.isActive,
          _props2$isReload = _props2.isReload,
          isReload = _props2$isReload === undefined ? false : _props2$isReload;


      return _react2['default'].createElement(
        'a',
        { href: href, onClick: this.onClick, className: isActive ? "active" : "" },
        children
      );
    }
  }]);

  return Link;
}(_react2['default'].Component);

Link.defaultProps = {
  isReload: false,
  action: "PUSH"
};

Link.contextTypes = {
  action: _react2['default'].PropTypes.func
};
exports.Link = Link = (0, _reactRedux.connect)(function (state, props) {
  var _state$routing = state.routing,
      paramMap = _state$routing.paramMap,
      urls = _state$routing.urls,
      location = _state$routing.location;

  var url = urls[props.name];
  var tokens = url.tokens;
  var href = tokens.reduce(function (result, next) {
    if (!next.startsWith(":")) result += next;else {
      var key = next.substring(1);
      result += props.params && props.params[key] || paramMap[key];
    }
    return result;
  }, "");
  function jsonToQueryString(json) {
    return '?' + Object.keys(json).map(function (key) {
      return encodeURIComponent(key) + '=' + encodeURIComponent(json[key]);
    }).join('&');
  }
  var qStr = jsonToQueryString(props.query || {});
  return {
    pathname: href,
    href: href + qStr,
    isActive: href == location.pathname
  };
}, { push: _actions.push, replace: _actions.replace })(Link);