// ServicesPage.jsx
import { useState, useEffect } from 'react';
import {  addDoc, getDocs, doc, updateDoc, deleteDoc, collection } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../utils/firebase';

const ServicesPage = () => {
  const [services, setServices] = useState([]);
  const [editingService, setEditingService] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // Form states
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [benefits, setBenefits] = useState([{ name: '', description: '' }]);
  const [portfolioItems, setPortfolioItems] = useState([{ 
    name: '', 
    description: '', 
    projectName: '', 
    techniques: [''], 
    image: null,
    imageUrl: ''
  }]);
  const [faqs, setFaqs] = useState([{ question: '', answer: '' }]);

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    setIsLoading(true);
    try {
      const querySnapshot = await getDocs(collection(db, 'services'));
      const servicesData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setServices(servicesData);
    } catch (error) {
      console.error('Error fetching services:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Upload portfolio images first
      const portfolioWithUrls = await Promise.all(
        portfolioItems.map(async (item) => {
          if (item.image) {
            const storageRef = ref(storage, `portfolio/${Date.now()}_${item.image.name}`);
            await uploadBytes(storageRef, item.image);
            const url = await getDownloadURL(storageRef);
            return { ...item, imageUrl: url };
          }
          return item;
        })
      );

      const serviceData = {
        name,
        description,
        benefits,
        portfolio: portfolioWithUrls,
        faqs
      };

      if (editingService) {
        // Update existing service
        await updateDoc(doc(db, 'services', editingService.id), serviceData);
      } else {
        // Add new service
        await addDoc(collection(db, 'services'), serviceData);
      }

      resetForm();
      fetchServices();
    } catch (error) {
      console.error('Error saving service:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setName('');
    setDescription('');
    setBenefits([{ name: '', description: '' }]);
    setPortfolioItems([{ 
      name: '', 
      description: '', 
      projectName: '', 
      techniques: [''], 
      image: null,
      imageUrl: ''
    }]);
    setFaqs([{ question: '', answer: '' }]);
    setEditingService(null);
  };

  const editService = (service) => {
    setEditingService(service);
    setName(service.name);
    setDescription(service.description);
    setBenefits(service.benefits || [{ name: '', description: '' }]);
    setPortfolioItems(service.portfolio || [{ 
      name: '', 
      description: '', 
      projectName: '', 
      techniques: [''], 
      image: null,
      imageUrl: ''
    }]);
    setFaqs(service.faqs || [{ question: '', answer: '' }]);
  };

  const deleteService = async (id) => {
    if (window.confirm('Are you sure you want to delete this service?')) {
      setIsLoading(true);
      try {
        await deleteDoc(doc(db, 'services', id));
        fetchServices();
      } catch (error) {
        console.error('Error deleting service:', error);
      } finally {
        setIsLoading(false);
      }
    }
  };

  // Benefits handlers
  const handleBenefitChange = (index, field, value) => {
    const updatedBenefits = [...benefits];
    updatedBenefits[index][field] = value;
    setBenefits(updatedBenefits);
  };

  const addBenefit = () => {
    setBenefits([...benefits, { name: '', description: '' }]);
  };

  const removeBenefit = (index) => {
    if (benefits.length > 1) {
      const updatedBenefits = [...benefits];
      updatedBenefits.splice(index, 1);
      setBenefits(updatedBenefits);
    }
  };

  // Portfolio handlers
  const handlePortfolioChange = (index, field, value) => {
    const updatedPortfolio = [...portfolioItems];
    updatedPortfolio[index][field] = value;
    setPortfolioItems(updatedPortfolio);
  };

  const handlePortfolioImageChange = (index, file) => {
    const updatedPortfolio = [...portfolioItems];
    updatedPortfolio[index].image = file;
    setPortfolioItems(updatedPortfolio);
  };

  const handleTechniqueChange = (portfolioIndex, techIndex, value) => {
    const updatedPortfolio = [...portfolioItems];
    updatedPortfolio[portfolioIndex].techniques[techIndex] = value;
    setPortfolioItems(updatedPortfolio);
  };

  const addTechnique = (portfolioIndex) => {
    const updatedPortfolio = [...portfolioItems];
    updatedPortfolio[portfolioIndex].techniques.push('');
    setPortfolioItems(updatedPortfolio);
  };

  const removeTechnique = (portfolioIndex, techIndex) => {
    const updatedPortfolio = [...portfolioItems];
    if (updatedPortfolio[portfolioIndex].techniques.length > 1) {
      updatedPortfolio[portfolioIndex].techniques.splice(techIndex, 1);
      setPortfolioItems(updatedPortfolio);
    }
  };

  const addPortfolioItem = () => {
    setPortfolioItems([...portfolioItems, { 
      name: '', 
      description: '', 
      projectName: '', 
      techniques: [''], 
      image: null,
      imageUrl: ''
    }]);
  };

  const removePortfolioItem = (index) => {
    if (portfolioItems.length > 1) {
      const updatedPortfolio = [...portfolioItems];
      updatedPortfolio.splice(index, 1);
      setPortfolioItems(updatedPortfolio);
    }
  };

  // FAQ handlers
  const handleFaqChange = (index, field, value) => {
    const updatedFaqs = [...faqs];
    updatedFaqs[index][field] = value;
    setFaqs(updatedFaqs);
  };

  const addFaq = () => {
    setFaqs([...faqs, { question: '', answer: '' }]);
  };

  const removeFaq = (index) => {
    if (faqs.length > 1) {
      const updatedFaqs = [...faqs];
      updatedFaqs.splice(index, 1);
      setFaqs(updatedFaqs);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Services Management</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Form Section */}
        <div className="lg:col-span-2 bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">
            {editingService ? 'Edit Service' : 'Add New Service'}
          </h2>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Info */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Service Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows="3"
                required
              />
            </div>
            
            {/* Benefits Section */}
            <div className="border-t pt-4">
              <h3 className="text-lg font-medium mb-2">Key Benefits</h3>
              {benefits.map((benefit, index) => (
                <div key={index} className="mb-4 p-3 bg-gray-50 rounded-md">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-2">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Benefit Name</label>
                      <input
                        type="text"
                        value={benefit.name}
                        onChange={(e) => handleBenefitChange(index, 'name', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                      <input
                        type="text"
                        value={benefit.description}
                        onChange={(e) => handleBenefitChange(index, 'description', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      />
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeBenefit(index)}
                    className="text-red-600 text-sm hover:text-red-800"
                    disabled={benefits.length <= 1}
                  >
                    Remove Benefit
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={addBenefit}
                className="mt-2 text-blue-600 hover:text-blue-800 text-sm font-medium"
              >
                + Add Another Benefit
              </button>
            </div>
            
            {/* Portfolio Section */}
            <div className="border-t pt-4">
              <h3 className="text-lg font-medium mb-2">Portfolio Items</h3>
              {portfolioItems.map((item, pIndex) => (
                <div key={pIndex} className="mb-6 p-3 bg-gray-50 rounded-md">
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Item Name</label>
                      <input
                        type="text"
                        value={item.name}
                        onChange={(e) => handlePortfolioChange(pIndex, 'name', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Project Name</label>
                      <input
                        type="text"
                        value={item.projectName}
                        onChange={(e) => handlePortfolioChange(pIndex, 'projectName', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                      <textarea
                        value={item.description}
                        onChange={(e) => handlePortfolioChange(pIndex, 'description', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        rows="2"
                        required
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Image</label>
                      <input
                        type="file"
                        onChange={(e) => handlePortfolioImageChange(pIndex, e.target.files[0])}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        accept="image/*"
                        required={!editingService || !item.imageUrl}
                      />
                      {item.imageUrl && (
                        <div className="mt-2">
                          <img src={item.imageUrl} alt="Preview" className="h-20 object-cover rounded" />
                        </div>
                      )}
                    </div>
                    
                    {/* Techniques */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Techniques Used</label>
                      {item.techniques.map((tech, tIndex) => (
                        <div key={tIndex} className="flex items-center mb-2">
                          <input
                            type="text"
                            value={tech}
                            onChange={(e) => handleTechniqueChange(pIndex, tIndex, e.target.value)}
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            required
                          />
                          <button
                            type="button"
                            onClick={() => removeTechnique(pIndex, tIndex)}
                            className="ml-2 text-red-600 hover:text-red-800"
                            disabled={item.techniques.length <= 1}
                          >
                            ×
                          </button>
                        </div>
                      ))}
                      <button
                        type="button"
                        onClick={() => addTechnique(pIndex)}
                        className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                      >
                        + Add Technique
                      </button>
                    </div>
                  </div>
                  
                  <button
                    type="button"
                    onClick={() => removePortfolioItem(pIndex)}
                    className="mt-2 text-red-600 text-sm hover:text-red-800"
                    disabled={portfolioItems.length <= 1}
                  >
                    Remove Portfolio Item
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={addPortfolioItem}
                className="mt-2 text-blue-600 hover:text-blue-800 text-sm font-medium"
              >
                + Add Another Portfolio Item
              </button>
            </div>
            
            {/* FAQs Section */}
            <div className="border-t pt-4">
              <h3 className="text-lg font-medium mb-2">FAQs</h3>
              {faqs.map((faq, index) => (
                <div key={index} className="mb-4 p-3 bg-gray-50 rounded-md">
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Question</label>
                      <input
                        type="text"
                        value={faq.question}
                        onChange={(e) => handleFaqChange(index, 'question', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Answer</label>
                      <textarea
                        value={faq.answer}
                        onChange={(e) => handleFaqChange(index, 'answer', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        rows="2"
                        required
                      />
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeFaq(index)}
                    className="mt-2 text-red-600 text-sm hover:text-red-800"
                    disabled={faqs.length <= 1}
                  >
                    Remove FAQ
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={addFaq}
                className="mt-2 text-blue-600 hover:text-blue-800 text-sm font-medium"
              >
                + Add Another FAQ
              </button>
            </div>
            
            {/* Form Actions */}
            <div className="flex justify-end space-x-3 pt-4 border-t">
              <button
                type="button"
                onClick={resetForm}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-blue-400"
              >
                {isLoading ? 'Saving...' : (editingService ? 'Update Service' : 'Add Service')}
              </button>
            </div>
          </form>
        </div>
        
        {/* Services List */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Existing Services</h2>
          {isLoading && !services.length ? (
            <p>Loading services...</p>
          ) : services.length === 0 ? (
            <p>No services found. Add one to get started.</p>
          ) : (
            <ul className="space-y-3">
              {services.map((service) => (
                <li key={service.id} className="border-b pb-3">
                  <h3 className="font-medium">{service.name}</h3>
                  <p className="text-sm text-gray-600 mb-2 line-clamp-2">{service.description}</p>
                  <div className="flex space-x-2 text-sm">
                    <button
                      onClick={() => editService(service)}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => deleteService(service.id)}
                      className="text-red-600 hover:text-red-800"
                    >
                      Delete
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};

export default ServicesPage;