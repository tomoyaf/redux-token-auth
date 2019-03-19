import axios from 'axios';
import { Dispatch, Store } from 'redux';

import AsyncLocalStorage from './AsyncLocalStorage';
import {
    deleteAuthHeaders, deleteAuthHeadersFromDeviceStorage, getUserAttributesFromResponse,
    persistAuthHeadersInDeviceStorage, setAuthHeaders
} from './services/auth';
import {
    ActionsExport, AuthResponse, DeviceStorage, REGISTRATION_REQUEST_FAILED,
    REGISTRATION_REQUEST_SENT, REGISTRATION_REQUEST_SUCCEEDED, RegistrationRequestFailedAction,
    RegistrationRequestSentAction, RegistrationRequestSucceededAction,
    SET_HAS_VERIFICATION_BEEN_ATTEMPTED, SetHasVerificationBeenAttemptedAction,
    SIGNIN_REQUEST_FAILED, SIGNIN_REQUEST_SENT, SIGNIN_REQUEST_SUCCEEDED, SignInRequestFailedAction,
    SignInRequestSentAction, SignInRequestSucceededAction, SIGNOUT_REQUEST_FAILED,
    SIGNOUT_REQUEST_SENT, SIGNOUT_REQUEST_SUCCEEDED, SignOutRequestFailedAction,
    SignOutRequestSentAction, SignOutRequestSucceededAction, UserAttributes,
    UserRegistrationDetails, UserSignInCredentials, UserSignOutCredentials, VerificationParams,
    VERIFY_TOKEN_REQUEST_FAILED, VERIFY_TOKEN_REQUEST_SENT, VERIFY_TOKEN_REQUEST_SUCCEEDED,
    VerifyTokenRequestFailedAction, VerifyTokenRequestSentAction, VerifyTokenRequestSucceededAction
} from './types';

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Pure Redux actions:
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const registrationRequestSent = (): RegistrationRequestSentAction => ({
  type: REGISTRATION_REQUEST_SENT
});

export const registrationRequestSucceeded = (
  userAttributes: UserAttributes
): RegistrationRequestSucceededAction => ({
  type: REGISTRATION_REQUEST_SUCCEEDED,
  payload: {
    userAttributes
  }
});

export const registrationRequestFailed = (
  error: any
): RegistrationRequestFailedAction => ({
  type: REGISTRATION_REQUEST_FAILED,
  error
});

export const verifyTokenRequestSent = (): VerifyTokenRequestSentAction => ({
  type: VERIFY_TOKEN_REQUEST_SENT
});

export const verifyTokenRequestSucceeded = (
  userAttributes: UserAttributes
): VerifyTokenRequestSucceededAction => ({
  type: VERIFY_TOKEN_REQUEST_SUCCEEDED,
  payload: {
    userAttributes
  }
});

export const verifyTokenRequestFailed = (): VerifyTokenRequestFailedAction => ({
  type: VERIFY_TOKEN_REQUEST_FAILED
});

export const signInRequestSent = (): SignInRequestSentAction => ({
  type: SIGNIN_REQUEST_SENT
});

export const signInRequestSucceeded = (
  userAttributes: UserAttributes
): SignInRequestSucceededAction => ({
  type: SIGNIN_REQUEST_SUCCEEDED,
  payload: {
    userAttributes
  }
});

export const signInRequestFailed = (error: any): SignInRequestFailedAction => ({
  type: SIGNIN_REQUEST_FAILED,
  error
});

export const signOutRequestSent = (): SignOutRequestSentAction => ({
  type: SIGNOUT_REQUEST_SENT
});

export const signOutRequestSucceeded = (): SignOutRequestSucceededAction => ({
  type: SIGNOUT_REQUEST_SUCCEEDED
});

export const signOutRequestFailed = (
  error: any
): SignOutRequestFailedAction => ({
  type: SIGNOUT_REQUEST_FAILED,
  error
});

export const setHasVerificationBeenAttempted = (
  hasVerificationBeenAttempted: boolean
): SetHasVerificationBeenAttemptedAction => ({
  type: SET_HAS_VERIFICATION_BEEN_ATTEMPTED,
  payload: {
    hasVerificationBeenAttempted
  }
});

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Async Redux Thunk actions:
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

