import React, { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
  FolderOpen,
  Users,
  HelpCircle,
  Palette,
  Megaphone,
  Image,
  Code,
  ChevronLeft,
  ChevronRight,
  LogOut,
  User,
  Home,
  Contact,
  Crown,
  IndianRupee
} from 'lucide-react';

const AdminLayout = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    { id: 'projects', label: 'Projects', icon: FolderOpen, path: '/admin/projects' },
    { id: 'clients', label: 'Clients', icon: Users, path: '/admin/clients' },
    { id: 'faqs', label: 'FAQs', icon: HelpCircle, path: '/admin/faqs' },
    { id: 'BrandingAdmin', label: 'BrandingAdmin', icon: Palette, path: '/admin/BrandingAdmin' },
    { id: 'PerformanceAdmin', label: 'PerformanceAdmin', icon: Crown, path: '/admin/PerformanceAdmin' },
    // { id: 'GraphicAdmin', label: 'GraphicAdmin', icon: Palette, path: '/admin/GraphicAdmin' },
    { id: 'PackagesAdmin', label: 'PackagesAdmin', icon: IndianRupee, path: '/admin/PackagesAdmin' },
    { id: 'ContactDetails', label: 'Contact Details', icon: Contact, path: '/admin/contact-details' },
    { id: 'Image', label: 'Image', icon: Image, path: '/admin/image' }
  ];

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  const handleItemClick = (path) => {
    navigate(path);
  };

  const handleLogout = () => {
    console.log('Logout clicked');
    // Add your logout logic here
  };

  const getCurrentActiveItem = () => {
    const currentPath = location.pathname;
    const activeMenuItem = menuItems.find(item => item.path === currentPath);
    return activeMenuItem?.id || 'projects';
  };

  const activeItem = getCurrentActiveItem();

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Sidebar */}
      <div
        className={`bg-white border-r border-gray-200 transition-all duration-300 ease-in-out ${
          isCollapsed ? 'w-16' : 'w-64'
        } h-full flex flex-col shadow-sm`}
      >
        {/* Header */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            {!isCollapsed && (
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                  <Home className="w-5 h-5 text-white" />
                </div>
                <span className="font-bold text-lg text-gray-800">Admin Panel</span>
              </div>
            )}
            <button
              onClick={toggleSidebar}
              className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors text-gray-600"
            >
              {isCollapsed ? (
                <ChevronRight className="w-4 h-4" />
              ) : (
                <ChevronLeft className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 overflow-y-auto">
          <ul className="space-y-2">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeItem === item.id;

              return (
                <li key={item.id}>
                  <button
                    onClick={() => handleItemClick(item.path)}
                    className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg transition-all duration-200 ${
                      isActive
                        ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-600'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                  >
                    <Icon className="w-5 h-5 flex-shrink-0" />
                    {!isCollapsed && (
                      <span className="flex-1 text-left font-medium">{item.label}</span>
                    )}
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* User Profile & Logout */}
        <div className="p-4 border-t border-gray-200">
          {!isCollapsed ? (
            <div className="space-y-3">
              <div className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
                <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                  <User className="w-4 h-4 text-gray-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">Admin User</p>
                  <p className="text-xs text-gray-500">Administrator</p>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-gray-600 hover:bg-red-50 hover:text-red-700 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span className="font-medium">Logout</span>
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              <button className="w-full p-2 rounded-lg hover:bg-gray-50 transition-colors">
                <User className="w-5 h-5 mx-auto text-gray-600" />
              </button>
              <button
                onClick={handleLogout}
                className="w-full p-2 rounded-lg text-gray-600 hover:bg-red-50 hover:text-red-700 transition-colors"
              >
                <LogOut className="w-5 h-5 mx-auto" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        <Outlet />
      </div>
    </div>
  );
};

export default AdminLayout;
