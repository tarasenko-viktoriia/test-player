import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setTrack, play, pause, togglePlayPause } from './playerSlice';
import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, IconButton, MenuItem, Select, TextField } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';

function Library({ library, addTrackToPlaylist, updateTrackInfo, playlists }) {
  const dispatch = useDispatch();
  const { currentTrack, isPlaying } = useSelector((state) => state.player);
  const [openAdd, setOpenAdd] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);
  const [selectedTrack, setSelectedTrack] = useState(null);
  const [selectedPlaylist, setSelectedPlaylist] = useState('');
  const [newTrackName, setNewTrackName] = useState('');
  const [newArtistName, setNewArtistName] = useState('');

  const handlePlayPause = (track, index) => {
    if (currentTrack && currentTrack.url === track.url) {
      dispatch(togglePlayPause());
    } else {
      dispatch(pause());
      dispatch(setTrack({ track, index, context: 'library', playlist: null }));
      dispatch(play());
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

  return (
    <div>
      <h2>My Library</h2>
      <ul>
        {library.map((track, index) => (
          <div
            key={index}
            onClick={() => handlePlayPause(track, index)}
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
              <IconButton onClick={(e) => { e.stopPropagation(); handleClickOpenAdd(track); }}>
                <AddIcon />
              </IconButton>
              <IconButton onClick={(e) => { e.stopPropagation(); handleClickOpenEdit(track); }}>
                <EditIcon />
              </IconButton>
            </div>
          </div>
        ))}
      </ul>
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
    </div>
  );
}

export default Library;
