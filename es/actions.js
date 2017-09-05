import _Object$assign from 'babel-runtime/core-js/object/assign';
import { URL_CHANGE, URL_CHANGE_BLOCK, URL_CHANGE_UNBLOCK } from './constants';

var historyAction = function historyAction(action) {
	return function (location) {
		return {
			type: URL_CHANGE,
			data: {
				location: _Object$assign({}, location, { action: action })
			}
		};
	};
};

export var push = historyAction('push');
export var replace = historyAction('replace');
//export const go = historyAction('go') //not check
export var goBack = historyAction('goBack');
//export const goForward = historyAction('goForward') //not check
export var block = function block() {
	var msg = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : null;
	return { type: URL_CHANGE_BLOCK, data: { msg: msg } };
};
export var unblock = function unblock() {
	return { type: URL_CHANGE_UNBLOCK };
};
export var routerActions = { push: push, replace: replace, block: block, unblock: unblock /*, go, goBack, goForward*/ };