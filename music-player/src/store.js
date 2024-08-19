import { configureStore } from '@reduxjs/toolkit';
import playerReducer from './playerSlice';
import { persistStore, persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import { createApi } from '@reduxjs/toolkit/query/react';
import { graphqlRequestBaseQuery } from '@rtk-query/graphql-request-base-query';
import authSlice, {registerSuccess} from './authSlice'; 

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
          if (result.data && result.data.register) {
            const loginResult = await dispatch(api.endpoints.login.initiate({ login, password })).unwrap();
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
      query: ({ avatarId }) => ({
        document: `
          mutation setAvatar($avatarId: ID!) {
            setAvatar(avatarId: $avatarId) {
              id
              avatars {
                url
              }
            }
          }
        `,
        variables: { avatarId }, 
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
    invalidatesTags: [{ type: 'Playlist', id: 'LIST' }], 
}),
    updatePlaylistTitle: builder.mutation({
      query: ({ id, title }) => ({
        document: `
          mutation updatePlaylist($id: ID!, $playlist: PlaylistInput!) {
            updatePlaylist(id: $id, playlist: $playlist) {
              id
              title
            }
          }
        `,
        variables: { id, playlist: { title } },
      }),
      invalidatesTags: [{ type: 'Playlist', id: 'LIST' }], 
    }),
    addTracksToLibrary: builder.mutation({
      query: (fileIds) => ({
        document: `
          mutation addTracksToLibrary($fileIds: [ID!]!) {
            addTracksToLibrary(fileIds: $fileIds) {
              id
              originalname
              url
            }
          }
        `,
        variables: { fileIds },
      }),
    }),
    deleteTrack: builder.mutation({
      query: ({ id }) => ({
        document: `
          mutation deleteTrack($id: ID!) {
            deleteTrack(id: $id) {
              id
            }
          }
        `,
        variables: { id },
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'Library', id }],
    }),
    addTracksToPlaylist: builder.mutation({
      query: ({ playlistId, fileIds }) => ({
        document: `
          mutation addTracksToPlaylist($playlistId: ID!, $fileIds: [ID!]!) {
            addTracksToPlaylist(playlistId: $playlistId, fileIds: $fileIds) {
              id
              title
              files {
                id
                originalname
              }
            }
          }
        `,
        variables: { playlistId, fileIds },
      }),
      invalidatesTags: [{ type: 'Playlist', id: 'LIST' }],
    }),
  deleteFile: builder.mutation({
      query: ({ id }) => ({
          document: `
              mutation deleteFile($id: ID!) {
                  deleteFile(id: $id) {
                      id
                  }
              }
          `,
          variables: { id },
      }),
      invalidatesTags: [{ type: 'File', id: 'LIST' }],
  }),
  uploadFile: builder.mutation({
      query: ({ file }) => ({
          document: `
              mutation uploadFile($file: Upload!) {
                  uploadFile(file: $file) {
                      id
                      originalname
                      artist
                      mimetype
                      url
                      size
                  }
              }
          `,
          variables: { file },
      }),
      invalidatesTags: [{ type: 'File', id: 'LIST' }],
  }),
  getPlaylists: builder.query({
    query: () => ({
      document: `
        query getPlaylists {
          getPlaylists {
            id
            title
            files {
              id
              originalname
              artist
              url
            }
          }
        }
      `,
    }),
    providesTags: (result) => {
      if (!result || !result.getPlaylists) {
        return [{ type: 'Playlist', id: 'LIST' }];
      }
      return [
        ...result.getPlaylists.map(({ id }) => ({ type: 'Playlist', id })),
        { type: 'Playlist', id: 'LIST' },
      ];
    },
  }),
  getFiles: builder.query({
    query: () => ({
      document: `
        query getFiles {
          getFiles {
            id
            originalname
            artist
            url
          }
        }
      `,
    }),
    providesTags: (result) =>
      result && result.getFiles
        ? [
            ...result.getFiles.map(({ id }) => ({ type: 'File', id })),
            { type: 'File', id: 'LIST' },
          ]
        : [{ type: 'File', id: 'LIST' }],
  }),  
  updateTrack: builder.mutation({
    query: ({ id, originalname, artist }) => ({
      document: `
        mutation updateTrack($id: ID!, $originalname: String!, $artist: String!) {
          updateTrack(id: $id, originalname: $originalname, artist: $artist) {
            id
            originalname
            artist
          }
        }
      `,
      variables: { id, originalname, artist },
    }),
    invalidatesTags: (result, error, { id }) => [{ type: 'Library', id }],
  }),
})
});

export const { useUploadAvatarMutation, 
  useSetUserNickMutation, 
  useAddPlaylistMutation, 
  useDeletePlaylistMutation, 
  useUpdatePlaylistTitleMutation, 
  useAddTracksToLibraryMutation, 
  useDeleteTrackMutation,
  useAddTracksToPlaylistMutation,
  useGetPlaylistsQuery,
  useGetFilesQuery, 
  useDeleteFileMutation, 
  useUploadFileMutation,
  useUpdateTrackMutation
} = api;

const store = configureStore({
  reducer: {
    player: playerReducer,
    [authSlice.name]: persistReducer({ key: 'auth', storage }, authSlice.reducer),
    [api.reducerPath]: api.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(api.middleware),
});

const persistor = persistStore(store);

export { store, persistor, api };

