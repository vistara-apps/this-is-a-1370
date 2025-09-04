import React from 'react';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { 
  LayoutDashboard, 
  Upload, 
  Files, 
  BarChart3, 
  Store,
  Settings,
  HelpCircle,
  Folder
} from 'lucide-react';

const Sidebar = ({ currentPage, onPageChange }) => {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'upload', label: 'Upload File', icon: Upload },
    { id: 'files', label: 'My Files', icon: Files },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'marketplace', label: 'Marketplace', icon: Store },
  ];

  return (
    <div className="fixed left-0 top-0 h-full w-64 bg-dark-surface border-r border-dark-border">
      <div className="p-6">
        {/* Logo */}
        <div className="flex items-center space-x-2 mb-8">
          <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg flex items-center justify-center">
            <Folder className="w-5 h-5 text-white" />
          </div>
          <h1 className="text-xl font-bold text-dark-text">FilePay</h1>
        </div>

        {/* Wallet Connection */}
        <div className="mb-8">
          <ConnectButton />
        </div>

        {/* Navigation */}
        <nav className="space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => onPageChange(item.id)}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-all duration-200 ${
                  currentPage === item.id
                    ? 'bg-gradient-to-r from-purple-500/20 to-blue-500/20 text-white border border-purple-500/30'
                    : 'text-dark-muted hover:text-dark-text hover:bg-dark-border/50'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="font-medium">{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Bottom Menu */}
        <div className="absolute bottom-6 left-6 right-6 space-y-2">
          <button className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left text-dark-muted hover:text-dark-text hover:bg-dark-border/50 transition-all duration-200">
            <Settings className="w-5 h-5" />
            <span className="font-medium">Settings</span>
          </button>
          <button className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left text-dark-muted hover:text-dark-text hover:bg-dark-border/50 transition-all duration-200">
            <HelpCircle className="w-5 h-5" />
            <span className="font-medium">Help</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;