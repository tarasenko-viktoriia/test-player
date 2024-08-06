import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setTrack, play, pause, togglePlayPause } from './playerSlice';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import PauseIcon from '@mui/icons-material/Pause';
import { Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Button, Select, MenuItem, TextField, IconButton } from '@mui/material';

function Library({ library, addTrackToPlaylist, updateTrackInfo, deleteTrack, playlists, searchQuery }) {
  const dispatch = useDispatch();
  const { currentTrack, isPlaying } = useSelector((state) => state.player);
  const [openAdd, setOpenAdd] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);
  const [selectedTrack, setSelectedTrack] = useState(null);
  const [selectedPlaylist, setSelectedPlaylist] = useState('');
  const [newTrackName, setNewTrackName] = useState('');
  const [newArtistName, setNewArtistName] = useState('');

  const filteredLibrary = library.filter((track) =>
    track.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    track.artist.toLowerCase().includes(searchQuery.toLowerCase())
  );

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

  const handleDeleteTrack = (trackUrl) => {
    deleteTrack(trackUrl);
  };

  return (
    <div className='track-container'>
      {filteredLibrary.map((track, index) => (
        <div 
          className={`track ${currentTrack && currentTrack.url === track.url && isPlaying ? 'playing' : ''}`} 
          key={index} 
          onClick={() => handlePlayPause(track, index)}
        >
          <span className='play-pause-button'>
            {currentTrack && currentTrack.url === track.url && isPlaying ? <PauseIcon/> : <PlayArrowIcon/>}
          </span>
          <div className='track-info'>
            <strong>{track.name}</strong> by {track.artist}
          </div>
          <div className='track-controls'>
            <IconButton onClick={(e) => { e.stopPropagation(); handleClickOpenAdd(track); }}>
              <AddIcon className='icon-button' />
            </IconButton>
            <IconButton onClick={(e) => { e.stopPropagation(); handleClickOpenEdit(track); }}>
              <EditIcon className='icon-button'/>
            </IconButton>
            <IconButton onClick={(e) => { e.stopPropagation(); handleDeleteTrack(track.url); }}>
              <DeleteIcon className='icon-button'/>
            </IconButton>
          </div>
        </div>
      ))}
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
              <MenuItem key={index} value={playlist.title}>
                {playlist.title}
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