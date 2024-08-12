import { createSlice } from '@reduxjs/toolkit';

const librarySlice = createSlice({
  name: 'library',
  initialState: [],
  reducers: {
    addTrack(state, action) {
      state.push(action.payload);
    },
  },
});

export const { addTrack } = librarySlice.actions;
export default librarySlice.reducer;