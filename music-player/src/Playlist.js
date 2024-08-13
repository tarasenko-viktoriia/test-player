import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setTrack, play, pause, togglePlayPause } from './playerSlice';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import PauseIcon from '@mui/icons-material/Pause';
import { Dialog, DialogActions, DialogContent, DialogTitle, Button, TextField, IconButton } from '@mui/material';
import { useAddPlaylistMutation, useDeletePlaylistMutation, useUpdatePlaylistTitleMutation, useGetPlaylistsQuery } from './store'; // <-- додано імпорт

function Playlist({ removeTrackFromPlaylist, updateTrackInfo, searchQuery }) {
  const dispatch = useDispatch();
  const { currentTrack, isPlaying } = useSelector((state) => state.player);
  const userId = useSelector((state) => state.auth.payload?.sub?.id); // <-- отримання userId
  const [playlistTitle, setPlaylistTitle] = useState('');
  const [newPlaylistTitle, setNewPlaylistTitle] = useState('');
  const [openEdit, setOpenEdit] = useState(false);
  const [openEditPlaylistTitle, setOpenEditPlaylistTitle] = useState(false);
  const [selectedTrack, setSelectedTrack] = useState(null);
  const [selectedPlaylist, setSelectedPlaylist] = useState(null);
  const [newTrackTitle, setNewTrackTitle] = useState('');
  const [newArtistName, setNewArtistName] = useState('');
  const [openCreateDialog, setOpenCreateDialog] = useState(false);

  const [addPlaylist, { data: newPlaylistData }] = useAddPlaylistMutation();
  const [deletePlaylist] = useDeletePlaylistMutation();
  const [updatePlaylistTitle] = useUpdatePlaylistTitleMutation();
  
  const { data: playlistsData, error, isLoading } = useGetPlaylistsQuery(userId); // <-- передача userId

  useEffect(() => {
    if (newPlaylistData) {
      dispatch({ type: 'playlists/addPlaylist', payload: newPlaylistData.addPlaylist });
    }
  }, [newPlaylistData, dispatch]);

  const handleCreatePlaylist = async () => {
    await addPlaylist({ title: playlistTitle });
    setPlaylistTitle('');
    setOpenCreateDialog(false);
  };

  const handleDeletePlaylist = async (playlistId) => {
    await deletePlaylist({ id: playlistId });
    dispatch({ type: 'playlists/removePlaylist', payload: playlistId });
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

  const handleRemoveTrack = (playlistTitle, trackUrl) => {
    removeTrackFromPlaylist(playlistTitle, trackUrl);
    setSelectedPlaylist((prevSelectedPlaylist) => ({
      ...prevSelectedPlaylist,
      tracks: prevSelectedPlaylist.tracks.filter((track) => track.url !== trackUrl),
    }));
  };

  const handleClickOpenEdit = (track) => {
    setSelectedTrack(track);
    setNewTrackTitle(track.title);
    setNewArtistName(track.artist);
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

  const handleOpenEditPlaylistTitle = (playlist) => {
    setSelectedPlaylist(playlist);
    setNewPlaylistTitle(playlist.title);
    setOpenEditPlaylistTitle(true);
  };

  const handleCloseEditPlaylistTitle = () => {
    setOpenEditPlaylistTitle(false);
    setSelectedPlaylist(null);
    setNewPlaylistTitle('');
  };

  const handleUpdatePlaylistTitle = async () => {
    if (selectedPlaylist) {
      await updatePlaylistTitle({ id: selectedPlaylist.id, title: newPlaylistTitle });
      dispatch({
        type: 'playlists/updatePlaylistTitle',
        payload: { id: selectedPlaylist.id, title: newPlaylistTitle },
      });
      handleCloseEditPlaylistTitle();
    }
  };

  if (isLoading) {
    return <div>Loading playlists...</div>;
  }

  if (error) {
    return <div>Error loading playlists: {error.message}</div>;
  }

  const filteredPlaylists = playlistsData?.getPlaylists?.map((playlist) => ({
    ...playlist,
    tracks: playlist.files?.filter(
      (track) =>
        track.originalname.toLowerCase().includes(searchQuery.toLowerCase())
    ),
  })) || [];

  return (
    <div style={{ width: '100%' }}>
      {!selectedPlaylist ? (
        <>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '18px', fontFamily:'Poppins'}}>
              <div style={{fontWeight: '500'}}>My Playlists</div>
              <IconButton onClick={() => setOpenCreateDialog(true)}>
                <AddIcon style={{ color: 'white', width: '40px', height: '40px' }} />
              </IconButton>
          </div>
          {filteredPlaylists.map((playlist, index) => (
            <div className='playlist' key={index} onClick={() => setSelectedPlaylist(playlist)}>
            <div>
              {playlist.title}
            </div>
            <div className='track-controls'>
              <IconButton onClick={(e) => { e.stopPropagation(); handleOpenEditPlaylistTitle(playlist); }}>
                <EditIcon style={{ color: 'white' }} />
              </IconButton>
              <IconButton onClick={(e) => { e.stopPropagation(); handleDeletePlaylist(playlist.id); }}>
                <DeleteIcon style={{ color: 'white' }} />
              </IconButton>
            </div>
          </div>
          ))}

          <Dialog open={openCreateDialog} onClose={() => setOpenCreateDialog(false)}>
            <div className='create-playlist-dialog'>
              <DialogTitle>Create New Playlist</DialogTitle>
              <DialogContent>
                <TextField
                  margin="dense"
                  label="New Playlist Title"
                  type="text"
                  fullWidth
                  value={playlistTitle}
                  onChange={(e) => setPlaylistTitle(e.target.value)}
                />
              </DialogContent>
              <DialogActions>
                <Button onClick={() => setOpenCreateDialog(false)}>Cancel</Button>
                <Button onClick={handleCreatePlaylist} color="primary">Create</Button>
              </DialogActions>
            </div>
          </Dialog>
        </>
      ) : (
        <div className='playlist-container'>
          <ArrowBackIcon onClick={() => setSelectedPlaylist(null)} />
          <h3>{selectedPlaylist.title}</h3>
          {selectedPlaylist.tracks?.map((track, trackIndex) => (
            <div className={`track ${currentTrack && currentTrack.url === track.url && isPlaying ? 'playing' : ''}`}
              key={trackIndex}
              onClick={() => handlePlayPause(track, trackIndex, selectedPlaylist)}
            >
              <span className='play-pause-button'>
                {currentTrack && currentTrack.url === track.url && isPlaying ? <PauseIcon /> : <PlayArrowIcon />}
              </span>
              <div className='track-info'>
                <strong>{track.originalname}</strong>
              </div>
              <div className='track-controls'>
                <IconButton onClick={(e) => { e.stopPropagation(); handleRemoveTrack(selectedPlaylist.title, track.url); }}>
                  <DeleteIcon style={{ color: 'white' }} />
                </IconButton>
                <IconButton onClick={(e) => { e.stopPropagation(); handleClickOpenEdit(track); }}>
                  <EditIcon style={{ color: 'white' }} />
                </IconButton>
              </div>
            </div>
          ))}


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

          <Dialog open={openEditPlaylistTitle} onClose={handleCloseEditPlaylistTitle}>
            <DialogTitle>Edit Playlist Title</DialogTitle>
            <DialogContent>
              <TextField
                margin="dense"
                label="Playlist Title"
                type="text"
                fullWidth
                value={newPlaylistTitle}
                onChange={(e) => setNewPlaylistTitle(e.target.value)}
              />
            </DialogContent>
            <DialogActions>
              <Button onClick={handleCloseEditPlaylistTitle}>Cancel</Button>
              <Button onClick={handleUpdatePlaylistTitle} color="primary">Save</Button>
            </DialogActions>
          </Dialog>
        </div>
      )}
    </div>
  );
}

export default Playlist;
