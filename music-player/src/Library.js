import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setTrack, play, pause, togglePlayPause, removeTrack } from './playerSlice';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import PauseIcon from '@mui/icons-material/Pause';
import { Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Button, Select, MenuItem, TextField, IconButton } from '@mui/material';
import { useDeleteTrackMutation, useAddTracksToPlaylistMutation, useGetPlaylistsQuery, useGetFilesQuery } from './store';

function Library({ updateTrackInfo, searchQuery }) {
  const dispatch = useDispatch();
  const { currentTrack, isPlaying } = useSelector((state) => state.player);
  const [openAdd, setOpenAdd] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);
  const [selectedTrack, setSelectedTrack] = useState(null);
  const [selectedPlaylist, setSelectedPlaylist] = useState('');
  const [newTrackTitle, setNewTrackTitle] = useState('');
  const [newArtistName, setNewArtistName] = useState('');
  const [deleteTrack] = useDeleteTrackMutation();
  const [addTracksToPlaylist] = useAddTracksToPlaylistMutation();
  const { data: libraryData = {}, isLoading } = useGetFilesQuery();
  const { data: playlistsData = [], isLoading: isLoadingPlaylists } = useGetPlaylistsQuery();

  const library = libraryData.getFiles || [];
  const playlists = playlistsData.getPlaylists || [];

  const filteredLibrary = library.filter((track) =>
    track.originalname.toLowerCase().includes(searchQuery.toLowerCase())
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

  const handleAddToPlaylist = async () => {
    if (selectedTrack && selectedPlaylist) {
      try {
        await addTracksToPlaylist({
          playlistId: selectedPlaylist,
          fileIds: [selectedTrack.id],
        }).unwrap();
        handleCloseAdd();
      } catch (error) {
        console.error('Failed to add track to playlist:', error);
      }
    }
  };

  const handleClickOpenEdit = (track) => {
    setSelectedTrack(track);
    setNewTrackTitle(track.originalname);
    setNewArtistName(track.artist || "Unknown Artist");
    setOpenEdit(true);
  };

  const handleCloseEdit = () => {
    setOpenEdit(false);
    setSelectedTrack(null);
    setNewTrackTitle('');
    setNewArtistName('');
  };

  const handleUpdateTrackInfo = () => {
    if (selectedTrack) {
      updateTrackInfo(selectedTrack.url, newTrackTitle, newArtistName);
      handleCloseEdit();
    }
  };

  const handleDeleteTrack = async (trackId) => {
    try {
      await deleteTrack({ id: trackId }).unwrap();
      dispatch(removeTrack(trackId));
    } catch (error) {
      console.error('Failed to delete track:', error);
    }
  };

  return (
    <div className='track-container'>
      {isLoading && <p>Loading tracks...</p>}
      {isLoadingPlaylists && <p>Loading playlists...</p>}
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
            <strong>{track.originalname}</strong>
            <strong className='artist'>{track.artist || 'Unknown Artist'}</strong>
          </div>
          <div className='track-controls'>
            <IconButton onClick={(e) => { e.stopPropagation(); handleClickOpenAdd(track); }}>
              <AddIcon className='icon-button' />
            </IconButton>
            <IconButton onClick={(e) => { e.stopPropagation(); handleClickOpenEdit(track); }}>
              <EditIcon className='icon-button'/>
            </IconButton>
            <IconButton onClick={(e) => { e.stopPropagation(); handleDeleteTrack(track.id); }}>
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
           {playlists.map((playlist) => (
             <MenuItem key={playlist.id} value={playlist.id}>
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
            label="Track Title"
            type="text"
            fullWidth
            value={newTrackTitle}
            onChange={(e) => setNewTrackTitle(e.target.value)}
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
