import React, { useState, useEffect } from 'react';
import { ThesisData, PresentationSlide, GradeLevel } from '../types';
import { generatePresentationPoints } from '../services/geminiService';
import { Button } from './ui/Button';
import { Tv, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';

interface PresentationModeProps {
  thesis: ThesisData;
  level: GradeLevel;
}

export const PresentationMode: React.FC<PresentationModeProps> = ({ thesis, level }) => {
  const [slides, setSlides] = useState<PresentationSlide[]>([]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const generateSlides = async () => {
      if (!thesis.title) return;
      setLoading(true);
      try {
        // Fix: Pass level to generatePresentationPoints
        const data = await generatePresentationPoints(thesis, level);
        if (data.slides && Array.isArray(data.slides)) {
            // Add Title Slide manually
            const titleSlide: PresentationSlide = {
                id: 'title',
                title: thesis.title,
                points: ['ICAN Academy', 'EduSpace Project', 'Space Orienteering']
            };
            setSlides([titleSlide, ...data.slides]);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };

    if (slides.length === 0) {
      generateSlides();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const nextSlide = () => setCurrentSlide(p => Math.min(slides.length - 1, p + 1));
  const prevSlide = () => setCurrentSlide(p => Math.max(0, p - 1));

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-black text-white">
        <Loader2 className="w-12 h-12 animate-spin text-cyan-500 mb-4" />
        <h2 className="text-xl font-light tracking-widest uppercase">Preparing Launchpad...</h2>
      </div>
    );
  }

  if (slides.length === 0) {
    return (
      <div className="flex items-center justify-center h-screen text-gray-400">
        No thesis data available to generate presentation.
      </div>
    );
  }

  return (
    <div className="h-screen w-full bg-black relative flex flex-col items-center justify-center overflow-hidden font-sans">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1465101162946-4377e57745c3?q=80&w=2948&auto=format&fit=crop')] bg-cover bg-center opacity-30 blur-sm"></div>
      <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black"></div>

      {/* Logo */}
      <div className="absolute top-8 left-8 z-10">
        <h1 className="text-2xl font-bold text-red-600 tracking-tight">TED<span className="text-white font-light">x</span><span className="text-xs text-gray-300 block tracking-widest">ICAN ACADEMY</span></h1>
      </div>

      {/* Slide Content */}
      <div className="relative z-10 max-w-5xl w-full px-8 text-center">
        <div className="animate-fade-in-up">
          <h2 className="text-5xl md:text-7xl font-bold text-white mb-12 leading-tight drop-shadow-2xl">
            {slides[currentSlide].title}
          </h2>
          
          <div className="space-y-8">
            {slides[currentSlide].points.map((point, idx) => (
              <p key={idx} className="text-2xl md:text-3xl text-gray-200 font-light leading-relaxed border-l-4 border-red-600 pl-6 text-left bg-black/40 p-4 rounded-r-lg backdrop-blur-sm">
                {point}
              </p>
            ))}
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="absolute bottom-10 z-20 flex items-center gap-8">
        <Button onClick={prevSlide} disabled={currentSlide === 0} variant="ghost" className="text-white/50 hover:text-white">
          <ChevronLeft size={32} />
        </Button>
        
        <div className="flex gap-2">
          {slides.map((_, idx) => (
            <div 
              key={idx} 
              className={`h-1 w-8 rounded-full transition-all ${idx === currentSlide ? 'bg-red-600 w-12' : 'bg-gray-700'}`} 
            />
          ))}
        </div>

        <Button onClick={nextSlide} disabled={currentSlide === slides.length - 1} variant="ghost" className="text-white/50 hover:text-white">
          <ChevronRight size={32} />
        </Button>
      </div>
    </div>
  );
};