import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  currentTrack: null,
  isPlaying: false,
  library: [],
  playlists: [],
  currentIndex: 0, 
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
    nextTrack: (state) => {
      const trackList = state.currentContext === 'library' 
        ? state.currentPlaylist.tracks 
        : state.currentPlaylist?.tracks || [];
      if (trackList.length > 0) {
        const nextIndex = state.isShuffle
          ? Math.floor(Math.random() * trackList.length)
          : (state.currentIndex + 1) % trackList.length;
        state.currentTrack = trackList[nextIndex];
        state.currentIndex = nextIndex;
      }
    },
    previousTrack: (state) => {
      const trackList = state.currentContext === 'library' 
        ? state.currentPlaylist.tracks 
        : state.currentPlaylist?.tracks || [];
      if (trackList.length > 0) {
        const prevIndex = state.isShuffle
          ? Math.floor(Math.random() * trackList.length)
          : (state.currentIndex - 1 + trackList.length) % trackList.length;
        state.currentTrack = trackList[prevIndex];
        state.currentIndex = prevIndex;
      }
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
  },
});

export const {
  setTrack,
  play,
  pause,
  setLibrary,
  setPlaylists,
  togglePlayPause,
  setTrackProgress,
  toggleShuffle,
  setNormalMode,
  removeTrack,
  nextTrack,
  previousTrack,
} = playerSlice.actions;

export default playerSlice.reducer;
