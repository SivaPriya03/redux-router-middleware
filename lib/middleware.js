'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.historyMiddleware = exports.reduxRouter = undefined;

var _constants = require('./constants');

var _utils = require('./utils');

var _reducer = require('./reducer');

var reduxRouter = exports.reduxRouter = function reduxRouter(history, urls, onUrlChange) {
  var routingReducer = (0, _reducer.routing)(urls);
  function historyMiddleware(history) {
    return function (store) {
      var preUrlChangeReject = null;
      var onChange = function onChange(location, action) {
        var search = location.search;
        if (search) {
          location.query = (0, _utils.queryStringToJSON)(search);
        }
        var newRoutingState = routingReducer(store.getState().routing, {
          type: _constants.URL_CHANGE,
          from: "history", data: { location: location }
        });
        if (preUrlChangeReject) {
          preUrlChangeReject();
          preUrlChangeReject = null;
        }
        new Promise(function (res, rej) {
          onUrlChange(newRoutingState, res, { dispatch: store.dispatch, getState: store.getState });
          preUrlChangeReject = rej;
        }).then(function () {
          preUrlChangeReject = null;
          store.dispatch({
            type: _constants.URL_CHANGE,
            from: "history", data: { location: location }
          });
        }).catch(function () {
          store.dispatch({
            type: "URL_CHANGE_Failure",
            from: "history", data: { location: location }
          });
        });
      };
      /* init dispatch*/
      setTimeout(function () {
        return onChange(history.getCurrentLocation ? history.getCurrentLocation() : history.location);
      }, 1);

      /*store.dispatch({
        type:URL_CHANGE,
        from:"history",data:{
          location:history.getCurrentLocation ? history.getCurrentLocation() : history.location // only works history ^3.0.0 
        }
      })*/

      var unlisten = history.listen(onChange);
      var unblock = null;
      return function (next) {
        return function (action) {
          if (action.type == _constants.URL_CHANGE && action.from == "history") {
            if (unblock) {
              unblock();
              unblock = null;
              next({ type: _constants.URL_CHANGE_UNBLOCK });
            }
            return next(Object.assign(action, { from: null })); //from is a flag used for update url only via history api 
          } else if (action.type == _constants.URL_CHANGE) {
            if (action.data.location.action == "POP") {
              history.go(-1);
            } else {
              var location = Object.assign({}, action.data.location);
              var query = location.query;
              location.search = (0, _utils.jsonToQueryString)(location.query || {});
              history[action.data.location.action.toLowerCase()](location);
            }
          } else if (action.type == _constants.URL_CHANGE_BLOCK) {
            unblock = history.block(action.data.msg || 'Are you sure to leave the page?'); //i18n miss
            next(action);
          } else if (action.type == _constants.URL_CHANGE_UNBLOCK) {
            if (unblock) {
              unblock();
              unblock = null;
            }
            next(action);
          } else {
            return next(action);
          }
        };
      };
    };
  }
  return {
    historyMiddleware: historyMiddleware(history),
    routing: routingReducer

  };
}; /**
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
            unblock = null;
            next({ type: _constants.URL_CHANGE_UNBLOCK });
          }
          return next(Object.assign(action, { from: null })); //from is a flag used for update url only via history api 
        } else if (action.type == _constants.URL_CHANGE) {
          if (action.data.location.action == "POP") {
            history.go(-1);
          } else {
            var location = Object.assign({}, action.data.location);
            var query = location.query;
            location.search = (0, _utils.jsonToQueryString)(location.query || {});
            history[action.data.location.action.toLowerCase()](location);
          }
        } else if (action.type == _constants.URL_CHANGE_BLOCK) {
          unblock = history.block(action.data.msg || 'Are you sure to leave the page?'); //i18n miss
          next(action);
        } else if (action.type == _constants.URL_CHANGE_UNBLOCK) {
          if (unblock) {
            unblock();
            unblock = null;
          }
          next(action);
        } else {
          return next(action);
        }
      };
    };
  };
};