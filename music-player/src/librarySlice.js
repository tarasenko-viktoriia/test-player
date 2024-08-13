import { createSlice } from '@reduxjs/toolkit';

const librarySlice = createSlice({
  name: 'library',
  initialState: [],
  reducers: {
    addTrack(state, action) {
      state.push(action.payload);
    },
    removeTrack: (state, action) => state.filter(track => track.id !== action.payload),
  },
});

export const { addTrack, removeTrack } = librarySlice.actions;
export default librarySlice.reducer;