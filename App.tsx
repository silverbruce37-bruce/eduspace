import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { MissionSelect } from './components/MissionSelect';
import { OrienteeringChat } from './components/OrienteeringChat';
import { ThesisEditor } from './components/ThesisEditor';
import { PresentationMode } from './components/PresentationMode';
import { KnowledgeBase } from './components/KnowledgeBase';
import { OnboardingTour } from './components/OnboardingTour';
import { AppStage, Conundrum, EduSpaceState, GradeLevel } from './types';

const App: React.FC = () => {
  // Initialize state with data from localStorage if available
  const [state, setState] = useState<EduSpaceState>(() => {
    let initialConundrum: Conundrum | null = null;
    let initialLevel = GradeLevel.ELEMENTARY_UPPER;

    if (typeof window !== 'undefined') {
      const savedConundrum = localStorage.getItem('eduSpace_currentConundrum');
      const savedLevel = localStorage.getItem('eduSpace_gradeLevel');

      if (savedConundrum) {
        try {
          initialConundrum = JSON.parse(savedConundrum);
        } catch (e) {
          console.error("Failed to load saved conundrum", e);
        }
      }

      if (savedLevel) {
        try {
          initialLevel = JSON.parse(savedLevel);
        } catch (e) {
          console.error("Failed to load saved level", e);
        }
      }
    }

    return {
      stage: AppStage.MISSION_CONTROL,
      gradeLevel: initialLevel,
      currentConundrum: initialConundrum,
      chatHistory: [],
      microDecisions: [],
      thesis: {
        title: '',
        abstract: '',
        problemAnalysis: '',
        alternatives: '',
        proposedSolution: '',
        conclusion: ''
      },
      slides: []
    };
  });

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [showTour, setShowTour] = useState(false);

  useEffect(() => {
    const tourCompleted = localStorage.getItem('eduSpace_tourCompleted');
    if (!tourCompleted) {
      setShowTour(true);
    }
  }, []);

  const handleTourComplete = () => {
    setShowTour(false);
    localStorage.setItem('eduSpace_tourCompleted', 'true');
  };

  const handleMissionSelect = (conundrum: Conundrum) => {
    // Save to localStorage
    localStorage.setItem('eduSpace_currentConundrum', JSON.stringify(conundrum));
    localStorage.setItem('eduSpace_gradeLevel', JSON.stringify(state.gradeLevel));

    setState(prev => ({
      ...prev,
      currentConundrum: conundrum,
      stage: AppStage.ORIENTEERING,
      chatHistory: [],
      microDecisions: [] // Reset decisions on new mission
    }));
  };

  const handleSetLevel = (level: GradeLevel) => {
    localStorage.setItem('eduSpace_gradeLevel', JSON.stringify(level));
    setState(prev => ({ ...prev, gradeLevel: level }));
  };

  const handleSetStage = (stage: AppStage) => {
    if (stage !== AppStage.MISSION_CONTROL && !state.currentConundrum) {
      alert("Please select a mission first!");
      return;
    }
    setState(prev => ({ ...prev, stage }));
  };

  return (
    <div className="flex min-h-screen bg-space-900 text-white font-sans overflow-hidden">
      
      {showTour && <OnboardingTour onComplete={handleTourComplete} />}

      {state.stage !== AppStage.LAUNCHPAD && (
        <Sidebar 
          currentStage={state.stage} 
          setStage={handleSetStage} 
          isOpen={isSidebarOpen}
          setIsOpen={setIsSidebarOpen}
        />
      )}

      <main className={`flex-1 transition-all duration-300 overflow-y-auto ${state.stage !== AppStage.LAUNCHPAD ? 'md:ml-64' : ''}`}>
        
        {state.stage === AppStage.MISSION_CONTROL && (
          <MissionSelect 
            onSelect={handleMissionSelect} 
            selectedId={state.currentConundrum?.id} 
            activeConundrum={state.currentConundrum}
            currentLevel={state.gradeLevel}
            setLevel={handleSetLevel}
          />
        )}

        {state.stage === AppStage.KNOWLEDGE_BASE && state.currentConundrum && (
          <KnowledgeBase conundrum={state.currentConundrum} />
        )}

        {state.stage === AppStage.ORIENTEERING && state.currentConundrum && (
          <OrienteeringChat 
            conundrum={state.currentConundrum}
            history={state.chatHistory}
            setHistory={(h) => setState(prev => ({ ...prev, chatHistory: h }))}
            level={state.gradeLevel}
            microDecisions={state.microDecisions}
            setMicroDecisions={(d) => setState(prev => ({ ...prev, microDecisions: d }))}
          />
        )}

        {state.stage === AppStage.THESIS && state.currentConundrum && (
          <ThesisEditor 
            conundrum={state.currentConundrum}
            history={state.chatHistory}
            microDecisions={state.microDecisions}
            thesis={state.thesis}
            setThesis={(t) => setState(prev => ({ ...prev, thesis: t }))}
            level={state.gradeLevel}
          />
        )}

        {state.stage === AppStage.LAUNCHPAD && (
          <PresentationMode thesis={state.thesis} level={state.gradeLevel} />
        )}

      </main>
    </div>
  );
};

export default App;
