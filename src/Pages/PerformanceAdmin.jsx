import React, { useState, useEffect } from 'react';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { db } from '../utils/firebase';
// import { toast } from 'react-toastify';

const PerformanceAdmin = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('hero');
  
  // Initialize all sections with empty/default values
  const [formData, setFormData] = useState({
    hero: {
      title: '',
      subtitle: ''
    },
    partnerReasons: [],
    benefits: [],
    services: [],
    metrics: [],
    faq: [],
  });

  // Fetch data from Firebase on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        const docRef = doc(db, 'performanceAdmin', 'content');
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          setFormData(docSnap.data());
        } else {
          console.log('No such document! Using default values');
        }
      } catch (error) {
        console.error('Error fetching document: ', error);
        // toast.error('Failed to load content');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

  // Handle input changes for all sections
  const handleChange = (section, field, value, index = null) => {
    if (index !== null) {
      // For array fields (partnerReasons, benefits, etc.)
      setFormData(prev => ({
        ...prev,
        [section]: prev[section].map((item, i) => 
          i === index ? { ...item, [field]: value } : item
        )
      }));
    } else {
      // For simple fields (hero title, etc.)
      setFormData(prev => ({
        ...prev,
        [section]: {
          ...prev[section],
          [field]: value
        }
      }));
    }
  };

  // Add new item to an array section
  const addItem = (section, template) => {
    setFormData(prev => ({
      ...prev,
      [section]: [...prev[section], template]
    }));
  };

  // Remove item from an array section
  const removeItem = (section, index) => {
    setFormData(prev => ({
      ...prev,
      [section]: prev[section].filter((_, i) => i !== index)
    }));
  };

  // Save all data to Firebase
  const handleSave = async () => {
    setSaving(true);
    try {
      const docRef = doc(db, 'performanceAdmin', 'content');
      // Use setDoc with merge: true to create or update the document
      await setDoc(docRef, formData, { merge: true });
    //   toast.success('Content saved successfully!');
    } catch (error) {
      console.error('Error updating document: ', error);
    //   toast.error('Failed to save content');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">Performance Marketing Admin</h1>
        
        {/* Navigation Tabs */}
        <div className="flex flex-wrap gap-2 mb-6">
          {['hero', 'partnerReasons', 'benefits', 'services', 'metrics', 'faq'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-md ${activeTab === tab ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-200'}`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1).replace(/([A-Z])/g, ' $1')}
            </button>
          ))}
        </div>
        
        {/* Save Button */}
        <div className="flex justify-end mb-6">
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-green-400 flex items-center"
          >
            {saving ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Saving...
              </>
            ) : 'Save All Changes'}
          </button>
        </div>
        
        {/* Hero Section Editor */}
        {activeTab === 'hero' && (
          <div className="bg-white p-6 rounded-lg shadow-md mb-6">
            <h2 className="text-xl font-semibold mb-4">Hero Section</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                <input
                  type="text"
                  value={formData.hero.title}
                  onChange={(e) => handleChange('hero', 'title', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Subtitle</label>
                <textarea
                  value={formData.hero.subtitle}
                  onChange={(e) => handleChange('hero', 'subtitle', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={3}
                />
              </div>
            </div>
          </div>
        )}
        
        {/* Partner Reasons Editor */}
        {activeTab === 'partnerReasons' && (
          <div className="bg-white p-6 rounded-lg shadow-md mb-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Why Partner With Us</h2>
              <button
                onClick={() => addItem('partnerReasons', {
                  icon: 'Target',
                  title: '',
                  description: ''
                })}
                className="px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm"
              >
                Add Reason
              </button>
            </div>
            
            <div className="space-y-4">
              {formData.partnerReasons.map((reason, index) => (
                <div key={index} className="border border-gray-200 rounded-md p-4">
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="font-medium">Reason {index + 1}</h3>
                    <button
                      onClick={() => removeItem('partnerReasons', index)}
                      className="text-red-600 hover:text-red-800 text-sm"
                    >
                      Remove
                    </button>
                  </div>
                  
                  <div className="grid md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Icon</label>
                      <select
                        value={reason.icon}
                        onChange={(e) => handleChange('partnerReasons', 'icon', e.target.value, index)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="Target">Target</option>
                        <option value="BarChart3">BarChart3</option>
                        <option value="Share2">Share2</option>
                        <option value="Eye">Eye</option>
                        <option value="Users">Users</option>
                        <option value="Zap">Zap</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                      <input
                        type="text"
                        value={reason.title}
                        onChange={(e) => handleChange('partnerReasons', 'title', e.target.value, index)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                      <textarea
                        value={reason.description}
                        onChange={(e) => handleChange('partnerReasons', 'description', e.target.value, index)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        rows={2}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* Benefits Editor */}
        {activeTab === 'benefits' && (
          <div className="bg-white p-6 rounded-lg shadow-md mb-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Key Benefits</h2>
              <button
                onClick={() => addItem('benefits', {
                  icon: 'TrendingUp',
                  title: '',
                  description: ''
                })}
                className="px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm"
              >
                Add Benefit
              </button>
            </div>
            
            <div className="space-y-4">
              {formData.benefits.map((benefit, index) => (
                <div key={index} className="border border-gray-200 rounded-md p-4">
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="font-medium">Benefit {index + 1}</h3>
                    <button
                      onClick={() => removeItem('benefits', index)}
                      className="text-red-600 hover:text-red-800 text-sm"
                    >
                      Remove
                    </button>
                  </div>
                  
                  <div className="grid md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Icon</label>
                      <select
                        value={benefit.icon}
                        onChange={(e) => handleChange('benefits', 'icon', e.target.value, index)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="TrendingUp">TrendingUp</option>
                        <option value="Target">Target</option>
                        <option value="Users">Users</option>
                        <option value="DollarSign">DollarSign</option>
                        <option value="Zap">Zap</option>
                        <option value="Sparkles">Sparkles</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                      <input
                        type="text"
                        value={benefit.title}
                        onChange={(e) => handleChange('benefits', 'title', e.target.value, index)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                      <textarea
                        value={benefit.description}
                        onChange={(e) => handleChange('benefits', 'description', e.target.value, index)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        rows={3}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* Services Editor */}
        {activeTab === 'services' && (
          <div className="bg-white p-6 rounded-lg shadow-md mb-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Our Services</h2>
              <button
                onClick={() => addItem('services', {
                  icon: 'Search',
                  title: '',
                  description: ''
                })}
                className="px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm"
              >
                Add Service
              </button>
            </div>
            
            <div className="space-y-4">
              {formData.services.map((service, index) => (
                <div key={index} className="border border-gray-200 rounded-md p-4">
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="font-medium">Service {index + 1}</h3>
                    <button
                      onClick={() => removeItem('services', index)}
                      className="text-red-600 hover:text-red-800 text-sm"
                    >
                      Remove
                    </button>
                  </div>
                  
                  <div className="grid md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Icon</label>
                      <select
                        value={service.icon}
                        onChange={(e) => handleChange('services', 'icon', e.target.value, index)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="Search">Search</option>
                        <option value="Share2">Share2</option>
                        <option value="Monitor">Monitor</option>
                        <option value="ShoppingCart">ShoppingCart</option>
                        <option value="Smartphone">Smartphone</option>
                        <option value="RefreshCw">RefreshCw</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                      <input
                        type="text"
                        value={service.title}
                        onChange={(e) => handleChange('services', 'title', e.target.value, index)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                      <textarea
                        value={service.description}
                        onChange={(e) => handleChange('services', 'description', e.target.value, index)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        rows={3}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* Metrics Editor */}
        {activeTab === 'metrics' && (
          <div className="bg-white p-6 rounded-lg shadow-md mb-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Success Metrics</h2>
              <button
                onClick={() => addItem('metrics', {
                  icon: 'MousePointer',
                  title: '',
                  description: ''
                })}
                className="px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm"
              >
                Add Metric
              </button>
            </div>
            
            <div className="space-y-4">
              {formData.metrics.map((metric, index) => (
                <div key={index} className="border border-gray-200 rounded-md p-4">
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="font-medium">Metric {index + 1}</h3>
                    <button
                      onClick={() => removeItem('metrics', index)}
                      className="text-red-600 hover:text-red-800 text-sm"
                    >
                      Remove
                    </button>
                  </div>
                  
                  <div className="grid md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Icon</label>
                      <select
                        value={metric.icon}
                        onChange={(e) => handleChange('metrics', 'icon', e.target.value, index)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="MousePointer">MousePointer</option>
                        <option value="UserCheck">UserCheck</option>
                        <option value="Mail">Mail</option>
                        <option value="TrendingUp">TrendingUp</option>
                        <option value="DollarSign">DollarSign</option>
                        <option value="BarChart3">BarChart3</option>
                        <option value="UserCircle2Icon">UserCircle2Icon</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                      <input
                        type="text"
                        value={metric.title}
                        onChange={(e) => handleChange('metrics', 'title', e.target.value, index)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                      <textarea
                        value={metric.description}
                        onChange={(e) => handleChange('metrics', 'description', e.target.value, index)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        rows={3}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* FAQ Editor */}
        {activeTab === 'faq' && (
          <div className="bg-white p-6 rounded-lg shadow-md mb-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Frequently Asked Questions</h2>
              <button
                onClick={() => addItem('faq', {
                  question: '',
                  answer: ''
                })}
                className="px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm"
              >
                Add FAQ
              </button>
            </div>
            
            <div className="space-y-4">
              {formData.faq.map((item, index) => (
                <div key={index} className="border border-gray-200 rounded-md p-4">
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="font-medium">FAQ {index + 1}</h3>
                    <button
                      onClick={() => removeItem('faq', index)}
                      className="text-red-600 hover:text-red-800 text-sm"
                    >
                      Remove
                    </button>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Question</label>
                      <input
                        type="text"
                        value={item.question}
                        onChange={(e) => handleChange('faq', 'question', e.target.value, index)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Answer</label>
                      <textarea
                        value={item.answer}
                        onChange={(e) => handleChange('faq', 'answer', e.target.value, index)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        rows={4}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PerformanceAdmin;