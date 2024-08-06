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
  },
});

export const { addPlaylist } = playlistSlice.actions;
export default playlistSlice.reducer;