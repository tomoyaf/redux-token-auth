import initialState from '../../initial-state';
import {
    ReduxAction, REGISTRATION_REQUEST_FAILED, REGISTRATION_REQUEST_SENT,
    REGISTRATION_REQUEST_SUCCEEDED, RESET_ERRORS, SET_HAS_VERIFICATION_BEEN_ATTEMPTED,
    SIGNIN_REQUEST_FAILED, SIGNIN_REQUEST_SENT, SIGNIN_REQUEST_SUCCEEDED, SIGNOUT_LOCAL_REQUEST,
    SIGNOUT_REQUEST_FAILED, SIGNOUT_REQUEST_SENT, SIGNOUT_REQUEST_SUCCEEDED, User, UserAttributes,
    VERIFY_TOKEN_REQUEST_FAILED, VERIFY_TOKEN_REQUEST_SENT, VERIFY_TOKEN_REQUEST_SUCCEEDED
} from '../../types';

const { currentUser: initialUser } = initialState;

const currentUser = (state: User = initialUser, action: ReduxAction): User => {
  switch (action.type) {
    case REGISTRATION_REQUEST_SENT:
    case VERIFY_TOKEN_REQUEST_SENT:
    case SIGNIN_REQUEST_SENT:
    case SIGNOUT_REQUEST_SENT:
      return {
        ...state,
        isLoading: true
      };
    case SIGNOUT_LOCAL_REQUEST:
      return { ...state, isSignedIn: false };
    case VERIFY_TOKEN_REQUEST_SUCCEEDED:
      return {
        ...state,
        attributes: { ...action.payload.userAttributes },
        isLoading: false,
        isSignedIn: true,
        hasVerificationBeenAttempted: true
      };
    case REGISTRATION_REQUEST_SUCCEEDED:
      return {
        ...state,
        error: undefined,
        emailHasSent: true
      };
    case SIGNIN_REQUEST_SUCCEEDED:
      return {
        ...state,
        attributes: { ...action.payload.userAttributes },
        isLoading: false,
        isSignedIn: true,
        error: undefined
      };
    case VERIFY_TOKEN_REQUEST_FAILED:
      return {
        ...state,
        isLoading: false,
        isSignedIn: false,
        hasVerificationBeenAttempted: true
      };
    case REGISTRATION_REQUEST_FAILED:
      return {
        ...state,
        error: action.error
      };
    case SIGNIN_REQUEST_FAILED:
      return {
        ...state,
        isLoading: false,
        isSignedIn: false,
        error: action.error
      };
    case SIGNOUT_REQUEST_SUCCEEDED:
      const userAttributeKeys: string[] = Object.keys(state.attributes);
      const allNullUserAttributes: UserAttributes = userAttributeKeys.reduce(
        (
          accumulatedNullUserAttributes: UserAttributes,
          currentUserAttributeKey: string
        ): UserAttributes => {
          return {
            ...accumulatedNullUserAttributes,
            [currentUserAttributeKey]: null
          };
        },
        {}
      );
      return {
        ...state,
        attributes: allNullUserAttributes,
        isLoading: false,
        isSignedIn: false,
        error: undefined
      };
    case SIGNOUT_REQUEST_FAILED:
      return {
        ...state,
        isLoading: false,
        error: action.error
      };
    case SET_HAS_VERIFICATION_BEEN_ATTEMPTED:
      return {
        ...state,
        hasVerificationBeenAttempted:
          action.payload.hasVerificationBeenAttempted
      };
    case RESET_ERRORS:
      return {
        ...state,
        error: undefined
      };
    default:
      return state;
  }
};

export default currentUser;
