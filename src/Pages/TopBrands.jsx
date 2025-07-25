import React, { useState, useEffect } from 'react';
import { Plus, Star, X, Upload, Loader2, Grid, List, Eye, Calendar, Tag, Users, Building2, Search, Trash2, Edit } from 'lucide-react';
import { addDoc, collection, getDocs, doc, deleteDoc, updateDoc } from 'firebase/firestore';
import { db, storage } from '../utils/firebase';
import { getDownloadURL, ref, uploadBytes, deleteObject } from 'firebase/storage';

const TopBrands = () => {
  const [brands, setBrands] = useState([]);
  const [open, setOpen] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [selectedBrand, setSelectedBrand] = useState(null);
  const [loading, setLoading] = useState(false);
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [viewMode, setViewMode] = useState('grid');
  const [searchTerm, setSearchTerm] = useState('');
  const [isEditing, setIsEditing] = useState(false);

  const [formData, setFormData] = useState({
    brandName: '',
    brandType: '',
    review: '',
    starRating: 3,
    imageUrl: ''
  });

  useEffect(() => {
    fetchBrands();
  }, []);

  const fetchBrands = async () => {
    try {
      setLoading(true);
      const querySnapshot = await getDocs(collection(db, 'topbrands'));
      const brandsData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setBrands(brandsData);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching brands: ', error);
      setLoading(false);
    }
  };

  const filteredBrands = brands.filter(brand =>
    brand.brandName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    brand.brandType.toLowerCase().includes(searchTerm.toLowerCase()) ||
    brand.review.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleOpen = () => {
    setOpen(true);
    setIsEditing(false);
  };

  const handleClose = () => {
    setOpen(false);
    setFormData({
      brandName: '',
      brandType: '',
      review: '',
      starRating: 3,
      imageUrl: ''
    });
    setImage(null);
    setImagePreview('');
  };

  const handleEditOpen = (brand) => {
    setSelectedBrand(brand);
    setFormData({
      brandName: brand.brandName,
      brandType: brand.brandType,
      review: brand.review,
      starRating: brand.starRating,
      imageUrl: brand.imageUrl
    });
    if (brand.imageUrl) {
      setImagePreview(brand.imageUrl);
    }
    setOpen(true);
    setIsEditing(true);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const uploadImage = async () => {
    if (!image) return null;
    
    const storageRef = ref(storage, `brands/${Date.now()}_${image.name}`);
    const uploadTask = uploadBytes(storageRef, image);
    
    try {
      const snapshot = await uploadTask;
      const downloadURL = await getDownloadURL(snapshot.ref);
      return downloadURL;
    } catch (error) {
      console.error('Error uploading image: ', error);
      return null;
    }
  };

  const deleteImage = async (imageUrl) => {
    if (!imageUrl) return;
    
    try {
      const imageRef = ref(storage, imageUrl);
      await deleteObject(imageRef);
    } catch (error) {
      console.error('Error deleting image: ', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      let imageUrl = formData.imageUrl;
      
      // Upload new image if one was selected
      if (image) {
        // Delete old image if editing and had a previous image
        if (isEditing && formData.imageUrl) {
          await deleteImage(formData.imageUrl);
        }
        imageUrl = await uploadImage();
      }
      
      const brandData = {
        ...formData,
        imageUrl: imageUrl || '',
        createdAt: isEditing ? selectedBrand.createdAt : new Date().toISOString()
      };
      
      if (isEditing) {
        // Update existing brand
        await updateDoc(doc(db, 'topbrands', selectedBrand.id), brandData);
      } else {
        // Add new brand
        await addDoc(collection(db, 'topbrands'), brandData);
      }
      
      await fetchBrands();
      handleClose();
    } catch (error) {
      console.error('Error saving brand: ', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (brandId, imageUrl) => {
    if (window.confirm('Are you sure you want to delete this brand?')) {
      try {
        setLoading(true);
        
        // Delete the image from storage if it exists
        if (imageUrl) {
          await deleteImage(imageUrl);
        }
        
        // Delete the document from Firestore
        await deleteDoc(doc(db, 'topbrands', brandId));
        
        // Refresh the list
        await fetchBrands();
      } catch (error) {
        console.error('Error deleting brand: ', error);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleDetailsOpen = (brand) => {
    setSelectedBrand(brand);
    setDetailsOpen(true);
  };

  const handleDetailsClose = () => {
    setDetailsOpen(false);
    setSelectedBrand(null);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const renderStars = (rating) => {
    return (
      <div className="flex">
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            size={16}
            className={i < rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}
          />
        ))}
      </div>
    );
  };

  const GridView = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {filteredBrands.map((brand) => (
        <div key={brand.id} className="group bg-white rounded-2xl p-6 shadow-lg border border-gray-200 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
          <div className="flex flex-col items-center text-center">
            <div className="relative mb-4">
              {brand.imageUrl ? (
                <img 
                  src={brand.imageUrl} 
                  alt={brand.brandName} 
                  className="h-20 w-20 rounded-full object-cover ring-4 ring-white shadow-lg"
                />
              ) : (
                <div className="h-20 w-20 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center ring-4 ring-white shadow-lg">
                  <Tag className="text-gray-400" size={32} />
                </div>
              )}
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-1">{brand.brandName}</h3>
            <span className="bg-blue-100 text-blue-800 text-xs px-3 py-1 rounded-full mb-2">
              {brand.brandType}
            </span>
            <div className="mb-2">
              {renderStars(brand.starRating)}
            </div>
            <p className="text-gray-600 text-sm mb-4 line-clamp-3">"{brand.review}"</p>
            <p className="text-xs text-gray-500 mb-4 flex items-center gap-1">
              <Calendar size={12} />
              {formatDate(brand.createdAt)}
            </p>

            <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-all duration-200">
              <button
                onClick={() => handleDetailsOpen(brand)}
                className="p-2 bg-blue-100 hover:bg-blue-200 text-blue-600 rounded-xl"
                title="View Details"
              >
                <Eye size={16} />
              </button>
              <button
                onClick={() => handleEditOpen(brand)}
                className="p-2 bg-green-100 hover:bg-green-200 text-green-600 rounded-xl"
                title="Edit"
              >
                <Edit size={16} />
              </button>
              <button
                onClick={() => handleDelete(brand.id, brand.imageUrl)}
                className="p-2 bg-red-100 hover:bg-red-200 text-red-600 rounded-xl"
                title="Delete"
              >
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  const TableView = () => (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Brand
              </th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Type
              </th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Rating
              </th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Review
              </th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Date Added
              </th>
              <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredBrands.map((brand, index) => (
              <tr key={brand.id} className={`hover:bg-gray-50 transition-colors ${index % 2 === 0 ? 'bg-white' : 'bg-gray-25'}`}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-12 w-12">
                      {brand.imageUrl ? (
                        <img 
                          src={brand.imageUrl} 
                          alt={brand.brandName}
                          className="h-12 w-12 rounded-full object-cover ring-2 ring-white shadow-sm"
                        />
                      ) : (
                        <div className="h-12 w-12 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center ring-2 ring-white shadow-sm">
                          <Tag size={20} className="text-gray-400" />
                        </div>
                      )}
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900">{brand.brandName}</div>
                      <div className="text-sm text-gray-500">Brand ID: {brand.id}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                    {brand.brandType}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center space-x-2">
                    {renderStars(brand.starRating)}
                    <span className="text-sm text-gray-600">({brand.starRating})</span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <p className="text-sm text-gray-900 line-clamp-2">{brand.review}</p>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                  {formatDate(brand.createdAt)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => handleDetailsOpen(brand)}
                      className="text-blue-600 hover:text-blue-800 hover:bg-blue-50 p-2 rounded-lg transition-all duration-200"
                      title="View Details"
                    >
                      <Eye size={16} />
                    </button>
                    <button
                      onClick={() => handleEditOpen(brand)}
                      className="text-green-600 hover:text-green-800 hover:bg-green-50 p-2 rounded-lg transition-all duration-200"
                      title="Edit"
                    >
                      <Edit size={16} />
                    </button>
                    <button
                      onClick={() => handleDelete(brand.id, brand.imageUrl)}
                      className="text-red-600 hover:text-red-800 hover:bg-red-50 p-2 rounded-lg transition-all duration-200"
                      title="Delete"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl shadow-lg">
              <Building2 className="text-white" size={28} />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Top Brands</h1>
              <p className="text-gray-600">Manage and review your favorite brands</p>
            </div>
          </div>

          {/* Action Bar */}
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-white rounded-2xl p-4 shadow-lg border border-gray-200">
            <div className="flex items-center gap-4 w-full sm:w-auto">
              <div className="relative flex-1 sm:flex-initial">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder="Search brands..."
                  className="pl-10 pr-4 py-2 w-full sm:w-64 bg-white rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex bg-gray-100 rounded-xl p-1">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${viewMode === 'grid'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                    }`}
                >
                  <Grid size={18} />
                  Grid
                </button>
                <button
                  onClick={() => setViewMode('table')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${viewMode === 'table'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                    }`}
                >
                  <List size={18} />
                  Table
                </button>
              </div>

              <button
                onClick={handleOpen}
                className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-6 py-2 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              >
                <Plus size={20} />
                Add Brand
              </button>
            </div>
          </div>
        </div>

        {/* Content */}
        {loading && !brands.length ? (
          <div className="flex justify-center items-center h-64">
            <div className="flex flex-col items-center gap-4">
              <Loader2 className="animate-spin text-blue-600" size={32} />
              <p className="text-gray-600">Loading brands...</p>
            </div>
          </div>
        ) : brands.length === 0 ? (
          <div className="text-center py-16">
            <div className="bg-white rounded-xl p-8 shadow-lg border border-gray-200">
              <Tag size={48} className="text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No brands yet</h3>
              <p className="text-gray-600 mb-6">Start by adding your first brand to get started.</p>
              <button
                onClick={handleOpen}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-colors"
              >
                Add Your First Brand
              </button>
            </div>
          </div>
        ) : (
          <>
            {viewMode === 'grid' ? <GridView /> : <TableView />}
          </>
        )}

        {/* Add/Edit Brand Modal */}
        {open && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
<div className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto transform transition-all">
              {/* Header */}
              <div className="flex justify-between items-center border-b border-gray-200 p-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 rounded-xl">
                    <Plus className="text-blue-600" size={20} />
                  </div>
                  <h2 className="text-2xl font-semibold text-gray-900">
                    {isEditing ? 'Edit Brand' : 'Add New Brand'}
                  </h2>
                </div>
                <button
                  onClick={handleClose}
                  className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition-colors"
                >
                  <X size={22} />
                </button>
              </div>
              
              <div className="p-6">
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Brand Name</label>
                      <input
                        type="text"
                        name="brandName"
                        value={formData.brandName}
                        onChange={handleChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                        placeholder="Enter brand name"
                        required
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Brand Type</label>
                      <input
                        type="text"
                        name="brandType"
                        value={formData.brandType}
                        onChange={handleChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                        placeholder="e.g., Technology, Fashion, Food"
                        required
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Review</label>
                    <textarea
                      name="review"
                      value={formData.review}
                      onChange={handleChange}
                      rows={4}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 resize-none"
                      placeholder="Share your experience with this brand..."
                      required
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Star Rating</label>
                      <select
                        name="starRating"
                        value={formData.starRating}
                        onChange={handleChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                        required
                      >
                        {[1, 2, 3, 4, 5].map((num) => (
                          <option key={num} value={num}>
                            {num} Star{num !== 1 ? 's' : ''} - {
                              num === 1 ? 'Poor' :
                              num === 2 ? 'Fair' :
                              num === 3 ? 'Good' :
                              num === 4 ? 'Very Good' : 'Excellent'
                            }
                          </option>
                        ))}
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Brand Image</label>
                      <label className="flex items-center gap-3 px-4 py-3 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition">
                        <Upload size={20} className="text-gray-400" />
                        <span className="text-sm text-gray-600">
                          {image ? image.name : formData.imageUrl ? 'Current image' : 'Upload Image'}
                        </span>
                        <input 
                          type="file" 
                          className="hidden" 
                          onChange={handleImageChange}
                          accept="image/*"
                        />
                      </label>
                      {imagePreview && (
                        <div className="mt-4 flex justify-center">
                          <img 
                            src={imagePreview} 
                            alt="Preview" 
                            className="max-h-40 rounded-lg border shadow-sm"
                          />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="flex justify-end space-x-3 pt-6 mt-6 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={handleClose}
                    className="px-6 py-3 border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 transition-colors font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleSubmit}
                    disabled={loading}
                    className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition font-medium"
                  >
                    {loading && <Loader2 className="animate-spin h-4 w-4" />}
                    {isEditing ? 'Update Brand' : 'Add Brand'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Brand Details Modal */}
        {detailsOpen && selectedBrand && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
              <div className="relative">
                {selectedBrand.imageUrl && (
                  <div className="h-64 bg-gradient-to-br from-gray-100 to-gray-200 overflow-hidden rounded-t-3xl">
                    <img 
                      src={selectedBrand.imageUrl} 
                      alt={selectedBrand.brandName}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <button 
                  onClick={handleDetailsClose} 
                  className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm hover:bg-white text-gray-700 p-2 rounded-full shadow-lg transition-all duration-200"
                >
                  <X size={20} />
                </button>
              </div>
              
              <div className="p-8">
                <div className="flex items-start justify-between mb-6">
                  <div>
                    <h2 className="text-3xl font-bold text-gray-900 mb-2">{selectedBrand.brandName}</h2>
                    <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                      {selectedBrand.brandType}
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        handleDetailsClose();
                        handleEditOpen(selectedBrand);
                      }}
                      className="p-2 bg-green-100 hover:bg-green-200 text-green-600 rounded-xl transition-colors"
                      title="Edit"
                    >
                      <Edit size={18} />
                    </button>
                    <button
                      onClick={() => handleDelete(selectedBrand.id, selectedBrand.imageUrl)}
                      className="p-2 bg-red-100 hover:bg-red-200 text-red-600 rounded-xl transition-colors"
                      title="Delete"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Rating</h3>
                    <div className="flex items-center space-x-3 mb-6">
                      {renderStars(selectedBrand.starRating)}
                      <span className="text-xl font-bold text-gray-900">
                        {selectedBrand.starRating}/5
                      </span>
                    </div>
                    
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Details</h3>
                    <div className="space-y-3 text-sm">
                      <div className="flex items-center text-gray-600">
                        <Calendar size={16} className="mr-3 text-gray-400" />
                        <span>Added on {formatDate(selectedBrand.createdAt)}</span>
                      </div>
                      <div className="flex items-center text-gray-600">
                        <Tag size={16} className="mr-3 text-gray-400" />
                        <span>Category: {selectedBrand.brandType}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Review</h3>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <p className="text-gray-700 leading-relaxed">{selectedBrand.review}</p>
                    </div>
                  </div>
                </div>
                
                <div className="flex justify-end mt-8 pt-6 border-t border-gray-200">
                  <button
                    onClick={handleDetailsClose}
                    className="px-6 py-3 bg-gray-900 text-white rounded-xl hover:bg-gray-800 transition-colors font-medium"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TopBrands;