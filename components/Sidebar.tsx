import React from 'react';
import { AppStage } from '../types';
import { Rocket, BookOpen, Compass, FileText, Tv, Menu, X } from 'lucide-react';

interface SidebarProps {
  currentStage: AppStage;
  setStage: (stage: AppStage) => void;
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentStage, setStage, isOpen, setIsOpen }) => {
  const menuItems = [
    { id: AppStage.MISSION_CONTROL, label: 'Mission Control', icon: <Rocket size={20} /> },
    { id: AppStage.KNOWLEDGE_BASE, label: 'Knowledge Base', icon: <BookOpen size={20} /> },
    { id: AppStage.ORIENTEERING, label: 'Orienteering', icon: <Compass size={20} /> },
    { id: AppStage.THESIS, label: 'Thesis Builder', icon: <FileText size={20} /> },
    { id: AppStage.LAUNCHPAD, label: 'TED Launchpad', icon: <Tv size={20} /> },
  ];

  return (
    <>
      {/* Mobile Toggle */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="md:hidden fixed top-4 left-4 z-50 p-2 bg-space-800 rounded-md text-white border border-space-700"
      >
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Sidebar Container */}
      <div className={`
        fixed inset-y-0 left-0 z-40 w-64 bg-space-900/95 backdrop-blur-xl border-r border-space-700 transform transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0
      `}>
        <div className="flex flex-col h-full">
          <div className="p-6 border-b border-space-800">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent">
              ICAN EduSpace
            </h1>
            <p className="text-xs text-gray-400 mt-1">Space Thinking Expansion</p>
          </div>

          <nav className="flex-1 p-4 space-y-2">
            {menuItems.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  setStage(item.id);
                  setIsOpen(false);
                }}
                className={`
                  w-full flex items-center px-4 py-3 rounded-lg transition-all duration-200
                  ${currentStage === item.id 
                    ? 'bg-gradient-to-r from-space-800 to-space-700 text-cyan-300 border-l-4 border-cyan-500' 
                    : 'text-gray-400 hover:text-white hover:bg-space-800/50'}
                `}
              >
                <span className="mr-3">{item.icon}</span>
                <span className="font-medium">{item.label}</span>
              </button>
            ))}
          </nav>

          <div className="p-6 border-t border-space-800">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center font-bold text-xs">
                IC
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-white">Student Pilot</p>
                <p className="text-xs text-gray-500">ICAN Academy</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
