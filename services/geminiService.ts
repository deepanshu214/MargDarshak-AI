
import { GoogleGenAI, Type } from "@google/genai";
import { UserProfile, ResumeData } from "../types";

export const getGeminiResponse = async (
  message: string, 
  history: { role: 'user' | 'model'; parts: { text: string }[] }[],
  userProfile?: UserProfile
) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const preferredLanguage = userProfile?.language || 'en';
  const languageNames: Record<string, string> = {
    'en': 'English', 'hi': 'Hindi', 'bn': 'Bengali', 'ta': 'Tamil', 
    'te': 'Telugu', 'kn': 'Kannada', 'ml': 'Malayalam', 'mr': 'Marathi', 'ur': 'Urdu'
  };

  const systemInstruction = `
    You are 'MargDarshak AI', a career and scholarship mentor for Indian students, especially those from government schools and low-income families.
    
    User Database Context:
    - Name: ${userProfile?.name}
    - Locality: ${userProfile?.locality || 'Not specified'}
    - Caste/Category: ${userProfile?.caste || 'General'}
    - Family Income: ${userProfile?.income || 'Not specified'}
    - Interest: ${userProfile?.interest || 'General Education'}
    - Education Level: ${userProfile?.educationLevel || 'Not set'}
    
    GUIDELINES:
    1. STRICTLY RESPOND in ${languageNames[preferredLanguage] || 'English'}.
    2. Suggest paths based on their specific income group and caste for scholarship eligibility.
    3. Link advice to official Indian government schemes (NSP, State Scholarships) and accessible private CSR initiatives (Tata, Reliance, HDFC).
    4. Provide encouragement and actionable steps for students from weaker economic backgrounds.
    5. Prioritize schemes that have online application portals and are currently active or widely known for reliability.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: [
        ...history,
        { role: 'user', parts: [{ text: message }] }
      ],
      config: {
        systemInstruction,
        tools: [{ googleSearch: {} }]
      }
    });

    const text = response.text || "I'm sorry, I couldn't process that.";
    const sources = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];

    return { text, sources };
  } catch (error) {
    console.error("Gemini API Error:", error);
    return { text: "Connection error. Please check your internet.", sources: [] };
  }
};

export const getSmartRecommendations = async (user: UserProfile) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const lang = user.language || 'en';
  
  const prompt = `
    Based on this Indian student's profile, suggest 5 to 6 specific career actions or scholarship schemes:
    Locality: ${user.locality}
    Caste: ${user.caste}
    Income: ${user.income}
    Interests: ${user.interest}
    Education: ${user.educationLevel}
    
    CRITICAL: 
    - At least 3 items must be actionable scholarship schemes (either Govt or Private CSR).
    - At least 2 items must be career guidance/next steps based on their education level.
    - Ensure all suggestions are "easily accessible" for underprivileged students in India.
    
    Return a JSON array of objects with 'title', 'description', and 'type' (career/scheme).
    The text MUST be in the language code: ${lang}.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              description: { type: Type.STRING },
              type: { type: Type.STRING }
            },
            required: ['title', 'description', 'type']
          }
        }
      }
    });
    return JSON.parse(response.text || "[]");
  } catch (e) {
    return [];
  }
};

export const getDetailedAnalysis = async (field: string, accuracy: number, breakdown: any, lang: string = 'en') => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const prompt = `
    Analyze test results for field: ${field}. 
    Accuracy: ${accuracy}%. 
    Breakdown: Subject Score ${breakdown.subjectCorrect}/${breakdown.subjectTotal}, Logical Score ${breakdown.logicalCorrect}/${breakdown.logicalTotal}.
    
    Provide a detailed analysis in language ${lang}.
    Return JSON object with:
    - strengths: Array of 2-3 points
    - weaknesses: Array of 2-3 points
    - careerFit: A 2-sentence explanation of suitability for this career
    - actionPlan: A concrete next step for improvement
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            strengths: { type: Type.ARRAY, items: { type: Type.STRING } },
            weaknesses: { type: Type.ARRAY, items: { type: Type.STRING } },
            careerFit: { type: Type.STRING },
            actionPlan: { type: Type.STRING }
          },
          required: ['strengths', 'weaknesses', 'careerFit', 'actionPlan']
        }
      }
    });
    return JSON.parse(response.text || "{}");
  } catch (e) {
    return { strengths: ["Good attempt"], weaknesses: ["Needs more practice"], careerFit: "Potentially suitable.", actionPlan: "Keep practicing." };
  }
};

export const getImprovementResources = async (field: string, accuracy: number, lang: string = 'en') => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const prompt = `
    User scored ${accuracy}% in a ${field} assessment. 
    Suggest 4 high-quality learning resources (YouTube channels, websites like Khan Academy/NPTEL, or specific books) to improve in ${field}.
    Include a short reason for each.
    Return JSON array of { name, description, link, type }.
    The text MUST be in language code: ${lang}.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              name: { type: Type.STRING },
              description: { type: Type.STRING },
              link: { type: Type.STRING },
              type: { type: Type.STRING }
            },
            required: ['name', 'description', 'type']
          }
        }
      }
    });
    return JSON.parse(response.text || "[]");
  } catch (e) {
    return [];
  }
};

export const generateAiResume = async (user: UserProfile): Promise<ResumeData | null> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const prompt = `Generate a resume for ${user.name} specializing in ${user.fieldOfStudy}. Lang: ${user.language}. JSON only.`;
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            summary: { type: Type.STRING },
            skills: { type: Type.ARRAY, items: { type: Type.STRING } },
            achievements: { type: Type.ARRAY, items: { type: Type.STRING } },
            education: {
              type: Type.OBJECT,
              properties: {
                institution: { type: Type.STRING },
                level: { type: Type.STRING },
                field: { type: Type.STRING }
              }
            },
            suggestedRoles: { type: Type.ARRAY, items: { type: Type.STRING } }
          }
        }
      }
    });
    return JSON.parse(response.text || '{}') as ResumeData;
  } catch (e) {
    return null;
  }
};
