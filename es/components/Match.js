import _Object$getPrototypeOf from 'babel-runtime/core-js/object/get-prototype-of';
import _classCallCheck from 'babel-runtime/helpers/classCallCheck';
import _createClass from 'babel-runtime/helpers/createClass';
import _possibleConstructorReturn from 'babel-runtime/helpers/possibleConstructorReturn';
import _inherits from 'babel-runtime/helpers/inherits';
import React from 'react';
import { connect } from 'react-redux';
import { replace } from '../actions';
export var Match = function (_React$Component) {
  _inherits(Match, _React$Component);

  function Match() {
    _classCallCheck(this, Match);

    return _possibleConstructorReturn(this, (Match.__proto__ || _Object$getPrototypeOf(Match)).apply(this, arguments));
  }

  _createClass(Match, [{
    key: 'render',
    value: function render() {
      var _props = this.props,
          children = _props.children,
          isMatch = _props.isMatch,
          isAuthenticate = _props.isAuthenticate;

      return isMatch && isAuthenticate && React.Children.only(children) || null;
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
}(React.Component);

Match = connect(function (state, props) {
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
}, { replace: replace })(Match);

Match.defaultProps = {
  isExactly: false
};