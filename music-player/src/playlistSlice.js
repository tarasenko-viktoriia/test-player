import { createSlice } from '@reduxjs/toolkit';

const playlistSlice = createSlice({
  name: 'playlists',
  initialState: [],
  reducers: {
    addPlaylist: (state, action) => {
      state.push(action.payload);
    },
  },
});

export const { addPlaylist } = playlistSlice.actions;
export default playlistSlice.reducer;