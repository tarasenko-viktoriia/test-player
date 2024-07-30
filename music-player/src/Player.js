import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { play, pause, nextTrack, prevTrack, setTrackProgress, toggleShuffle, setNormalMode } from './playerSlice';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import PauseIcon from '@mui/icons-material/Pause';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import ArrowBackIosIcon from '@mui/icons-material/ArrowBackIos';
import ShuffleIcon from '@mui/icons-material/Shuffle';
import RepeatIcon from '@mui/icons-material/Repeat';
import VolumeUpIcon from '@mui/icons-material/VolumeUp';

function Player() {
  const dispatch = useDispatch();
  const { currentTrack, isPlaying, audio, isShuffle } = useSelector((state) => state.player);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [showVolumeControl, setShowVolumeControl] = useState(false);

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

  const handleVolumeChange = (e) => {
    const newVolume = e.target.value;
    audio.volume = newVolume;
    setVolume(newVolume);
  };

  const handleShuffleToggle = () => {
    dispatch(toggleShuffle());
  };

  const handleNormalMode = () => {
    dispatch(setNormalMode());
  };

  const formatTime = (time) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  const toggleVolumeControl = () => {
    setShowVolumeControl(!showVolumeControl);
};

  return (
    <div>
      {currentTrack ? (
        <div className='player'>
          <div >
            <img className={isPlaying ? 'spin' : ''} src='../image/player-image.png' width="100px"></img>
          </div>
          <h2> {currentTrack.name}</h2>
          <h3> {currentTrack.artist}</h3>
          <div className="player-controls-container">
            <div className="volume-control-wrapper">
              <div className="player-controls volume-button" onClick={toggleVolumeControl}>
                <VolumeUpIcon />
              </div>
              {showVolumeControl && (
                <div className="volume-control">
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.01"
                    value={volume}
                    onChange={handleVolumeChange}
                    className="vertical-slider"
                  />
                </div>
              )}
            </div>
            <span>{formatTime(currentTime)}</span>
            <input
              className='input-duration'
              type="range"
              min="0"
              max={duration}
              value={currentTime}
              onChange={handleProgressChange}
            />
            <span>{formatTime(duration)}</span>
          </div>
          <div className='player-control'>
            <ShuffleIcon onClick={handleShuffleToggle} style={{ color: isShuffle ? 'white': ' #8A7BAA'  }} />
            <ArrowBackIosIcon onClick={handlePrevTrack} />
            <div onClick={handlePlayPause}>{isPlaying ? <PauseIcon /> : <PlayArrowIcon />}</div>
            <ArrowForwardIosIcon onClick={handleNextTrack} />
            <RepeatIcon onClick={handleNormalMode} style={{ color: !isShuffle ? 'white': ' #8A7BAA'  }} />
          </div>
        </div>
      ) : (
        <h2>No track selected</h2>
      )}
    </div>
  );
}

export default Player;
