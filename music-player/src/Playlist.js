import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setTrack, play, pause, togglePlayPause } from './playerSlice';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Button, TextField, IconButton } from '@mui/material';

function Playlist({ playlists, createPlaylist, removeTrackFromPlaylist, updateTrackInfo, searchQuery, deletePlaylist, updatePlaylistName }) {
  const dispatch = useDispatch();
  const { currentTrack, isPlaying } = useSelector((state) => state.player);
  const [playlistName, setPlaylistName] = useState('');
  const [newPlaylistName, setNewPlaylistName] = useState('');
  const [openEdit, setOpenEdit] = useState(false);
  const [openEditPlaylistName, setOpenEditPlaylistName] = useState(false);
  const [selectedTrack, setSelectedTrack] = useState(null);
  const [selectedPlaylist, setSelectedPlaylist] = useState(null);
  const [newTrackName, setNewTrackName] = useState('');
  const [newArtistName, setNewArtistName] = useState('');

  const handleCreatePlaylist = () => {
    createPlaylist(playlistName);
    setPlaylistName('');
  };

  const handleDeletePlaylist = (playlistName) => {
    deletePlaylist(playlistName);
    setSelectedPlaylist(null);
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
    setSelectedPlaylist((prevSelectedPlaylist) => ({
      ...prevSelectedPlaylist,
      tracks: prevSelectedPlaylist.tracks.filter((track) => track.url !== trackUrl),
    }));
  };

  const handleClickOpenEdit = (track) => {
    setSelectedTrack(track);
    setNewTrackName(track.name);
    setNewArtistName(track.artist);
    setOpenEdit(true);
  };

  const handleCloseEdit = () => {
    setOpenEdit(false);
    setSelectedTrack(null);
    setNewTrackName('');
    setNewArtistName('');
  };

  const handleUpdateTrackInfo = () => {
    if (selectedTrack) {
      updateTrackInfo(selectedTrack.url, newTrackName, newArtistName);
      handleCloseEdit();
    }
  };

  const handleOpenEditPlaylistName = (playlist) => {
    setSelectedPlaylist(playlist);
    setNewPlaylistName(playlist.name);
    setOpenEditPlaylistName(true);
  };

  const handleCloseEditPlaylistName = () => {
    setOpenEditPlaylistName(false);
    setSelectedPlaylist(null);
    setNewPlaylistName('');
  };

  const handleUpdatePlaylistName = () => {
    if (selectedPlaylist) {
      updatePlaylistName(selectedPlaylist.name, newPlaylistName);
      handleCloseEditPlaylistName();
    }
  };

  const filteredPlaylists = playlists.map((playlist) => ({
    ...playlist,
    tracks: playlist.tracks.filter(
      (track) =>
        track.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        track.artist.toLowerCase().includes(searchQuery.toLowerCase())
    ),
  }));

  return (
    <div>
      {!selectedPlaylist ? (
        <>
          <input
            type="text"
            value={playlistName}
            onChange={(e) => setPlaylistName(e.target.value)}
            placeholder="New Playlist Name"
          />
          <button onClick={handleCreatePlaylist}>Create Playlist</button>
          <ul>
            {filteredPlaylists.map((playlist, index) => (
              <li
                key={index}
                style={{ cursor: 'pointer', padding: '10px', borderBottom: '1px solid #ccc', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
              >
                <div onClick={() => setSelectedPlaylist(playlist)}>
                  {playlist.name}
                </div>
                <IconButton onClick={() => handleOpenEditPlaylistName(playlist)}>
                  <EditIcon />
                </IconButton>
                <IconButton onClick={() => handleDeletePlaylist(playlist.name)}>
                  <DeleteIcon />
                </IconButton>
              </li>
            ))}
          </ul>
        </>
      ) : (
        <div>
          <ArrowBackIcon onClick={() => setSelectedPlaylist(null)}/>
          <h3>{selectedPlaylist.name}</h3>
          <ul>
            {selectedPlaylist.tracks.map((track, trackIndex) => (
              <div
                key={trackIndex}
                onClick={() => handlePlayPause(track, trackIndex, selectedPlaylist)}
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
                <div>
                  <IconButton onClick={(e) => { e.stopPropagation(); handleRemoveTrack(selectedPlaylist.name, track.url); }}>
                    <DeleteIcon />
                  </IconButton>
                  <IconButton onClick={(e) => { e.stopPropagation(); handleClickOpenEdit(track); }}>
                    <EditIcon />
                  </IconButton>
                </div>
              </div>
            ))}
          </ul>
          <Dialog open={openEdit} onClose={handleCloseEdit}>
            <DialogTitle>Edit Track Info</DialogTitle>
            <DialogContent>
              <TextField
                margin="dense"
                label="Track Name"
                type="text"
                fullWidth
                value={newTrackName}
                onChange={(e) => setNewTrackName(e.target.value)}
              />
              <TextField
                margin="dense"
                label="Artist Name"
                type="text"
                fullWidth
                value={newArtistName}
                onChange={(e) => setNewArtistName(e.target.value)}
              />
            </DialogContent>
            <DialogActions>
              <Button onClick={handleCloseEdit}>Cancel</Button>
              <Button onClick={handleUpdateTrackInfo} color="primary">Save</Button>
            </DialogActions>
          </Dialog>

          <Dialog open={openEditPlaylistName} onClose={handleCloseEditPlaylistName}>
            <DialogTitle>Edit Playlist Name</DialogTitle>
            <DialogContent>
              <TextField
                margin="dense"
                label="New Playlist Name"
                type="text"
                fullWidth
                value={newPlaylistName}
                onChange={(e) => setNewPlaylistName(e.target.value)}
              />
            </DialogContent>
            <DialogActions>
              <Button onClick={handleCloseEditPlaylistName}>Cancel</Button>
              <Button onClick={handleUpdatePlaylistName} color="primary">Save</Button>
            </DialogActions>
          </Dialog>
        </div>
      )}
    </div>
  );
}

export default Playlist;
