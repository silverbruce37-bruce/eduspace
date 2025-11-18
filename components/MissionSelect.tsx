import React, { useState, useEffect } from 'react';
import { Conundrum, GradeLevel } from '../types';
import { generateConundrum } from '../services/geminiService';
import { Button } from './ui/Button';
import { RefreshCw, ArrowRight, Star, GraduationCap, School, Baby, Brain } from 'lucide-react';

interface MissionSelectProps {
  onSelect: (c: Conundrum) => void;
  selectedId?: string;
  activeConundrum?: Conundrum | null;
  currentLevel: GradeLevel;
  setLevel: (level: GradeLevel) => void;
}

export const MissionSelect: React.FC<MissionSelectProps> = ({ 
  onSelect, 
  selectedId, 
  activeConundrum, 
  currentLevel, 
  setLevel 
}) => {
  const [missions, setMissions] = useState<Conundrum[]>([]);
  const [loading, setLoading] = useState(false);

  // Ensure the active persistent conundrum is visible in the list
  useEffect(() => {
    if (activeConundrum) {
      setMissions(prev => {
        const exists = prev.some(m => m.id === activeConundrum.id);
        return exists ? prev : [activeConundrum, ...prev];
      });
    }
  }, [activeConundrum]);

  const handleGenerate = async () => {
    setLoading(true);
    try {
      const newMission = await generateConundrum(currentLevel);
      setMissions(prev => [newMission, ...prev]);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const LevelButton = ({ level, icon: Icon, label, gradeText }: { level: GradeLevel, icon: any, label: string, gradeText: string }) => (
    <button
      onClick={() => {
        setLevel(level);
        // We don't clear missions immediately so the user doesn't lose the current view if they just misclicked,
        // but generating new ones will use the new level.
      }}
      className={`
        flex flex-col items-center justify-center p-4 rounded-xl border transition-all duration-300 w-full
        ${currentLevel === level 
          ? 'bg-indigo-900/60 border-cyan-400 text-white shadow-[0_0_20px_rgba(6,182,212,0.3)] scale-105' 
          : 'bg-space-800/40 border-space-700 text-gray-400 hover:bg-space-800 hover:text-white'}
      `}
    >
      <Icon size={28} className={`mb-2 ${currentLevel === level ? 'text-cyan-400' : 'text-gray-500'}`} />
      <span className="text-lg font-bold mb-1">{label}</span>
      <span className="text-[10px] opacity-70 uppercase tracking-wider font-medium text-indigo-300">
        {gradeText}
      </span>
    </button>
  );

  return (
    <div className="max-w-5xl mx-auto p-6 animate-fade-in pb-20">
      <div className="mb-8 text-center">
        <h2 className="text-4xl font-bold text-white mb-4 tracking-tight">ICAN Conundrums Mission Control</h2>
        <p className="text-gray-400 text-lg">Begin your journey of Space Thinking Expansion. Select difficulty.</p>
      </div>

      {/* Level Selection */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
        <LevelButton level={GradeLevel.ELEMENTARY_LOWER} icon={Baby} label="Easy" gradeText="Cadet (Gr 1-3)" />
        <LevelButton level={GradeLevel.ELEMENTARY_UPPER} icon={School} label="Medium" gradeText="Pilot (Gr 4-6)" />
        <LevelButton level={GradeLevel.MIDDLE_SCHOOL} icon={Brain} label="Hard" gradeText="Specialist (Gr 7-9)" />
        <LevelButton level={GradeLevel.HIGH_SCHOOL} icon={GraduationCap} label="Expert" gradeText="Commander (Gr 10-12)" />
      </div>

      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-semibold text-white">Available Missions</h3>
        <Button 
          onClick={handleGenerate} 
          disabled={loading} 
          icon={loading ? <RefreshCw className="animate-spin" /> : <Star />}
          variant="secondary"
        >
          {loading ? 'Scanning Deep Space...' : 'Generate New Mission'}
        </Button>
      </div>

      {/* Missions Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {missions.length === 0 && !loading && (
          <div className="col-span-full text-center py-12 border-2 border-dashed border-space-700 rounded-xl text-gray-500">
            <p>No active signals detected for this sector.</p>
            <p className="text-sm mt-2">Click "Generate New Mission" to scan.</p>
          </div>
        )}

        {missions.map((mission) => (
          <div 
            key={mission.id}
            onClick={() => onSelect(mission)}
            className={`
              group relative p-6 rounded-xl border cursor-pointer transition-all duration-300 hover:-translate-y-1
              ${selectedId === mission.id 
                ? 'bg-space-800/80 border-cyan-500 shadow-[0_0_30px_rgba(6,182,212,0.15)]' 
                : 'bg-space-800/40 border-space-700 hover:border-space-600 hover:bg-space-800'}
            `}
          >
            <div className="absolute top-4 right-4">
              <span className={`
                text-xs px-2 py-1 rounded-full font-medium border
                ${mission.difficulty === 'Easy' ? 'bg-green-900/30 text-green-400 border-green-700' :
                  mission.difficulty === 'Medium' ? 'bg-yellow-900/30 text-yellow-400 border-yellow-700' :
                  mission.difficulty === 'Hard' ? 'bg-orange-900/30 text-orange-400 border-orange-700' :
                  'bg-red-900/30 text-red-400 border-red-700'}
              `}>
                {mission.difficulty}
              </span>
            </div>

            <h3 className="text-xl font-bold text-white mb-2 group-hover:text-cyan-400 transition-colors pr-16">
              {mission.title}
            </h3>
            <p className="text-gray-400 mb-4 line-clamp-3 text-sm">
              {mission.description}
            </p>
            
            <div className="flex flex-wrap gap-2 mb-6">
              {mission.tags.map(tag => (
                <span key={tag} className="text-xs text-indigo-300 bg-indigo-900/30 px-2 py-1 rounded">
                  #{tag}
                </span>
              ))}
            </div>

            <div className="flex items-center text-sm font-medium text-cyan-500 group-hover:translate-x-1 transition-transform">
              Initiate Mission <ArrowRight size={16} className="ml-1" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};