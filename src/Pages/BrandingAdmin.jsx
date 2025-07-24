import React, { useState, useEffect } from "react";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import {
  Palette,
  Brush,
  BarChart3,
  Smartphone,
  Package,
  FileText,
  Plus,
  Trash2,
  Edit,
  Save,
  X,
} from 'lucide-react';
import { db } from "../utils/firebase";

const BrandingAdmin = () => {
  // State for all content sections
  const [brandingData, setBrandingData] = useState({
    hero: {
      title: "",
      description: ""
    },
    services: [],
    process: [],
    faqs: [],
    cta: {
      title: "",
      description: ""
    }
  });

  // Form states for editing
  const [editingService, setEditingService] = useState(null);
  const [newService, setNewService] = useState({
    icon: "Palette",
    title: "",
    description: "",
    features: [""]
  });

  const [editingProcess, setEditingProcess] = useState(null);
  const [newProcess, setNewProcess] = useState({
    step: "",
    title: "",
    description: ""
  });

  const [editingFaq, setEditingFaq] = useState(null);
  const [newFaq, setNewFaq] = useState({
    question: "",
    answer: ""
  });

  // Available icons for services
  const serviceIcons = {
    Palette: <Palette size={24} />,
    Brush: <Brush size={24} />,
    BarChart3: <BarChart3 size={24} />,
    Smartphone: <Smartphone size={24} />,
    Package: <Package size={24} />,
    FileText: <FileText size={24} />
  };

  // Fetch data from Firebase
  useEffect(() => {
    const fetchData = async () => {
      try {
        const docRef = doc(db, "branding", "brandingData");
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          setBrandingData(docSnap.data());
        } else {
          await updateDoc(docRef, {
            hero: {
              title: "",
              description: ""
            },
            services: [],
            process: [],
            faqs: [],
            cta: {
              title: "",
              description: ""
            }
          });
        }
      } catch (error) {
        console.error("Error fetching data: ", error);
      }
    };

    fetchData();
  }, []);

  // Service CRUD operations
  const handleAddService = async () => {
    try {
      const updatedServices = [...brandingData.services, {...newService}];
      await updateDoc(doc(db, "branding", "brandingData"), {
        services: updatedServices
      });
      setBrandingData({ ...brandingData, services: updatedServices });
      setNewService({
        icon: "Palette",
        title: "",
        description: "",
        features: [""]
      });
    } catch (error) {
      console.error("Error adding service: ", error);
    }
  };

  const handleUpdateService = async () => {
    try {
      const updatedServices = brandingData.services.map(s =>
        s === editingService.service ? editingService.updatedService : s
      );
      await updateDoc(doc(db, "branding", "brandingData"), {
        services: updatedServices
      });
      setBrandingData({ ...brandingData, services: updatedServices });
      setEditingService(null);
    } catch (error) {
      console.error("Error updating service: ", error);
    }
  };

  const handleDeleteService = async (index) => {
    try {
      const updatedServices = brandingData.services.filter((_, i) => i !== index);
      await updateDoc(doc(db, "branding", "brandingData"), {
        services: updatedServices
      });
      setBrandingData({ ...brandingData, services: updatedServices });
    } catch (error) {
      console.error("Error deleting service: ", error);
    }
  };

  // Process CRUD operations
  const handleAddProcess = async () => {
    try {
      const updatedProcess = [...brandingData.process, {...newProcess}];
      await updateDoc(doc(db, "branding", "brandingData"), {
        process: updatedProcess
      });
      setBrandingData({ ...brandingData, process: updatedProcess });
      setNewProcess({
        step: "",
        title: "",
        description: ""
      });
    } catch (error) {
      console.error("Error adding process step: ", error);
    }
  };

  const handleUpdateProcess = async () => {
    try {
      const updatedProcess = brandingData.process.map(p =>
        p === editingProcess.process ? editingProcess.updatedProcess : p
      );
      await updateDoc(doc(db, "branding", "brandingData"), {
        process: updatedProcess
      });
      setBrandingData({ ...brandingData, process: updatedProcess });
      setEditingProcess(null);
    } catch (error) {
      console.error("Error updating process step: ", error);
    }
  };

  const handleDeleteProcess = async (index) => {
    try {
      const updatedProcess = brandingData.process.filter((_, i) => i !== index);
      await updateDoc(doc(db, "branding", "brandingData"), {
        process: updatedProcess
      });
      setBrandingData({ ...brandingData, process: updatedProcess });
    } catch (error) {
      console.error("Error deleting process step: ", error);
    }
  };

  // FAQ CRUD operations
  const handleAddFaq = async () => {
    try {
      const updatedFaqs = [...brandingData.faqs, {...newFaq}];
      await updateDoc(doc(db, "branding", "brandingData"), {
        faqs: updatedFaqs
      });
      setBrandingData({ ...brandingData, faqs: updatedFaqs });
      setNewFaq({
        question: "",
        answer: ""
      });
    } catch (error) {
      console.error("Error adding FAQ: ", error);
    }
  };

  const handleUpdateFaq = async () => {
    try {
      const updatedFaqs = brandingData.faqs.map(f =>
        f === editingFaq.faq ? editingFaq.updatedFaq : f
      );
      await updateDoc(doc(db, "branding", "brandingData"), {
        faqs: updatedFaqs
      });
      setBrandingData({ ...brandingData, faqs: updatedFaqs });
      setEditingFaq(null);
    } catch (error) {
      console.error("Error updating FAQ: ", error);
    }
  };

  const handleDeleteFaq = async (index) => {
    try {
      const updatedFaqs = brandingData.faqs.filter((_, i) => i !== index);
      await updateDoc(doc(db, "branding", "brandingData"), {
        faqs: updatedFaqs
      });
      setBrandingData({ ...brandingData, faqs: updatedFaqs });
    } catch (error) {
      console.error("Error deleting FAQ: ", error);
    }
  };

  // Update hero and CTA
  const handleUpdateHero = async () => {
    try {
      await updateDoc(doc(db, "branding", "brandingData"), {
        hero: brandingData.hero
      });
    } catch (error) {
      console.error("Error updating hero: ", error);
    }
  };

  // Helper functions to handle edit clicks
  const handleEditService = (service) => {
    setEditingService({
      service: service,
      updatedService: {...service}
    });
  };

  const handleEditProcess = (process) => {
    setEditingProcess({
      process: process,
      updatedProcess: {...process}
    });
  };

  const handleEditFaq = (faq) => {
    setEditingFaq({
      faq: faq,
      updatedFaq: {...faq}
    });
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Branding Content Management</h1>

        {/* Hero Section Editor */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Hero Section</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
              <input
                type="text"
                value={brandingData.hero.title}
                onChange={(e) => setBrandingData({
                  ...brandingData,
                  hero: { ...brandingData.hero, title: e.target.value }
                })}
                className="w-full p-2 border border-gray-300 rounded-md"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea
                value={brandingData.hero.description}
                onChange={(e) => setBrandingData({
                  ...brandingData,
                  hero: { ...brandingData.hero, description: e.target.value }
                })}
                className="w-full p-2 border border-gray-300 rounded-md"
                rows={3}
              />
            </div>
            <button
              onClick={handleUpdateHero}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
            >
              Save Hero Section
            </button>
          </div>
        </div>

        {/* Services Editor */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Services</h2>

          {editingService ? (
            <div className="bg-gray-50 p-4 rounded-lg mb-6">
              <h3 className="font-medium mb-3">Edit Service</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Icon</label>
                  <select
                    value={editingService.updatedService.icon}
                    onChange={(e) => setEditingService({
                      ...editingService,
                      updatedService: {
                        ...editingService.updatedService,
                        icon: e.target.value
                      }
                    })}
                    className="w-full p-2 border border-gray-300 rounded-md"
                  >
                    {Object.keys(serviceIcons).map(iconName => (
                      <option key={iconName} value={iconName}>{iconName}</option>
                    ))}
                  </select>
                  <div className="mt-2">
                    Selected icon: {serviceIcons[editingService.updatedService.icon]}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                  <input
                    type="text"
                    value={editingService.updatedService.title}
                    onChange={(e) => setEditingService({
                      ...editingService,
                      updatedService: {
                        ...editingService.updatedService,
                        title: e.target.value
                      }
                    })}
                    className="w-full p-2 border border-gray-300 rounded-md"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea
                    value={editingService.updatedService.description}
                    onChange={(e) => setEditingService({
                      ...editingService,
                      updatedService: {
                        ...editingService.updatedService,
                        description: e.target.value
                      }
                    })}
                    className="w-full p-2 border border-gray-300 rounded-md"
                    rows={3}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Features</label>
                  {editingService.updatedService.features.map((feature, index) => (
                    <div key={index} className="flex items-center mb-2">
                      <input
                        type="text"
                        value={feature}
                        onChange={(e) => {
                          const newFeatures = [...editingService.updatedService.features];
                          newFeatures[index] = e.target.value;
                          setEditingService({
                            ...editingService,
                            updatedService: {
                              ...editingService.updatedService,
                              features: newFeatures
                            }
                          });
                        }}
                        className="flex-1 p-2 border border-gray-300 rounded-md"
                      />
                      <button
                        onClick={() => {
                          const newFeatures = [...editingService.updatedService.features];
                          newFeatures.splice(index, 1);
                          setEditingService({
                            ...editingService,
                            updatedService: {
                              ...editingService.updatedService,
                              features: newFeatures
                            }
                          });
                        }}
                        className="ml-2 text-red-500 hover:text-red-700"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  ))}
                  <button
                    onClick={() => setEditingService({
                      ...editingService,
                      updatedService: {
                        ...editingService.updatedService,
                        features: [...editingService.updatedService.features, ""]
                      }
                    })}
                    className="mt-2 text-sm text-blue-600 hover:text-blue-800 flex items-center"
                  >
                    <Plus size={16} className="mr-1" /> Add Feature
                  </button>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={handleUpdateService}
                    className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors flex items-center"
                  >
                    <Save size={16} className="mr-1" /> Save
                  </button>
                  <button
                    onClick={() => setEditingService(null)}
                    className="bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600 transition-colors flex items-center"
                  >
                    <X size={16} className="mr-1" /> Cancel
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-gray-50 p-4 rounded-lg mb-6">
              <h3 className="font-medium mb-3">Add New Service</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Icon</label>
                  <select
                    value={newService.icon}
                    onChange={(e) => setNewService({ ...newService, icon: e.target.value })}
                    className="w-full p-2 border border-gray-300 rounded-md"
                  >
                    {Object.keys(serviceIcons).map(iconName => (
                      <option key={iconName} value={iconName}>{iconName}</option>
                    ))}
                  </select>
                  <div className="mt-2">
                    Selected icon: {serviceIcons[newService.icon]}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                  <input
                    type="text"
                    value={newService.title}
                    onChange={(e) => setNewService({ ...newService, title: e.target.value })}
                    className="w-full p-2 border border-gray-300 rounded-md"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea
                    value={newService.description}
                    onChange={(e) => setNewService({ ...newService, description: e.target.value })}
                    className="w-full p-2 border border-gray-300 rounded-md"
                    rows={3}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Features</label>
                  {newService.features.map((feature, index) => (
                    <div key={index} className="flex items-center mb-2">
                      <input
                        type="text"
                        value={feature}
                        onChange={(e) => {
                          const newFeatures = [...newService.features];
                          newFeatures[index] = e.target.value;
                          setNewService({ ...newService, features: newFeatures });
                        }}
                        className="flex-1 p-2 border border-gray-300 rounded-md"
                      />
                      <button
                        onClick={() => {
                          const newFeatures = [...newService.features];
                          newFeatures.splice(index, 1);
                          setNewService({ ...newService, features: newFeatures });
                        }}
                        className="ml-2 text-red-500 hover:text-red-700"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  ))}
                  <button
                    onClick={() => setNewService({
                      ...newService,
                      features: [...newService.features, ""]
                    })}
                    className="mt-2 text-sm text-blue-600 hover:text-blue-800 flex items-center"
                  >
                    <Plus size={16} className="mr-1" /> Add Feature
                  </button>
                </div>
                <button
                  onClick={handleAddService}
                  className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors flex items-center"
                >
                  <Plus size={16} className="mr-1" /> Add Service
                </button>
              </div>
            </div>
          )}

          <div className="space-y-4">
            {brandingData.services.map((service, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-4">
                <div className="flex justify-between items-start">
                  <div className="flex items-center">
                    <div className="mr-4">
                      {serviceIcons[service.icon] || <Palette size={24} />}
                    </div>
                    <div>
                      <h3 className="font-medium">{service.title}</h3>
                      <p className="text-sm text-gray-600">{service.description}</p>
                      <ul className="mt-2 text-sm text-gray-500">
                        {service.features.map((feature, i) => (
                          <li key={i} className="flex items-center">
                            <span className="mr-2">✓</span>
                            {feature}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleEditService(service)}
                      className="text-blue-500 hover:text-blue-700"
                    >
                      <Edit size={18} />
                    </button>
                    <button
                      onClick={() => handleDeleteService(index)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Process Steps Editor */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Process Steps</h2>

          {editingProcess ? (
            <div className="bg-gray-50 p-4 rounded-lg mb-6">
              <h3 className="font-medium mb-3">Edit Process Step</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Step Number</label>
                  <input
                    type="text"
                    value={editingProcess.updatedProcess.step}
                    onChange={(e) => setEditingProcess({
                      ...editingProcess,
                      updatedProcess: {
                        ...editingProcess.updatedProcess,
                        step: e.target.value
                      }
                    })}
                    className="w-full p-2 border border-gray-300 rounded-md"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                  <input
                    type="text"
                    value={editingProcess.updatedProcess.title}
                    onChange={(e) => setEditingProcess({
                      ...editingProcess,
                      updatedProcess: {
                        ...editingProcess.updatedProcess,
                        title: e.target.value
                      }
                    })}
                    className="w-full p-2 border border-gray-300 rounded-md"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea
                    value={editingProcess.updatedProcess.description}
                    onChange={(e) => setEditingProcess({
                      ...editingProcess,
                      updatedProcess: {
                        ...editingProcess.updatedProcess,
                        description: e.target.value
                      }
                    })}
                    className="w-full p-2 border border-gray-300 rounded-md"
                    rows={3}
                  />
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={handleUpdateProcess}
                    className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors flex items-center"
                  >
                    <Save size={16} className="mr-1" /> Save
                  </button>
                  <button
                    onClick={() => setEditingProcess(null)}
                    className="bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600 transition-colors flex items-center"
                  >
                    <X size={16} className="mr-1" /> Cancel
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-gray-50 p-4 rounded-lg mb-6">
              <h3 className="font-medium mb-3">Add New Process Step</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Step Number</label>
                  <input
                    type="text"
                    value={newProcess.step}
                    onChange={(e) => setNewProcess({ ...newProcess, step: e.target.value })}
                    className="w-full p-2 border border-gray-300 rounded-md"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                  <input
                    type="text"
                    value={newProcess.title}
                    onChange={(e) => setNewProcess({ ...newProcess, title: e.target.value })}
                    className="w-full p-2 border border-gray-300 rounded-md"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea
                    value={newProcess.description}
                    onChange={(e) => setNewProcess({ ...newProcess, description: e.target.value })}
                    className="w-full p-2 border border-gray-300 rounded-md"
                    rows={3}
                  />
                </div>
                <button
                  onClick={handleAddProcess}
                  className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors flex items-center"
                >
                  <Plus size={16} className="mr-1" /> Add Process Step
                </button>
              </div>
            </div>
          )}

          <div className="space-y-4">
            {brandingData.process.map((step, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="flex items-center">
                      <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-800 flex items-center justify-center font-bold mr-3">
                        {step.step}
                      </div>
                      <h3 className="font-medium">{step.title}</h3>
                    </div>
                    <p className="text-sm text-gray-600 mt-2 ml-11">{step.description}</p>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleEditProcess(step)}
                      className="text-blue-500 hover:text-blue-700"
                    >
                      <Edit size={16} />
                    </button>
                    <button
                      onClick={() => handleDeleteProcess(index)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* FAQs Editor */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">FAQs</h2>

          {editingFaq ? (
            <div className="bg-gray-50 p-4 rounded-lg mb-6">
              <h3 className="font-medium mb-3">Edit FAQ</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Question</label>
                  <input
                    type="text"
                    value={editingFaq.updatedFaq.question}
                    onChange={(e) => setEditingFaq({
                      ...editingFaq,
                      updatedFaq: {
                        ...editingFaq.updatedFaq,
                        question: e.target.value
                      }
                    })}
                    className="w-full p-2 border border-gray-300 rounded-md"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Answer</label>
                  <textarea
                    value={editingFaq.updatedFaq.answer}
                    onChange={(e) => setEditingFaq({
                      ...editingFaq,
                      updatedFaq: {
                        ...editingFaq.updatedFaq,
                        answer: e.target.value
                      }
                    })}
                    className="w-full p-2 border border-gray-300 rounded-md"
                    rows={4}
                  />
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={handleUpdateFaq}
                    className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors flex items-center"
                  >
                    <Save size={16} className="mr-1" /> Save
                  </button>
                  <button
                    onClick={() => setEditingFaq(null)}
                    className="bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600 transition-colors flex items-center"
                  >
                    <X size={16} className="mr-1" /> Cancel
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-gray-50 p-4 rounded-lg mb-6">
              <h3 className="font-medium mb-3">Add New FAQ</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Question</label>
                  <input
                    type="text"
                    value={newFaq.question}
                    onChange={(e) => setNewFaq({ ...newFaq, question: e.target.value })}
                    className="w-full p-2 border border-gray-300 rounded-md"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Answer</label>
                  <textarea
                    value={newFaq.answer}
                    onChange={(e) => setNewFaq({ ...newFaq, answer: e.target.value })}
                    className="w-full p-2 border border-gray-300 rounded-md"
                    rows={4}
                  />
                </div>
                <button
                  onClick={handleAddFaq}
                  className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors flex items-center"
                >
                  <Plus size={16} className="mr-1" /> Add FAQ
                </button>
              </div>
            </div>
          )}

          <div className="space-y-4">
            {brandingData.faqs.map((faq, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-medium">{faq.question}</h3>
                    <p className="text-sm text-gray-600 mt-2">{faq.answer}</p>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleEditFaq(faq)}
                      className="text-blue-500 hover:text-blue-700"
                    >
                      <Edit size={16} />
                    </button>
                    <button
                      onClick={() => handleDeleteFaq(index)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BrandingAdmin;