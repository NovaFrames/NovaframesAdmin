// PackagesAdmin.js
import React, { useState, useEffect } from 'react';
import {
    collection,
    doc,
    getDocs,
    addDoc,
    updateDoc,
    deleteDoc
} from 'firebase/firestore';
import { db } from '../utils/firebase';

// Tab configuration
const TABS = [
    { id: 'packages', label: 'Packages' },
    { id: 'faqs', label: 'FAQs' },
    { id: 'stats', label: 'Statistics' },
    { id: 'serviceFeatures', label: 'Service Features' }
];

// Icons for stats
const STAT_ICONS = [
    { value: 'Award', label: 'Award' },
    { value: 'Check', label: 'Check' },
    { value: 'Users', label: 'Users' },
    { value: 'ThumbsUp', label: 'Thumbs Up' }
];

const PackagesAdmin = () => {
    // Active tab state
    const [activeTab, setActiveTab] = useState(TABS[0].id);
    const [selectedPackage, setSelectedPackage] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [packages, setPackages] = useState([]);

    // Form states
    const [packageForm, setPackageForm] = useState({
        name: '',
        price: '',
        billing: '',
        highlighted: false,
        button: '',
        features: [],
        bestFor: '',
        newFeature: '',
        faqs: [],
        stats: [],
        serviceFeatures: []
    });

    // Nested form states
    const [newFaq, setNewFaq] = useState({ question: '', answer: '' });
    const [editingFaq, setEditingFaq] = useState({ index: null, packageId: null });
    
    const [newStat, setNewStat] = useState({ label: '', value: '', icon: 'Award' });
    const [editingStat, setEditingStat] = useState({ index: null, packageId: null });
    
    const [newServiceFeature, setNewServiceFeature] = useState({
        category: '',
        items: [],
        newItem: ''
    });
    const [editingServiceFeature, setEditingServiceFeature] = useState({ 
        index: null, 
        packageId: null 
    });

    // Fetch all packages from Firebase
    useEffect(() => {
        const fetchPackages = async () => {
            try {
                setIsLoading(true);
                const packagesCollection = collection(db, 'packages');
                const packagesSnapshot = await getDocs(packagesCollection);
                setPackages(packagesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
            } catch (error) {
                console.error('Error fetching packages:', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchPackages();
    }, []);

    // Reset form when selected package changes
    useEffect(() => {
        if (selectedPackage) {
            const pkg = packages.find(p => p.id === selectedPackage);
            if (pkg) {
                setPackageForm({
                    name: pkg.name,
                    price: pkg.price,
                    billing: pkg.billing || '/ month',
                    highlighted: pkg.highlighted || false,
                    button: pkg.button || 'Get Started',
                    features: pkg.features || [],
                    bestFor: pkg.bestFor || '',
                    newFeature: '',
                    faqs: pkg.faqs || [],
                    stats: pkg.stats || [],
                    serviceFeatures: pkg.serviceFeatures || []
                });
            }
        }
    }, [selectedPackage, packages]);

    // Reset all forms
    const resetForms = () => {
        setSelectedPackage(null);
        setPackageForm({
            name: '',
            price: '',
            billing: '/ month',
            highlighted: false,
            button: 'Get Started',
            features: [],
            bestFor: '',
            newFeature: '',
            faqs: [],
            stats: [],
            serviceFeatures: []
        });
        setNewFaq({ question: '', answer: '' });
        setEditingFaq({ index: null, packageId: null });
        setNewStat({ label: '', value: '', icon: 'Award' });
        setEditingStat({ index: null, packageId: null });
        setNewServiceFeature({ category: '', items: [], newItem: '' });
        setEditingServiceFeature({ index: null, packageId: null });
    };

    // Add new package
    const addPackage = async () => {
        try {
            setIsLoading(true);
            await addDoc(collection(db, 'packages'), packageForm);
            resetForms();
            
            // Refresh data
            const packagesSnapshot = await getDocs(collection(db, 'packages'));
            setPackages(packagesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        } catch (error) {
            console.error('Error adding package:', error);
        } finally {
            setIsLoading(false);
        }
    };

    // Update package
    const updatePackage = async () => {
        if (!selectedPackage) return;

        try {
            setIsLoading(true);
            await updateDoc(doc(db, 'packages', selectedPackage), packageForm);
            resetForms();
            
            // Refresh data
            const packagesSnapshot = await getDocs(collection(db, 'packages'));
            setPackages(packagesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        } catch (error) {
            console.error('Error updating package:', error);
        } finally {
            setIsLoading(false);
        }
    };

    // Delete package
    const deletePackage = async (id) => {
        if (window.confirm('Are you sure you want to delete this package?')) {
            try {
                setIsLoading(true);
                await deleteDoc(doc(db, 'packages', id));
                setPackages(packages.filter(pkg => pkg.id !== id));
            } catch (error) {
                console.error('Error deleting package:', error);
            } finally {
                setIsLoading(false);
            }
        }
    };

    // Add feature to package form
    const addFeatureToPackage = () => {
        if (packageForm.newFeature.trim()) {
            setPackageForm({
                ...packageForm,
                features: [...packageForm.features, packageForm.newFeature],
                newFeature: ''
            });
        }
    };

    // Remove item from array helper
    const removeItem = (array, index) => array.filter((_, i) => i !== index);

    // FAQ Functions
    const handleFaqSubmit = async () => {
        if (!newFaq.question.trim() || !newFaq.answer.trim() || !selectedPackage) return;
        
        try {
            setIsLoading(true);
            const packageToUpdate = packages.find(pkg => pkg.id === selectedPackage);
            let updatedFaqs = [...(packageToUpdate.faqs || [])];
            
            if (editingFaq.index !== null && editingFaq.packageId === selectedPackage) {
                updatedFaqs[editingFaq.index] = newFaq;
            } else {
                updatedFaqs.push(newFaq);
            }
            
            await updateDoc(doc(db, 'packages', selectedPackage), { faqs: updatedFaqs });
            
            // Refresh data
            const packagesSnapshot = await getDocs(collection(db, 'packages'));
            setPackages(packagesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
            
            // Reset form
            setNewFaq({ question: '', answer: '' });
            setEditingFaq({ index: null, packageId: null });
        } catch (error) {
            console.error('Error updating FAQs:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const editFaq = (packageId, faqIndex) => {
        const pkg = packages.find(p => p.id === packageId);
        if (pkg?.faqs?.[faqIndex]) {
            setSelectedPackage(packageId);
            setNewFaq(pkg.faqs[faqIndex]);
            setEditingFaq({ index: faqIndex, packageId });
        }
    };

    const deleteFaq = async (packageId, faqIndex) => {
        if (window.confirm('Are you sure you want to delete this FAQ?')) {
            try {
                setIsLoading(true);
                const pkg = packages.find(p => p.id === packageId);
                if (pkg?.faqs) {
                    const updatedFaqs = pkg.faqs.filter((_, index) => index !== faqIndex);
                    await updateDoc(doc(db, 'packages', packageId), { faqs: updatedFaqs });
                    
                    // Refresh data
                    const packagesSnapshot = await getDocs(collection(db, 'packages'));
                    setPackages(packagesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
                }
            } catch (error) {
                console.error('Error deleting FAQ:', error);
            } finally {
                setIsLoading(false);
            }
        }
    };

    // Stats Functions
    const handleStatSubmit = async () => {
        if (!newStat.label.trim() || !newStat.value.trim() || !selectedPackage) return;
        
        try {
            setIsLoading(true);
            const packageToUpdate = packages.find(pkg => pkg.id === selectedPackage);
            let updatedStats = [...(packageToUpdate.stats || [])];
            
            if (editingStat.index !== null && editingStat.packageId === selectedPackage) {
                updatedStats[editingStat.index] = newStat;
            } else {
                updatedStats.push(newStat);
            }
            
            await updateDoc(doc(db, 'packages', selectedPackage), { stats: updatedStats });
            
            // Refresh data
            const packagesSnapshot = await getDocs(collection(db, 'packages'));
            setPackages(packagesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
            
            // Reset form
            setNewStat({ label: '', value: '', icon: 'Award' });
            setEditingStat({ index: null, packageId: null });
        } catch (error) {
            console.error('Error updating stats:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const editStat = (packageId, statIndex) => {
        const pkg = packages.find(p => p.id === packageId);
        if (pkg?.stats?.[statIndex]) {
            setSelectedPackage(packageId);
            setNewStat(pkg.stats[statIndex]);
            setEditingStat({ index: statIndex, packageId });
        }
    };

    const deleteStat = async (packageId, statIndex) => {
        if (window.confirm('Are you sure you want to delete this statistic?')) {
            try {
                setIsLoading(true);
                const pkg = packages.find(p => p.id === packageId);
                if (pkg?.stats) {
                    const updatedStats = pkg.stats.filter((_, index) => index !== statIndex);
                    await updateDoc(doc(db, 'packages', packageId), { stats: updatedStats });
                    
                    // Refresh data
                    const packagesSnapshot = await getDocs(collection(db, 'packages'));
                    setPackages(packagesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
                }
            } catch (error) {
                console.error('Error deleting stat:', error);
            } finally {
                setIsLoading(false);
            }
        }
    };

    // Service Features Functions
    const addItemToServiceFeature = () => {
        if (newServiceFeature.newItem.trim()) {
            setNewServiceFeature({
                ...newServiceFeature,
                items: [...newServiceFeature.items, newServiceFeature.newItem],
                newItem: ''
            });
        }
    };

    const handleServiceFeatureSubmit = async () => {
        if (!newServiceFeature.category.trim() || !selectedPackage) return;
        
        try {
            setIsLoading(true);
            const packageToUpdate = packages.find(pkg => pkg.id === selectedPackage);
            let updatedFeatures = [...(packageToUpdate.serviceFeatures || [])];
            
            if (editingServiceFeature.index !== null && editingServiceFeature.packageId === selectedPackage) {
                updatedFeatures[editingServiceFeature.index] = {
                    category: newServiceFeature.category,
                    items: newServiceFeature.items
                };
            } else {
                updatedFeatures.push({
                    category: newServiceFeature.category,
                    items: newServiceFeature.items
                });
            }
            
            await updateDoc(doc(db, 'packages', selectedPackage), {
                serviceFeatures: updatedFeatures
            });
            
            // Refresh data
            const packagesSnapshot = await getDocs(collection(db, 'packages'));
            setPackages(packagesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
            
            // Reset form
            setNewServiceFeature({ category: '', items: [], newItem: '' });
            setEditingServiceFeature({ index: null, packageId: null });
        } catch (error) {
            console.error('Error updating service features:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const editServiceFeature = (packageId, featureIndex) => {
        const pkg = packages.find(p => p.id === packageId);
        if (pkg?.serviceFeatures?.[featureIndex]) {
            setSelectedPackage(packageId);
            setNewServiceFeature({
                category: pkg.serviceFeatures[featureIndex].category,
                items: [...pkg.serviceFeatures[featureIndex].items],
                newItem: ''
            });
            setEditingServiceFeature({ index: featureIndex, packageId });
        }
    };

    const deleteServiceFeature = async (packageId, featureIndex) => {
        if (window.confirm('Are you sure you want to delete this service feature?')) {
            try {
                setIsLoading(true);
                const pkg = packages.find(p => p.id === packageId);
                if (pkg?.serviceFeatures) {
                    const updatedFeatures = pkg.serviceFeatures.filter((_, index) => index !== featureIndex);
                    await updateDoc(doc(db, 'packages', packageId), {
                        serviceFeatures: updatedFeatures
                    });
                    
                    // Refresh data
                    const packagesSnapshot = await getDocs(collection(db, 'packages'));
                    setPackages(packagesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
                }
            } catch (error) {
                console.error('Error deleting service feature:', error);
            } finally {
                setIsLoading(false);
            }
        }
    };

    // Loading state
    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    return (
        <div className="admin-container bg-gray-50 min-h-screen p-4 md:p-8">
            <div className="max-w-7xl mx-auto">
                <header className="mb-8">
                    <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Packages Management</h1>
                    <p className="text-gray-600 mt-2">Manage your subscription packages and their features</p>
                </header>

                {/* Tabs Navigation */}
                <nav className="flex overflow-x-auto pb-2 mb-6 scrollbar-hide">
                    <div className="flex space-x-1">
                        {TABS.map((tab) => (
                            <button
                                key={tab.id}
                                className={`px-4 py-2 rounded-md font-medium transition-colors ${activeTab === tab.id
                                    ? 'bg-blue-600 text-white shadow-md'
                                    : 'bg-white text-gray-700 hover:bg-gray-100'
                                    }`}
                                onClick={() => setActiveTab(tab.id)}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </div>
                </nav>

                {/* Packages Tab */}
                {activeTab === 'packages' && (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Package Form */}
                        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                            <h2 className="text-xl font-semibold mb-4 text-gray-800">
                                {selectedPackage ? 'Edit Package' : 'Create New Package'}
                            </h2>
                            
                            <div className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Package Name*</label>
                                        <input
                                            type="text"
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            placeholder="e.g. Premium Plan"
                                            value={packageForm.name}
                                            onChange={(e) => setPackageForm({ ...packageForm, name: e.target.value })}
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Price*</label>
                                        <input
                                            type="text"
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            placeholder="e.g. $29"
                                            value={packageForm.price}
                                            onChange={(e) => setPackageForm({ ...packageForm, price: e.target.value })}
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Billing Cycle</label>
                                        <select
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            value={packageForm.billing}
                                            onChange={(e) => setPackageForm({ ...packageForm, billing: e.target.value })}
                                        >
                                            <option value="/ month">/ month</option>
                                            <option value="/ year">/ year</option>
                                        </select>
                                    </div>
                                    <div className="flex items-center justify-end">
                                        <div className="flex items-center">
                                            <input
                                                type="checkbox"
                                                id="highlighted"
                                                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                                checked={packageForm.highlighted}
                                                onChange={(e) => setPackageForm({ ...packageForm, highlighted: e.target.checked })}
                                            />
                                            <label htmlFor="highlighted" className="ml-2 block text-sm text-gray-700">
                                                Highlighted Package
                                            </label>
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Button Text</label>
                                    <input
                                        type="text"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        placeholder="e.g. Get Started"
                                        value={packageForm.button}
                                        onChange={(e) => setPackageForm({ ...packageForm, button: e.target.value })}
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Best For</label>
                                    <textarea
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        placeholder="Describe who this package is best for"
                                        rows="2"
                                        value={packageForm.bestFor}
                                        onChange={(e) => setPackageForm({ ...packageForm, bestFor: e.target.value })}
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Features</label>
                                    <div className="flex">
                                        <input
                                            type="text"
                                            className="flex-1 px-3 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            placeholder="Add feature"
                                            value={packageForm.newFeature}
                                            onChange={(e) => setPackageForm({ ...packageForm, newFeature: e.target.value })}
                                            onKeyPress={(e) => e.key === 'Enter' && addFeatureToPackage()}
                                        />
                                        <button
                                            onClick={addFeatureToPackage}
                                            className="bg-blue-600 text-white px-4 py-2 rounded-r-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        >
                                            Add
                                        </button>
                                    </div>

                                    {packageForm.features.length > 0 && (
                                        <div className="mt-2 space-y-1">
                                            {packageForm.features.map((feature, index) => (
                                                <div key={index} className="flex items-center justify-between bg-gray-50 px-3 py-2 rounded">
                                                    <span className="text-sm">{feature}</span>
                                                    <button
                                                        onClick={() => setPackageForm({
                                                            ...packageForm,
                                                            features: removeItem(packageForm.features, index)
                                                        })}
                                                        className="text-red-500 hover:text-red-700 text-lg"
                                                    >
                                                        ×
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                <div className="flex space-x-3 pt-2">
                                    <button
                                        onClick={selectedPackage ? updatePackage : addPackage}
                                        disabled={!packageForm.name || !packageForm.price}
                                        className={`flex-1 py-2 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors ${selectedPackage
                                            ? 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500 text-white'
                                            : 'bg-green-600 hover:bg-green-700 focus:ring-green-500 text-white'
                                            } ${(!packageForm.name || !packageForm.price) ? 'opacity-50 cursor-not-allowed' : ''}`}
                                    >
                                        {selectedPackage ? 'Update Package' : 'Create Package'}
                                    </button>

                                    {selectedPackage && (
                                        <button
                                            onClick={resetForms}
                                            className="flex-1 bg-gray-200 text-gray-800 py-2 px-4 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors"
                                        >
                                            Cancel
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Packages List */}
                        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                            <div className="flex justify-between items-center mb-4">
                                <h2 className="text-xl font-semibold text-gray-800">Existing Packages</h2>
                                <span className="text-sm text-gray-500">{packages.length} packages</span>
                            </div>

                            {packages.length === 0 ? (
                                <div className="text-center py-8">
                                    <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    <h3 className="mt-2 text-sm font-medium text-gray-900">No packages</h3>
                                    <p className="mt-1 text-sm text-gray-500">Get started by creating a new package.</p>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {packages.map((pkg) => (
                                        <div key={pkg.id} className={`border rounded-lg p-4 transition-all ${pkg.highlighted ? 'border-yellow-400 bg-yellow-50' : 'border-gray-200 hover:border-gray-300'} ${selectedPackage === pkg.id ? 'ring-2 ring-blue-500' : ''}`}>
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <div className="flex items-center">
                                                        <h3 className="font-bold text-gray-800">{pkg.name}</h3>
                                                        {pkg.highlighted && (
                                                            <span className="ml-2 px-2 py-0.5 text-xs font-medium bg-yellow-100 text-yellow-800 rounded-full">
                                                                Featured
                                                            </span>
                                                        )}
                                                    </div>
                                                    <p className="text-gray-600">{pkg.price}{pkg.billing}</p>
                                                    {pkg.bestFor && <p className="text-sm text-gray-500 mt-1">{pkg.bestFor}</p>}
                                                </div>
                                                <div className="flex space-x-2">
                                                    <button
                                                        onClick={() => setSelectedPackage(pkg.id)}
                                                        className="text-blue-600 hover:text-blue-800 p-1 rounded-md hover:bg-blue-50"
                                                        title="Edit"
                                                    >
                                                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                        </svg>
                                                    </button>
                                                    <button
                                                        onClick={() => deletePackage(pkg.id)}
                                                        className="text-red-600 hover:text-red-800 p-1 rounded-md hover:bg-red-50"
                                                        title="Delete"
                                                    >
                                                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                        </svg>
                                                    </button>
                                                </div>
                                            </div>

                                            {pkg.features?.length > 0 && (
                                                <div className="mt-3">
                                                    <h4 className="text-sm font-medium text-gray-700 mb-1">Features:</h4>
                                                    <ul className="list-disc list-inside text-sm text-gray-600 space-y-1 pl-2">
                                                        {pkg.features.slice(0, 3).map((feature, index) => (
                                                            <li key={index}>{feature}</li>
                                                        ))}
                                                        {pkg.features.length > 3 && (
                                                            <li className="text-gray-500">+ {pkg.features.length - 3} more</li>
                                                        )}
                                                    </ul>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* FAQs Tab */}
                {activeTab === 'faqs' && (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* FAQ Form */}
                        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                            <h2 className="text-xl font-semibold mb-4 text-gray-800">
                                {editingFaq.index !== null ? 'Edit FAQ' : 'Add FAQ'}
                            </h2>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Select Package*</label>
                                    <select
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        value={selectedPackage || ''}
                                        onChange={(e) => setSelectedPackage(e.target.value)}
                                    >
                                        <option value="">Select a package</option>
                                        {packages.map(pkg => (
                                            <option key={pkg.id} value={pkg.id}>{pkg.name}</option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Question*</label>
                                    <input
                                        type="text"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        placeholder="Enter question"
                                        value={newFaq.question}
                                        onChange={(e) => setNewFaq({ ...newFaq, question: e.target.value })}
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Answer*</label>
                                    <textarea
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        placeholder="Enter answer"
                                        rows="3"
                                        value={newFaq.answer}
                                        onChange={(e) => setNewFaq({ ...newFaq, answer: e.target.value })}
                                    />
                                </div>

                                <div className="flex space-x-3 pt-2">
                                    <button
                                        onClick={handleFaqSubmit}
                                        disabled={!selectedPackage || !newFaq.question || !newFaq.answer}
                                        className={`flex-1 py-2 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors ${editingFaq.index !== null
                                            ? 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500 text-white'
                                            : 'bg-green-600 hover:bg-green-700 focus:ring-green-500 text-white'
                                            } ${(!selectedPackage || !newFaq.question || !newFaq.answer) ? 'opacity-50 cursor-not-allowed' : ''}`}
                                    >
                                        {editingFaq.index !== null ? 'Update FAQ' : 'Add FAQ'}
                                    </button>

                                    {editingFaq.index !== null && (
                                        <button
                                            onClick={() => {
                                                setNewFaq({ question: '', answer: '' });
                                                setEditingFaq({ index: null, packageId: null });
                                            }}
                                            className="flex-1 bg-gray-200 text-gray-800 py-2 px-4 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors"
                                        >
                                            Cancel
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* FAQs List */}
                        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                            <div className="flex justify-between items-center mb-4">
                                <h2 className="text-xl font-semibold text-gray-800">Package FAQs</h2>
                                <span className="text-sm text-gray-500">
                                    {packages.reduce((acc, pkg) => acc + (pkg.faqs?.length || 0), 0)} FAQs
                                </span>
                            </div>

                            {packages.filter(pkg => pkg.faqs?.length > 0).length === 0 ? (
                                <div className="text-center py-8">
                                    <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    <h3 className="mt-2 text-sm font-medium text-gray-900">No FAQs</h3>
                                    <p className="mt-1 text-sm text-gray-500">Add some frequently asked questions to your packages.</p>
                                </div>
                            ) : (
                                <div className="space-y-6">
                                    {packages.map((pkg) => (
                                        (pkg.faqs?.length > 0) && (
                                            <div key={pkg.id} className="border-b border-gray-200 pb-4 last:border-0 last:pb-0">
                                                <div className="flex justify-between items-center mb-3">
                                                    <h3 className="font-medium text-gray-800">{pkg.name}</h3>
                                                    <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                                                        {pkg.faqs.length} FAQs
                                                    </span>
                                                </div>
                                                <div className="space-y-3">
                                                    {pkg.faqs.map((faq, index) => (
                                                        <div key={index} className="bg-gray-50 p-3 rounded-lg">
                                                            <div className="flex justify-between items-start">
                                                                <div>
                                                                    <p className="font-medium text-gray-800">
                                                                        <span className="text-blue-600">Q:</span> {faq.question}
                                                                    </p>
                                                                    <p className="text-gray-600 mt-1">
                                                                        <span className="text-green-600">A:</span> {faq.answer}
                                                                    </p>
                                                                </div>
                                                                <div className="flex space-x-1">
                                                                    <button
                                                                        onClick={() => editFaq(pkg.id, index)}
                                                                        className="text-blue-600 hover:text-blue-800 p-1 rounded-md hover:bg-blue-50"
                                                                        title="Edit"
                                                                    >
                                                                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                                        </svg>
                                                                    </button>
                                                                    <button
                                                                        onClick={() => deleteFaq(pkg.id, index)}
                                                                        className="text-red-600 hover:text-red-800 p-1 rounded-md hover:bg-red-50"
                                                                        title="Delete"
                                                                    >
                                                                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                                        </svg>
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Stats Tab */}
                {activeTab === 'stats' && (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Stats Form */}
                        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                            <h2 className="text-xl font-semibold mb-4 text-gray-800">
                                {editingStat.index !== null ? 'Edit Statistic' : 'Add Statistic'}
                            </h2>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Select Package*</label>
                                    <select
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        value={selectedPackage || ''}
                                        onChange={(e) => setSelectedPackage(e.target.value)}
                                    >
                                        <option value="">Select a package</option>
                                        {packages.map(pkg => (
                                            <option key={pkg.id} value={pkg.id}>{pkg.name}</option>
                                        ))}
                                    </select>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Label*</label>
                                        <input
                                            type="text"
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            placeholder="e.g. Satisfaction Rate"
                                            value={newStat.label}
                                            onChange={(e) => setNewStat({ ...newStat, label: e.target.value })}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Value*</label>
                                        <input
                                            type="text"
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            placeholder="e.g. 99%"
                                            value={newStat.value}
                                            onChange={(e) => setNewStat({ ...newStat, value: e.target.value })}
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Icon</label>
                                    <div className="grid grid-cols-4 gap-2">
                                        {STAT_ICONS.map((icon) => (
                                            <button
                                                key={icon.value}
                                                type="button"
                                                className={`flex flex-col items-center justify-center p-3 rounded-md border ${newStat.icon === icon.value
                                                    ? 'border-blue-500 bg-blue-50'
                                                    : 'border-gray-300 hover:border-gray-400'
                                                    }`}
                                                onClick={() => setNewStat({ ...newStat, icon: icon.value })}
                                            >
                                                <span className="text-lg font-bold">{icon.value}</span>
                                                <span className="text-xs mt-1 text-gray-600">{icon.label}</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="flex space-x-3 pt-2">
                                    <button
                                        onClick={handleStatSubmit}
                                        disabled={!selectedPackage || !newStat.label || !newStat.value}
                                        className={`flex-1 py-2 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors ${editingStat.index !== null
                                            ? 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500 text-white'
                                            : 'bg-green-600 hover:bg-green-700 focus:ring-green-500 text-white'
                                            } ${(!selectedPackage || !newStat.label || !newStat.value) ? 'opacity-50 cursor-not-allowed' : ''}`}
                                    >
                                        {editingStat.index !== null ? 'Update Statistic' : 'Add Statistic'}
                                    </button>

                                    {editingStat.index !== null && (
                                        <button
                                            onClick={() => {
                                                setNewStat({ label: '', value: '', icon: 'Award' });
                                                setEditingStat({ index: null, packageId: null });
                                            }}
                                            className="flex-1 bg-gray-200 text-gray-800 py-2 px-4 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors"
                                        >
                                            Cancel
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Stats List */}
                        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                            <div className="flex justify-between items-center mb-4">
                                <h2 className="text-xl font-semibold text-gray-800">Package Statistics</h2>
                                <span className="text-sm text-gray-500">
                                    {packages.reduce((acc, pkg) => acc + (pkg.stats?.length || 0), 0)} statistics
                                </span>
                            </div>

                            {packages.filter(pkg => pkg.stats?.length > 0).length === 0 ? (
                                <div className="text-center py-8">
                                    <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                    </svg>
                                    <h3 className="mt-2 text-sm font-medium text-gray-900">No statistics</h3>
                                    <p className="mt-1 text-sm text-gray-500">Add some statistics to showcase your package benefits.</p>
                                </div>
                            ) : (
                                <div className="space-y-6">
                                    {packages.map((pkg) => (
                                        (pkg.stats?.length > 0) && (
                                            <div key={pkg.id} className="border-b border-gray-200 pb-4 last:border-0 last:pb-0">
                                                <div className="flex justify-between items-center mb-3">
                                                    <h3 className="font-medium text-gray-800">{pkg.name}</h3>
                                                    <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                                                        {pkg.stats.length} stats
                                                    </span>
                                                </div>
                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                                    {pkg.stats.map((stat, index) => (
                                                        <div key={index} className="bg-gray-50 p-3 rounded-lg flex items-center">
                                                            <div className="bg-blue-100 text-blue-600 p-2 rounded-full mr-3 flex-shrink-0">
                                                                <span className="text-sm font-bold">{stat.icon}</span>
                                                            </div>
                                                            <div className="flex-1 min-w-0">
                                                                <p className="text-sm text-gray-500 truncate">{stat.label}</p>
                                                                <p className="font-bold text-gray-800 truncate">{stat.value}</p>
                                                            </div>
                                                            <div className="flex space-x-1 ml-2">
                                                                <button
                                                                    onClick={() => editStat(pkg.id, index)}
                                                                    className="text-blue-500 hover:text-blue-700 p-1 rounded-md hover:bg-blue-50"
                                                                    title="Edit"
                                                                >
                                                                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                                    </svg>
                                                                </button>
                                                                <button
                                                                    onClick={() => deleteStat(pkg.id, index)}
                                                                    className="text-red-500 hover:text-red-700 p-1 rounded-md hover:bg-red-50"
                                                                    title="Delete"
                                                                >
                                                                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                                    </svg>
                                                                </button>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Service Features Tab */}
                {activeTab === 'serviceFeatures' && (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Service Features Form */}
                        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                            <h2 className="text-xl font-semibold mb-4 text-gray-800">
                                {editingServiceFeature.index !== null ? 'Edit Service Feature' : 'Add Service Feature'}
                            </h2>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Select Package*</label>
                                    <select
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        value={selectedPackage || ''}
                                        onChange={(e) => setSelectedPackage(e.target.value)}
                                    >
                                        <option value="">Select a package</option>
                                        {packages.map(pkg => (
                                            <option key={pkg.id} value={pkg.id}>{pkg.name}</option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Category*</label>
                                    <input
                                        type="text"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        placeholder="e.g. Design Services"
                                        value={newServiceFeature.category}
                                        onChange={(e) => setNewServiceFeature({
                                            ...newServiceFeature,
                                            category: e.target.value
                                        })}
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Items</label>
                                    <div className="flex">
                                        <input
                                            type="text"
                                            className="flex-1 px-3 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            placeholder="Add item"
                                            value={newServiceFeature.newItem}
                                            onChange={(e) => setNewServiceFeature({
                                                ...newServiceFeature,
                                                newItem: e.target.value
                                            })}
                                            onKeyPress={(e) => e.key === 'Enter' && addItemToServiceFeature()}
                                        />
                                        <button
                                            onClick={addItemToServiceFeature}
                                            disabled={!newServiceFeature.newItem.trim()}
                                            className={`bg-blue-600 text-white px-4 py-2 rounded-r-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 ${!newServiceFeature.newItem.trim() ? 'opacity-50 cursor-not-allowed' : ''}`}
                                        >
                                            Add
                                        </button>
                                    </div>

                                    {newServiceFeature.items.length > 0 && (
                                        <div className="mt-2 space-y-1">
                                            {newServiceFeature.items.map((item, index) => (
                                                <div key={index} className="flex items-center justify-between bg-gray-50 px-3 py-2 rounded">
                                                    <span className="text-sm">{item}</span>
                                                    <button
                                                        onClick={() => setNewServiceFeature({
                                                            ...newServiceFeature,
                                                            items: removeItem(newServiceFeature.items, index)
                                                        })}
                                                        className="text-red-500 hover:text-red-700 text-lg"
                                                    >
                                                        ×
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                <div className="flex space-x-3 pt-2">
                                    <button
                                        onClick={handleServiceFeatureSubmit}
                                        disabled={!selectedPackage || !newServiceFeature.category.trim()}
                                        className={`flex-1 py-2 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors ${editingServiceFeature.index !== null
                                            ? 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500 text-white'
                                            : 'bg-green-600 hover:bg-green-700 focus:ring-green-500 text-white'
                                            } ${(!selectedPackage || !newServiceFeature.category.trim()) ? 'opacity-50 cursor-not-allowed' : ''}`}
                                    >
                                        {editingServiceFeature.index !== null ? 'Update Feature' : 'Add Feature'}
                                    </button>

                                    {editingServiceFeature.index !== null && (
                                        <button
                                            onClick={() => {
                                                setNewServiceFeature({ category: '', items: [], newItem: '' });
                                                setEditingServiceFeature({ index: null, packageId: null });
                                            }}
                                            className="flex-1 bg-gray-200 text-gray-800 py-2 px-4 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors"
                                        >
                                            Cancel
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Service Features List */}
                        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                            <div className="flex justify-between items-center mb-4">
                                <h2 className="text-xl font-semibold text-gray-800">Package Service Features</h2>
                                <span className="text-sm text-gray-500">
                                    {packages.reduce((acc, pkg) => acc + (pkg.serviceFeatures?.length || 0), 0)} features
                                </span>
                            </div>

                            {packages.filter(pkg => pkg.serviceFeatures?.length > 0).length === 0 ? (
                                <div className="text-center py-8">
                                    <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                    </svg>
                                    <h3 className="mt-2 text-sm font-medium text-gray-900">No service features</h3>
                                    <p className="mt-1 text-sm text-gray-500">Add service features to describe what's included in your packages.</p>
                                </div>
                            ) : (
                                <div className="space-y-6">
                                    {packages.map((pkg) => (
                                        (pkg.serviceFeatures?.length > 0) && (
                                            <div key={pkg.id} className="border-b border-gray-200 pb-4 last:border-0 last:pb-0">
                                                <div className="flex justify-between items-center mb-3">
                                                    <h3 className="font-medium text-gray-800">{pkg.name}</h3>
                                                    <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                                                        {pkg.serviceFeatures.length} features
                                                    </span>
                                                </div>
                                                <div className="space-y-3">
                                                    {pkg.serviceFeatures.map((feature, index) => (
                                                        <div key={index} className="bg-gray-50 p-4 rounded-lg">
                                                            <div className="flex justify-between items-start">
                                                                <h4 className="font-medium text-gray-800 mb-2">{feature.category}</h4>
                                                                <div className="flex space-x-1">
                                                                    <button
                                                                        onClick={() => editServiceFeature(pkg.id, index)}
                                                                        className="text-blue-600 hover:text-blue-800 p-1 rounded-md hover:bg-blue-50"
                                                                        title="Edit"
                                                                    >
                                                                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                                        </svg>
                                                                    </button>
                                                                    <button
                                                                        onClick={() => deleteServiceFeature(pkg.id, index)}
                                                                        className="text-red-600 hover:text-red-800 p-1 rounded-md hover:bg-red-50"
                                                                        title="Delete"
                                                                    >
                                                                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                                        </svg>
                                                                    </button>
                                                                </div>
                                                            </div>
                                                            <ul className="list-disc list-inside text-sm text-gray-600 space-y-1 pl-2">
                                                                {feature.items.map((item, itemIndex) => (
                                                                    <li key={itemIndex}>{item}</li>
                                                                ))}
                                                            </ul>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default PackagesAdmin;