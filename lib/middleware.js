'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.historyMiddleware = undefined;

var _constants = require('./constants');

var _utils = require('./utils');

/**
two way to update state

1. action("push|replace")->historyapi("push|replace")->historychangelistener->dispatch->updateState

2. historychange -> historychangelistener->dispatch->updateState

*/

var historyMiddleware = exports.historyMiddleware = function historyMiddleware(history) {
  return function (store) {
    /* init dispatch*/
    store.dispatch({
      type: _constants.URL_CHANGE,
      from: "history", data: {
        location: history.getCurrentLocation ? history.getCurrentLocation() : history.location /* only works history ^3.0.0 */
      }
    });
    var unlisten = history.listen(function (location, action) {
      var search = location.search;
      if (search) location.query = (0, _utils.queryStringToJSON)(search);
      store.dispatch({
        type: _constants.URL_CHANGE,
        from: "history", data: { location: location }
      });
    });
    var unblock = null;
    return function (next) {
      return function (action) {
        if (action.type == _constants.URL_CHANGE && action.from == "history") {
          if (unblock) {
            unblock();
            next({ type: _constants.URL_CHANGE_UNBLOCK });
          }
          return next(Object.assign(action, { from: null })); //from is a flag used for update url only via history api 
        } else if (action.type == _constants.URL_CHANGE) {
          if (action.data.location.action == "POP") {
            history.go(-1);
          } else {
            history[action.data.location.action.toLowerCase()](action.data.location);
          }
        } else if (action.type == _constants.URL_CHANGE_BLOCK) {
          unblock = history.block(action.data.msg || 'Are you sure to leave the page?'); //i18n miss
          next(action);
        } else if (action.type == _constants.URL_CHANGE_UNBLOCK) {
          if (unblock) {
            unblock();
          }
          next(action);
        } else {
          return next(action);
        }
      };
    };
  };
};