import React, { useState, useEffect } from 'react';
import { Provider, useDispatch, useSelector } from 'react-redux';
import { store } from './store';
import Library from './Library';
import Playlist from './Playlist';
import TrackUploader from './TrackUploader';
import Player from './Player';
import Login from './Login';
import { setLibrary, setPlaylists, setTrack } from './playerSlice';
import { useGetFilesQuery } from './store';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import './App.css';

function App() {
  const [library, setLibraryState] = useState([]);
  const [playlists, setPlaylistsState] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const dispatch = useDispatch();
  const currentTrack = useSelector((state) => state.player.currentTrack);
  const { refetch } = useGetFilesQuery();

  useEffect(() => {
    dispatch(setLibrary(library));
  }, [library, dispatch]);

  useEffect(() => {
    dispatch(setPlaylists(playlists));
  }, [playlists, dispatch]);

  const removeTrackFromPlaylist = (playlistTitle, trackUrl) => {
    setPlaylistsState((prevPlaylists) => {
      const updatedPlaylists = prevPlaylists.map((playlist) => {
        if (playlist.title === playlistTitle) {
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

  const updateTrackInfo = (url, newTitle, newArtist) => {
    setLibraryState((prevLibrary) => prevLibrary.map(track => {
      if (track.url === url) {
        const updatedTrack = { ...track, title: newTitle, artist: newArtist };
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
          const updatedTrack = { ...track, title: newTitle, artist: newArtist };
          if (currentTrack && currentTrack.url === url) {
            dispatch(setTrack({ track: updatedTrack, index: -1, context: 'playlist', playlist: null }));
          }
          return updatedTrack;
        }
        return track;
      })
    })));
  };

  const handleSearchChange = (event) => {
    setSearchQuery(event.target.value);
  };

  const handleTrackUploaded = (newTrack) => {
    refetch();
  }

  return (
    <Provider store={store}>
      <Router>
        <div className="app">
          <div className="sidebar-wrapper-left">
            <div className='sidebar-left'>
              <div className='logo-container'>
                <img src="../logo.png" alt="Logo"></img>
                <p>Bits</p>
              </div>
              <div className='sidebar-left-item'>
                <Link to="/library">
                  <img src="./image/music.png" alt="Frame 1" />
                  My Library
                </Link>
              </div>
              <div className='sidebar-left-item'>
                <Link to="/playlists">
                  <img src="./image/playlist.png" alt="Frame 2" />
                  Playlists
                </Link>
              </div>
            </div>
          </div>
          <div className="main-container">
            <div className="hero-container">
              <div className="input-container">
                <input
                  className="search-input"
                  type="text"
                  value={searchQuery}
                  onChange={handleSearchChange}
                  placeholder="Search"
                />
              </div>
              <Routes>
                <Route 
                  path="/library" 
                  element={
                    <Library
                      library={library}
                      updateTrackInfo={updateTrackInfo}
                      playlists={playlists}
                      searchQuery={searchQuery}
                    />
                  } 
                />
                <Route 
                  path="/playlists" 
                  element={
                    <Playlist
                      playlists={playlists}
                      removeTrackFromPlaylist={removeTrackFromPlaylist}
                      updateTrackInfo={updateTrackInfo}
                      searchQuery={searchQuery}
                    />
                  } 
                />
              </Routes>
            </div>
          </div>
          <div className="sidebar-wrapper-right">
            <div className='sidebar-right'>
              <Login/>
              <Player />
              <TrackUploader className="dropzone" onTrackUploaded={handleTrackUploaded} />
            </div>
          </div>
        </div>
      </Router>
    </Provider>
  );
}

export default App;
