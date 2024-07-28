import React, { useState, useEffect } from 'react';
import { Provider, useDispatch } from 'react-redux';
import { store } from './store';
import Library from './Library';
import Playlist from './Playlist';
import TrackUploader from './TrackUploader';
import Player from './Player';
import { setLibrary } from './playerSlice';

function App() {
  const [library, setLibraryState] = useState([]);
  const [playlists, setPlaylists] = useState([]);
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(setLibrary(library));
  }, [library, dispatch]);

  const addTrackToLibrary = (track) => {
    setLibraryState([...library, track]);
  };

  const addTrackToPlaylist = (track, playlistName) => {
    setPlaylists((prevPlaylists) => {
      const updatedPlaylists = prevPlaylists.map((playlist) => {
        if (playlist.name === playlistName) {
          return {
            ...playlist,
            tracks: [...playlist.tracks, track],
          };
        }
        return playlist;
      });
      return updatedPlaylists;
    });
  };

  const createPlaylist = (name) => {
    setPlaylists([...playlists, { name, tracks: [] }]);
  };

  return (
    <Provider store={store}>
      <div className="App">
        <h1>Music Player</h1>
        <TrackUploader addTrackToLibrary={addTrackToLibrary} />
        <Library library={library} addTrackToPlaylist={addTrackToPlaylist} playlists={playlists} />
        <Playlist playlists={playlists} createPlaylist={createPlaylist} />
        <Player />
      </div>
    </Provider>
  );
}

export default App;
