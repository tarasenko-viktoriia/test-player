import React, { useState, useEffect } from 'react';
import { Provider, useDispatch, useSelector } from 'react-redux';
import { store } from './store';
import Library from './Library';
import Playlist from './Playlist';
import TrackUploader from './TrackUploader';
import Player from './Player';
import { setLibrary, setPlaylists, setTrack } from './playerSlice';
import './App.css'; // Импортируем стили

function App() {
  const [library, setLibraryState] = useState([]);
  const [playlists, setPlaylistsState] = useState([]);
  const [activeTab, setActiveTab] = useState('library');
  const [searchQuery, setSearchQuery] = useState('');
  const dispatch = useDispatch();
  const currentTrack = useSelector((state) => state.player.currentTrack);

  useEffect(() => {
    dispatch(setLibrary(library));
  }, [library, dispatch]);

  useEffect(() => {
    dispatch(setPlaylists(playlists));
  }, [playlists, dispatch]);

  const addTrackToLibrary = (track) => {
    setLibraryState([...library, track]);
  };

  const addTrackToPlaylist = (track, playlistName) => {
    setPlaylistsState((prevPlaylists) => {
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

  const removeTrackFromPlaylist = (playlistName, trackUrl) => {
    setPlaylistsState((prevPlaylists) => {
      const updatedPlaylists = prevPlaylists.map((playlist) => {
        if (playlist.name === playlistName) {
          return {
            ...playlist,
            tracks: playlist.tracks.filter((track) => track.url !== trackUrl),
          };
        }
        return playlist;
      });
      return updatedPlaylists;
    });
  };

  const createPlaylist = (name) => {
    setPlaylistsState([...playlists, { name, tracks: [] }]);
  };

  const updateTrackInfo = (url, newName, newArtist) => {
    setLibraryState((prevLibrary) => prevLibrary.map(track => {
      if (track.url === url) {
        const updatedTrack = { ...track, name: newName, artist: newArtist };
        if (currentTrack && currentTrack.url === url) {
          dispatch(setTrack({ track: updatedTrack, index: -1, context: 'library', playlist: null }));
        }
        return updatedTrack;
      }
      return track;
    }));
    setPlaylistsState((prevPlaylists) => prevPlaylists.map(playlist => ({
      ...playlist,
      tracks: playlist.tracks.map(track => {
        if (track.url === url) {
          const updatedTrack = { ...track, name: newName, artist: newArtist };
          if (currentTrack && currentTrack.url === url) {
            dispatch(setTrack({ track: updatedTrack, index: -1, context: 'playlist', playlist: null }));
          }
          return updatedTrack;
        }
        return track;
      })
    })));
  };

  const deleteTrack = (url) => {
    setLibraryState((prevLibrary) => prevLibrary.filter(track => track.url !== url));
    setPlaylistsState((prevPlaylists) => prevPlaylists.map(playlist => ({
      ...playlist,
      tracks: playlist.tracks.filter(track => track.url !== url)
    })));
  };

  const handleSearchChange = (event) => {
    setSearchQuery(event.target.value);
  };

  return (
    <Provider store={store}>
      <div className="App" style={{ display: 'flex', height: '100vh' }}>
        <div style={{ width: '200px', borderRight: '1px solid #ccc', padding: '10px' }}>
          <h1>Music Player</h1>
          <div onClick={() => setActiveTab('library')} style={{ cursor: 'pointer', padding: '10px', backgroundColor: activeTab === 'library' ? '#ddd' : 'transparent' }}>
            My Library
          </div>
          <div onClick={() => setActiveTab('playlists')} style={{ cursor: 'pointer', padding: '10px', backgroundColor: activeTab === 'playlists' ? '#ddd' : 'transparent' }}>
            Playlists
          </div>
        </div>
        <div style={{ flex: 1, padding: '10px' }}>
          <input
            type="text"
            value={searchQuery}
            onChange={handleSearchChange}
            placeholder="Search"
            style={{ width: '100%', padding: '10px', marginBottom: '10px' }}
          />
          {activeTab === 'library' ? (
            <>
              <TrackUploader addTrackToLibrary={addTrackToLibrary} />
              <Library
                library={library}
                addTrackToPlaylist={addTrackToPlaylist}
                updateTrackInfo={updateTrackInfo}
                deleteTrack={deleteTrack}
                playlists={playlists}
                searchQuery={searchQuery}
              />
            </>
          ) : (
            <Playlist
              playlists={playlists}
              createPlaylist={createPlaylist}
              removeTrackFromPlaylist={removeTrackFromPlaylist}
              updateTrackInfo={updateTrackInfo}
              searchQuery={searchQuery}
            />
          )}
        </div>
        <div style={{ width: '300px', borderLeft: '1px solid #ccc', padding: '10px' }}>
          <Player />
        </div>
      </div>
    </Provider>
  );
}

export default App;
