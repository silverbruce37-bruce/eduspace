import React, { useState } from 'react';
import { ThesisData, Conundrum, Message, GradeLevel, MicroDecision } from '../types';
import { generateThesisDraft } from '../services/geminiService';
import { Button } from './ui/Button';
import { Sparkles, Save } from 'lucide-react';

interface ThesisEditorProps {
  conundrum: Conundrum;
  history: Message[];
  microDecisions: MicroDecision[];
  thesis: ThesisData;
  setThesis: (data: ThesisData) => void;
  level: GradeLevel;
}

export const ThesisEditor: React.FC<ThesisEditorProps> = ({ 
  conundrum, 
  history, 
  microDecisions,
  thesis, 
  setThesis, 
  level 
}) => {
  const [isGenerating, setIsGenerating] = useState(false);

  const handleAutoDraft = async () => {
    if (history.length < 2) {
      alert("Please chat with the AI in the Orienteering stage first to discuss your options!");
      return;
    }
    setIsGenerating(true);
    try {
      const draft = await generateThesisDraft(conundrum, history, microDecisions, level);
      setThesis({ ...thesis, ...draft });
    } catch (e) {
      console.error(e);
      alert("Failed to generate draft. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleChange = (field: keyof ThesisData, value: string) => {
    setThesis({ ...thesis, [field]: value });
  };

  // Labels matching the "Moon Base" example structure
  const labels = {
    mainTitle: "Solution Thesis",
    subTitle: `Addressing: ${conundrum.description}`,
    title: "Final Project Title",
    abstract: "Context & Warm-up Findings",
    problemAnalysis: "Challenge Analysis (Follow-up Questions)",
    alternatives: "Possible Solutions Considered",
    proposedSolution: "My Best Solution",
    conclusion: "Why is this the Best? (Justification)"
  };

  return (
    <div className="max-w-5xl mx-auto p-6 md:p-10 min-h-screen bg-space-900 text-gray-200 animate-fade-in pb-24">
      
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h2 className="text-3xl font-bold text-white mb-1">{labels.mainTitle}</h2>
          <p className="text-cyan-400 text-sm font-medium">{labels.subTitle}</p>
        </div>
        <div className="flex gap-3">
          <Button 
            onClick={handleAutoDraft} 
            variant="secondary" 
            disabled={isGenerating}
            icon={isGenerating ? <Sparkles className="animate-spin" /> : <Sparkles />}
          >
            {isGenerating ? 'Synthesize Micro-Decisions' : 'Auto-Draft with AI'}
          </Button>
          <Button icon={<Save />} variant="primary">
            Save Thesis
          </Button>
        </div>
      </div>

      <div className="grid gap-8 bg-space-800/30 p-8 rounded-2xl border border-space-700">
        
        {/* Title */}
        <div className="space-y-2">
          <label className="text-xs uppercase tracking-wider font-bold text-indigo-400">{labels.title}</label>
          <input
            type="text"
            value={thesis.title}
            onChange={(e) => handleChange('title', e.target.value)}
            className="w-full bg-space-900 border border-space-600 rounded-lg p-4 text-xl font-bold text-white focus:border-indigo-500 outline-none"
            placeholder="Enter title..."
          />
        </div>

        {/* Context / Warm-up */}
        <div className="space-y-2">
          <label className="text-xs uppercase tracking-wider font-bold text-indigo-400">{labels.abstract}</label>
          <textarea
            value={thesis.abstract}
            onChange={(e) => handleChange('abstract', e.target.value)}
            className="w-full h-24 bg-space-900 border border-space-600 rounded-lg p-4 text-gray-300 focus:border-indigo-500 outline-none resize-none"
            placeholder="Summarize the initial context and warm-up findings..."
          />
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Analysis */}
          <div className="space-y-2">
            <label className="text-xs uppercase tracking-wider font-bold text-indigo-400">{labels.problemAnalysis}</label>
            <textarea
              value={thesis.problemAnalysis}
              onChange={(e) => handleChange('problemAnalysis', e.target.value)}
              className="w-full h-64 bg-space-900 border border-space-600 rounded-lg p-4 text-gray-300 focus:border-indigo-500 outline-none resize-none"
              placeholder="Analyze the follow-up questions and core challenges..."
            />
          </div>

          {/* Possible Solutions (Alternatives) */}
          <div className="space-y-2">
            <label className="text-xs uppercase tracking-wider font-bold text-indigo-400">{labels.alternatives}</label>
            <textarea
              value={thesis.alternatives}
              onChange={(e) => handleChange('alternatives', e.target.value)}
              className="w-full h-64 bg-space-900 border border-space-600 rounded-lg p-4 text-gray-300 focus:border-indigo-500 outline-none resize-none"
              placeholder="- Option 1...&#10;- Option 2...&#10;- Option 3..."
            />
          </div>
        </div>

        {/* Best Solution */}
        <div className="space-y-2">
          <label className="text-xs uppercase tracking-wider font-bold text-cyan-400">{labels.proposedSolution}</label>
          <textarea
            value={thesis.proposedSolution}
            onChange={(e) => handleChange('proposedSolution', e.target.value)}
            className="w-full h-32 bg-space-800 border border-cyan-900/50 rounded-lg p-4 text-white font-medium focus:border-cyan-500 outline-none resize-none shadow-inner"
            placeholder="State your chosen Best Solution..."
          />
        </div>

        {/* Justification (Why is it Best?) */}
        <div className="space-y-2">
          <label className="text-xs uppercase tracking-wider font-bold text-indigo-400">{labels.conclusion}</label>
          <textarea
            value={thesis.conclusion}
            onChange={(e) => handleChange('conclusion', e.target.value)}
            className="w-full h-40 bg-space-900 border border-space-600 rounded-lg p-4 text-gray-300 focus:border-indigo-500 outline-none resize-none"
            placeholder="Explain why this is the best solution using your micro-decisions as evidence..."
          />
        </div>

      </div>
    </div>
  );
};