import React, { useEffect, useState } from 'react';
import { Eye, CheckCircle, X, Mail, Phone, User, MessageSquare, Clock, CheckCheck, Search, Filter, Copy, Check, Grid3X3, List, Table } from 'lucide-react';
import { fetchContacts, markAsDiscussed } from '../utils/service';


const ContactDetails = () => {
    const [messages, setMessages] = useState([]);
    const [activeTab, setActiveTab] = useState('notDiscussed');
    const [selectedMessage, setSelectedMessage] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [copiedItems, setCopiedItems] = useState({});
    const [viewMode, setViewMode] = useState('table'); // 'table' or 'grid'

    useEffect(() => {
        const loadMessages = async () => {
            const data = await fetchContacts();
            setMessages(data);
        };
        loadMessages();
    }, []);

    const filteredMessages = messages.filter(msg => {
        const matchesTab = activeTab === 'notDiscussed' ? msg.discussed === false : msg.discussed === true;

        const lowerSearch = searchTerm.toLowerCase();

        const nameMatch = msg.name?.toLowerCase().includes(lowerSearch) ?? false;
        const emailMatch = msg.email?.toLowerCase().includes(lowerSearch) ?? false;
        const phoneMatch = msg.phone?.toLowerCase().includes(lowerSearch) ?? false;

        const serviceText = Array.isArray(msg.services)
            ? msg.services.join(', ').toLowerCase()
            : typeof msg.services === 'string'
                ? msg.services.toLowerCase()
                : '';

        const serviceMatch = serviceText.includes(lowerSearch);

        return matchesTab && (nameMatch || emailMatch || phoneMatch || serviceMatch);
    });

    const handleMoveToDiscussed = (id) => {
        setMessages(messages.map(msg =>
            msg.id === id ? { ...msg, discussed: true } : msg
        ));
        setShowModal(false);
    };

    const handleCopy = async (text, type, id) => {
        try {
            await navigator.clipboard.writeText(text);
            const key = `${type}-${id}`;
            setCopiedItems(prev => ({ ...prev, [key]: true }));

            setTimeout(() => {
                setCopiedItems(prev => ({ ...prev, [key]: false }));
            }, 2000);
        } catch (err) {
            console.error('Failed to copy text: ', err);
        }
    };

    const CopyButton = ({ text, type, id, className = "" }) => {
        const key = `${type}-${id}`;
        const isCopied = copiedItems[key];

        return (
            <button
                onClick={(e) => {
                    e.stopPropagation();
                    handleCopy(text, type, id);
                }}
                className={`ml-1 p-1 rounded hover:bg-gray-200 transition-colors duration-150 ${className}`}
                title={`Copy ${type}`}
            >
                {isCopied ? (
                    <Check className="h-3 w-3 text-green-600" />
                ) : (
                    <Copy className="h-3 w-3 text-gray-400 hover:text-gray-600" />
                )}
            </button>
        );
    };

    const getStatusBadge = (discussed) => {
        if (discussed) {
            return (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">
                    <CheckCheck className="h-3 w-3" />
                    Discussed
                </span>
            );
        } else {
            return (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
                    <Clock className="h-3 w-3" />
                    Not Discussed
                </span>
            );
        }
    };

    const GridView = () => (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredMessages.length > 0 ? (
                filteredMessages.map((msg) => (
                    <div key={msg.id} className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-200 overflow-hidden">
                        {/* Card Header */}
                        <div className="p-4 border-b border-gray-100">
                            <div className="flex items-center gap-3 mb-3">
                                <div className="flex-shrink-0 h-12 w-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                                    <span className="text-white font-medium text-sm">
                                        {msg.name.split(' ').map(n => n[0]).join('')}
                                    </span>
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h3 className="text-sm font-semibold text-gray-900 truncate">{msg.name}</h3>
                                    <div className="flex items-center justify-between mt-1">
                                        {getStatusBadge(msg.discussed)}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Card Body */}
                        <div className="p-4 space-y-3">
                            {/* Email */}
                            <div className="flex items-center gap-2">
                                <Mail className="h-4 w-4 text-gray-400 flex-shrink-0" />
                                <span className="text-sm text-gray-600 truncate flex-1">{msg.email}</span>
                                <CopyButton text={msg.email} type="email" id={msg.id} />
                            </div>

                            {/* Phone */}
                            <div className="flex items-center gap-2">
                                <Phone className="h-4 w-4 text-gray-400 flex-shrink-0" />
                                <span className="text-sm text-gray-600 flex-1">{msg.phone}</span>
                                <CopyButton text={msg.phone} type="phone" id={msg.id} />
                            </div>

                            {/* Services */}
                            <div className="flex items-start gap-2">
                                <Filter className="h-4 w-4 text-gray-400 flex-shrink-0 mt-0.5" />
                                <div className="flex-1">
                                    <div className="flex flex-wrap gap-1">
                                        {(Array.isArray(msg.services) ? msg.services : [msg.services]).slice(0, 2).map((service, index) => (
                                            <span key={index} className="inline-block px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                                                {service}
                                            </span>
                                        ))}
                                        {(Array.isArray(msg.services) ? msg.services : [msg.services]).length > 2 && (
                                            <span className="inline-block px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                                                +{(Array.isArray(msg.services) ? msg.services : [msg.services]).length - 2} more
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Message Preview */}
                            <div className="flex items-start gap-2">
                                <MessageSquare className="h-4 w-4 text-gray-400 flex-shrink-0 mt-0.5" />
                                <p className="text-sm text-gray-600 line-clamp-2 flex-1">
                                    {msg.message}
                                </p>
                            </div>

                            {/* Time */}
                            <div className="flex items-center gap-2 text-xs text-gray-500">
                                <Clock className="h-3 w-3" />
                                {msg.timestamp?.toDate().toLocaleString() ?? '—'}
                            </div>
                        </div>

                        {/* Card Footer */}
                        <div className="p-4 border-t border-gray-100">
                            <button
                                onClick={() => {
                                    setSelectedMessage(msg);
                                    setShowModal(true);
                                }}
                                className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors duration-150"
                            >
                                <Eye className="h-4 w-4" />
                                View Details
                            </button>
                        </div>
                    </div>
                ))
            ) : (
                <div className="col-span-full flex flex-col items-center justify-center py-12">
                    <div className="p-3 bg-gray-100 rounded-full mb-3">
                        <MessageSquare className="h-6 w-6 text-gray-400" />
                    </div>
                    <div className="text-sm text-gray-500">
                        No {activeTab === 'notDiscussed' ? 'pending' : 'discussed'} messages found
                    </div>
                </div>
            )}
        </div>
    );

    const TableView = () => (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                        <tr>
                            <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                <div className="flex items-center gap-2">
                                    <User className="h-4 w-4" />
                                    Contact
                                </div>
                            </th>
                            <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                <div className="flex items-center gap-2">
                                    <Phone className="h-4 w-4" />
                                    Phone
                                </div>
                            </th>
                            <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Services</th>
                            <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                <div className="flex items-center gap-2">
                                    <Clock className="h-4 w-4" />
                                    Time
                                </div>
                            </th>
                            <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-100">
                        {filteredMessages.length > 0 ? (
                            filteredMessages.map((msg, index) => (
                                <tr key={msg.id} className={`hover:bg-blue-50 transition-colors duration-150 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}`}>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="flex-shrink-0 h-10 w-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                                                <span className="text-white font-medium text-sm">
                                                    {msg.name.split(' ').map(n => n[0]).join('')}
                                                </span>
                                            </div>
                                            <div>
                                                <div className="text-sm font-medium text-gray-900">{msg.name}</div>
                                                <div className="flex items-center gap-1 text-sm text-gray-500">
                                                    <Mail className="h-3 w-3" />
                                                    <span className="break-all">{msg.email}</span>
                                                    <CopyButton text={msg.email} type="email" id={msg.id} />
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center gap-1 text-sm text-gray-600">
                                            <Phone className="h-3 w-3" />
                                            <span>{msg.phone}</span>
                                            <CopyButton text={msg.phone} type="phone" id={msg.id} />
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="text-sm text-gray-900 max-w-50 truncate" title={Array.isArray(msg.services) ? msg.services.join(', ') : msg.services}>
                                            {Array.isArray(msg.services)
                                                ? msg.services.join(', ')
                                                : typeof msg.services === 'string'
                                                    ? msg.services
                                                    : 'N/A'}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-600 whitespace-nowrap">
                                        {msg.timestamp?.toDate().toLocaleString() ?? '—'}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <button
                                            onClick={() => {
                                                setSelectedMessage(msg);
                                                setShowModal(true);
                                            }}
                                            className="inline-flex items-center gap-1 px-3 py-1.5 bg-blue-600 text-white text-xs font-medium rounded-lg hover:bg-blue-700 transition-colors duration-150 shadow-sm hover:shadow-md"
                                            title="View details"
                                        >
                                            <Eye className="h-3 w-3" />
                                            View
                                        </button>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="5" className="px-6 py-12 text-center">
                                    <div className="flex flex-col items-center gap-3">
                                        <div className="p-3 bg-gray-100 rounded-full">
                                            <MessageSquare className="h-6 w-6 text-gray-400" />
                                        </div>
                                        <div className="text-sm text-gray-500">
                                            No {activeTab === 'notDiscussed' ? 'pending' : 'discussed'} messages found
                                        </div>
                                    </div>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-6">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 bg-blue-600 rounded-lg">
                            <MessageSquare className="h-6 w-6 text-white" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">Contact Messages</h1>
                            <p className="text-gray-600 mt-1">Manage and track customer inquiries</p>
                        </div>
                    </div>

                    {/* Search Bar and View Toggle */}
                    <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                        <div className="relative max-w-md flex-1">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search messages..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white shadow-sm"
                            />
                        </div>

                        {/* View Toggle */}
                        <div className="flex items-center bg-white rounded-lg border border-gray-200 shadow-sm">
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

                {/* Tabs */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-6">
                    <div className="flex border-b border-gray-200">
                        <button
                            className={`flex-1 py-4 px-6 font-medium text-sm flex items-center justify-center gap-3 transition-all duration-200 ${activeTab === 'notDiscussed'
                                ? 'border-b-2 border-blue-500 text-blue-600 bg-blue-50'
                                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                                }`}
                            onClick={() => setActiveTab('notDiscussed')}
                        >
                            <Clock className="h-4 w-4" />
                            <span>Not Discussed</span>
                            <span className="bg-red-500 text-white text-xs font-bold px-2.5 py-1 rounded-full min-w-[24px]">
                                {messages.filter(msg => msg.discussed === false).length}
                            </span>
                        </button>
                        <button
                            className={`flex-1 py-4 px-6 font-medium text-sm flex items-center justify-center gap-3 transition-all duration-200 ${activeTab === 'discussed'
                                ? 'border-b-2 border-blue-500 text-blue-600 bg-blue-50'
                                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                                }`}
                            onClick={() => setActiveTab('discussed')}
                        >
                            <CheckCheck className="h-4 w-4" />
                            <span>Discussed</span>
                            <span className="bg-green-700 text-white text-xs font-bold px-2.5 py-1 rounded-full min-w-[24px]">
                                {messages.filter(msg => msg.discussed === true).length}
                            </span>
                        </button>
                    </div>
                </div>

                {/* Dynamic View Content */}
                {viewMode === 'table' ? <TableView /> : <GridView />}
            </div>

            {/* Enhanced Modal */}
            {showModal && selectedMessage && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="p-6">
                            {/* Modal Header */}
                            <div className="flex justify-between items-start mb-6">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-blue-100 rounded-lg">
                                        <MessageSquare className="h-5 w-5 text-blue-600" />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-bold text-gray-900">Message Details</h3>
                                        <p className="text-sm text-gray-500">Contact inquiry information</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setShowModal(false)}
                                    className="p-2 text-gray-400 hover:text-gray-500 hover:bg-gray-100 rounded-lg transition-colors duration-150"
                                >
                                    <X className="h-5 w-5" />
                                </button>
                            </div>

                            {/* Contact Info Cards */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                                <div className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl border border-blue-200">
                                    <div className="flex items-center gap-2 mb-2">
                                        <User className="h-4 w-4 text-blue-600" />
                                        <span className="text-sm font-medium text-blue-800">Name</span>
                                    </div>
                                    <p className="text-gray-900 font-medium">{selectedMessage.name}</p>
                                </div>

                                <div className="p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-xl border border-green-200">
                                    <div className="flex items-center gap-2 mb-2">
                                        <Mail className="h-4 w-4 text-green-600" />
                                        <span className="text-sm font-medium text-green-800">Email</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <p className="text-gray-900 font-medium break-all flex-1">{selectedMessage.email}</p>
                                        <CopyButton text={selectedMessage.email} type="email" id={selectedMessage.id} className="hover:bg-green-200" />
                                    </div>
                                </div>

                                <div className="p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl border border-purple-200">
                                    <div className="flex items-center gap-2 mb-2">
                                        <Phone className="h-4 w-4 text-purple-600" />
                                        <span className="text-sm font-medium text-purple-800">Phone</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <p className="text-gray-900 font-medium flex-1">{selectedMessage.phone}</p>
                                        <CopyButton text={selectedMessage.phone} type="phone" id={selectedMessage.id} className="hover:bg-purple-200" />
                                    </div>
                                </div>

                                <div className="p-4 bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl border border-orange-200">
                                    <div className="flex items-center gap-2 mb-2">
                                        <Filter className="h-4 w-4 text-orange-600" />
                                        <span className="text-sm font-medium text-orange-800">Status</span>
                                    </div>
                                    {getStatusBadge(selectedMessage.discussed)}
                                </div>
                            </div>

                            {/* Services */}
                            <div className="mb-6">
                                <div className="flex items-center gap-2 mb-3">
                                    <div className="p-1 bg-indigo-100 rounded">
                                        <Filter className="h-4 w-4 text-indigo-600" />
                                    </div>
                                    <span className="text-sm font-medium text-gray-700">Requested Services</span>
                                </div>

                                <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
                                    <ul className="list-disc list-inside text-gray-900 space-y-1">
                                        {(Array.isArray(selectedMessage.services)
                                            ? selectedMessage.services
                                            : typeof selectedMessage.services === "string"
                                                ? selectedMessage.services.split(',').map(s => s.trim())
                                                : []
                                        ).map((service, index) => (
                                            <li key={index}>{service}</li>
                                        ))}
                                    </ul>
                                </div>
                            </div>

                            {/* Message */}
                            <div className="mb-6">
                                <div className="flex items-center gap-2 mb-3">
                                    <div className="p-1 bg-emerald-100 rounded">
                                        <MessageSquare className="h-4 w-4 text-emerald-600" />
                                    </div>
                                    <span className="text-sm font-medium text-gray-700">Message</span>
                                </div>
                                <div className="p-4 bg-gray-50 rounded-xl border border-gray-200 max-h-40 overflow-y-auto">
                                    <p className="text-gray-900 whitespace-pre-line leading-relaxed">{selectedMessage.message}</p>
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                                <button
                                    onClick={() => setShowModal(false)}
                                    className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors duration-150"
                                >
                                    Close
                                </button>
                                {activeTab === 'notDiscussed' && (
                                    <button
                                        onClick={() => {
                                            markAsDiscussed(selectedMessage.id)
                                            handleMoveToDiscussed(selectedMessage.id)
                                        }}
                                        className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                                    >
                                        Mark as Discussed
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ContactDetails;