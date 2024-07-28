import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { play, pause, nextTrack, prevTrack } from './playerSlice';

function Player() {
  const dispatch = useDispatch();
  const { currentTrack, isPlaying } = useSelector((state) => state.player);

  const handlePlayPause = () => {
    if (isPlaying) {
      dispatch(pause());
    } else {
      dispatch(play());
    }
  };

  const handleNextTrack = () => {
    dispatch(nextTrack());
  };

  const handlePrevTrack = () => {
    dispatch(prevTrack());
  };

  return (
    <div>
      {currentTrack ? (
        <div>
          <h2>Now Playing: {currentTrack.name}</h2>
          <h3>Artist: {currentTrack.artist}</h3>
          <button onClick={handlePlayPause}>{isPlaying ? 'Pause' : 'Play'}</button>
          <button onClick={handlePrevTrack}>Previous</button>
          <button onClick={handleNextTrack}>Next</button>
        </div>
      ) : (
        <h2>No track selected</h2>
      )}
    </div>
  );
}

export default Player;