import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setTrack, play, pause, togglePlayPause } from './playerSlice';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Button, TextField, IconButton, Select, MenuItem } from '@mui/material';

function Playlist({ playlists, createPlaylist, removeTrackFromPlaylist, updateTrackInfo, addTrackToPlaylist, searchQuery }) {
  const dispatch = useDispatch();
  const { currentTrack, isPlaying } = useSelector((state) => state.player);
  const [playlistName, setPlaylistName] = useState('');
  const [openEdit, setOpenEdit] = useState(false);
  const [openAdd, setOpenAdd] = useState(false);
  const [selectedTrack, setSelectedTrack] = useState(null);
  const [selectedPlaylist, setSelectedPlaylist] = useState('');
  const [selectedPlaylistName, setSelectedPlaylistName] = useState(null);
  const [newTrackName, setNewTrackName] = useState('');
  const [newArtistName, setNewArtistName] = useState('');

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
    setSelectedPlaylist((prevSelectedPlaylist) => {
      const updatedTracks = prevSelectedPlaylist?.tracks?.filter((track) => track.url !== trackUrl) || [];
      return { ...prevSelectedPlaylist, tracks: updatedTracks };
    });
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

  const handleClickOpenAdd = (track) => {
    setSelectedTrack(track);
    setOpenAdd(true);
  };

  const handleCloseAdd = () => {
    setOpenAdd(false);
    setSelectedTrack(null);
    setSelectedPlaylist('');
  };

  const handleAddToPlaylist = () => {
    if (selectedTrack && selectedPlaylist) {
      addTrackToPlaylist(selectedTrack, selectedPlaylist);
      handleCloseAdd();
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
      <h2>Playlists</h2>
      {!selectedPlaylistName ? (
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
                onClick={() => setSelectedPlaylistName(playlist.name)}
                style={{ cursor: 'pointer', padding: '10px', borderBottom: '1px solid #ccc' }}
              >
                {playlist.name}
              </li>
            ))}
          </ul>
        </>
      ) : (
        <div>
          <button onClick={() => setSelectedPlaylistName(null)}>Back to Playlists</button>
          <h3>{selectedPlaylistName}</h3>
          <ul>
            {filteredPlaylists.find((playlist) => playlist.name === selectedPlaylistName)?.tracks.map((track, trackIndex) => (
              <div
                key={trackIndex}
                onClick={() => handlePlayPause(track, trackIndex, selectedPlaylistName)}
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
                  <IconButton onClick={(e) => { e.stopPropagation(); handleRemoveTrack(selectedPlaylistName, track.url); }}>
                    <DeleteIcon />
                  </IconButton>
                  <IconButton onClick={(e) => { e.stopPropagation(); handleClickOpenEdit(track); }}>
                    <EditIcon />
                  </IconButton>
                  <IconButton onClick={(e) => { e.stopPropagation(); handleClickOpenAdd(track); }}>
                    <AddIcon />
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
          <Dialog open={openAdd} onClose={handleCloseAdd}>
            <DialogTitle>Add to Playlist</DialogTitle>
            <DialogContent>
              <DialogContentText>
                Select a playlist to add the track.
              </DialogContentText>
              <Select
                value={selectedPlaylist}
                onChange={(e) => setSelectedPlaylist(e.target.value)}
                fullWidth
              >
                {playlists.map((playlist, index) => (
                  <MenuItem key={index} value={playlist.name}>
                    {playlist.name}
                  </MenuItem>
                ))}
              </Select>
            </DialogContent>
            <DialogActions>
              <Button onClick={handleCloseAdd}>Cancel</Button>
              <Button onClick={handleAddToPlaylist} color="primary">Add</Button>
            </DialogActions>
          </Dialog>
        </div>
      )}
    </div>
  );
}

export default Playlist;
