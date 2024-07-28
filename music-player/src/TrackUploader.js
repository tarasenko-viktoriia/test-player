import React from 'react';

function TrackUploader({ addTrackToLibrary }) {
  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    const trackName = file.name.split('.').slice(0, -1).join('.'); // Use file name without extension
    const track = {
      name: trackName,
      artist: 'Unknown Artist',
      url: URL.createObjectURL(file),
    };
    addTrackToLibrary(track);
  };

  return (
    <div>
      <h2>Upload Track</h2>
      <input type="file" onChange={handleFileUpload} />
    </div>
  );
}

export default TrackUploader;
