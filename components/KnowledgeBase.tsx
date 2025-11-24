import React, { useState } from 'react';
import { Conundrum, CoreConcept } from '../types';
import { BookOpen, Lightbulb, GraduationCap, ChevronRight } from 'lucide-react';
import { Button } from './ui/Button';

interface KnowledgeBaseProps {
  conundrum: Conundrum;
}

export const KnowledgeBase: React.FC<KnowledgeBaseProps> = ({ conundrum }) => {
  const [selectedConcept, setSelectedConcept] = useState<CoreConcept | null>(null);

  return (
    <div className="min-h-screen bg-gradient-to-br from-space-900 via-indigo-950 to-purple-950 p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl">
              <BookOpen size={32} className="text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">Knowledge Base</h1>
              <p className="text-gray-400">핵심 개념 학습</p>
            </div>
          </div>
          
          <div className="bg-space-800/50 backdrop-blur-sm border border-space-700 rounded-xl p-6">
            <h2 className="text-xl font-semibold text-cyan-300 mb-2">{conundrum.title}</h2>
            <p className="text-gray-300">{conundrum.description}</p>
          </div>
        </div>

        {/* Learning Objective */}
        <div className="mb-8 bg-gradient-to-r from-purple-900/30 to-indigo-900/30 border border-purple-500/30 rounded-xl p-6">
          <div className="flex items-start gap-3">
            <GraduationCap size={24} className="text-purple-400 flex-shrink-0 mt-1" />
            <div>
              <h3 className="text-lg font-semibold text-purple-300 mb-2">학습 목표</h3>
              <p className="text-gray-300">{conundrum.learningObjective}</p>
            </div>
          </div>
        </div>

        {/* Core Concepts Grid */}
        <div className="mb-8">
          <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <Lightbulb size={24} className="text-yellow-400" />
            핵심 개념들
          </h3>
          
          {conundrum.coreConcepts && conundrum.coreConcepts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {conundrum.coreConcepts.map((concept, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedConcept(concept)}
                  className={`
                    text-left p-6 rounded-xl border-2 transition-all duration-300
                    ${selectedConcept === concept 
                      ? 'bg-gradient-to-br from-cyan-900/50 to-blue-900/50 border-cyan-500 shadow-lg shadow-cyan-500/20' 
                      : 'bg-space-800/50 border-space-700 hover:border-cyan-600 hover:shadow-md'}
                  `}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="text-lg font-semibold text-white mb-2">{concept.term}</h4>
                      <p className="text-sm text-gray-400 line-clamp-2">{concept.definition}</p>
                    </div>
                    <ChevronRight 
                      size={20} 
                      className={`flex-shrink-0 ml-2 transition-transform ${
                        selectedConcept === concept ? 'text-cyan-400 rotate-90' : 'text-gray-600'
                      }`} 
                    />
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <div className="bg-space-800/30 border border-space-700 rounded-xl p-8 text-center">
              <BookOpen size={48} className="mx-auto mb-4 text-gray-600" />
              <p className="text-gray-400">이 미션에 대한 핵심 개념이 아직 준비되지 않았습니다.</p>
            </div>
          )}
        </div>

        {/* Detailed Concept View */}
        {selectedConcept && (
          <div className="bg-gradient-to-br from-space-800 to-space-900 border-2 border-cyan-500 rounded-xl p-8 shadow-xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-cyan-500/20 rounded-lg">
                <Lightbulb size={24} className="text-cyan-400" />
              </div>
              <h3 className="text-2xl font-bold text-white">{selectedConcept.term}</h3>
            </div>
            <div className="prose prose-invert max-w-none">
              <p className="text-gray-300 text-lg leading-relaxed">{selectedConcept.definition}</p>
            </div>
          </div>
        )}

        {/* Warm-up Question Preview */}
        {conundrum.warmUpQuestion && (
          <div className="mt-8 bg-gradient-to-r from-orange-900/30 to-red-900/30 border border-orange-500/30 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-orange-300 mb-3">🔥 워밍업 질문</h3>
            <p className="text-gray-300 italic">"{conundrum.warmUpQuestion}"</p>
          </div>
        )}

        {/* Navigation Help */}
        <div className="mt-8 text-center">
          <p className="text-gray-400 text-sm mb-4">
            핵심 개념을 숙지한 후, Orienteering 단계로 넘어가 본격적인 탐구를 시작하세요! 
          </p>
          <div className="flex justify-center gap-2 text-xs text-gray-500">
            <span className="px-3 py-1 bg-space-800 rounded-full">💡 Tip: 각 개념을 클릭하면 상세 설명을 볼 수 있습니다</span>
          </div>
        </div>
      </div>
    </div>
  );
};
