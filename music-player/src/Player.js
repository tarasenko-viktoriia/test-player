import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { play, pause, nextTrack, prevTrack,setTrackProgress } from './playerSlice';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import PauseIcon from '@mui/icons-material/Pause';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import ArrowBackIosIcon from '@mui/icons-material/ArrowBackIos';

function Player() {
  const dispatch = useDispatch();
  const { currentTrack, isPlaying, audio } = useSelector((state) => state.player);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    if (audio) {
      const handleTimeUpdate = () => {
        setCurrentTime(audio.currentTime);
      };
      const handleLoadedMetadata = () => {
        setDuration(audio.duration);
      };
      audio.addEventListener('timeupdate', handleTimeUpdate);
      audio.addEventListener('loadedmetadata', handleLoadedMetadata);
      return () => {
        audio.removeEventListener('timeupdate', handleTimeUpdate);
        audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      };
    }
  }, [audio]);

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

  const handleProgressChange = (e) => {
    const newTime = e.target.value;
    audio.currentTime = newTime;
    setCurrentTime(newTime);
    dispatch(setTrackProgress(newTime));
  };

  const formatTime = (time) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };


  return (
    <div>
      {currentTrack ? (
        <div>
          <h2>Now Playing: {currentTrack.name}</h2>
          <h3>Artist: {currentTrack.artist}</h3>
          <div onClick={handlePlayPause}>{isPlaying ? <PauseIcon/> : <PlayArrowIcon/>}</div>
          <ArrowBackIosIcon onClick={handlePrevTrack}/>
          <ArrowForwardIosIcon onClick={handleNextTrack}/>
          <span>{formatTime(currentTime)}</span>
          <input
            type="range"
            min="0"
            max={duration}
            value={currentTime}
            onChange={handleProgressChange}
            style={{ width: '80%' }}
          />
          <span>{formatTime(duration)}</span>
     </div>
 ) : (
   <h2>No track selected</h2>
 )}
</div>
);
}

export default Player;
