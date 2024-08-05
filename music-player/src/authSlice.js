import { createSlice } from '@reduxjs/toolkit';

function jwtDecode(token) {
    try {
      const [, data] = token.split('.');
      const json = atob(data);
      const result = JSON.parse(json);
      return result;
    } catch (e) {
      console.error('Failed to decode JWT:', e);
      return null;
    }
  }
  
const authSlice = createSlice({
    name: 'auth',
    initialState: { token: null, payload: { sub: {} }, profile: null },
    reducers: {
      login(state, { payload: token }) {
        const decoded = jwtDecode(token);
        if (decoded) {
          state.payload = { sub: { id: decoded.userId, login: decoded.login } };
          state.token = token;
        }
      },
      logout(state) {
        state.payload = { sub: {} };
        state.token = null;
        state.profile = null;
      },
      setProfile(state, { payload }) {
        if (payload.avatar) {
          state.profile = { ...state.profile, avatar: payload.avatar };
        }
        if (payload.nick) {
          state.payload = { ...state.payload, sub: { ...state.payload.sub, nick: payload.nick } };
        }
      },
      registerSuccess(state, { payload: token }) {
        const decoded = jwtDecode(token);
        if (decoded) {
          state.payload = { sub: { id: decoded.id, login: decoded.login } };
          state.token = token;
        }
      },
    },
  });
  
  
  export const { login, logout, registerSuccess, setProfile } = authSlice.actions;
  export default authSlice;
  