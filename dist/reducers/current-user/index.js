"use strict";
var __assign = (this && this.__assign) || Object.assign || function(t) {
    for (var s, i = 1, n = arguments.length; i < n; i++) {
        s = arguments[i];
        for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
            t[p] = s[p];
    }
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
var initial_state_1 = require("../../initial-state");
var types_1 = require("../../types");
var initialUser = initial_state_1.default.currentUser;
var currentUser = function (state, action) {
    if (state === void 0) { state = initialUser; }
    switch (action.type) {
        case types_1.REGISTRATION_REQUEST_SENT:
        case types_1.VERIFY_TOKEN_REQUEST_SENT:
        case types_1.SIGNIN_REQUEST_SENT:
        case types_1.SIGNOUT_REQUEST_SENT:
            return __assign({}, state, { isLoading: true });
        case types_1.SIGNOUT_LOCAL_REQUEST:
            return __assign({}, state, { isSignedIn: false });
        case types_1.VERIFY_TOKEN_REQUEST_SUCCEEDED:
            return __assign({}, state, { attributes: __assign({}, action.payload.userAttributes), isLoading: false, isSignedIn: true, hasVerificationBeenAttempted: true });
        case types_1.REGISTRATION_REQUEST_SUCCEEDED:
            return __assign({}, state, { error: undefined, emailHasSent: true });
        case types_1.SIGNIN_REQUEST_SUCCEEDED:
            return __assign({}, state, { attributes: __assign({}, action.payload.userAttributes), isLoading: false, isSignedIn: true, error: undefined });
        case types_1.VERIFY_TOKEN_REQUEST_FAILED:
            return __assign({}, state, { isLoading: false, isSignedIn: false, hasVerificationBeenAttempted: true });
        case types_1.REGISTRATION_REQUEST_FAILED:
            return __assign({}, state, { error: action.error });
        case types_1.SIGNIN_REQUEST_FAILED:
            return __assign({}, state, { isLoading: false, isSignedIn: false, error: action.error });
        case types_1.SIGNOUT_REQUEST_SUCCEEDED:
            var userAttributeKeys = Object.keys(state.attributes);
            var allNullUserAttributes = userAttributeKeys.reduce(function (accumulatedNullUserAttributes, currentUserAttributeKey) {
                var _a;
                return __assign({}, accumulatedNullUserAttributes, (_a = {}, _a[currentUserAttributeKey] = null, _a));
            }, {});
            return __assign({}, state, { attributes: allNullUserAttributes, isLoading: false, isSignedIn: false, error: undefined });
        case types_1.SIGNOUT_REQUEST_FAILED:
            return __assign({}, state, { isLoading: false, error: action.error });
        case types_1.SET_HAS_VERIFICATION_BEEN_ATTEMPTED:
            return __assign({}, state, { hasVerificationBeenAttempted: action.payload.hasVerificationBeenAttempted });
        case types_1.RESET_ERRORS:
            return __assign({}, state, { error: undefined });
        default:
            return state;
    }
};
exports.default = currentUser;
//# sourceMappingURL=index.js.map