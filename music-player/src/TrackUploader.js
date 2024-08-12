import React from 'react';
import { useDropzone } from 'react-dropzone';
import { useAddTracksToLibraryMutation } from './store';
import { useSelector } from 'react-redux';

function TrackUploader({ onTrackUploaded }) {
  const [addTracksToLibrary] = useAddTracksToLibraryMutation();
  
  const authToken = useSelector((state) => state.auth.token);

  const onDrop = async (acceptedFiles) => {
    const formData = new FormData();
    acceptedFiles.forEach((file) => {
      formData.append('file', file);
    });

    try {
      const response = await fetch('http://localhost:4000/upload', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${authToken}`, 
        },
        body: formData,
      });
      const data = await response.json();

      if (response.ok) {
        const { id, url } = data;
        const track = {
          id,
          title: acceptedFiles[0].name.split('.').slice(0, -1).join('.'),
          artist: 'Unknown Artist',
          url,
        };

        await addTracksToLibrary([id]);

        onTrackUploaded(track);
      } else {
        console.error("Upload failed:", data);
      }
    } catch (error) {
      console.error("Error uploading file:", error);
    }
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