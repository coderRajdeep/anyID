

import { useState, useRef, ChangeEvent, DragEvent } from 'react';

interface ImageUploaderProps {
  onUpload: (file: File, category: string) => void;
}

const categories = ['Famous Person', 'Animal', 'Plant', 'Vehicle', 'Other'];

const ImageUploader: React.FC<ImageUploaderProps> = ({ onUpload }) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [showCamera, setShowCamera] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && selectedCategory) {
      handleImageUpload(file);
    }

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }

  };

  const handleDrop = (e: DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && selectedCategory) {
      onUpload(file, selectedCategory);
    }
  };

  const handleDragOver = (e: DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
  };

  const handleImageUpload = async (file: File) => {
    setLoading(true);
    try {
      onUpload(file, selectedCategory);
    } catch (error) {
      console.error('Error uploading image:', error);
    } finally {
      setLoading(false);
    }
  };

  const openCamera = async () => {
    setShowCamera(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { exact: 'environment' }, // Use the back camera
        },
      });

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
      const context = canvas.getContext('2d');
      if (context) {
        context.drawImage(videoRef.current, 0, 0);
        canvas.toBlob(
          (blob) => {
            if (blob) {
              const file = new File([blob], 'photo.jpg', { type: 'image/jpeg' });
              handleImageUpload(file);
            }
          },
          'image/jpeg',
          0.95
        );
      }
    }
    setShowCamera(false);
  };

  return (
    <div className="space-y-6 mb-8 flex flex-col items-center w-full max-w-2xl mx-auto">
      <div className="w-full">
        <label className="block text-gray-300 mb-2 font-medium">Select Category</label>
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="w-full p-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-blue-500 transition-colors"
        >
          <option value="" className="bg-gray-900 text-gray-400">
            Select a category
          </option>
          {categories.map((category) => (
            <option key={category} value={category} className="bg-gray-900 text-white">
              {category}
            </option>
          ))}
        </select>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 w-full justify-center">
        <label
          className={`flex-1 flex items-center justify-center bg-gradient-to-r from-blue-600 to-blue-500 text-white font-bold py-3 px-6 rounded-lg cursor-pointer transition-all hover:scale-105 hover:shadow-lg hover:shadow-blue-500/20 ${(!selectedCategory || showCamera) ? 'opacity-50 cursor-not-allowed' : ''}`}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
        >
          <span className="mr-2">📁</span> Upload Image
          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            onChange={handleFileChange}
            accept="image/*"
            disabled={!selectedCategory || showCamera}
          />
        </label>
        <button
          onClick={openCamera}
          className={`flex-1 flex items-center justify-center bg-gradient-to-r from-purple-600 to-purple-500 text-white font-bold py-3 px-6 rounded-lg cursor-pointer transition-all hover:scale-105 hover:shadow-lg hover:shadow-purple-500/20 ${loading || !selectedCategory ? 'opacity-50 cursor-not-allowed' : ''}`}
          disabled={loading || !selectedCategory}
        >
          <span className="mr-2">📷</span> Take Photo
        </button>
      </div>

      {showCamera && (
        <div className="mt-4 w-full glass p-4 rounded-xl">
          <video ref={videoRef} autoPlay playsInline className="mb-4 rounded-lg w-full" />
          <button
            onClick={takePhoto}
            className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-6 rounded-lg transition-colors shadow-lg shadow-green-500/20"
          >
            Capture Photo
          </button>
        </div>
      )}
    </div>
  );
};

export default ImageUploader;


