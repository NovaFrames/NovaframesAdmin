import React, { useState, useEffect } from 'react';
import {
  collection,
  addDoc,
  getDocs,
  doc,
  updateDoc,
  deleteDoc,
  getFirestore
} from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import {
  Eye,
  Edit,
  Trash2,
  Plus,
  Upload,
  X,
  Check,
  Image as ImageIcon,
  Loader2,
  Users,
  Building2,
  Search,
  Filter,
  User,
  Grid3X3,
  Table
} from 'lucide-react';
import { db, storage } from '../utils/firebase';

const Clients = () => {
  const [clients, setClients] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [currentClient, setCurrentClient] = useState(null);
  const [loading, setLoading] = useState(false);
  const [imageFile, setImageFile] = useState(null);
  const [editImageFile, setEditImageFile] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'table'
  const [formData, setFormData] = useState({
    name: '',
    review: '',
    image: ''
  });
  const [editFormData, setEditFormData] = useState({
    name: '',
    review: '',
    image: ''
  });

  useEffect(() => {
    fetchClients();
  }, []);

  const fetchClients = async () => {
    setLoading(true);
    try {
      const querySnapshot = await getDocs(collection(db, 'clients'));
      const clientsData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setClients(clientsData);
    } catch (error) {
      console.error('Error fetching clients: ', error);
      alert('Failed to fetch clients');
    } finally {
      setLoading(false);
    }
  };

  const filteredClients = clients.filter(client =>
    client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.review.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleEditInputChange = (e) => {
    const { name, value } = e.target;
    setEditFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageUpload = async (file) => {
    if (!file) return null;

    try {
      const storageRef = ref(storage, `client_images/${file.name}`);
      await uploadBytes(storageRef, file);
      const imageUrl = await getDownloadURL(storageRef);
      return imageUrl;
    } catch (error) {
      console.error('Error uploading image: ', error);
      alert('Failed to upload image');
      return null;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);

      let imageUrl = '';
      if (imageFile) {
        imageUrl = await handleImageUpload(imageFile);
      }

      await addDoc(collection(db, 'clients'), {
        name: formData.name,
        review: formData.review,
        image: imageUrl
      });

      alert('Client added successfully');
      fetchClients();
      setIsModalOpen(false);
      setFormData({ name: '', review: '', image: '' });
      setImageFile(null);
    } catch (error) {
      console.error('Error adding client: ', error);
      alert('Failed to add client');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (client) => {
    setCurrentClient(client);
    setEditFormData({
      name: client.name,
      review: client.review,
      image: client.image
    });
    setIsEditModalOpen(true);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);

      let imageUrl = editFormData.image;
      if (editImageFile) {
        imageUrl = await handleImageUpload(editImageFile);
      }

      await updateDoc(doc(db, 'clients', currentClient.id), {
        name: editFormData.name,
        review: editFormData.review,
        image: imageUrl
      });

      alert('Client updated successfully');
      fetchClients();
      setIsEditModalOpen(false);
      setCurrentClient(null);
      setEditImageFile(null);
    } catch (error) {
      console.error('Error updating client: ', error);
      alert('Failed to update client');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this client?')) return;

    try {
      setLoading(true);
      await deleteDoc(doc(db, 'clients', id));
      alert('Client deleted successfully');
      fetchClients();
    } catch (error) {
      console.error('Error deleting client: ', error);
      alert('Failed to delete client');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl shadow-lg">
              <Users className="text-white" size={28} />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Client Management</h1>
              <p className="text-gray-600">Manage your clients and their information</p>
            </div>
          </div>

          {/* Action Bar */}
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-white/80 backdrop-blur-sm rounded-2xl p-4 shadow-lg border border-white/20">
            <div className="flex items-center gap-4 w-full sm:w-auto">
              <div className="relative flex-1 sm:flex-initial">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder="Search clients..."
                  className="pl-10 pr-4 py-2 w-full sm:w-64 bg-white rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <h1 className="flex items-center gap-3 p-4 bg-white rounded-2xl border border-gray-200 shadow-sm hover:bg-gray-50 transition-colors">
                <Users className="w-6 h-6 text-blue-600" />
                <span className="text-lg font-semibold text-gray-800">
                  Total Clients: {clients.length}
                </span>
              </h1>
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
                  <Grid3X3 size={18} />
                  Grid
                </button>
                <button
                  onClick={() => setViewMode('table')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${viewMode === 'table'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                    }`}
                >
                  <Table size={18} />
                  Table
                </button>
              </div>

              <button
                onClick={() => setIsModalOpen(true)}
                className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-6 py-2 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              >
                <Plus size={20} />
                Add Client
              </button>
            </div>
          </div>
        </div>

        {/* Clients Display */}
        {loading && !clients.length ? (
          <div className="flex justify-center items-center h-64">
            <div className="flex flex-col items-center gap-4">
              <Loader2 className="animate-spin text-blue-600" size={32} />
              <p className="text-gray-600">Loading clients...</p>
            </div>
          </div>
        ) : (
          <>
            {viewMode === 'grid' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredClients.map((client) => (
                  <div key={client.id} className="group bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                    <div className="flex flex-col items-center text-center">
                      <div className="relative mb-4">
                        {client.image ? (
                          <img
                            className="h-20 w-20 rounded-full object-cover ring-4 ring-white shadow-lg"
                            src={client.image}
                            alt={client.name}
                          />
                        ) : (
                          <div className="h-20 w-20 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center ring-4 ring-white shadow-lg">
                            <User className="text-gray-400" size={32} />
                          </div>
                        )}
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-1">{client.name}</h3>
                      <p className="text-gray-600 text-sm mb-4 flex items-center gap-1">
                        "{client.review}"
                      </p>

                      <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        {/* <button
                          onClick={() => alert(`Viewing ${client.name}`)}
                          className="p-2 bg-blue-100 hover:bg-blue-200 text-blue-600 rounded-xl transition-colors"
                          title="View"
                        >
                          <Eye size={16} />
                        </button> */}
                        <button
                          onClick={() => handleEdit(client)}
                          className="p-2 bg-green-100 hover:bg-green-200 text-green-600 rounded-xl transition-colors"
                          title="Edit"
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(client.id)}
                          className="p-2 bg-red-100 hover:bg-red-200 text-red-600 rounded-xl transition-colors"
                          title="Delete"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50/80">
                      <tr>
                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Client
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Review
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white/50 divide-y divide-gray-200">
                      {filteredClients.map((client) => (
                        <tr key={client.id} className="hover:bg-gray-50/50 transition-colors">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="flex-shrink-0 h-12 w-12">
                                {client.image ? (
                                  <img
                                    className="h-12 w-12 rounded-full object-cover ring-2 ring-white shadow-sm"
                                    src={client.image}
                                    alt={client.name}
                                  />
                                ) : (
                                  <div className="h-12 w-12 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center ring-2 ring-white shadow-sm">
                                    <User className="text-gray-400" size={20} />
                                  </div>
                                )}
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-medium text-gray-900">{client.name}</div>
                                <div className="text-sm text-gray-500">Client ID: {client.id}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center text-sm text-gray-900">
                              {client.review}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              Active
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <div className="flex items-center justify-end gap-2">
                              {/* <button
                                onClick={() => alert(`Viewing ${client.name}`)}
                                className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                title="View"
                              >
                                <Eye size={16} />
                              </button> */}
                              <button
                                onClick={() => handleEdit(client)}
                                className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                                title="Edit"
                              >
                                <Edit size={16} />
                              </button>
                              <button
                                onClick={() => handleDelete(client.id)}
                                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
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
            )}
          </>
        )}

        {/* Add Client Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md transform transition-all">
              <div className="flex justify-between items-center border-b border-gray-200 p-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 rounded-xl">
                    <Plus className="text-blue-600" size={20} />
                  </div>
                  <h2 className="text-xl font-semibold text-gray-900">Add New Client</h2>
                </div>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition-colors"
                >
                  <X size={20} />
                </button>
              </div>
              <form onSubmit={handleSubmit} className="p-6 space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Client Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                    placeholder="Enter client name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Review
                  </label>
                  <input
                    type="text"
                    name="review"
                    value={formData.review}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                    placeholder="Enter review"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Client Image
                  </label>
                  <div className="flex items-center gap-4">
                    <label className="flex items-center gap-3 px-4 py-3 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-colors">
                      <Upload size={20} className="text-gray-400" />
                      <span className="text-sm text-gray-600">Upload Image</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => setImageFile(e.target.files[0])}
                        className="hidden"
                      />
                    </label>
                    {imageFile && (
                      <div className="flex items-center gap-2 px-3 py-2 bg-green-50 rounded-xl">
                        <Check className="text-green-500" size={16} />
                        <span className="text-sm text-green-700 font-medium">
                          {imageFile.name}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-6 py-3 border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-all"
                  >
                    {loading && <Loader2 className="animate-spin" size={18} />}
                    Add Client
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Edit Client Modal */}
        {isEditModalOpen && currentClient && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md transform transition-all">
              <div className="flex justify-between items-center border-b border-gray-200 p-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-100 rounded-xl">
                    <Edit className="text-green-600" size={20} />
                  </div>
                  <h2 className="text-xl font-semibold text-gray-900">Edit Client</h2>
                </div>
                <button
                  onClick={() => setIsEditModalOpen(false)}
                  className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition-colors"
                >
                  <X size={20} />
                </button>
              </div>
              <form onSubmit={handleEditSubmit} className="p-6 space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Client Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={editFormData.name}
                    onChange={handleEditInputChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Review
                  </label>
                  <input
                    type="text"
                    name="review"
                    value={editFormData.review}
                    onChange={handleEditInputChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Client Image
                  </label>
                  <div className="flex items-center gap-4 mb-4">
                    {editFormData.image ? (
                      <img
                        src={editFormData.image}
                        alt="Current"
                        className="h-16 w-16 rounded-full object-cover ring-2 ring-white shadow-lg"
                      />
                    ) : (
                      <div className="h-16 w-16 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center ring-2 ring-white shadow-lg">
                        <User className="text-gray-400" size={24} />
                      </div>
                    )}
                    <div className="flex-1">
                      <label className="flex items-center gap-3 px-4 py-3 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-colors">
                        <Upload size={20} className="text-gray-400" />
                        <span className="text-sm text-gray-600">Change Image</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => setEditImageFile(e.target.files[0])}
                          className="hidden"
                        />
                      </label>
                    </div>
                  </div>
                  {editImageFile && (
                    <div className="flex items-center gap-2 px-3 py-2 bg-green-50 rounded-xl">
                      <Check className="text-green-500" size={16} />
                      <span className="text-sm text-green-700 font-medium">
                        {editImageFile.name}
                      </span>
                    </div>
                  )}
                </div>
                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setIsEditModalOpen(false)}
                    className="px-6 py-3 border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl hover:from-green-700 hover:to-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-all"
                  >
                    {loading && <Loader2 className="animate-spin" size={18} />}
                    Update Client
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Clients;