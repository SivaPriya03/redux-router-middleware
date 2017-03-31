'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.routing = undefined;

var _simpleNormalizr = require('simple-normalizr');

var _constants = require('./constants');

var _utils = require('./utils');

var routing = exports.routing = function routing(urls) {
  var urlNormalizer = (0, _simpleNormalizr.normalize)(urls, _utils.urlsSchema);
  var urls = (0, _utils.initialStateWithTokens)(urlNormalizer.entities.urls);
  var order = urlNormalizer.result;
  var initialState = {
    urls: urls,
    order: order
  };
  return function () {
    var state = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : initialState;
    var action = arguments[1];

    var currentParams;
    switch (action.type) {
      case _constants.URL_CHANGE:
        var flag = 1;
        return {
          urls: state.order.reduce(function (result, next) {
            var obj = (0, _utils.matchPattern)(state.urls[next].pattern, action.data.location.pathname);
            var match = _constants.NOT_MATCH;
            if (obj) {
              if (flag == 1) {
                currentParams = obj;
              }
              if (obj.remainingPathname == "" && flag == 1) {
                match = _constants.EXACT_MATCH;
                flag = 0;
              } else if (flag == 1) {
                match = _constants.MATCH;
              }
            }
            result[next] = url(state.urls[next], action, match);
            return result;
          }, {}),
          order: state.order,
          paramMap: currentParams && currentParams.paramMap || {},
          location: location(state.location, action) };
      case _constants.URL_CHANGE_BLOCK:
        return Object.assign({}, state, { block: true });
      case _constants.URL_CHANGE_UNBLOCK:
        return Object.assign({}, state, { block: false });
    }
    return state;
  };
}; /*
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
     [
       {
         name:
   
       }
       {
         name:"ticketList",
         pattern:"/zd/:portalId/tickets",
         parent:"ticket"
       }
     ]
   */

var url = function url() {
  var state = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
  var action = arguments[1];
  var matchType = arguments[2];

  return Object.assign({}, state, { match: matchType });
};
var location = function location() {
  var state = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
  var action = arguments[1];

  if (action.type == _constants.URL_CHANGE) {
    return action.data.location;
  }
  return state;
};