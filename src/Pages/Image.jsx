import React, { useState, useEffect } from 'react';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { collection, addDoc, getDocs, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db, storage } from '../utils/firebase';
import { 
  Upload, 
  Image as ImageIcon, 
  Edit3, 
  Trash2, 
  Save, 
  X, 
  Plus,
  Calendar,
  FileImage
} from 'lucide-react';

const Image = () => {
  const [images, setImages] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [editImageId, setEditImageId] = useState(null);
  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');

  // Fetch images from Firestore
  useEffect(() => {
    const fetchImages = async () => {
      const querySnapshot = await getDocs(collection(db, 'images'));
      const imagesData = [];
      querySnapshot.forEach((doc) => {
        imagesData.push({ id: doc.id, ...doc.data() });
      });
      setImages(imagesData);
    };
    fetchImages();
  }, []);

  // Handle file selection
  const handleFileChange = (e) => {
    if (e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  // Upload image to Firebase Storage and add metadata to Firestore
  const handleUpload = async (e) => {
    e.preventDefault();
    if (!selectedFile) return;

    setUploading(true);
    try {
      // Upload image to Firebase Storage
      const storageRef = ref(storage, `images/${selectedFile.name}`);
      const snapshot = await uploadBytes(storageRef, selectedFile);
      const downloadURL = await getDownloadURL(snapshot.ref);

      // Add image metadata to Firestore
      const docRef = await addDoc(collection(db, 'images'), {
        title: selectedFile.name,
        description: '',
        url: downloadURL,
        createdAt: new Date().toISOString()
      });

      // Update local state
      setImages([...images, {
        id: docRef.id,
        title: selectedFile.name,
        description: '',
        url: downloadURL,
        createdAt: new Date().toISOString()
      }]);

      setSelectedFile(null);
      document.getElementById('fileInput').value = ''; // Reset file input
    } catch (error) {
      console.error('Error uploading image:', error);
    } finally {
      setUploading(false);
    }
  };

  // Start editing an image
  const startEdit = (image) => {
    setEditImageId(image.id);
    setEditTitle(image.title);
    setEditDescription(image.description || '');
  };

  // Save edited image details
  const saveEdit = async () => {
    if (!editImageId) return;

    try {
      const imageRef = doc(db, 'images', editImageId);
      await updateDoc(imageRef, {
        title: editTitle,
        description: editDescription
      });

      // Update local state
      setImages(images.map(img => 
        img.id === editImageId 
          ? { ...img, title: editTitle, description: editDescription } 
          : img
      ));

      setEditImageId(null);
    } catch (error) {
      console.error('Error updating image:', error);
    }
  };

  // Delete an image
  const handleDelete = async (imageId, imageUrl) => {
    if (!window.confirm('Are you sure you want to delete this image?')) return;

    try {
      // Delete from Firebase Storage
      const storageRef = ref(storage, imageUrl);
      await deleteObject(storageRef);

      // Delete from Firestore
      await deleteDoc(doc(db, 'images', imageId));

      // Update local state
      setImages(images.filter(img => img.id !== imageId));
    } catch (error) {
      console.error('Error deleting image:', error);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-blue-500 rounded-lg">
              <ImageIcon className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-800">Image Gallery</h1>
          </div>
          <p className="text-gray-600">Manage and organize your image collection</p>
        </div>
        
        {/* Upload Section */}
        <div className="mb-8">
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
            <div className="bg-gradient-to-r from-blue-500 to-purple-600 px-6 py-4">
              <div className="flex items-center gap-2">
                <Plus className="w-5 h-5 text-white" />
                <h2 className="text-xl font-semibold text-white">Upload New Image</h2>
              </div>
            </div>
            
            <div className="p-6">
              <form onSubmit={handleUpload} className="space-y-6">
                <div className="relative">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Choose Image File
                  </label>
                  <div className="relative">
                    <input
                      id="fileInput"
                      type="file"
                      onChange={handleFileChange}
                      accept="image/*"
                      className="block w-full text-sm text-gray-500 file:mr-4 file:py-3 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 file:cursor-pointer cursor-pointer border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                    <FileImage className="absolute right-3 top-3 w-5 h-5 text-gray-400 pointer-events-none" />
                  </div>
                  {selectedFile && (
                    <p className="mt-2 text-sm text-green-600 flex items-center gap-1">
                      <FileImage className="w-4 h-4" />
                      Selected: {selectedFile.name}
                    </p>
                  )}
                </div>
                
                <button
                  type="submit"
                  disabled={uploading || !selectedFile}
                  className={`w-full flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
                    uploading || !selectedFile 
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                      : 'bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:from-blue-600 hover:to-purple-700 transform hover:-translate-y-0.5 shadow-lg hover:shadow-xl'
                  }`}
                >
                  {uploading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Uploading...
                    </>
                  ) : (
                    <>
                      <Upload className="w-4 h-4" />
                      Upload Image
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>

        {/* Images Grid */}
        {images.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {images.map((image) => (
              <div key={image.id} className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                <div className="relative overflow-hidden">
                  <img 
                    src={image.url} 
                    alt={image.title} 
                    className="w-full h-48 object-cover transition-transform duration-300 hover:scale-105"
                  />
                  <div className="absolute top-2 right-2 bg-black bg-opacity-50 rounded-full p-1">
                    <ImageIcon className="w-4 h-4 text-white" />
                  </div>
                </div>
                
                {editImageId === image.id ? (
                  <div className="p-4 space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                      <input
                        type="text"
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                        placeholder="Enter image title"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                      <textarea
                        value={editDescription}
                        onChange={(e) => setEditDescription(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors resize-none"
                        rows="3"
                        placeholder="Enter image description"
                      />
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={saveEdit}
                        className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors font-medium"
                      >
                        <Save className="w-4 h-4" />
                        Save
                      </button>
                      <button
                        onClick={() => setEditImageId(null)}
                        className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors font-medium"
                      >
                        <X className="w-4 h-4" />
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="p-4">
                    <h3 className="font-semibold text-lg text-gray-800 mb-1 truncate">{image.title}</h3>
                    {image.description && (
                      <p className="text-gray-600 text-sm mb-3 line-clamp-2">{image.description}</p>
                    )}
                    
                    {image.createdAt && (
                      <div className="flex items-center gap-1 text-xs text-gray-500 mb-4">
                        <Calendar className="w-3 h-3" />
                        {formatDate(image.createdAt)}
                      </div>
                    )}
                    
                    <div className="flex gap-2">
                      <button
                        onClick={() => startEdit(image)}
                        className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-all duration-200 font-medium hover:shadow-md"
                      >
                        <Edit3 className="w-4 h-4" />
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(image.id, image.url)}
                        className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-all duration-200 font-medium hover:shadow-md"
                      >
                        <Trash2 className="w-4 h-4" />
                        Delete
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="max-w-md mx-auto">
              <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <ImageIcon className="w-12 h-12 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-700 mb-2">No Images Yet</h3>
              <p className="text-gray-500 mb-6">Upload your first image to get started with your gallery</p>
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-lg">
                <Upload className="w-4 h-4" />
                <span className="text-sm font-medium">Use the upload form above</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Image;