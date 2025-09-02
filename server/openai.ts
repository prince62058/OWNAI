import OpenAI from "openai";

// the newest OpenAI model is "gpt-5" which was released August 7, 2025. do not change this unless explicitly requested by the user
const openai = process.env.OPENAI_API_KEY || process.env.OPENAI_KEY || process.env.API_KEY 
  ? new OpenAI({ 
      apiKey: process.env.OPENAI_API_KEY || process.env.OPENAI_KEY || process.env.API_KEY 
    })
  : null;

interface AISearchResponse {
  content: string;
  sources: Array<{
    title: string;
    url: string;
    snippet: string;
  }>;
}

export async function generateAIResponse(query: string, category?: string): Promise<AISearchResponse> {
  if (!openai) {
    return {
      content: "AI search is currently unavailable. Please configure an OpenAI API key to enable AI-powered responses.",
      sources: []
    };
  }

  try {
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

    const response = await openai.chat.completions.create({
      model: "gpt-5",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: query }
      ],
      response_format: { type: "json_object" },
      temperature: 0.7,
      max_tokens: 2000,
    });

    const result = JSON.parse(response.choices[0].message.content || '{}');
    
    return {
      content: result.content || "I'm sorry, I couldn't generate a response to your query.",
      sources: result.sources || []
    };
  } catch (error) {
    console.error("OpenAI API error:", error);
    
    // Fallback response
    return {
      content: "I'm experiencing technical difficulties right now. Please try your search again in a moment.",
      sources: []
    };
  }
}

export async function generateSearchSuggestions(query: string): Promise<string[]> {
  if (!openai) {
    // Simple fallback suggestions when OpenAI is not available
    const fallbackSuggestions = [
      `What is ${query}?`,
      `How does ${query} work?`,
      `Latest news about ${query}`,
      `${query} explained`,
      `Best practices for ${query}`
    ];
    
    return fallbackSuggestions.slice(0, 3);
  }

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-5",
      messages: [
        {
          role: "system",
          content: `Generate 3-5 search suggestions based on the user's partial query. 
          The suggestions should be:
          1. Related to the user's input
          2. Complete, searchable questions or topics
          3. Diverse and covering different angles
          4. Formatted as a JSON array of strings
          
          Example format: ["suggestion 1", "suggestion 2", "suggestion 3"]`
        },
        {
          role: "user",
          content: `Partial query: "${query}"`
        }
      ],
      response_format: { type: "json_object" },
      temperature: 0.8,
      max_tokens: 200,
    });

    const result = JSON.parse(response.choices[0].message.content || '{}');
    return Array.isArray(result.suggestions) ? result.suggestions : [];
  } catch (error) {
    console.error("Search suggestions error:", error);
    
    // Simple fallback suggestions
    const fallbackSuggestions = [
      `What is ${query}?`,
      `How does ${query} work?`,
      `Latest news about ${query}`,
      `${query} explained`,
      `Best practices for ${query}`
    ];
    
    return fallbackSuggestions.slice(0, 3);
  }
}

export async function categorizeQuery(query: string): Promise<string | null> {
  if (!openai) {
    return null;
  }

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-5",
      messages: [
        {
          role: "system",
          content: `Categorize the following query into one of these categories:
          - Finance
          - Travel
          - Shopping
          - Academic
          - Technology
          - Health
          - null (if it doesn't fit any category)
          
          Respond with JSON format: {"category": "category_name"}`
        },
        {
          role: "user",
          content: query
        }
      ],
      response_format: { type: "json_object" },
      temperature: 0.3,
      max_tokens: 50,
    });

    const result = JSON.parse(response.choices[0].message.content || '{}');
    return result.category || null;
  } catch (error) {
    console.error("Query categorization error:", error);
    return null;
  }
}
