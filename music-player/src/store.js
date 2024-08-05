import { configureStore } from '@reduxjs/toolkit';
import playerReducer from './playerSlice';
import { persistStore, persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import { createApi } from '@reduxjs/toolkit/query/react';
import { graphqlRequestBaseQuery } from '@rtk-query/graphql-request-base-query';
import authSlice, {registerSuccess} from './authSlice'; 
import playlistReducer from './playlistSlice';

export const actionFullLogin = ({ login, password }) => async (dispatch) => {
  try {
    const token = await dispatch(api.endpoints.login.initiate({ login, password }));
    if (token?.data?.login) {
      dispatch(authSlice.actions.login(token.data.login));
      await dispatch(actionAboutMe());
    }
  } catch (error) {
    console.error('Login failed:', error);
  }
};

const actionAboutMe = () => async (dispatch, getState) => {
  const { auth } = getState();
  if (auth.payload) {
    const { id } = auth.payload.sub;
    await dispatch(api.endpoints.getUserById.initiate({ _id: id }));
  }
};

const api = createApi({
  baseQuery: graphqlRequestBaseQuery({
    url: 'http://localhost:4000/graphql',
    prepareHeaders(headers, { getState }) {
      const { token } = getState().auth;
      if (token) {
        headers.set('Authorization', `Bearer ${token}`);
      }
      return headers;
    },
  }),
  endpoints: (builder) => ({
    login: builder.mutation({
      query: ({ login, password }) => ({
        document: `
          query login($login: String!, $password: String!) {
            login(login: $login, password: $password) 
          }
        `,
        variables: { login, password },
      }),
    }),
    getUserById: builder.query({
      query: ({ _id }) => ({
        document: `
          query getUser($id: ID!) {
            getUser(id: $id) {
              id
              login
              nick
              avatar
            }
          }
        `,
        variables: { id: _id },
      }),
    }),
    setUserNick: builder.mutation({
      query: ({ id, nick }) => ({
        document: `
          mutation updateUserNick($id: ID!, $nick: String!) {
            updateUserNick(id: $id, nick: $nick) {
              id
              nick
            }
          }
        `,
        variables: { id, nick },
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'User', id }],
    }),
    registerUser: builder.mutation({
      query: ({ login, password }) => ({
        document: `
        mutation register($login: String!, $password: String!) {
          register(login: $login, password: $password) {
            id
            login
            nick
          }
        }
        `,
        variables: { login, password },
      }),
      async onQueryStarted({ login, password }, { dispatch, queryFulfilled }) {
        try {
          const result = await queryFulfilled;
          console.log('Registration result:', result);
          if (result.data && result.data.createUser) {
            const loginResult = await dispatch(api.endpoints.login.initiate({ login, password })).unwrap();
            console.log('Login result:', loginResult);
            if (loginResult?.login) {
              dispatch(registerSuccess(loginResult.login));
              await dispatch(actionAboutMe());
            }
          }
        } catch (error) {
          console.error('Registration or login error:', error);
        }
      },
    }),
    uploadAvatar: builder.mutation({
      query: ({ _id, avatar }) => ({
        document: `
          mutation uploadAvatar($_id: String!, $avatar: ImageInput!) {
            UserUpsert(user: { _id: $_id, avatar: $avatar }) {
              _id
              avatar {
                url
              }
            }
          }
        `,
        variables: { _id, avatar },
      }),
      invalidatesTags: (result, error, { _id }) => [{ type: 'User', id: _id }],
    }),
    addPlaylist: builder.mutation({
      query: ({ title, fileIds }) => ({
        document: `
          mutation addPlaylist($playlist: PlaylistInput!) {
            addPlaylist(playlist: $playlist) {
              id
              title
            }
          }
        `,
        variables: { playlist: { title, fileIds } },
      }),
      invalidatesTags: [{ type: 'Playlist', id: 'LIST' }],
    }),
    deletePlaylist: builder.mutation({
      query: ({ id }) => ({
        document: `
          mutation deletePlaylist($id: ID!) {
            deletePlaylist(id: $id) {
              id
            }
          }
        `,
        variables: { id },
  }),
  invalidatesTags: (result, error, { id }) => [{ type: 'Playlist', id }],
    }),
  }),
});

export const { useUploadAvatarMutation, useSetUserNickMutation, useAddPlaylistMutation, useDeletePlaylistMutation,} = api;

const store = configureStore({
  reducer: {
    player: playerReducer,
    [authSlice.name]: persistReducer({ key: 'auth', storage }, authSlice.reducer),
    [api.reducerPath]: api.reducer,
    playlists: playlistReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(api.middleware),
});

const persistor = persistStore(store);

export { store, persistor, api };

