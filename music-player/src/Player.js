import React, { useState, useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { play, pause, setTrackProgress, toggleShuffle, setNormalMode, nextTrack, previousTrack } from './playerSlice';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import PauseIcon from '@mui/icons-material/Pause';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import ArrowBackIosIcon from '@mui/icons-material/ArrowBackIos';
import ShuffleIcon from '@mui/icons-material/Shuffle';
import RepeatIcon from '@mui/icons-material/Repeat';
import VolumeUpIcon from '@mui/icons-material/VolumeUp';

function Player() {
  const dispatch = useDispatch();
  const { currentTrack, isPlaying, isShuffle } = useSelector((state) => state.player);
  const audioRef = useRef(new Audio());
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [showVolumeControl, setShowVolumeControl] = useState(false);

  useEffect(() => {
    const audio = audioRef.current;

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
    };

    const handleLoadedMetadata = () => {
      setDuration(audio.duration);
    };

    const handleEnded = () => {
      dispatch(nextTrack()); 
    };

    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('ended', handleEnded);
    };
  }, [dispatch]);

  useEffect(() => {
    const audio = audioRef.current;
  
    const loadAndPlayTrack = async () => {
      if (currentTrack && currentTrack.url) {
        try {
          const baseURL = 'http://localhost:4000';
          const trackURL = `${baseURL}${currentTrack.url}`;
  
          if (audio.src !== trackURL) {
            audio.pause();
            audio.currentTime = 0;
            audio.src = trackURL;
            await audio.load();
          }
  
          if (isPlaying) {
            const playPromise = audio.play();
            if (playPromise !== undefined) {
              playPromise.catch((error) => console.error('Error playing audio:', error));
            }
          }
        } catch (error) {
          console.error('Error loading or playing audio:', error);
        }
      }
    };
  
    loadAndPlayTrack();
  }, [currentTrack, isPlaying]);

  const handlePlayPause = () => {
    const audio = audioRef.current;

    if (audio.paused) {
      const playPromise = audio.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            dispatch(play());
          })
          .catch((error) => {
            console.error('Error playing audio:', error);
          });
      }
    } else {
      audio.pause();
      dispatch(pause());
    }
  };

  const handleNextTrack = () => {
    dispatch(nextTrack());
  };

  const handlePreviousTrack = () => {
    dispatch(previousTrack());
  };

  const handleProgressChange = (e) => {
    const newTime = e.target.value;
    const audio = audioRef.current;
    audio.currentTime = newTime;
    setCurrentTime(newTime);
    dispatch(setTrackProgress(newTime));
  };

  const handleVolumeChange = (e) => {
    const newVolume = e.target.value;
    const audio = audioRef.current;
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
          <div>
            <img className={isPlaying ? 'spin' : ''} src='../image/player-image.png' width="100px" alt="Player" />
          </div>
          <div className='track-id3'>
            <h2>{currentTrack.originalname}</h2>
            <h3>{currentTrack.artist || 'Unknown Artist'}</h3>
          </div>
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
            <ShuffleIcon onClick={handleShuffleToggle} style={{ color: isShuffle ? 'white' : '#8A7BAA' }} />
            <ArrowBackIosIcon onClick={handlePreviousTrack} />
            <div onClick={handlePlayPause}>{isPlaying ? <PauseIcon /> : <PlayArrowIcon />}</div>
            <ArrowForwardIosIcon onClick={handleNextTrack} />
            <RepeatIcon onClick={handleNormalMode} style={{ color: !isShuffle ? 'white' : '#8A7BAA' }} />
          </div>
        </div>
      ) : (
        <h2>No track selected</h2>
      )}
    </div>
  );
}

export default Player;
