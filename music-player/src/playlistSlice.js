import { createSlice } from '@reduxjs/toolkit';

const playlistSlice = createSlice({
  name: 'playlists',
  initialState: [],
  reducers: {
    addPlaylist: (state, action) => {
      state.push(action.payload);
    },
    removePlaylist: (state, action) => {
      return state.filter(playlist => playlist.id !== action.payload);
    },
    updatePlaylistTitle: (state, action) => {
      const { id, title } = action.payload;
      const playlist = state.find(playlist => playlist.id === id);
      if (playlist) {
        playlist.title = title;
      }
    },
  },
});

export const { addPlaylist } = playlistSlice.actions;
export default playlistSlice.reducer;