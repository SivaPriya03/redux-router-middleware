import _Object$assign from 'babel-runtime/core-js/object/assign';
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

import { normalize } from 'simple-normalizr';
import { MATCH, EXACT_MATCH, NOT_MATCH, URL_CHANGE, URL_CHANGE_BLOCK, URL_CHANGE_UNBLOCK } from './constants';
import { urlsSchema, initialStateWithTokens, matchPattern } from './utils';

export var routing = function routing(urls) {
  var urlNormalizer = normalize(urls, urlsSchema);
  var urls = initialStateWithTokens(urlNormalizer.entities.urls);
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
      case URL_CHANGE:
        var flag = 1;
        return { /* have to optimize code - skip all process once exact match*/
          urls: state.order.reduce(function (result, next) {
            var obj = matchPattern(state.urls[next].pattern, action.data.location.pathname);
            var match = NOT_MATCH;
            if (obj) {
              if (flag == 1) {
                currentParams = obj;
              }
              if (obj.remainingPathname == "" && flag == 1) {
                match = EXACT_MATCH;
                flag = 0;
              } else if (flag == 1) {
                match = MATCH;
              }
            }
            result[next] = url(state.urls[next], action, match);
            return result;
          }, {}),
          order: state.order,
          paramMap: currentParams && currentParams.paramMap || {},
          location: location(state.location, action) //old location and new location are diff deep compare
        };
      case URL_CHANGE_BLOCK:
        return _Object$assign({}, state, { block: true });
      case URL_CHANGE_UNBLOCK:
        return _Object$assign({}, state, { block: false });
    }
    return state;
  };
};

var url = function url() {
  var state = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
  var action = arguments[1];
  var matchType = arguments[2];

  return _Object$assign({}, state, { match: matchType });
};
var location = function location() {
  var state = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
  var action = arguments[1];

  if (action.type == URL_CHANGE) {
    return action.data.location;
  }
  return state;
};