import React from 'react';
import { useDropzone } from 'react-dropzone';

function TrackUploader({ addTrackToLibrary }) {
  const onDrop = (acceptedFiles) => {
    acceptedFiles.forEach((file) => {
      const trackTitle = file.name.split('.').slice(0, -1).join('.'); 
      const track = {
        title: trackTitle,
        artist: 'Unknown Artist',
        url: URL.createObjectURL(file),
      };
      addTrackToLibrary(track);
    });
  };

  const { getRootProps, getInputProps } = useDropzone({ onDrop });

  return (
    <div {...getRootProps()} className="dropzone">
      <input {...getInputProps()} />
      <p>Click here to add a song</p>
    </div>
  );
}

export default TrackUploader;
