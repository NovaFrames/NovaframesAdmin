import React, { useState, useEffect } from 'react';
import { collection, getDocs, addDoc, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../utils/firebase';
import {
  Plus,
  X,
  Upload,
  Camera,
  Calendar,
  Tag,
  FileText,
  Eye,
  Trash2,
  Edit3,
  Grid3X3,
  List,
  Search,
  Filter,
  ImageIcon,
  Table,
  Quote,
  Link
} from 'lucide-react';
import { fetchServices } from '../utils/service';

const Projects = () => {
  const [projects, setProjects] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [viewMode, setViewMode] = useState('table');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [project, setProject] = useState({
    title: '',
    category: '',
    images: [],
    description: '',
    year: '',
    link: '',
    review: '',
    serviceId: '', // Add this line
  });
  const [isUploading, setIsUploading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentProjectId, setCurrentProjectId] = useState(null);
  const [viewingProject, setViewingProject] = useState(null);

  // Fetch projects from Firebase
  useEffect(() => {
    const fetchProjects = async () => {
      const querySnapshot = await getDocs(collection(db, 'projects'));
      const projectsData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setProjects(projectsData);
    };

    fetchProjects();
    loadServices();
  }, []);

  const [services, setServices] = useState([]);
  const loadServices = async () => {
    try {
      const serviceList = await fetchServices();
      setServices(serviceList);
    } catch (error) {
      console.error("Failed to fetch services:", error);
    }
  };

  // Get unique categories for filter
  const categories = [...new Set(projects.map(p => p.category))];

  // Filter projects based on search and category
  const filteredProjects = projects.filter(proj => {
    const matchesSearch = proj.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      proj.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !selectedCategory || proj.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProject(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageUpload = async (e, index) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const storageRef = ref(storage, `projects/${Date.now()}_${file.name}`);
      await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(storageRef);

      setProject(prev => {
        const newImages = [...prev.images];
        newImages[index] = downloadURL;
        return {
          ...prev,
          images: newImages
        };
      });
    } catch (error) {
      console.error('Error uploading image:', error);
      alert('Error uploading image');
    } finally {
      setIsUploading(false);
    }
  };

  const addImageInput = () => {
    setProject(prev => ({
      ...prev,
      images: [...prev.images, null]
    }));
  };

  const removeImageInput = (index) => {
    setProject(prev => {
      const newImages = [...prev.images];
      newImages.splice(index, 1);
      return {
        ...prev,
        images: newImages
      };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (project.images.filter(img => img).length === 0) {
      alert('Please upload at least one image');
      return;
    }

    setIsUploading(true);
    try {
      if (isEditing) {
        // Update existing project
        await updateDoc(doc(db, "projects", currentProjectId), {
          ...project,
          images: project.images.filter(img => img)
        });
        // Update local state
        setProjects(projects.map(p =>
          p.id === currentProjectId ? { ...p, ...project } : p
        ));
      } else {
        // Add new project
        const docRef = await addDoc(collection(db, 'projects'), {
          ...project,

          images: project.images.filter(img => img)
        });

        await updateDoc(doc(db, 'projects', docRef.id), {
          id: docRef.id
        });

        setProjects(prev => [...prev, {
          id: docRef.id,
          ...project,
          images: project.images.filter(img => img)
        }]);
      }

      // Reset form and close modal
      setIsModalOpen(false);
      setProject({
        title: '',
        category: '',
        images: [],
        description: '',
        year: '',
        link: '',
        review: '',
        serviceId: '',
      });
      setIsEditing(false);
      setCurrentProjectId(null);

    } catch (error) {
      console.error('Error:', error);
      alert(isEditing ? 'Error updating project' : 'Error adding project');
    } finally {
      setIsUploading(false);
    }
  };

  const handleView = (project) => {
    setViewingProject(project);
  };

  const handleEdit = (project) => {
    setProject({
      title: project.title,
      category: project.category,
      images: project.images || [],
      description: project.description,
      year: project.year,
      link: project.link,
      review: project.review,
      serviceId: project.serviceId || '',// Add this line
    });
    setCurrentProjectId(project.id);
    setIsEditing(true);
    setIsModalOpen(true);
  };

  const handleDelete = async (projectId) => {
    if (window.confirm("Are you sure you want to delete this project?")) {
      try {
        await deleteDoc(doc(db, "projects", projectId));
        setProjects(projects.filter(p => p.id !== projectId));
      } catch (error) {
        console.error("Error deleting project:", error);
        alert("Error deleting project");
      }
    }
  };

  const closeViewModal = () => {
    setViewingProject(null);
  };

  const ProjectCard = ({ project }) => (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-lg transition-all duration-300 group overflow-hidden">
      <div className="relative h-48 bg-gradient-to-br from-blue-50 to-indigo-100">
        {project.images && project.images.length > 0 ? (
          <img
            src={project.images[0]}
            alt={project.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="flex items-center justify-center h-full">
            <Camera className="w-16 h-16 text-gray-300" />
          </div>
        )}
        <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm rounded-full px-2 py-1 text-xs font-medium text-gray-600">
          {project.images?.length || 0} <Camera className="w-3 h-3 inline ml-1" />
        </div>
      </div>

      <div className="p-6">
        <div className="flex items-start justify-between mb-3">
          <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
            {project.title}
          </h3>
          <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
            {project.year}
          </span>
        </div>

        <div className="flex items-center gap-2 mb-3">
          <Tag className="w-4 h-4 text-blue-500" />
          <span className="text-sm font-medium text-blue-600 bg-blue-50 px-2 py-1 rounded-full">
            {project.category}
          </span>
        </div>

        <p className="text-gray-600 text-sm line-clamp-3 mb-4">
          {project.description}
        </p>

        <div className="flex items-center justify-between">
          <button
            onClick={() => handleView(project)}
            className="flex items-center gap-2 text-sm text-gray-500 hover:text-blue-600 transition-colors"
          >
            <Eye className="w-4 h-4" />
            View Details
          </button>
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleEdit(project)}
              className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
            >
              <Edit3 className="w-4 h-4" />
            </button>
            <button
              onClick={() => handleDelete(project.id)}
              className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Projects Portfolio</h1>
              <p className="text-gray-600">Manage and showcase your creative projects</p>
            </div>

            <button
              onClick={() => {
                setIsEditing(false);
                setCurrentProjectId(null);
                setProject({
                  title: '',
                  category: '',
                  images: [],
                  description: '',
                  year: '',
                });
                setIsModalOpen(true);
              }}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              <Plus className="w-5 h-5" />
              Add New Project
            </button>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
          <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
            <div className="flex flex-col sm:flex-row gap-4 flex-1">
              {/* Search */}
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search projects..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Category Filter */}
              <div className="relative">
                <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="pl-10 pr-8 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white min-w-[150px]"
                >
                  <option value="">All Categories</option>
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* View Toggle */}
            <div className="flex items-center gap-2 bg-gray-100 rounded-lg p-1">
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
          </div>
        </div>

        {/* Results Count */}
        <div className="mb-6">
          <p className="text-gray-600">
            Showing {filteredProjects.length} of {projects.length} projects
          </p>
        </div>

        {/* Projects Display */}
        {viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProjects.map((proj) => (
              <ProjectCard key={proj.id} project={proj} />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Project</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Year</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Images</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredProjects.map((proj) => (
                    <tr key={proj.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            {proj.images && proj.images.length > 0 ? (
                              <img
                                className="h-10 w-10 rounded-lg object-cover"
                                src={proj.images[0]}
                                alt={proj.title}
                              />
                            ) : (
                              <div className="h-10 w-10 rounded-lg bg-gray-200 flex items-center justify-center">
                                <Camera className="w-5 h-5 text-gray-400" />
                              </div>
                            )}
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{proj.title}</div>
                            <div className="text-sm text-gray-500 truncate max-w-xs">{proj.description}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {proj.category}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{proj.year}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div className="flex items-center">
                          <Camera className="w-4 h-4 mr-1" />
                          {proj.images?.length || 0}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleView(proj)}
                            className="text-blue-600 hover:text-blue-900 p-1"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleEdit(proj)}
                            className="text-gray-600 hover:text-gray-900 p-1"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(proj.id)}
                            className="text-red-600 hover:text-red-900 p-1"
                          >
                            <Trash2 className="w-4 h-4" />
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

        {filteredProjects.length === 0 && (
          <div className="text-center py-12">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12">
              <ImageIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No projects found</h3>
              <p className="text-gray-500 mb-6">
                {searchTerm || selectedCategory
                  ? "Try adjusting your search or filter criteria"
                  : "Get started by adding your first project"
                }
              </p>
              {!searchTerm && !selectedCategory && (
                <button
                  onClick={() => setIsModalOpen(true)}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Plus className="w-5 h-5" />
                  Add Your First Project
                </button>
              )}
            </div>
          </div>
        )}

        {/* Add/Edit Project Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden shadow-2xl">
              <div className="p-6 border-b border-gray-200">
                <div className="flex justify-between items-center">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">
                      {isEditing ? "Edit Project" : "Add New Project"}
                    </h2>
                    <p className="text-gray-600 mt-1">Share your latest creative work</p>
                  </div>
                  <button
                    onClick={() => setIsModalOpen(false)}
                    className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                    disabled={isUploading}
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>
              </div>

              <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
                <form onSubmit={handleSubmit} className="space-y-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                        <FileText className="w-4 h-4" />
                        Project Title *
                      </label>
                      <input
                        type="text"
                        name="title"
                        value={project.title}
                        onChange={handleChange}
                        className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                        placeholder="Enter project title"
                        required
                        disabled={isUploading}
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                        <Tag className="w-4 h-4" />
                        Category *
                      </label>
                      <select
                        name="category"
                        value={project.category}
                        onChange={handleChange}
                        className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                        required
                        disabled={isUploading}
                      >
                        <option value="">Select a category</option>
                        <option value="Digital Marketing">Digital Marketing</option>
                        <option value="Branding">Branding</option>
                        <option value="Graphic Design">Graphic Design</option>
                        <option value="Software Developement">Software Developement</option>
                      </select>
                    </div>

                    {project.category === 'Software Developement' && (
                      <div className="space-y-2">
                        <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                          <Tag className="w-4 h-4" />
                          Select Service
                        </label>
                        <select
                          name="serviceId"
                          value={project.serviceId}
                          onChange={handleChange}
                          disabled={isUploading}
                          className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                        >
                          <option value="">Select an option</option>
                          <option value="mobile">Mobile</option>
                          <option value="website">Website</option>
                          <option value="ecommerce">E-commerce</option>
                        </select>
                      </div>
                    )}

                    <div className="space-y-2">
                      <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                        <Link className="w-4 h-4" />
                        Link
                      </label>
                      <input
                        type="text"
                        name="link"
                        value={project.link}
                        onChange={handleChange}
                        className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                        placeholder="Enter project link"
                        required
                        disabled={isUploading}
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                        <Quote className="w-4 h-4" />
                        Review
                      </label>
                      <input
                        type="text"
                        name="review"
                        value={project.review}
                        onChange={handleChange}
                        className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                        placeholder="Enter project review"
                        required
                        disabled={isUploading}
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                        <Calendar className="w-4 h-4" />
                        Year *
                      </label>
                      <input
                        type="text"
                        name="year"
                        value={project.year}
                        onChange={handleChange}
                        className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                        placeholder="2024"
                        required
                        disabled={isUploading}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                      <FileText className="w-4 h-4" />
                      Description *
                    </label>
                    <textarea
                      name="description"
                      value={project.description}
                      onChange={handleChange}
                      rows="4"
                      className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors resize-none"
                      placeholder="Describe your project, technologies used, challenges overcome..."
                      required
                      disabled={isUploading}
                    />
                  </div>

                  <div className="space-y-4">
                    <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                      <ImageIcon className="w-4 h-4" />
                      Project Images
                    </label>

                    <div className="space-y-4">
                      {project.images.map((image, index) => (
                        <div key={index} className="bg-gray-50 rounded-lg p-4 border-2 border-dashed border-gray-200">
                          <div className="flex items-start gap-4">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <Upload className="w-4 h-4 text-gray-500" />
                                <span className="text-sm font-medium text-gray-700">
                                  Image {index + 1}
                                </span>
                              </div>

                              <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => handleImageUpload(e, index)}
                                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                disabled={isUploading}
                              />

                              {project.images[index] && (
                                <div className="mt-3 bg-white rounded-lg p-2 border border-gray-200 shadow-sm">
                                  <img
                                    src={project.images[index]}
                                    alt={`Preview ${index + 1}`}
                                    className="w-full h-32 object-cover rounded-md"
                                  />
                                  <p className="text-xs text-green-600 mt-2 flex items-center gap-1">
                                    ✓ Uploaded successfully
                                  </p>
                                </div>
                              )}
                            </div>

                            <button
                              type="button"
                              onClick={() => removeImageInput(index)}
                              className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                              disabled={isUploading}
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ))}

                      <button
                        type="button"
                        onClick={addImageInput}
                        className="w-full p-4 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-blue-400 hover:text-blue-600 hover:bg-blue-50 transition-all duration-200 flex items-center justify-center gap-2"
                        disabled={isUploading}
                      >
                        <Plus className="w-5 h-5" />
                        Add Another Image
                      </button>
                    </div>
                  </div>

                  <div className="flex justify-end gap-4 pt-6 border-t border-gray-200">
                    <button
                      type="button"
                      onClick={() => {
                        setIsModalOpen(false);
                        setIsEditing(false);
                        setCurrentProjectId(null);
                      }}
                      className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                      disabled={isUploading}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                      disabled={isUploading}
                    >
                      {isUploading ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          {isEditing ? "Updating..." : "Uploading..."}
                        </>
                      ) : (
                        <>
                          {isEditing ? (
                            <>
                              <Edit3 className="w-4 h-4" />
                              Update Project
                            </>
                          ) : (
                            <>
                              <Plus className="w-4 h-4" />
                              Save Project
                            </>
                          )}
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* View Project Modal */}
        {viewingProject && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden shadow-2xl">
              <div className="p-6 border-b border-gray-200">
                <div className="flex justify-between items-center">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">{viewingProject.title}</h2>
                    <p className="text-gray-600 mt-1">{viewingProject.category} • {viewingProject.year}</p>
                  </div>
                  <button
                    onClick={closeViewModal}
                    className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>
              </div>

              <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)] space-y-6">
                {viewingProject.images && viewingProject.images.length > 0 && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {viewingProject.images.map((img, index) => (
                      <div key={index} className="rounded-lg overflow-hidden border border-gray-200">
                        <img
                          src={img}
                          alt={`Project ${index + 1}`}
                          className="w-full h-64 object-cover"
                        />
                      </div>
                    ))}
                  </div>
                )}

                <div className="prose max-w-none">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Description</h3>
                  <p className="text-gray-700 whitespace-pre-line">{viewingProject.description}</p>
                </div>

                <div className="flex justify-end pt-6 border-t border-gray-200">
                  <button
                    onClick={() => {
                      closeViewModal();
                      handleEdit(viewingProject);
                    }}
                    className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                  >
                    <Edit3 className="w-4 h-4" />
                    Edit Project
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

export default Projects;