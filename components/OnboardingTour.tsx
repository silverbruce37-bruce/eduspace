import React, { useState } from 'react';
import { Button } from './ui/Button';
import { Rocket, Compass, FileText, Tv, X, BookOpen } from 'lucide-react';

export const OnboardingTour: React.FC<{ onComplete: () => void }> = ({ onComplete }) => {
  const [step, setStep] = useState(0);

  const steps = [
    {
      title: "Welcome to ICAN EduSpace",
      description: "Your journey to expanding cosmic thinking starts here. This platform is designed to guide you through complex problem-solving in space contexts.",
      icon: <Rocket size={64} className="text-cyan-400" />
    },
    {
      title: "1. Mission Control",
      description: "Start by selecting your rank (Difficulty Level). Generate unique 'Conundrums' - complex space missions that require critical thinking to solve.",
      icon: <Rocket size={64} className="text-indigo-400" />
    },
    {
      title: "2. Orienteering & Knowledge",
      description: "Engage with the AI Commander. Use the Knowledge Base to learn core concepts, then chat to explore solutions and log your critical 'Micro-Decisions'.",
      icon: <Compass size={64} className="text-blue-400" />
    },
    {
      title: "3. Thesis Builder",
      description: "Synthesize your journey. The AI will help you draft a structured solution paper based on the decisions and discoveries you made during Orienteering.",
      icon: <FileText size={64} className="text-purple-400" />
    },
    {
      title: "4. TED Launchpad",
      description: "Share your vision. Convert your thesis into a compelling, auto-generated presentation and practice delivering your solution to the galaxy.",
      icon: <Tv size={64} className="text-red-400" />
    }
  ];

  const handleNext = () => {
    if (step < steps.length - 1) {
      setStep(step + 1);
    } else {
      onComplete();
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-sm animate-fade-in p-4">
      <div className="bg-space-800 border border-space-700 p-8 rounded-3xl max-w-md w-full shadow-[0_0_50px_rgba(6,182,212,0.15)] relative">
        <button 
          onClick={onComplete} 
          className="absolute top-4 right-4 text-gray-500 hover:text-white transition-colors"
          title="Skip Tour"
        >
          <X size={24} />
        </button>
        
        <div className="flex flex-col items-center text-center space-y-8 py-4">
          <div className="p-8 bg-space-900 rounded-full border border-space-600 shadow-inner relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-tr from-cyan-500/10 to-purple-500/10"></div>
            {steps[step].icon}
          </div>
          
          <div className="space-y-3">
            <h2 className="text-2xl font-bold text-white">{steps[step].title}</h2>
            <p className="text-gray-400 leading-relaxed text-sm">{steps[step].description}</p>
          </div>

          {/* Progress Indicators */}
          <div className="flex items-center gap-2">
            {steps.map((_, idx) => (
              <div 
                key={idx} 
                className={`h-1.5 rounded-full transition-all duration-300 ${idx === step ? 'bg-cyan-500 w-8' : 'bg-space-600 w-2'}`} 
              />
            ))}
          </div>

          <div className="flex w-full gap-3 pt-2">
            {step > 0 && (
                <Button variant="ghost" onClick={() => setStep(step - 1)} className="flex-1 border border-space-700">
                    Back
                </Button>
            )}
            <Button onClick={handleNext} className="flex-1" variant={step === steps.length - 1 ? "primary" : "secondary"}>
              {step === steps.length - 1 ? "Launch System" : "Next Step"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
