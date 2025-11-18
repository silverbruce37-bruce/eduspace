import { GoogleGenAI, Chat } from "@google/genai";
import { Conundrum, Message, GradeLevel, MicroDecision } from "../types";

const apiKey = process.env.API_KEY || ''; 
const ai = new GoogleGenAI({ apiKey });

// System instruction helper based on grade level AND the specific conundrum content
const getSystemInstruction = (level: GradeLevel, conundrum?: Conundrum): string => {
  const base = `You are "Commander Gemini," a Socratic AI mentor for ICAN Academy's "Space Thinking Expansion" program. 
  Your goal is to guide the student through a specific problem-solving process to develop cosmic thinking.
  DO NOT give long lectures. Ask one question at a time.
  
  Current Mission: "${conundrum?.title}"
  Main Question: "${conundrum?.description}"
  
  Core Concepts available to student:
  ${conundrum?.coreConcepts ? conundrum.coreConcepts.map(c => `- ${c.term}: ${c.definition}`).join('\n') : 'None loaded.'}

  PROTOCOL:
  1. Start by asking the "Warm-up Question": "${conundrum?.warmUpQuestion}"
  2. Wait for the student's answer. Discuss it briefly.
  3. Move to the "Follow-up Questions". Ask them ONE by one. 
     - Q1: ${conundrum?.followUpQuestions[0]}
     - Q2: ${conundrum?.followUpQuestions[1]}
     - Q3: ${conundrum?.followUpQuestions[2]}
  4. Once the context is understood, present the "Decision Challenges" (Micro-decisions) one by one.
     - These are the "Small Decisions" the student must make to build their final solution.
     - Challenge 1: ${conundrum?.decisionChallenges[0]}
     - Challenge 2: ${conundrum?.decisionChallenges[1]}
     - Challenge 3: ${conundrum?.decisionChallenges[2]}
  5. Finally, help them synthesize their "Best Solution".

  Tone for ${level}:
  ${level === GradeLevel.ELEMENTARY_LOWER ? "Use simple words, emojis, and ask 'What if?' questions. (Difficulty: Easy)" : 
    level === GradeLevel.HIGH_SCHOOL ? "Demand scientific evidence, cost-benefit analysis, and ethical justification. (Difficulty: Expert)" : 
    "Encourage critical thinking and weigh pros/cons."}
  
  If the user asks about specific locations (e.g., "Where is the Kennedy Space Center?"), provide the answer and the tool will show the map.
  `;
  return base;
};

