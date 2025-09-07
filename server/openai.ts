import { GoogleGenerativeAI } from "@google/generative-ai";

// Initialize Google Gemini AI
const geminiAPI = process.env.GOOGLE_API_KEY ? new GoogleGenerativeAI(process.env.GOOGLE_API_KEY) : null;
const gemini = geminiAPI ? geminiAPI.getGenerativeModel({ model: "gemini-1.5-flash" }) : null;

interface AISearchResponse {
  content: string;
  sources: Array<{
    title: string;
    url: string;
    snippet: string;
  }>;
}

export async function generateAIResponse(query: string, category?: string): Promise<AISearchResponse> {
  const systemPrompt = `You are an AI assistant that provides accurate, informative responses to user queries. 
    ${category ? `Focus your response on the ${category} category.` : ''}
    
    Provide a comprehensive answer and include relevant sources. Format your response as JSON with this structure:
    {
      "content": "Your detailed response here",
      "sources": [
        {
          "title": "Source title",
          "url": "https://example.com",
          "snippet": "Brief excerpt from the source"
        }
      ]
    }
    
    Make sure to:
    1. Provide accurate, factual information
    2. Include 3-5 relevant sources when possible
    3. Keep the response comprehensive but concise
    4. Use proper formatting and structure`;

  // Use Gemini AI
  if (gemini) {
    try {
      const result = await gemini.generateContent([
        systemPrompt,
        `User query: ${query}`
      ]);
      
      const response = await result.response;
      const text = response.text();
      
      try {
        // Clean the text by removing markdown code blocks
        const cleanText = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
        const parsed = JSON.parse(cleanText);
        return {
          content: parsed.content || "I'm sorry, I couldn't generate a response to your query.",
          sources: parsed.sources || []
        };
      } catch {
        // If JSON parsing fails, return the cleaned text as content
        const cleanContent = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
        return {
          content: cleanContent,
          sources: []
        };
      }
    } catch (error) {
      console.error("Gemini API error:", error);
      // Fall through to fallback
    }
  }

  // Enhanced fallback with useful content based on query
  return {
    content: "I'm sorry, I couldn't generate a response to your query at this time. Please try again later or rephrase your question.",
    sources: []
  };
}

export async function generateSearchSuggestions(query: string): Promise<string[]> {
  const systemPrompt = `Generate 3-5 search suggestions based on the user's partial query. 
  The suggestions should be:
  1. Related to the user's input
  2. Complete, searchable questions or topics
  3. Diverse and covering different angles
  
  Return only a JSON array of strings in this exact format: ["suggestion 1", "suggestion 2", "suggestion 3"]`;

  // Use Gemini AI
  if (gemini) {
    try {
      const result = await gemini.generateContent([
        systemPrompt,
        `Partial query: "${query}"`
      ]);
      
      const response = await result.response;
      const text = response.text();
      
      try {
        // Clean the text by removing markdown code blocks and extra formatting
        const cleanText = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
        const parsed = JSON.parse(cleanText);
        return Array.isArray(parsed) ? parsed : (parsed.suggestions || []);
      } catch {
        // If JSON parsing fails, extract suggestions manually
        const cleanText = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
        // Try to extract array-like content
        if (cleanText.includes('[') && cleanText.includes(']')) {
          try {
            const arrayMatch = cleanText.match(/\[.*\]/gs);
            if (arrayMatch) {
              const parsed = JSON.parse(arrayMatch[0]);
              return Array.isArray(parsed) ? parsed : [];
            }
          } catch {}
        }
        // Final fallback - split by lines
        const lines = cleanText.split('\n').filter(line => line.trim().length > 0);
        return lines.slice(0, 3);
      }
    } catch (error) {
      console.error("Gemini search suggestions error:", error);
      // Fall through to fallback
    }
  }

  // Final fallback suggestions
  const fallbackSuggestions = [
    `What is ${query}?`,
    `How does ${query} work?`,
    `Latest news about ${query}`,
    `${query} explained`,
    `Best practices for ${query}`
  ];
  
  return fallbackSuggestions.slice(0, 3);
}

export async function categorizeQuery(query: string): Promise<string | null> {
  const systemPrompt = `Categorize the following query into one of these categories:
  - Finance
  - Travel
  - Shopping
  - Academic
  - Technology
  - Health
  - null (if it doesn't fit any category)
  
  Respond with only the category name as a single word, or "null" if it doesn't fit any category.`;

  // Use Gemini AI
  if (gemini) {
    try {
      const result = await gemini.generateContent([
        systemPrompt,
        `Query to categorize: ${query}`
      ]);
      
      const response = await result.response;
      const text = response.text().trim().toLowerCase();
      
      // Check if the response matches our categories
      const validCategories = ['finance', 'travel', 'shopping', 'academic', 'technology', 'health'];
      if (validCategories.includes(text)) {
        return text.charAt(0).toUpperCase() + text.slice(1);
      }
      return null;
    } catch (error) {
      console.error("Gemini categorization error:", error);
      // Fall through to fallback
    }
  }

  return null;
}