const generateAuthActions = (config: { [key: string]: any }): ActionsExport => {
  const {
    authUrl,
    storage,
    userAttributes,
    userRegistrationAttributes
  } = config;

  const Storage: DeviceStorage =
    storage && Boolean(storage.flushGetRequests) ? storage : AsyncLocalStorage;

  const registerUser = (userRegistrationDetails: UserRegistrationDetails) =>
    async function(dispatch: Dispatch<{}>): Promise<void> {
      dispatch(registrationRequestSent());
      const { email, password, passwordConfirmation } = userRegistrationDetails;
      const data = {
        email,
        password,
        password_confirmation: passwordConfirmation
      };
      Object.keys(userRegistrationAttributes).forEach((key: string) => {
        const backendKey = userRegistrationAttributes[key];
        data[backendKey] = userRegistrationDetails[key];
      });
      try {
        const response: AuthResponse = await axios({
          method: "POST",
          url: authUrl,
          data
        });
        setAuthHeaders(response.headers);
        persistAuthHeadersInDeviceStorage(Storage, response.headers);
        const userAttributesToSave = getUserAttributesFromResponse(
          userAttributes,
          response
        );
        dispatch(registrationRequestSucceeded(userAttributesToSave));
      } catch (error) {
        dispatch(registrationRequestFailed(error));
      }
    };

  const verifyToken = (verificationParams: VerificationParams) =>
    async function(dispatch: Dispatch<{}>): Promise<void> {
      dispatch(verifyTokenRequestSent());
      try {
        const response = await axios({
          method: "GET",
          url: `${authUrl}/validate_token`,
          params: verificationParams
        });
        setAuthHeaders(response.headers);
        persistAuthHeadersInDeviceStorage(Storage, response.headers);
        const userAttributesToSave = getUserAttributesFromResponse(
          userAttributes,
          response
        );
        dispatch(verifyTokenRequestSucceeded(userAttributesToSave));
      } catch (error) {
        dispatch(verifyTokenRequestFailed());
      }
    };

  const signInUser = (userSignInCredentials: UserSignInCredentials) =>
    async function(dispatch: Dispatch<{}>): Promise<void> {
      dispatch(signInRequestSent());
      const { email, password } = userSignInCredentials;
      try {
        const response = await axios({
          method: "POST",
          url: `${authUrl}/sign_in`,
          data: {
            email,
            password
          }
        });
        setAuthHeaders(response.headers);
        persistAuthHeadersInDeviceStorage(Storage, response.headers);
        const userAttributesToSave = getUserAttributesFromResponse(
          userAttributes,
          response
        );
        dispatch(signInRequestSucceeded(userAttributesToSave));
      } catch (error) {
        dispatch(signInRequestFailed(error));
      }
    };

  const signOutUser = () =>
    async function(dispatch: Dispatch<{}>): Promise<void> {
      const userSignOutCredentials: UserSignOutCredentials = {
        "access-token": (await Storage.getItem("access-token")) as string,
        client: (await Storage.getItem("client")) as string,
        uid: (await Storage.getItem("uid")) as string
      };
      dispatch(signOutRequestSent());
      try {
        await axios({
          method: "DELETE",
          url: `${authUrl}/sign_out`,
          data: userSignOutCredentials
        });
        deleteAuthHeaders();
        deleteAuthHeadersFromDeviceStorage(Storage);
        dispatch(signOutRequestSucceeded());
      } catch (error) {
        dispatch(signOutRequestFailed(error));
      }
    };

  const verifyCredentials = async (store: Store<{}>): Promise<void> => {
    if (await Storage.getItem("access-token")) {
      const verificationParams: VerificationParams = {
        "access-token": (await Storage.getItem("access-token")) as string,
        client: (await Storage.getItem("client")) as string,
        uid: (await Storage.getItem("uid")) as string
      };
      store.dispatch<any>(verifyToken(verificationParams));
    } else {
      store.dispatch(setHasVerificationBeenAttempted(true));
    }
  };

  return {
    registerUser,
    verifyToken,
    signInUser,
    signOutUser,
    verifyCredentials
  };
};

export default generateAuthActions;
