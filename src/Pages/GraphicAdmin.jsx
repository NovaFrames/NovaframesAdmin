import React, { useState, useEffect } from 'react';
import { Palette, Brush, Zap, Star, ArrowRight, Eye, Users, Award, ChevronDown, ChevronUp, Save, Plus, Trash2 } from 'lucide-react';
import { collection, doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import { db } from '../utils/firebase';

const GraphicAdmin = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [activeSection, setActiveSection] = useState('hero');
    const [formData, setFormData] = useState({
        heroTitle: "",
        heroSubtitle: "",
        services: [],
        faqs: [],
    });

    useEffect(() => {
        const fetchData = async () => {
            try {
                const docRef = doc(db, "graphicAdmin", "content");
                const docSnap = await getDoc(docRef);
                
                if (docSnap.exists()) {
                    setFormData(docSnap.data());
                } else {
                    console.log("No document found, using default data");
                }
            } catch (error) {
                console.error("Error fetching document: ", error);
            } finally {
                setLoading(false);
            }
        };
        
        fetchData();
    }, []);

    const handleInputChange = (e, section, index, field) => {
        const value = e.target.value;
        
        if (section && index !== undefined) {
            // For nested arrays (services, faqs)
            setFormData(prev => ({
                ...prev,
                [section]: prev[section].map((item, i) => 
                    i === index ? { ...item, [field]: value } : item
                )
            }));
        } else {
            // For top-level fields
            setFormData(prev => ({
                ...prev,
                [field]: value
            }));
        }
    };

    const handleAddItem = (section) => {
        const defaultItem = {
            services: { icon: "Palette", title: "", description: "" },
            faqs: { question: "", answer: "" },
        }[section];
        
        setFormData(prev => ({
            ...prev,
            [section]: [...prev[section], defaultItem]
        }));
    };

    const handleRemoveItem = (section, index) => {
        setFormData(prev => ({
            ...prev,
            [section]: prev[section].filter((_, i) => i !== index)
        }));
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            const docRef = doc(db, "graphicAdmin", "content");
            await setDoc(docRef, formData);
            console.log("Document successfully written!");
        } catch (error) {
            console.error("Error writing document: ", error);
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-pink-500"></div>
            </div>
        );
    }

    const renderSection = () => {
        switch (activeSection) {
            case 'hero':
                return (
                    <div className="rounded-xl p-6 mb-8">
                        <h2 className="text-2xl font-semibold mb-4 text-pink-400">Hero Section</h2>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-1">Title</label>
                                <input
                                    type="text"
                                    value={formData.heroTitle}
                                    onChange={(e) => handleInputChange(e, null, null, 'heroTitle')}
                                    className="w-full rounded-lg px-4 py-2 border focus:ring-2 focus:ring-pink-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Subtitle</label>
                                <textarea
                                    value={formData.heroSubtitle}
                                    onChange={(e) => handleInputChange(e, null, null, 'heroSubtitle')}
                                    className="w-full rounded-lg px-4 py-2 border focus:ring-2 focus:ring-pink-500"
                                    rows="3"
                                />
                            </div>
                        </div>
                    </div>
                );
            case 'services':
                return (
                    <div className="rounded-xl p-6 mb-8">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-2xl font-semibold text-pink-400">Services</h2>
                            <button
                                onClick={() => handleAddItem('services')}
                                className="flex items-center gap-1 bg-pink-600 text-white hover:bg-pink-700 px-3 py-1 rounded-lg text-sm transition-colors"
                            >
                                <Plus size={16} /> Add Service
                            </button>
                        </div>
                        
                        <div className="space-y-6">
                            {formData.services.map((service, index) => (
                                <div key={index} className="rounded-lg p-4">
                                    <div className="flex justify-between items-center mb-3">
                                        <h3 className="font-medium">Service {index + 1}</h3>
                                        <button
                                            onClick={() => handleRemoveItem('services', index)}
                                            className="text-red-400 hover:text-red-300 transition-colors"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                    
                                    <div className="grid md:grid-cols-3 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium mb-1">Icon</label>
                                            <select
                                                value={service.icon}
                                                onChange={(e) => handleInputChange(e, 'services', index, 'icon')}
                                                className="w-full rounded-lg px-4 py-2 focus:ring-2 focus:ring-pink-500"
                                            >
                                                <option value="Palette">Palette</option>
                                                <option value="Brush">Brush</option>
                                                <option value="Eye">Eye</option>
                                                <option value="Zap">Zap</option>
                                                <option value="Users">Users</option>
                                                <option value="Award">Award</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium mb-1">Title</label>
                                            <input
                                                type="text"
                                                value={service.title}
                                                onChange={(e) => handleInputChange(e, 'services', index, 'title')}
                                                className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-pink-500"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium mb-1">Description</label>
                                            <input
                                                type="text"
                                                value={service.description}
                                                onChange={(e) => handleInputChange(e, 'services', index, 'description')}
                                                className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-pink-500"
                                            />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                );
            case 'faqs':
                return (
                    <div className="rounded-xl p-6 mb-8">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-2xl font-semibold text-pink-400">FAQs</h2>
                            <button
                                onClick={() => handleAddItem('faqs')}
                                className="flex items-center gap-1 bg-pink-600 text-white hover:bg-pink-700 px-3 py-1 rounded-lg text-sm transition-colors"
                            >
                                <Plus size={16} /> Add FAQ
                            </button>
                        </div>
                        
                        <div className="space-y-6">
                            {formData.faqs.map((faq, index) => (
                                <div key={index} className="rounded-lg p-4">
                                    <div className="flex justify-between items-center mb-3">
                                        <h3 className="font-medium">FAQ {index + 1}</h3>
                                        <button
                                            onClick={() => handleRemoveItem('faqs', index)}
                                            className="text-red-400 hover:text-red-300 transition-colors"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                    
                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-medium mb-1">Question</label>
                                            <input
                                                type="text"
                                                value={faq.question}
                                                onChange={(e) => handleInputChange(e, 'faqs', index, 'question')}
                                                className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-pink-500"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium mb-1">Answer</label>
                                            <textarea
                                                value={faq.answer}
                                                onChange={(e) => handleInputChange(e, 'faqs', index, 'answer')}
                                                className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-pink-500"
                                                rows="3"
                                            />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                );
            default:
                return null;
        }
    };

    return (
        <div className="min-h-screen p-6">
            <div className="max-w-7xl mx-auto">
                {/* Navigation Buttons */}
                <div className="flex flex-wrap gap-2 mb-6">
                    <button
                        onClick={() => setActiveSection('hero')}
                        className={`px-4 py-2 rounded-lg ${activeSection === 'hero' ? 'bg-pink-600 text-white' : 'bg-gray-200'}`}
                    >
                        Hero Section
                    </button>
                    <button
                        onClick={() => setActiveSection('services')}
                        className={`px-4 py-2 rounded-lg ${activeSection === 'services' ? 'bg-pink-600 text-white' : 'bg-gray-200'}`}
                    >
                        Services
                    </button>
                    <button
                        onClick={() => setActiveSection('faqs')}
                        className={`px-4 py-2 rounded-lg ${activeSection === 'faqs' ? 'bg-pink-600 text-white' : 'bg-gray-200'}`}
                    >
                        FAQs
                    </button>
                </div>

                {/* Active Section Content */}
                {renderSection()}

                {/* Save Button */}
                <div className="flex justify-center mt-8">
                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className="flex items-center gap-2 bg-gradient-to-r from-pink-500 to-blue-500 text-white px-8 py-3 rounded-full font-semibold hover:shadow-lg transition-all"
                    >
                        {saving ? (
                            <>
                                <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Saving...
                            </>
                        ) : (
                            <>
                                <Save size={18} /> Save Changes
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default GraphicAdmin;