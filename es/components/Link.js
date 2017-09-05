import _Object$keys from 'babel-runtime/core-js/object/keys';
import _Object$getPrototypeOf from 'babel-runtime/core-js/object/get-prototype-of';
import _classCallCheck from 'babel-runtime/helpers/classCallCheck';
import _createClass from 'babel-runtime/helpers/createClass';
import _possibleConstructorReturn from 'babel-runtime/helpers/possibleConstructorReturn';
import _inherits from 'babel-runtime/helpers/inherits';
import React from 'react';
import { connect } from 'react-redux';

import { push, replace } from '../actions';

export var Link = function (_React$Component) {
  _inherits(Link, _React$Component);

  function Link(props) {
    _classCallCheck(this, Link);

    var _this = _possibleConstructorReturn(this, (Link.__proto__ || _Object$getPrototypeOf(Link)).call(this, props));

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


      return React.createElement('a', { href: href, onClick: this.onClick, className: isActive ? "active" : "" }, children);
    }
  }]);

  return Link;
}(React.Component);
Link.defaultProps = {
  isReload: false,
  action: "PUSH"
};

Link.contextTypes = {
  action: React.PropTypes.func
};
Link = connect(function (state, props) {
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
    return '?' + _Object$keys(json).map(function (key) {
      return encodeURIComponent(key) + '=' + encodeURIComponent(json[key]);
    }).join('&');
  }
  var qStr = jsonToQueryString(props.query || {});
  return {
    pathname: href,
    href: href + qStr,
    isActive: href == location.pathname
  };
}, { push: push, replace: replace })(Link);