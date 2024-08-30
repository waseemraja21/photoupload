import React, { useState, useEffect, useRef } from "react";
import axios from "axios";

function App() {
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null); // State for image preview
  const [photos, setPhotos] = useState([]);
  const [isUploading, setIsUploading] = useState(false); // Track upload status
  const fileInputRef = useRef(null); // Reference to the file input
  const [uploadSuccess, setUploadSuccess] = useState(""); // State for success message
  const URL = "";
  useEffect(() => {
    fetchPhotos();
  }, []);

  const fetchPhotos = async () => {
    try {
      const res = await axios.get(`${URL}/photos`);
      setPhotos(res.data);
    } catch (error) {
      console.error("Error fetching photos:", error);
    }
  };

  const handleImageChange = (e) => {
    const selectedImage = e.target.files[0];
    setImage(selectedImage);
    setUploadSuccess(""); // Clear success message on new image selection

    // Generate a preview URL for the selected image
    if (selectedImage) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result); // Set preview URL as state
      };
      reader.readAsDataURL(selectedImage); // Read the image file
    } else {
      setImagePreview(null); // Clear preview if no file is selected
    }
  };

  const handleUpload = async () => {
    if (!image) return; // Ensure there is an image to upload
    setIsUploading(true); // Start upload process

    const formData = new FormData();
    formData.append("image", image);

    try {
      await axios.post(`${URL}/upload`, formData);
      fetchPhotos(); // Refresh the photos after upload
      setImage(null); // Clear the image from the state
      setImagePreview(null); // Clear the image preview
      fileInputRef.current.value = ""; // Clear the file input value
      setUploadSuccess("Image uploaded successfully!"); // Set success message
      // Clear the success message after 3 seconds
      setTimeout(() => {
        setUploadSuccess("");
      }, 3000);
    } catch (error) {
      console.error("Error uploading the image:", error);
    } finally {
      setIsUploading(false); // End upload process
    }
  };

  return (
    <div>
      <h1>Photo Upload</h1>
      <input type="file" onChange={handleImageChange} ref={fileInputRef} />
      {imagePreview && (
        <div style={{ margin: "10px 0" }}>
          <img src={imagePreview} alt="Selected" style={{ width: "200px" }} />
        </div>
      )}
      <button onClick={handleUpload} disabled={!image || isUploading}>
        {isUploading ? "Uploading..." : "Upload"}
      </button>
      {uploadSuccess && (
        <div style={{ color: "green", marginTop: "10px" }}>{uploadSuccess}</div>
      )}
      <h2>Uploaded Photos</h2>
      <div>
        {photos.map((photo) => (
          <img
            key={photo._id}
            src={`{URL}${photo.imageUrl}`}
            alt="uploaded"
            style={{ width: "200px", margin: "10px" }}
          />
        ))}
      </div>
    </div>
  );
}

export default App;
