import React, { useState, useEffect, useRef } from 'react';
import { Message, Conundrum, GradeLevel, MicroDecision, GroundingLink } from '../types';
import { createChatSession, generateIdeaImages } from '../services/geminiService';
import { Button } from './ui/Button';
import { Send, Bot, User, CheckCircle, Plus, Gavel, Target, ArrowRight, X, MessageCircle, HelpCircle, ClipboardList, MapPin, BookOpen, Lightbulb, Sparkles, ImageIcon } from 'lucide-react';
import { Chat } from '@google/genai';

interface OrienteeringChatProps {
  conundrum: Conundrum;
  history: Message[];
  setHistory: (history: Message[]) => void;
  level: GradeLevel;
  microDecisions: MicroDecision[];
  setMicroDecisions: (decisions: MicroDecision[]) => void;
}

export const OrienteeringChat: React.FC<OrienteeringChatProps> = ({ 
  conundrum, 
  history, 
  setHistory, 
  level,
  microDecisions,
  setMicroDecisions
}) => {
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  // UI States
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); // For mobile toggle
  const [showDecisionForm, setShowDecisionForm] = useState(false); // Expand/Collapse form
  const [activeTab, setActiveTab] = useState<'log' | 'knowledge'>('log');

  // Form Data
  const [selectedChallenge, setSelectedChallenge] = useState<string | null>(null);
  const [decisionInput, setDecisionInput] = useState({ decision: '', reasoning: '' });
  
  const chatSessionRef = useRef<Chat | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const logSectionRef = useRef<HTMLDivElement>(null);
  
  // Ref to track history to avoid stale closures in async functions
  const historyRef = useRef(history);
  useEffect(() => {
    historyRef.current = history;
  }, [history]);

  // Initialize or Reset Chat Session
  useEffect(() => {
    chatSessionRef.current = createChatSession(level, conundrum);
    
    if (history.length === 0) {
      const initialContext = `Mission Start. Please ask me the Warm-Up Question: "${conundrum.warmUpQuestion}"`;
      sendMessage(initialContext, true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [conundrum.id, level]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [history]);

  const sendMessage = async (text: string, hidden = false) => {
    if (!text.trim() || !chatSessionRef.current) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      text: text,
      timestamp: Date.now()
    };

    // Optimistic update - Use direct array update via Ref, NO functional updates
    if (!hidden) {
      const newHistory = [...historyRef.current, userMsg];
      setHistory(newHistory);
      historyRef.current = newHistory; // Update ref immediately for sequential logic
    }
    
    setInput('');
    setIsLoading(true);

    try {
      // 1. Get Text Response
      const result = await chatSessionRef.current.sendMessage({ message: text });
      const responseText = result.text;

      // Extract Maps Grounding Data
      const chunks = result.candidates?.[0]?.groundingMetadata?.groundingChunks;
      const groundingLinks: GroundingLink[] = [];
      
      if (chunks) {
        chunks.forEach((c: any) => {
          if (c.maps) {
            groundingLinks.push({ 
              title: c.maps.title || 'View Location', 
              uri: c.maps.uri, 
              type: 'map' 
            });
          }
        });
      }

      const botMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        text: responseText || "Processing data...",
        timestamp: Date.now(),
        groundingLinks: groundingLinks.length > 0 ? groundingLinks : undefined
      };

      // Update history with bot response. 
      const currentHist = historyRef.current;
      const lastMsg = currentHist[currentHist.length - 1];
      
      let nextHistory;
      if (!hidden && lastMsg?.id === userMsg.id) {
         nextHistory = [...currentHist, botMsg];
      } else if (!hidden) {
         nextHistory = [...currentHist, userMsg, botMsg];
      } else {
         nextHistory = [...currentHist, botMsg];
      }
      
      setHistory(nextHistory);
      historyRef.current = nextHistory;

      // 2. Trigger Image "Idea Train" Generation in background if it's a Model response
      // We only generate images for meaningful model responses to visualize the topic
      if (responseText && responseText.length > 50) {
        generateIdeaImages(responseText.substring(0, 300)).then((images) => {
          if (images && images.length > 0) {
            // Safe update using Ref to get latest state, creating new array
            const latestHistory = historyRef.current;
            const updatedHistory = latestHistory.map(m => 
              m.id === botMsg.id ? { ...m, images: images } : m
            );
            setHistory(updatedHistory);
            historyRef.current = updatedHistory;
          }
        });
      }

    } catch (error) {
      console.error("Chat error:", error);
      const errorMsg: Message = {
        id: (Date.now() + 2).toString(),
        role: 'model',
        text: "Connection interruption. Please retry transmission.",
        timestamp: Date.now()
      };
      
      if (!hidden) {
          const errorHistory = [...historyRef.current, errorMsg];
          setHistory(errorHistory);
          historyRef.current = errorHistory;
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectChallenge = (challenge: string) => {
    setSelectedChallenge(challenge);
    setShowDecisionForm(true);
    setIsSidebarOpen(true);
    setActiveTab('log'); // Ensure we are on the log tab
  };

  const handleLogDecision = () => {
    if (!decisionInput.decision) return;
    
    const newDecision: MicroDecision = {
      id: Date.now().toString(),
      question: selectedChallenge || "Custom Decision",
      decision: decisionInput.decision,
      reasoning: decisionInput.reasoning
    };

    setMicroDecisions([...microDecisions, newDecision]);
    setDecisionInput({ decision: '', reasoning: '' });
    setShowDecisionForm(false);
    setSelectedChallenge(null);
    
    // Notify AI of the decision so it can proceed
    sendMessage(`I have decided on "${newDecision.question}". Choice: ${newDecision.decision}. Reasoning: ${newDecision.reasoning}. What is the next step?`, true);
    
    // Scroll to log to show confirmation
    setTimeout(() => {
       if(logSectionRef.current) {
          logSectionRef.current.scrollIntoView({ behavior: 'smooth' });
       }
    }, 300);
  };

  const handleQuickInsert = (text: string) => {
    setInput(text);
    inputRef.current?.focus();
  };

  const handleViewLog = () => {
    setIsSidebarOpen(true);
    setActiveTab('log');
    setTimeout(() => {
        if (logSectionRef.current) {
            logSectionRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, 100);
  };

  return (
    <div className="flex h-[calc(100vh-4rem)] md:h-screen bg-space-900 overflow-hidden">
      
      {/* Main Chat Interface */}
      <div className="flex-1 flex flex-col h-full border-r border-space-800 relative">
        {/* Mission Header */}
        <div className="p-4 border-b border-space-700 bg-space-800/50 backdrop-blur shadow-md z-10">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <CompassIcon /> Orienteering
              </h3>
              <p className="text-sm text-cyan-400 font-medium mt-1">{conundrum.description}</p>
            </div>
            <div className="text-[10px] text-gray-400 uppercase tracking-widest border border-space-600 px-2 py-1 rounded">
              Phase: Inquiry
            </div>
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            {conundrum.tags.map(tag => (
              <span key={tag} className="text-[10px] bg-indigo-900/50 text-indigo-300 px-2 py-0.5 rounded-full">
                {tag}
              </span>
            ))}
          </div>
        </div>

        {/* Chat History */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-6 scroll-smooth">
          {history.map((msg) => (
            <div key={msg.id} className={`flex gap-4 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              {msg.role === 'model' && (
                <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center shrink-0 shadow-lg shadow-indigo-500/20">
                  <Bot size={18} className="text-white" />
                </div>
              )}
              
              <div className={`
                max-w-[85%] flex flex-col gap-2
                ${msg.role === 'user' ? 'items-end' : 'items-start'}
              `}>
                <div className={`
                  p-4 rounded-2xl text-sm leading-relaxed shadow-lg
                  ${msg.role === 'user' 
                    ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white rounded-br-none' 
                    : 'bg-space-800 border border-space-700 text-gray-200 rounded-bl-none'}
                `}>
                  <div dangerouslySetInnerHTML={{ __html: msg.text.replace(/\n/g, '<br/>').replace(/\*\*(.*?)\*\*/g, '<strong class="text-cyan-300">$1</strong>') }} />
                </div>

                {/* Idea Train - Image Strip */}
                {msg.images && msg.images.length > 0 && (
                  <div className="mt-2 w-full overflow-hidden animate-fade-in">
                    <div className="flex items-center gap-1 mb-1 text-[10px] text-cyan-400 uppercase font-bold tracking-wider">
                      <Sparkles size={10} /> Idea Train
                    </div>
                    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                      {msg.images.map((img, idx) => (
                        <div key={idx} className="shrink-0 relative group cursor-pointer">
                          <img 
                            src={img} 
                            alt="AI Concept" 
                            className="h-24 w-auto rounded-md border border-space-600 shadow-sm hover:border-cyan-500 transition-all"
                            onClick={() => window.open(img, '_blank')}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Map Links Display */}
                {msg.groundingLinks && msg.groundingLinks.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-1">
                    {msg.groundingLinks.map((link, idx) => (
                      <a 
                        key={idx} 
                        href={link.uri} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="flex items-center gap-1.5 text-xs bg-space-700 hover:bg-space-600 text-cyan-300 px-3 py-2 rounded-lg border border-space-600 transition-colors"
                      >
                        <MapPin size={12} /> {link.title}
                      </a>
                    ))}
                  </div>
                )}
              </div>

              {msg.role === 'user' && (
                <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center shrink-0">
                  <User size={18} />
                </div>
              )}
            </div>
          ))}
          {isLoading && (
            <div className="flex gap-4 animate-pulse">
               <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center">
                  <Bot size={18} />
                </div>
                <div className="bg-space-800 p-4 rounded-2xl rounded-bl-none border border-space-700 flex items-center gap-2">
                  <span className="text-xs text-gray-400">Analyzing trajectory...</span>
                </div>
            </div>
          )}
        </div>

        {/* Input Area */}
        <div className="p-4 bg-space-900 border-t border-space-800 z-10">
          <div className="max-w-4xl mx-auto">
            
            {/* Suggestions / Quick Actions */}
            <div className="flex gap-2 overflow-x-auto pb-3 mb-1 scrollbar-hide mask-linear-fade">
               {/* Follow Up Questions */}
               {conundrum.followUpQuestions.map((q, i) => (
                   <button 
                      key={`fq-${i}`}
                      onClick={() => handleQuickInsert(q)}
                      className="flex items-center gap-2 whitespace-nowrap text-xs px-3 py-1.5 rounded-full bg-space-800 border border-space-700 text-cyan-300 hover:bg-cyan-900/30 hover:border-cyan-500 transition-colors"
                      title="Insert question"
                   >
                      <MessageCircle size={12} className="text-cyan-500" />
                      {q}
                   </button>
               ))}

               {/* Decision Challenges */}
               {conundrum.decisionChallenges.map((q, i) => (
                   <button 
                      key={`dc-${i}`}
                      onClick={() => handleQuickInsert(q)}
                      className="flex items-center gap-2 whitespace-nowrap text-xs px-3 py-1.5 rounded-full bg-space-800 border border-space-700 text-red-300 hover:bg-red-900/30 hover:border-red-500 transition-colors"
                      title="Insert challenge"
                   >
                      <Gavel size={12} className="text-red-500" />
                      {q}
                   </button>
               ))}
            </div>

            <div className="relative flex gap-2">
               <button 
                onClick={handleViewLog}
                className="p-3 bg-space-700 hover:bg-space-600 text-gray-300 hover:text-white rounded-xl border border-space-600 transition-colors"
                title="View Mission Log"
              >
                <ClipboardList size={20} />
              </button>

              <div className="relative flex-1">
                <input
                  ref={inputRef}
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && sendMessage(input)}
                  placeholder="Discuss investigation..."
                  className="w-full bg-space-800 text-white placeholder-gray-500 rounded-xl pl-4 pr-12 py-4 border border-space-700 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 outline-none transition-all"
                />
                <button 
                  onClick={() => sendMessage(input)}
                  disabled={!input.trim() || isLoading}
                  className="absolute right-2 top-2 p-2 bg-cyan-600 hover:bg-cyan-500 rounded-lg text-white disabled:opacity-50 transition-colors"
                >
                  <Send size={20} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Sidebar - Task & Decision Dashboard */}
      <div className={`
        fixed md:relative inset-y-0 right-0 w-80 lg:w-96 bg-space-900 border-l border-space-700 transform transition-transform duration-300 z-20 flex flex-col
        ${isSidebarOpen ? 'translate-x-0' : 'translate-x-full md:translate-x-0'}
      `}>
        
        {/* Sidebar Tabs */}
        <div className="flex border-b border-space-700 bg-space-900">
            <button 
                onClick={() => setActiveTab('log')}
                className={`flex-1 py-3 text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 border-b-2 transition-colors ${activeTab === 'log' ? 'border-cyan-500 text-cyan-400 bg-space-800/50' : 'border-transparent text-gray-500 hover:text-gray-300'}`}
            >
                <ClipboardList size={14} /> Mission Log
            </button>
            <button 
                onClick={() => setActiveTab('knowledge')}
                className={`flex-1 py-3 text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 border-b-2 transition-colors ${activeTab === 'knowledge' ? 'border-indigo-500 text-indigo-400 bg-space-800/50' : 'border-transparent text-gray-500 hover:text-gray-300'}`}
            >
                <BookOpen size={14} /> Knowledge Base
            </button>
            <button onClick={() => setIsSidebarOpen(false)} className="md:hidden px-3 text-gray-400 hover:text-white border-l border-space-700">
               <X size={18} />
            </button>
        </div>

        {/* Sidebar Content */}
        <div className="flex-1 overflow-y-auto p-4 scrollbar-thin space-y-6">
            
            {/* --- LOG TAB --- */}
            {activeTab === 'log' && (
                <>
                    {/* 1. Active Challenges */}
                    <div>
                        <h4 className="text-xs text-gray-500 uppercase font-bold mb-3 flex items-center gap-2">
                        <Target size={12} /> Pending Challenges
                        </h4>
                        <div className="space-y-2">
                            {conundrum.decisionChallenges.map((challenge, idx) => {
                                const isResolved = microDecisions.some(d => d.question === challenge);
                                if (isResolved) return null;
                                return (
                                    <div 
                                        key={idx}
                                        onClick={() => handleSelectChallenge(challenge)}
                                        className={`
                                        p-3 rounded-lg border text-sm cursor-pointer transition-all 
                                        hover:border-cyan-500 hover:bg-space-800 
                                        ${selectedChallenge === challenge 
                                            ? 'border-cyan-500 bg-cyan-900/20 ring-1 ring-cyan-500' 
                                            : 'border-space-700 bg-space-800/30 text-gray-300'}
                                        `}
                                    >
                                        <p className="mb-2 leading-snug">{challenge}</p>
                                        <div className="flex items-center text-xs text-cyan-400 font-bold">
                                            Log Decision <ArrowRight size={12} className="ml-1"/>
                                        </div>
                                    </div>
                                );
                            })}
                            {conundrum.decisionChallenges.every(c => microDecisions.some(d => d.question === c)) && (
                                <div className="text-xs text-green-500 flex items-center gap-2 bg-green-900/20 p-3 rounded border border-green-900">
                                    <CheckCircle size={14} /> All core challenges resolved!
                                </div>
                            )}
                            
                            <button 
                            onClick={() => {
                                setSelectedChallenge(null);
                                setShowDecisionForm(true);
                            }}
                            className="w-full py-2 border border-dashed border-space-600 rounded text-xs text-gray-500 hover:text-white hover:border-gray-400 mt-2"
                            >
                            + Log Custom Decision
                            </button>
                        </div>
                    </div>

                    {/* 2. Decision Form */}
                    <div className={`
                        bg-space-800 rounded-xl border border-space-700 overflow-hidden transition-all duration-500 ease-in-out
                        ${showDecisionForm ? 'max-h-[600px] opacity-100 mb-4' : 'max-h-0 opacity-0'}
                    `}>
                        <div className="p-3 bg-space-800 border-b border-space-700 flex justify-between items-center">
                            <span className="text-xs font-bold text-cyan-400 uppercase flex items-center gap-2">
                            <Gavel size={14} /> New Entry
                            </span>
                            <button 
                            onClick={() => setShowDecisionForm(false)} 
                            className="text-xs text-gray-500 hover:text-white"
                            >
                            Cancel
                            </button>
                        </div>
                        
                        <div className="p-4 space-y-4">
                            <div className="bg-space-900/50 p-3 rounded border border-space-700">
                                <label className="block text-[10px] text-indigo-400 uppercase font-bold mb-1">
                                Challenge Context
                                </label>
                                <p className="text-sm text-white font-medium leading-relaxed">
                                {selectedChallenge || "Custom Decision"}
                                </p>
                            </div>

                            <div>
                                <label className="block text-[10px] text-gray-500 uppercase mb-1">
                                My Decision
                                </label>
                                <input 
                                    className="w-full bg-space-900 border border-space-600 rounded-lg p-2.5 text-sm text-white focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 outline-none placeholder-gray-600"
                                    placeholder="e.g. Construct underground habitat..."
                                    value={decisionInput.decision}
                                    onChange={(e) => setDecisionInput({...decisionInput, decision: e.target.value})}
                                />
                            </div>

                            <div>
                                <label className="block text-[10px] text-gray-500 uppercase mb-1">
                                Reasoning
                                </label>
                                <textarea 
                                    className="w-full bg-space-900 border border-space-600 rounded-lg p-2.5 text-sm text-white h-24 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 outline-none resize-none placeholder-gray-600"
                                    placeholder="Why is this the best option? What are the trade-offs?"
                                    value={decisionInput.reasoning}
                                    onChange={(e) => setDecisionInput({...decisionInput, reasoning: e.target.value})}
                                />
                            </div>
                            
                            <Button size="sm" onClick={handleLogDecision} className="w-full">
                                <CheckCircle size={16} className="mr-2" /> Commit Decision
                            </Button>
                        </div>
                    </div>

                    {/* 3. Logged Decisions List */}
                    <div ref={logSectionRef}>
                        <h4 className="text-xs text-gray-500 uppercase font-bold mb-3 flex items-center gap-2 pt-2 border-t border-space-800">
                        <ClipboardList size={12} /> Logged Decisions
                        </h4>
                        <div className="space-y-3">
                            {microDecisions.map((d) => (
                                <div key={d.id} className="bg-space-800/50 border border-space-700 p-3 rounded-lg">
                                    <div className="flex items-center gap-2 mb-2">
                                        <div className="w-1.5 h-1.5 rounded-full bg-cyan-500 shadow-[0_0_8px_rgba(6,182,212,0.6)]"></div>
                                        <p className="text-xs text-gray-400 font-medium uppercase tracking-wide truncate">{d.question}</p>
                                    </div>
                                    <div className="pl-3 border-l border-space-600 ml-0.5 space-y-2">
                                        <div>
                                            <p className="text-[10px] text-gray-500 uppercase">Choice</p>
                                            <p className="font-bold text-white text-sm leading-tight">{d.decision}</p>
                                        </div>
                                        <div>
                                            <p className="text-[10px] text-gray-500 uppercase">Reasoning</p>
                                            <p className="text-xs text-gray-300 leading-relaxed">{d.reasoning}</p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                            {microDecisions.length === 0 && (
                                <div className="text-center py-6 border border-dashed border-space-700 rounded-lg">
                                    <p className="text-xs text-gray-500 italic">
                                        No decisions logged yet. <br/> Select a challenge above to begin.
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                </>
            )}

            {/* --- KNOWLEDGE TAB --- */}
            {activeTab === 'knowledge' && (
                <div className="animate-fade-in">
                    <div className="mb-4 p-3 bg-indigo-900/20 border border-indigo-500/30 rounded-lg">
                        <p className="text-xs text-indigo-300 leading-relaxed">
                            <Lightbulb size={14} className="inline mr-1 mb-0.5" />
                            Master these core concepts to solve the current mission effectively.
                        </p>
                    </div>
                    
                    <div className="space-y-4">
                        {conundrum.coreConcepts && conundrum.coreConcepts.length > 0 ? (
                            conundrum.coreConcepts.map((concept, idx) => (
                                <div key={idx} className="group bg-space-800 border border-space-700 p-4 rounded-lg hover:border-indigo-500 transition-colors">
                                    <div className="flex items-center justify-between mb-2">
                                        <h4 className="text-sm font-bold text-white group-hover:text-indigo-400 transition-colors">
                                            {concept.term}
                                        </h4>
                                        <BookOpen size={14} className="text-gray-600 group-hover:text-indigo-500" />
                                    </div>
                                    <p className="text-xs text-gray-400 leading-relaxed">
                                        {concept.definition}
                                    </p>
                                </div>
                            ))
                        ) : (
                            <div className="text-center py-10 opacity-50">
                                <BookOpen size={32} className="mx-auto mb-2 text-gray-600" />
                                <p className="text-xs text-gray-500">No specific concepts loaded.</p>
                            </div>
                        )}
                    </div>
                </div>
            )}

        </div>
      </div>

    </div>
  );
};

const CompassIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-cyan-400">
    <circle cx="12" cy="12" r="10"></circle>
    <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"></polygon>
  </svg>
);