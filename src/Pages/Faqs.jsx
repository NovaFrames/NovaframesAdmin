import React, { useEffect, useState } from 'react';
import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc
} from 'firebase/firestore';
import { 
  Eye, 
  Edit, 
  Trash2, 
  Plus, 
  Grid3X3, 
  Table, 
  Search,
  X,
  MessageCircleQuestion,
  Lightbulb
} from 'lucide-react';
import { db } from '../utils/firebase';

const Faqs = () => {
  const [faqs, setFaqs] = useState([]);
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editId, setEditId] = useState(null);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'table'
  const [searchTerm, setSearchTerm] = useState('');
  const [viewAnswerId, setViewAnswerId] = useState(null);

  const fetchFaqs = async () => {
    const querySnapshot = await getDocs(collection(db, 'faqs'));
    const data = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    setFaqs(data);
  };

  useEffect(() => {
    fetchFaqs();
  }, []);

  const filteredFaqs = faqs.filter(faq => 
    faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
    faq.answer.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddOrUpdate = async () => {
    if (!question.trim() || !answer.trim()) return;
    
    try {
      if (editId) {
        const faqRef = doc(db, 'faqs', editId);
        await updateDoc(faqRef, { question: question.trim(), answer: answer.trim() });
      } else {
        await addDoc(collection(db, 'faqs'), { question: question.trim(), answer: answer.trim() });
      }
      setQuestion('');
      setAnswer('');
      setIsModalOpen(false);
      setEditId(null);
      fetchFaqs();
    } catch (error) {
      console.error('Error saving FAQ:', error);
    }
  };

  const handleEdit = (faq) => {
    setQuestion(faq.question);
    setAnswer(faq.answer);
    setEditId(faq.id);
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this FAQ?')) {
      try {
        await deleteDoc(doc(db, 'faqs', id));
        fetchFaqs();
      } catch (error) {
        console.error('Error deleting FAQ:', error);
      }
    }
  };

  const openModal = () => {
    setQuestion('');
    setAnswer('');
    setEditId(null);
    setIsModalOpen(true);
  };

  const GridView = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
      {filteredFaqs.map((faq) => (
        <div key={faq.id} className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 overflow-hidden group">
          <div className="p-6">
            <div className="flex items-start gap-3 mb-4">
              <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <MessageCircleQuestion className="w-4 h-4 text-blue-600" />
              </div>
              <h3 className="font-semibold text-gray-900 text-lg leading-tight line-clamp-2">
                {faq.question}
              </h3>
            </div>
            
            <div className="flex items-start gap-3 mb-6">
              <div className="flex-shrink-0 w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                <Lightbulb className="w-4 h-4 text-green-600" />
              </div>
              <p className="text-gray-600 text-sm leading-relaxed line-clamp-3">
                {faq.answer}
              </p>
            </div>

            <div className="flex items-center gap-2 pt-4 border-t border-gray-100">
              <button
                onClick={() => setViewAnswerId(faq.id)}
                className="flex items-center gap-2 px-3 py-2 text-sm text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
              >
                <Eye size={16} />
                View
              </button>
              <button
                onClick={() => handleEdit(faq)}
                className="flex items-center gap-2 px-3 py-2 text-sm text-green-600 hover:bg-green-50 rounded-lg transition-colors"
              >
                <Edit size={16} />
                Edit
              </button>
              <button
                onClick={() => handleDelete(faq.id)}
                className="flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors ml-auto"
              >
                <Trash2 size={16} />
                Delete
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  const TableView = () => (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Question
              </th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Answer
              </th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredFaqs.map((faq) => (
              <tr key={faq.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                      <MessageCircleQuestion className="w-4 h-4 text-blue-600" />
                    </div>
                    <div className="text-sm font-medium text-gray-900 max-w-xs truncate">
                      {faq.question}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm text-gray-600 max-w-md truncate">
                    {faq.answer}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setViewAnswerId(faq.id)}
                      className="text-blue-600 hover:text-blue-800 p-1 hover:bg-blue-50 rounded transition-colors"
                    >
                      <Eye size={16} />
                    </button>
                    <button
                      onClick={() => handleEdit(faq)}
                      className="text-green-600 hover:text-green-800 p-1 hover:bg-green-50 rounded transition-colors"
                    >
                      <Edit size={16} />
                    </button>
                    <button
                      onClick={() => handleDelete(faq.id)}
                      className="text-red-600 hover:text-red-800 p-1 hover:bg-red-50 rounded transition-colors"
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
      {filteredFaqs.length === 0 && (
        <div className="text-center py-12">
          <MessageCircleQuestion className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500 text-lg">No FAQs found</p>
          <p className="text-gray-400 text-sm">Try adjusting your search or add a new FAQ</p>
        </div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-white-50 to-white-100 p-6">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">FAQs</h1>
              <p className="text-gray-600">Manage your frequently asked questions</p>
            </div>
            <button
              onClick={openModal}
              className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-3 rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              <Plus size={20} />
              Add FAQ
            </button>
          </div>

          {/* Search and View Toggle */}
          <div className="flex flex-col sm:flex-row gap-4 sm:items-center sm:justify-between">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search FAQs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl bg-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />
            </div>
            
            <div className="flex items-center gap-2 bg-white rounded-xl p-1 shadow-sm border border-gray-200">
              <button
                onClick={() => setViewMode('grid')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                  viewMode === 'grid' 
                    ? 'bg-blue-600 text-white shadow-sm' 
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                <Grid3X3 size={18} />
                Grid
              </button>
              <button
                onClick={() => setViewMode('table')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                  viewMode === 'table' 
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

        {/* Content */}
        {filteredFaqs.length === 0 && searchTerm === '' ? (
          <div className="text-center py-16">
            <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <MessageCircleQuestion className="w-12 h-12 text-blue-600" />
            </div>
            <h3 className="text-2xl font-semibold text-gray-900 mb-2">No FAQs yet</h3>
            <p className="text-gray-600 mb-6">Get started by adding your first FAQ</p>
            <button
              onClick={openModal}
              className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-xl hover:bg-blue-700 transition-colors"
            >
              <Plus size={20} />
              Add Your First FAQ
            </button>
          </div>
        ) : (
          <>
            {viewMode === 'grid' ? <GridView /> : <TableView />}
          </>
        )}

        {/* Add/Edit Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50 p-4">
            <div className="bg-white rounded-2xl p-6 w-full max-w-2xl shadow-2xl">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">
                  {editId ? 'Edit FAQ' : 'Add New FAQ'}
                </h2>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="text-gray-400 hover:text-gray-600 p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X size={20} />
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Question
                  </label>
                  <input
                    type="text"
                    placeholder="Enter your question..."
                    className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    value={question}
                    onChange={(e) => setQuestion(e.target.value)}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Answer
                  </label>
                  <textarea
                    placeholder="Enter your answer..."
                    className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
                    rows={6}
                    value={answer}
                    onChange={(e) => setAnswer(e.target.value)}
                  />
                </div>
              </div>
              
              <div className="flex justify-end gap-3 mt-6">
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="px-6 py-3 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddOrUpdate}
                  disabled={!question.trim() || !answer.trim()}
                  className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
                >
                  {editId ? 'Update FAQ' : 'Add FAQ'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* View Answer Modal */}
        {viewAnswerId && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
            <div className="bg-white rounded-2xl p-6 w-full max-w-2xl shadow-2xl">
              {(() => {
                const faq = faqs.find(f => f.id === viewAnswerId);
                return faq ? (
                  <>
                    <div className="flex justify-between items-start mb-6">
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0 w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                          <MessageCircleQuestion className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                          <h2 className="text-xl font-bold text-gray-900 mb-2">Question</h2>
                          <p className="text-gray-800">{faq.question}</p>
                        </div>
                      </div>
                      <button
                        onClick={() => setViewAnswerId(null)}
                        className="text-gray-400 hover:text-gray-600 p-2 hover:bg-gray-100 rounded-lg transition-colors"
                      >
                        <X size={20} />
                      </button>
                    </div>
                    
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                        <Lightbulb className="w-5 h-5 text-green-600" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">Answer</h3>
                        <p className="text-gray-800 leading-relaxed whitespace-pre-wrap">{faq.answer}</p>
                      </div>
                    </div>
                  </>
                ) : null;
              })()}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Faqs;