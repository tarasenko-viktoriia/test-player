import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  currentTrack: null,
  isPlaying: false,
  audio: null,
  library: [],
  currentIndex: -1,
};

const playerSlice = createSlice({
  name: 'player',
  initialState,
  reducers: {
    setTrack: (state, action) => {
      if (state.audio) {
        state.audio.pause();
      }
      state.currentTrack = action.payload.track;
      state.currentIndex = action.payload.index;
      state.audio = new Audio(action.payload.track.url);
    },
    play: (state) => {
      if (state.audio) {
        state.audio.play();
        state.isPlaying = true;
      }
    },
    pause: (state) => {
      if (state.audio) {
        state.audio.pause();
        state.isPlaying = false;
      }
    },
    setLibrary: (state, action) => {
      state.library = action.payload;
    },
    nextTrack: (state) => {
      if (state.currentIndex < state.library.length - 1) {
        state.currentIndex += 1;
        state.currentTrack = state.library[state.currentIndex];
        if (state.audio) {
          state.audio.pause();
        }
        state.audio = new Audio(state.currentTrack.url);
        if (state.isPlaying) {
          state.audio.play();
        }
      }
    },
    prevTrack: (state) => {
      if (state.currentIndex > 0) {
        state.currentIndex -= 1;
        state.currentTrack = state.library[state.currentIndex];
        if (state.audio) {
          state.audio.pause();
        }
        state.audio = new Audio(state.currentTrack.url);
        if (state.isPlaying) {
          state.audio.play();
        }
      }
    },
    togglePlayPause: (state) => {
      if (state.audio) {
        if (state.isPlaying) {
          state.audio.pause();
          state.isPlaying = false;
        } else {
          state.audio.play();
          state.isPlaying = true;
        }
      }
    },
  },
});

export const { setTrack, play, pause, setLibrary, nextTrack, prevTrack, togglePlayPause } = playerSlice.actions;

export default playerSlice.reducer;
