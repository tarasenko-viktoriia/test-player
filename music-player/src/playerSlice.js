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
    nextTrack: (state) => {
      const tracks = state.currentContext === 'library' ? state.library : (state.currentPlaylist?.tracks || []);
      if (tracks.length > 0) {
        const nextIndex = state.isShuffle
          ? Math.floor(Math.random() * tracks.length)
          : (state.currentIndex + 1) % tracks.length;
        state.currentTrack = tracks[nextIndex];
        state.currentIndex = nextIndex;
      }
    },
    previousTrack: (state) => {
      const tracks = state.currentContext === 'library' ? state.library : (state.currentPlaylist?.tracks || []);
      if (tracks.length > 0) {
        const prevIndex = state.isShuffle
          ? Math.floor(Math.random() * tracks.length)
          : (state.currentIndex - 1 + tracks.length) % tracks.length;
        state.currentTrack = tracks[prevIndex];
        state.currentIndex = prevIndex;
      }
    },
  },
});

export const { setTrack, play, pause, setLibrary, setPlaylists, togglePlayPause, setTrackProgress, toggleShuffle, setNormalMode, removeTrack, nextTrack, previousTrack } = playerSlice.actions;

export default playerSlice.reducer;
