import * as destiny from 'src/lib/destiny';
import { makePayloadAction } from './utils';

export const GET_PROFILE_SUCCESS = 'Get profile - success';
export const GET_PROFILE_ERROR = 'Get profile - error';
const SET_ACTIVE_PROFILE = 'Set active profile';

const INITIAL_STATE = {};

const k = ({ membershipType, membershipId }) =>
  [membershipType, membershipId].join('/');

export default function profilesReducer(
  state = INITIAL_STATE,
  { type, payload }
) {
  switch (type) {
    case GET_PROFILE_SUCCESS: {
      return {
        ...state,
        [k(payload.profile.data.userInfo)]: payload
      };
    }

    case SET_ACTIVE_PROFILE: {
      return {
        ...state,
        $activeProfile: payload
      };
    }

    default:
      return state;
  }
}

export const getProfileSuccess = makePayloadAction(GET_PROFILE_SUCCESS);
export const getProfileError = makePayloadAction(GET_PROFILE_ERROR);

export const setActiveProfile = makePayloadAction(SET_ACTIVE_PROFILE);

export function getProfile({ membershipType, membershipId }) {
  return (dispatch, getState) => {
    const state = getState();
    const prevProfile = state.profiles[k({ membershipType, membershipId })];

    if (prevProfile) {
      return Promise.resolve(prevProfile);
    }

    return destiny
      .getProfile({ membershipType, membershipId }, state.auth.accessToken)
      .then(data => {
        dispatch(getProfileSuccess(data));
        return data;
      })
      .catch(err => dispatch(getProfileError(err)));
  };
}
