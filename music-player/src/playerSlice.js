import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  currentTrack: null,
  isPlaying: false,
  library: [], 
  playlists: [],
  currentIndex: -1,
  currentContext: 'library', 
  currentPlaylist: null,
  trackProgress: 0, 
  isShuffle: false, 
};

const playerSlice = createSlice({
  name: 'player',
  initialState,
  reducers: {
    setTrack: (state, action) => {
      state.currentTrack = action.payload.track;
      state.currentIndex = action.payload.index;
      state.currentContext = action.payload.context;
      state.currentPlaylist = action.payload.playlist;
    },
    play: (state) => {
      state.isPlaying = true;
    },
    pause: (state) => {
      state.isPlaying = false;
    },
    setLibrary: (state, action) => {
      state.library = action.payload;
    },
    setPlaylists: (state, action) => {
      state.playlists = action.payload;
    },
    nextTrack: (state) => {
      const context = state.currentContext === 'library' ? state.library : state.currentPlaylist.tracks;
      if (state.isShuffle) {
        state.currentIndex = Math.floor(Math.random() * context.length);
      } else {
        state.currentIndex = (state.currentIndex + 1) % context.length;
      }
      state.currentTrack = context[state.currentIndex];
    },
    prevTrack: (state) => {
      const context = state.currentContext === 'library' ? state.library : state.currentPlaylist.tracks;
      if (state.currentIndex > 0) {
        state.currentIndex -= 1;
      } else {
        state.currentIndex = context.length - 1;
      }
      state.currentTrack = context[state.currentIndex];
    },
    togglePlayPause: (state) => {
      state.isPlaying = !state.isPlaying;
    },
    setTrackProgress: (state, action) => {
      state.trackProgress = action.payload;
    },
    toggleShuffle: (state) => {
      state.isShuffle = !state.isShuffle;
    },
    setNormalMode: (state) => {
      state.isShuffle = false;
    },
    removeTrack: (state, action) => {
      state.library = state.library.filter(track => track.id !== action.payload);
    },
  },
});

export const { setTrack, play, pause, setLibrary, setPlaylists, nextTrack, prevTrack, togglePlayPause, setTrackProgress, toggleShuffle, setNormalMode, removeTrack } = playerSlice.actions;

export default playerSlice.reducer;
