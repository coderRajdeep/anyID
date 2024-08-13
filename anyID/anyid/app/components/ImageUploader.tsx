import { useState, useRef } from 'react';

const categories = [
  'Famous Person',
  'Animal',
  'Plant',
  'Other',
];

const ImageUploader = ({ onUpload }) => {
  const [selectedCategory, setSelectedCategory] = useState('');
  const [showCamera, setShowCamera] = useState(false);
  const [loading, setLoading] = useState(false);
  const videoRef = useRef(null);
  const fileInputRef = useRef(null);

  const handleFileChange = (event) => {
    const file = event.target.files?.[0];
    if (file && selectedCategory) {
      handleImageUpload(file);
    }
  };

  const handleImageUpload = async (file) => {
    setLoading(true);
    try {
      onUpload(file, selectedCategory);  // Call the onUpload function passed from the parent
    } catch (error) {
      console.error('Error uploading image:', error);
    } finally {
      setLoading(false);
    }
  };

  const openCamera = async () => {
    setShowCamera(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (error) {
      console.error('Error accessing camera:', error);
      setShowCamera(false);
    }
  };

  const takePhoto = () => {
    if (videoRef.current) {
      const canvas = document.createElement('canvas');
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      canvas.getContext('2d')?.drawImage(videoRef.current, 0, 0);
      canvas.toBlob((blob) => {
        if (blob) {
          const file = new File([blob], 'photo.jpg', { type: 'image/jpeg' });
          handleImageUpload(file);
        }
      }, 'image/jpeg');
    }
    setShowCamera(false);
  };

  return (
    <div className="space-y-4 mb-8 flex flex-col items-center">
      <select
        value={selectedCategory}
        onChange={(e) => setSelectedCategory(e.target.value)}
        className="w-full p-2 border rounded"
      >
        <option value="">Select a category</option>
        {categories.map((category) => (
          <option key={category} value={category}>
            {category}
          </option>
        ))}
      </select>
      <div className="flex space-x-4 mb-4">
        <label
          htmlFor="image-upload"
          className="bg-white text-green-800 font-bold py-2 px-4 rounded cursor-pointer transition-colors hover:bg-green-300"
        >
          {loading ? 'Processing...' : 'Upload Image'}
        </label>
        <button
          onClick={openCamera}
          className="bg-white text-green-800 font-bold py-2 px-4 rounded cursor-pointer transition-colors hover:bg-green-300"
          disabled={loading || !selectedCategory}
        >
          Take Photo
        </button>
      </div>
      <input
        id="image-upload"
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
        disabled={loading || !selectedCategory}
        ref={fileInputRef}
      />
      {showCamera && (
        <div className="mt-4">
          <video ref={videoRef} autoPlay playsInline className="mb-2 rounded-lg" />
          <button
            onClick={takePhoto}
            className="bg-green-500 text-white font-bold py-2 px-4 rounded cursor-pointer transition-colors hover:bg-green-600"
          >
            Capture Photo
          </button>
        </div>
      )}
    </div>
  );
};

export default ImageUploader;
