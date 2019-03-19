import { ReduxTokenAuthState } from './types';

const initialState: ReduxTokenAuthState = {
  currentUser: {
    isSignedIn: false,
    isLoading: false,
    hasVerificationBeenAttempted: false,
    attributes: {},
    error: undefined
  }
};

export default initialState;
