import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setTrack, play, pause, togglePlayPause } from './playerSlice';
import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, IconButton, MenuItem, Select } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';

function Library({ library, addTrackToPlaylist, playlists }) {
  const dispatch = useDispatch();
  const { currentTrack, isPlaying } = useSelector((state) => state.player);
  const [open, setOpen] = useState(false);
  const [selectedTrack, setSelectedTrack] = useState(null);
  const [selectedPlaylist, setSelectedPlaylist] = useState('');

  const handlePlayPause = (track, index) => {
    if (currentTrack && currentTrack.url === track.url) {
      dispatch(togglePlayPause());
    } else {
      dispatch(pause());
      dispatch(setTrack({ track, index, context: 'library', playlist: null }));
      dispatch(play());
    }
  };

  const handleClickOpen = (track) => {
    setSelectedTrack(track);
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setSelectedTrack(null);
    setSelectedPlaylist('');
  };

  const handleAddToPlaylist = () => {
    if (selectedTrack && selectedPlaylist) {
      addTrackToPlaylist(selectedTrack, selectedPlaylist);
      handleClose();
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
            <IconButton onClick={(e) => { e.stopPropagation(); handleClickOpen(track); }}>
              <AddIcon />
            </IconButton>
          </div>
        ))}
      </ul>
      <Dialog open={open} onClose={handleClose}>
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
          <Button onClick={handleClose}>Cancel</Button>
          <Button onClick={handleAddToPlaylist} color="primary">Add</Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}

export default Library;
