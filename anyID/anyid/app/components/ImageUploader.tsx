

import { useState, useRef, ChangeEvent, DragEvent } from 'react';

interface ImageUploaderProps {
  onUpload: (file: File, category: string) => void;
  onStartQuiz: (category: string) => void;
}

const categories = ['Famous Person', 'Animal', 'Plant', 'Vehicle', 'Other'];

const ImageUploader: React.FC<ImageUploaderProps> = ({ onUpload, onStartQuiz }) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [customCategory, setCustomCategory] = useState<string>('');
  const [showCamera, setShowCamera] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const finalCategory = selectedCategory === 'Other' ? (customCategory.trim() || 'Other') : selectedCategory;

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && finalCategory) {
      setPreview(file);
    }

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleDrop = (e: DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && finalCategory) {
      setPreview(file);
    }
  };

  const handleDragOver = (e: DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
  };

  const setPreview = (file: File) => {
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    setSelectedFile(file);
    setShowCamera(false);
  };

  const handleConfirmUpload = () => {
    if (selectedFile && finalCategory) {
      setLoading(true);
      try {
        onUpload(selectedFile, finalCategory);
        setPreviewUrl(null);
        setSelectedFile(null);
      } catch (error) {
        console.error('Error uploading image:', error);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleCancelUpload = () => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setPreviewUrl(null);
    setSelectedFile(null);
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
              setPreview(file);
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
      <div className="w-full space-y-4">
        <div>
          <label className="block text-gray-300 mb-2 font-medium">Select Category</label>
          <div className="flex gap-2">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="flex-1 p-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-blue-500 transition-colors"
              disabled={!!previewUrl}
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

            {finalCategory && !previewUrl && (
              <button
                onClick={() => onStartQuiz(finalCategory)}
                className="bg-gradient-to-r from-pink-500 to-purple-600 text-white font-bold px-4 py-2 rounded-lg hover:shadow-lg hover:shadow-purple-500/30 transition-all flex items-center whitespace-nowrap animate-fade-in"
              >
                🎮 Quiz Game
              </button>
            )}
          </div>
        </div>

        {selectedCategory === 'Other' && (
          <div className="animate-fade-in">
            <label className="block text-gray-300 mb-2 font-medium">Specify Category</label>
            <input
              type="text"
              value={customCategory}
              onChange={(e) => setCustomCategory(e.target.value)}
              placeholder="Enter category name..."
              className="w-full p-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-purple-500 transition-colors"
              disabled={!!previewUrl}
            />
          </div>
        )}
      </div>

      {previewUrl ? (
        <div className="w-full max-w-md mx-auto glass p-4 rounded-xl animate-fade-in">
          <div className="relative aspect-video w-full mb-4 rounded-lg overflow-hidden bg-black/50">
            <img
              src={previewUrl}
              alt="Preview"
              className="w-full h-full object-contain"
            />
          </div>
          <p className="text-center text-white mb-4 font-medium">Do you want to upload this image?</p>
          <div className="flex gap-4 justify-center">
            <button
              onClick={handleCancelUpload}
              className="px-6 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-200 border border-red-500/50 rounded-lg transition-colors"
            >
              No, Cancel
            </button>
            <button
              onClick={handleConfirmUpload}
              className="px-6 py-2 bg-green-500 hover:bg-green-600 text-white font-bold rounded-lg transition-colors shadow-lg shadow-green-500/20"
            >
              Yes, Identify
            </button>
          </div>
        </div>
      ) : (
        <>
          <div className="flex flex-col sm:flex-row gap-4 w-full justify-center">
            <label
              className={`flex-1 flex items-center justify-center bg-gradient-to-r from-blue-600 to-blue-500 text-white font-bold py-3 px-6 rounded-lg cursor-pointer transition-all hover:scale-105 hover:shadow-lg hover:shadow-blue-500/20 ${(!finalCategory || showCamera) ? 'opacity-50 cursor-not-allowed' : ''}`}
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
                disabled={!finalCategory || showCamera}
              />
            </label>
            <button
              onClick={openCamera}
              className={`flex-1 flex items-center justify-center bg-gradient-to-r from-purple-600 to-purple-500 text-white font-bold py-3 px-6 rounded-lg cursor-pointer transition-all hover:scale-105 hover:shadow-lg hover:shadow-purple-500/20 ${loading || !finalCategory ? 'opacity-50 cursor-not-allowed' : ''}`}
              disabled={loading || !finalCategory}
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
        </>
      )}
    </div>
  );
};

export default ImageUploader;


