import React from 'react';
import { Conundrum } from '../types';
import { BookOpen, ArrowRight } from 'lucide-react';

interface KnowledgeBaseProps {
  conundrum: Conundrum;
}

export const KnowledgeBase: React.FC<KnowledgeBaseProps> = ({ conundrum }) => {
  return (
    <div className="p-8 max-w-4xl mx-auto animate-fadeIn">
      <div className="flex items-center gap-3 mb-8">
        <div className="p-3 rounded-full bg-cyan-500/20 text-cyan-400">
          <BookOpen size={24} />
        </div>
        <div>
          <h2 className="text-3xl font-bold text-white">Knowledge Base</h2>
          <p className="text-gray-400">Essential concepts for your mission</p>
        </div>
      </div>

      <div className="grid gap-6">
        {conundrum.coreConcepts.map((concept, index) => (
          <div 
            key={index}
            className="bg-space-800/50 border border-space-700 rounded-xl p-6 hover:border-cyan-500/50 transition-all duration-300"
          >
            <h3 className="text-xl font-bold text-cyan-300 mb-2">{concept.term}</h3>
            <p className="text-gray-300 leading-relaxed">{concept.definition}</p>
          </div>
        ))}
      </div>

      {conundrum.coreConcepts.length === 0 && (
        <div className="text-center p-12 bg-space-800/30 rounded-xl border border-space-700 border-dashed">
          <p className="text-gray-500">No core concepts available for this mission.</p>
        </div>
      )}
    </div>
  );
};
