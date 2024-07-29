import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  currentTrack: null,
  isPlaying: false,
  audio: null,
  library: [],
  playlists: [],
  currentIndex: -1,
  currentContext: 'library', // 'library' or 'playlist'
  currentPlaylist: null,
  trackProgress: 0, // добавлено состояние для отслеживания прогресса трека
  isShuffle: false, // добавлено состояние для режима случайного воспроизведения
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
      state.currentContext = action.payload.context;
      state.currentPlaylist = action.payload.playlist;
      state.audio = new Audio(action.payload.track.url);
      if (state.isPlaying) {
        state.audio.play();
      }
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
    setPlaylists: (state, action) => {
      state.playlists = action.payload;
    },
    nextTrack: (state) => {
      const context = state.currentContext === 'library' ? state.library : state.currentPlaylist.tracks;
      if (state.isShuffle) {
        state.currentIndex = Math.floor(Math.random() * context.length);
      } else {
        if (state.currentIndex < context.length - 1) {
          state.currentIndex += 1;
        }
      }
      state.currentTrack = context[state.currentIndex];
      if (state.audio) {
        state.audio.pause();
      }
      state.audio = new Audio(state.currentTrack.url);
      if (state.isPlaying) {
        state.audio.play();
      }
    },
    prevTrack: (state) => {
      const context = state.currentContext === 'library' ? state.library : state.currentPlaylist.tracks;
      if (state.currentIndex > 0) {
        state.currentIndex -= 1;
        state.currentTrack = context[state.currentIndex];
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
    setTrackProgress: (state, action) => {
      state.trackProgress = action.payload;
      if (state.audio) {
        state.audio.currentTime = action.payload;
      }
    },
    toggleShuffle: (state) => {
      state.isShuffle = !state.isShuffle;
    },
    setNormalMode: (state) => {
      state.isShuffle = false;
    },
  },
});

export const { setTrack, play, pause, setLibrary, setPlaylists, nextTrack, prevTrack, togglePlayPause, setTrackProgress, toggleShuffle, setNormalMode } = playerSlice.actions;

export default playerSlice.reducer;
