import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setTrack, play, pause, togglePlayPause } from './playerSlice';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Button, Select, MenuItem, TextField, IconButton } from '@mui/material';

function Playlist({ playlists, createPlaylist, removeTrackFromPlaylist }) {
  const dispatch = useDispatch();
  const { currentTrack, isPlaying } = useSelector((state) => state.player);
  const [playlistName, setPlaylistName] = useState('');

  const handleCreatePlaylist = () => {
    createPlaylist(playlistName);
    setPlaylistName('');
  };

  const handlePlayPause = (track, index, playlist) => {
    if (currentTrack && currentTrack.url === track.url) {
      dispatch(togglePlayPause());
    } else {
      dispatch(pause());
      dispatch(setTrack({ track, index, context: 'playlist', playlist }));
      dispatch(play());
    }
  };

  const handleRemoveTrack = (playlistName, trackUrl) => {
    removeTrackFromPlaylist(playlistName, trackUrl);
  };

  return (
    <div>
      <h2>Playlists</h2>
      <input
        type="text"
        value={playlistName}
        onChange={(e) => setPlaylistName(e.target.value)}
        placeholder="New Playlist Name"
      />
      <button onClick={handleCreatePlaylist}>Create Playlist</button>
      {playlists.map((playlist, index) => (
        <div key={index}>
          <h3>{playlist.name}</h3>
          <ul>
            {playlist.tracks.map((track, trackIndex) => (
              <div
                key={trackIndex}
                onClick={() => handlePlayPause(track, trackIndex, playlist)}
                style={{
                  border: '1px solid black',
                  padding: '10px',
                  margin: '10px 0',
                  cursor: 'pointer',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}
              >
                <div>
                  <strong>{track.name}</strong> by {track.artist}
                </div>
                <div>
                  {currentTrack && currentTrack.url === track.url && isPlaying ? 'Pause' : 'Play'}
                </div>
                <IconButton onClick={(e) => { e.stopPropagation(); handleRemoveTrack(playlist.name, track.url); }}>
                  <DeleteIcon />
                </IconButton>
              </div>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}

export default Playlist;
