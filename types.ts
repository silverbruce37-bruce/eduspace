export enum AppStage {
  MISSION_CONTROL = 'MISSION_CONTROL', // Select/Generate Conundrum
  KNOWLEDGE_BASE = 'KNOWLEDGE_BASE', // New: Core Concepts Learning
  ORIENTEERING = 'ORIENTEERING', // AI Chat & Research
  THESIS = 'THESIS', // Writing the solution paper
  LAUNCHPAD = 'LAUNCHPAD' // Presentation mode
}

export enum GradeLevel {
  ELEMENTARY_LOWER = 'Elementary (Lower)', // Grades 1-3
  ELEMENTARY_UPPER = 'Elementary (Upper)', // Grades 4-6
  MIDDLE_SCHOOL = 'Middle School', // Grades 7-9
  HIGH_SCHOOL = 'High School' // Grades 10-12
}

export interface CoreConcept {
  term: string;
  definition: string;
}

export interface Conundrum {
  id: string;
  title: string;
  description: string; // The main "Orienteering Question"
  learningObjective: string;
  difficulty: string;
  tags: string[]; // Hashtags
  
  // Structured Lesson Plan Data
  warmUpQuestion: string;
  followUpQuestions: string[];
  decisionChallenges: string[]; // Specific "Choice" questions
  possibleSolutions: string[]; // AI suggested solutions for reference
  coreConcepts: CoreConcept[]; // Background knowledge required
}

export interface GroundingLink {
  title: string;
  uri: string;
  type: 'map' | 'web';
}

export interface Message {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: number;
  groundingLinks?: GroundingLink[];
  images?: string[]; // Array of Base64 image strings for the "Idea Train"
}

export interface MicroDecision {
  id: string;
  question: string; // What was the issue?
  decision: string; // What did we choose?
  reasoning: string; // Why?
}

export interface ThesisData {
  title: string;
  abstract: string; // Context/Warm-up summary
  problemAnalysis: string; // Deep dive into challenges
  alternatives: string; // "Possible Solutions" list
  proposedSolution: string; // "Best Solution"
  conclusion: string; // "Why is this the best?" justification
}

export interface PresentationSlide {
  id: string;
  title: string;
  points: string[];
}

export interface EduSpaceState {
  stage: AppStage;
  gradeLevel: GradeLevel;
  currentConundrum: Conundrum | null;
  chatHistory: Message[];
  microDecisions: MicroDecision[]; // Track the small steps
  thesis: ThesisData;
  slides: PresentationSlide[];
}