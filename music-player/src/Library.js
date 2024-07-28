import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setTrack, play, pause, togglePlayPause } from './playerSlice';

function Library({ library, addTrackToPlaylist, playlists }) {
  const dispatch = useDispatch();
  const { currentTrack, isPlaying } = useSelector((state) => state.player);

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
              cursor: 'pointer'
            }}
          >
            <div>
              <strong>{track.name}</strong> by {track.artist}
            </div>
            <div>
              {currentTrack && currentTrack.url === track.url && isPlaying ? 'Pause' : 'Play'}
            </div>
            <button onClick={(e) => { e.stopPropagation(); addTrackToPlaylist(track, 'Default Playlist'); }}>Add to Default Playlist</button>
          </div>
        ))}
      </ul>
      <div>
        <h3>Add to Playlist</h3>
        {playlists.map((playlist, index) => (
          <div key={index}>
            <h4>{playlist.name}</h4>
            {library.map((track, index) => (
              <div key={index}>
                {track.name}
                <button onClick={() => addTrackToPlaylist(track, playlist.name)}>Add to {playlist.name}</button>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

export default Library;