export const generateConundrum = async (level: GradeLevel): Promise<Conundrum> => {
  const difficultyMap: Record<GradeLevel, string> = {
    [GradeLevel.ELEMENTARY_LOWER]: "Easy",
    [GradeLevel.ELEMENTARY_UPPER]: "Medium",
    [GradeLevel.MIDDLE_SCHOOL]: "Hard",
    [GradeLevel.HIGH_SCHOOL]: "Expert"
  };
  const difficulty = difficultyMap[level];

  const levelContext = {
    [GradeLevel.ELEMENTARY_LOWER]: "Simple survival or moral choices (e.g., Saving a robot vs. saving food).",
    [GradeLevel.ELEMENTARY_UPPER]: "Resource management and basic science (e.g., Building a moon base).",
    [GradeLevel.MIDDLE_SCHOOL]: "Engineering trade-offs and environmental systems.",
    [GradeLevel.HIGH_SCHOOL]: "Complex socio-political and advanced technical dilemmas."
  };

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Generate a structured "Space Orienteering Lesson Plan".
      Difficulty Level: ${difficulty} (${level}).
      Context: ${levelContext[level]}.
      
      It MUST follow this exact structure (like a teacher's guide):
      1. Title & Main Orienteering Question (The big complex problem).
      2. Warm-up Question (An icebreaker scenario).
      3. Follow-up Questions (3 questions to deepen understanding of the environment/physics).
      4. Decision Challenges (3 distinct "Choice" questions the student must answer to solve the main problem).
      5. Possible Solutions (List of standard approaches).
      6. Core Concepts (3-4 key scientific terms or theories needed to solve this, with definitions).
      7. Hashtags.

      Return ONLY a JSON object with keys: 
      - title 
      - description (The Main Orienteering Question)
      - learningObjective
      - difficulty ('${difficulty}')
      - tags (array of strings including hashtags)
      - warmUpQuestion (string)
      - followUpQuestions (array of 3 strings)
      - decisionChallenges (array of 3 strings - these are the small decisions)
      - possibleSolutions (array of strings)
      - coreConcepts (array of objects with 'term' and 'definition')
      `,
      config: {
        responseMimeType: "application/json",
        temperature: 0.9,
      }
    });

    const text = response.text;
    if (!text) throw new Error("No text returned from Gemini");
    
    const data = JSON.parse(text);
    return {
      id: Date.now().toString(),
      ...data,
      difficulty: difficulty // Ensure difficulty is set correctly if AI misses it
    };
  } catch (error) {
    console.error("Error generating conundrum:", error);
    return {
      id: 'fallback',
      title: 'Lunar Base Survival',
      description: 'How can we establish a sustainable and safe human presence on the moon?',
      learningObjective: 'Resource Management and ISRU',
      difficulty: difficulty, // Use mapped difficulty
      tags: ['#MoonBase', '#Sustainability', '#ISRU'],
      warmUpQuestion: "Imagine you're planning a trip to a place with no atmosphere. What top 3 things do you pack?",
      followUpQuestions: [
        "How does lack of atmosphere affect safety?",
        "Where should we build: Surface or Underground?",
        "How do we get water without bringing it from Earth?"
      ],
      decisionChallenges: [
        "Choose a power source: Nuclear vs. Solar.",
        "Choose a location: Polar Ice Caps vs. Lava Tubes.",
        "Choose a food source: Hydroponics vs. Imported rations."
      ],
      possibleSolutions: [
        "In-Situ Resource Utilization (ISRU)",
        "Closed-Loop Life Support",
        "Robotic Pre-construction"
      ],
      coreConcepts: [
        { term: "ISRU", definition: "In-Situ Resource Utilization: The practice of collecting and using materials found on other worlds." },
        { term: "Closed-Loop System", definition: "A life support system that recycles air, water, and waste with zero loss." },
        { term: "Regolith", definition: "The layer of loose, heterogeneous superficial deposits covering solid rock on the Moon." }
      ]
    };
  }
};

export const createChatSession = (level: GradeLevel, conundrum: Conundrum): Chat => {
  return ai.chats.create({
    model: 'gemini-2.5-flash', // Use Flash Standard for Tool support (Maps)
    config: {
      systemInstruction: {
        parts: [{ text: getSystemInstruction(level, conundrum) }]
      },
      tools: [{ googleMaps: {} }], // Maps Grounding enabled
    }
  });
};

// Generate 3 images to form an "Idea Train"
export const generateIdeaImages = async (context: string): Promise<string[]> => {
  const images: string[] = [];
  const promptBase = `Sci-fi concept art sketch, colorful, imaginative, visualizing: ${context}.`;
  
  // We will generate 3 slightly different perspectives/ideas in parallel
  const variations = [
    "Wide angle, establishing shot, futuristic environment.",
    "Close up detail, technical schematic style, blueprint elements.",
    "Action shot, dynamic angle, problem solving in progress."
  ];

  const promises = variations.map(async (v) => {
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image', // Nano Banana
        contents: {
          parts: [{ text: promptBase + " " + v }],
        },
        config: {
          imageConfig: { 
            aspectRatio: "16:9", // Cinematic look for the 'train'
          }
        }
      });
      
      // Extract image
      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData) {
          return `data:image/png;base64,${part.inlineData.data}`;
        }
      }
    } catch (e) {
      console.error("Image gen failed", e);
      return null;
    }
    return null;
  });

  const results = await Promise.all(promises);
  results.forEach(res => {
    if (res) images.push(res);
  });

  return images;
};

export const generateThesisDraft = async (conundrum: Conundrum, chatHistory: Message[], decisions: MicroDecision[], level: GradeLevel) => {
  const historyText = chatHistory.map(m => `${m.role}: ${m.text}`).join('\n');
  const decisionsText = decisions.map(d => `Decision: ${d.decision} (Reason: ${d.reasoning})`).join('\n');
  
  const prompt = `
      Act as a research assistant. Based on the chat history and the "Micro-Decisions" the student made, draft a solution paper.
      
      Mission: "${conundrum.title}"
      Student Level: ${level}
      
      Chat History:
      ${historyText}

      Key Decisions Made by Student:
      ${decisionsText}

      Return JSON with:
      - title (A creative title for the solution)
      - abstract (Summary of the ${conundrum.warmUpQuestion} and context)
      - problemAnalysis (Analysis of ${conundrum.followUpQuestions})
      - alternatives (List the "Possible Solutions" that were considered but maybe not chosen)
      - proposedSolution (The "Best Solution" based on the student's specific decisions)
      - conclusion (Why is this the Best Solution? Justify using the decisions made)
    `;

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-lite', // Use Flash Lite for fast generation
    contents: prompt,
    config: {
      responseMimeType: "application/json"
    }
  });

  return JSON.parse(response.text || "{}");
};

export const generatePresentationPoints = async (thesisJson: any, level: GradeLevel) => {
  const prompt = `
    Convert the following project data into 4 presentation slides for a student in ${level}.
    The presentation should focus on the DECISION JOURNEY.
    
    Data: ${JSON.stringify(thesisJson)}

    Return a JSON object with a key "slides" which is an array of objects. 
    Each slide object must have: "title" (string) and "points" (array of strings, max 3 points per slide).
    Slide 1: The Challenge.
    Slide 2: The Options we weighed.
    Slide 3: The Decisions we made.
    Slide 4: The Final Solution.
  `;

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-lite', // Use Flash Lite for fast generation
    contents: prompt,
    config: {
      responseMimeType: "application/json"
    }
  });

  return JSON.parse(response.text || "{}");
};
