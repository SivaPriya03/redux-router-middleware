'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.routerActions = exports.unblock = exports.block = exports.replace = exports.push = undefined;

var _constants = require('./constants');

var historyAction = function historyAction(action) {
	return function (location) {
		console.log("location", location);
		return {
			type: _constants.URL_CHANGE,
			data: {
				location: Object.assign({}, location, { action: action })
			}
		};
	};
};

var push = exports.push = historyAction('push');
var replace = exports.replace = historyAction('replace');
//export const go = historyAction('go') //not check
//export const goBack = historyAction('goBack') //not check
//export const goForward = historyAction('goForward') //not check
var block = exports.block = function block() {
	var msg = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : null;
	return { type: _constants.URL_CHANGE_BLOCK, data: { msg: msg } };
};
var unblock = exports.unblock = function unblock() {
	return { type: _constants.URL_CHANGE_UNBLOCK };
};
var routerActions = exports.routerActions = { push: push, replace: replace, block: block, unblock: unblock /*, go, goBack, goForward*/ };