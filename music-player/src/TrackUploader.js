import React from 'react';

function TrackUploader({ addTrackToLibrary }) {
  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    const trackName = prompt("Enter track name");
    const trackArtist = prompt("Enter track artist");
    const track = {
      name: trackName,
      artist: trackArtist,
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
