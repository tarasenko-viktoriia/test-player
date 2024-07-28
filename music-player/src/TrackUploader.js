import React from 'react';
import { useDropzone } from 'react-dropzone';

function TrackUploader({ addTrackToLibrary }) {
  const onDrop = (acceptedFiles) => {
    acceptedFiles.forEach((file) => {
      const trackName = file.name.split('.').slice(0, -1).join('.'); // Use file name without extension
      const track = {
        name: trackName,
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
      <p>Drag & drop some files here, or click to select files</p>
    </div>
  );
}

export default TrackUploader;
