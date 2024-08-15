import React from 'react';
import { useDropzone } from 'react-dropzone';
import { useAddTracksToLibraryMutation } from './store';
import { useSelector } from 'react-redux';

function TrackUploader({ onTrackUploaded }) {
  const [addTracksToLibrary] = useAddTracksToLibraryMutation();
  const authToken = useSelector((state) => state.auth.token);

  const onDrop = async (acceptedFiles) => {
    const supportedFormats = ['audio/mpeg', 'audio/wav', 'audio/ogg'];
    const validFiles = acceptedFiles.filter((file) => supportedFormats.includes(file.type));
  
    if (validFiles.length === 0) {
      console.error('No valid audio files to upload.');
      return;
    }
  
    const formData = new FormData();
    validFiles.forEach((file) => {
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
          title: validFiles[0].name.split('.').slice(0, -1).join('.'),
          artist: 'Unknown Artist',
          url,
        };
  
        await addTracksToLibrary([id]).unwrap(); 
  
        if (typeof onTrackUploaded === 'function') {
          onTrackUploaded(track); 
        } else {
          console.error('onTrackUploaded is not a function');
        }
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
