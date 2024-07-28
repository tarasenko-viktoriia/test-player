import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setTrack, play, pause, togglePlayPause } from './playerSlice';

function Playlist({ playlists, createPlaylist }) {
  const dispatch = useDispatch();
  const { currentTrack, isPlaying } = useSelector((state) => state.player);
  const [playlistName, setPlaylistName] = useState('');

  const handleCreatePlaylist = () => {
    createPlaylist(playlistName);
    setPlaylistName('');
  };

  const handlePlayPause = (track, index) => {
    if (currentTrack && currentTrack.url === track.url) {
      dispatch(togglePlayPause());
    } else {
      dispatch(pause());
      dispatch(setTrack({ track, index }));
      dispatch(play());
    }
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
                onClick={() => handlePlayPause(track, trackIndex)}
                style={{
                  border: '1px solid black',
                  padding: '10px',
                  margin: '10px 0',
                  cursor: 'pointer'
                }}
              >
                <div>
                  <strong>{track.name}</strong> by {track.artist}
                </div>
                <div>
                  {currentTrack && currentTrack.url === track.url && isPlaying ? 'Pause' : 'Play'}
                </div>
              </div>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}

export default Playlist;
