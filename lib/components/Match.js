'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Match = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _reactRedux = require('react-redux');

var _actions = require('../actions');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Match = exports.Match = function (_React$Component) {
  _inherits(Match, _React$Component);

  function Match() {
    _classCallCheck(this, Match);

    return _possibleConstructorReturn(this, (Match.__proto__ || Object.getPrototypeOf(Match)).apply(this, arguments));
  }

  _createClass(Match, [{
    key: 'render',
    value: function render() {
      var _props = this.props,
          children = _props.children,
          isMatch = _props.isMatch,
          isAuthenticate = _props.isAuthenticate;

      return isMatch && isAuthenticate && _react2.default.Children.only(children) || null;
    }
  }, {
    key: 'componentDidMount',
    value: function componentDidMount() {
      if (!this.props.isAuthenticate && this.props.isMatch) {
        this.props.replace(this.props.redirect);
      }
    }
  }, {
    key: 'componentDidUpdate',
    value: function componentDidUpdate(prevProps, prevState) {
      if (!this.props.isAuthenticate && this.props.isMatch) {
        this.props.replace(this.props.redirect);
      }
    }
  }]);

  return Match;
}(_react2.default.Component);

exports.Match = Match = (0, _reactRedux.connect)(function (state, props) {
  var isMatch;
  if (Array.isArray(props.name)) {
    var names = props.name;
    isMatch = names.some(function (name) {
      var url = state.routing.urls[name];
      if (url) {
        return props.isExactly && url.match == 2 || !props.isExactly && url.match;
      }
      return false;
    });
  } else {
    var url = state.routing.urls[props.name];
    if (url) {
      isMatch = props.isExactly && url.match == 2 || !props.isExactly && url.match;
    } else {
      isMatch = false;
    }
  }
  return {
    isMatch: isMatch,
    isAuthenticate: props.checkAuthenticate ? props.checkAuthenticate(state) : true
  };
}, { replace: _actions.replace })(Match);

Match.defaultProps = {
  isExactly: false
};