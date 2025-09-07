import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { generateAIResponse, generateSearchSuggestions } from "./openai";
import { insertSearchSchema, insertConversationSchema, insertMessageSchema } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Search routes
  app.post('/api/search', async (req, res) => {
    try {
      const { query, category } = req.body;

      if (!query) {
        return res.status(400).json({ message: "Query is required" });
      }

      console.log(`Processing search query: "${query}" with category: ${category}`);

      const aiResponse = await generateAIResponse(query, category);
      console.log(`AI response generated:`, { 
        contentLength: aiResponse.content?.length || 0, 
        sourcesCount: aiResponse.sources?.length || 0 
      });

      // Ensure we have a valid response
      if (!aiResponse.content) {
        console.warn("No AI content generated, using fallback");
        aiResponse.content = `I apologize, but I wasn't able to generate a response for "${query}". This might be due to configuration issues with the AI services. Please check the server logs or try again later.`;
      }

      const search = await storage.createSearch({
        query,
        response: aiResponse.content,
        category: category || null,
        sources: aiResponse.sources,
        userId: req.user?.claims?.sub || null,
      });

      // Add to user's search history if authenticated
      if (req.user?.claims?.sub) {
        await storage.addToSearchHistory(req.user.claims.sub, search.id);
      }

      res.json({
        searchId: search.id,
        query,
        response: aiResponse.content,
        sources: aiResponse.sources || [],
        category: category || null,
      });
    } catch (error) {
      console.error("Search error:", error);
      res.status(500).json({ message: "Search failed" });
    }
  });

  app.get('/api/search/suggestions', async (req, res) => {
    try {
      const { q } = req.query;

      if (!q || typeof q !== 'string') {
        return res.json({ suggestions: [] });
      }

      const suggestions = await generateSearchSuggestions(q);
      res.json({ suggestions });
    } catch (error) {
      console.error("Suggestions error:", error);
      res.json({ suggestions: [] });
    }
  });

  app.get('/api/search/:id', async (req, res) => {
    try {
      const search = await storage.getSearchById(req.params.id);
      if (!search) {
        return res.status(404).json({ message: "Search not found" });
      }
      res.json(search);
    } catch (error) {
      console.error("Get search error:", error);
      res.status(500).json({ message: "Failed to get search" });
    }
  });

  // User search history
  app.get('/api/search/history', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const searches = await storage.getSearchesByUser(userId, 50);
      res.json(searches);
    } catch (error) {
      console.error("Get search history error:", error);
      res.status(500).json({ message: "Failed to get search history" });
    }
  });

  // Trending topics routes
  app.get('/api/trending', async (req, res) => {
    try {
      const topics = await storage.getTrendingTopics(10);
      res.json(topics);
    } catch (error) {
      console.error("Get trending topics error:", error);
      res.status(500).json({ message: "Failed to get trending topics" });
    }
  });

  app.post('/api/trending/:id/view', async (req, res) => {
    try {
      await storage.incrementTopicViews(req.params.id);
      res.json({ success: true });
    } catch (error) {
      console.error("Increment topic views error:", error);
      res.status(500).json({ message: "Failed to increment views" });
    }
  });

  // Spaces routes
  app.get('/api/spaces', async (req, res) => {
    try {
      const { category } = req.query;
      let spaces;

      if (category && typeof category === 'string') {
        spaces = await storage.getSpacesByCategory(category);
      } else {
        spaces = await storage.getSpaces(10);
      }

      res.json(spaces);
    } catch (error) {
      console.error("Get spaces error:", error);
      res.status(500).json({ message: "Failed to get spaces" });
    }
  });

  // Categories route
  app.get('/api/categories', async (req, res) => {
    try {
      const categories = [
        {
          id: 'finance',
          name: 'Finance',
          description: 'Get insights on markets, investments, and financial planning',
          icon: 'DollarSign',
          color: 'green',
          href: '/finance'
        },
        {
          id: 'travel',
          name: 'Travel',
          description: 'Discover destinations, plan trips, and travel tips',
          icon: 'Plane',
          color: 'blue',
          href: '/travel'
        },
        {
          id: 'shopping',
          name: 'Shopping',
          description: 'Find products, compare prices, and shopping advice',
          icon: 'ShoppingBag',
          color: 'purple',
          href: '/shopping'
        },
        {
          id: 'academic',
          name: 'Academic',
          description: 'Research assistance and educational content',
          icon: 'GraduationCap',
          color: 'orange',
          href: '/academic'
        }
      ];
      res.json(categories);
    } catch (error) {
      console.error("Get categories error:", error);
      res.status(500).json({ message: "Failed to get categories" });
    }
  });

  // Conversation routes
  app.post('/api/conversations', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const validation = insertConversationSchema.safeParse(req.body);
      
      if (!validation.success) {
        return res.status(400).json({ message: "Invalid conversation data", errors: validation.error.errors });
      }

      const conversation = await storage.createConversation({
        ...validation.data,
        userId,
      });

      res.json(conversation);
    } catch (error) {
      console.error("Create conversation error:", error);
      res.status(500).json({ message: "Failed to create conversation" });
    }
  });

  app.get('/api/conversations', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const conversations = await storage.getConversationsByUser(userId);
      res.json(conversations);
    } catch (error) {
      console.error("Get conversations error:", error);
      res.status(500).json({ message: "Failed to get conversations" });
    }
  });

  app.get('/api/conversations/:id', isAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      const conversation = await storage.getConversation(id);
      
      if (!conversation) {
        return res.status(404).json({ message: "Conversation not found" });
      }

      // Check if user owns this conversation
      if (conversation.userId !== req.user.claims.sub) {
        return res.status(403).json({ message: "Access denied" });
      }

      res.json(conversation);
    } catch (error) {
      console.error("Get conversation error:", error);
      res.status(500).json({ message: "Failed to get conversation" });
    }
  });

  // Message routes
  app.post('/api/conversations/:id/messages', isAuthenticated, async (req: any, res) => {
    try {
      const { id: conversationId } = req.params;
      const userId = req.user.claims.sub;

      // Verify conversation exists and user owns it
      const conversation = await storage.getConversation(conversationId);
      if (!conversation || conversation.userId !== userId) {
        return res.status(404).json({ message: "Conversation not found" });
      }

      const validation = insertMessageSchema.safeParse({
        ...req.body,
        conversationId,
      });

      if (!validation.success) {
        return res.status(400).json({ message: "Invalid message data", errors: validation.error.errors });
      }

      const message = await storage.createMessage(validation.data);

      // Update conversation timestamp
      await storage.updateConversation(conversationId, { updatedAt: new Date() });

      res.json(message);
    } catch (error) {
      console.error("Create message error:", error);
      res.status(500).json({ message: "Failed to create message" });
    }
  });

  app.get('/api/conversations/:id/messages', isAuthenticated, async (req: any, res) => {
    try {
      const { id: conversationId } = req.params;
      const userId = req.user.claims.sub;

      // Verify conversation exists and user owns it
      const conversation = await storage.getConversation(conversationId);
      if (!conversation || conversation.userId !== userId) {
        return res.status(404).json({ message: "Conversation not found" });
      }

      const messages = await storage.getMessagesByConversation(conversationId);
      res.json(messages);
    } catch (error) {
      console.error("Get messages error:", error);
      res.status(500).json({ message: "Failed to get messages" });
    }
  });

  // Chat endpoint with conversation support
  app.post('/api/chat', async (req, res) => {
    try {
      const { message, conversationId } = req.body;

      if (!message) {
        return res.status(400).json({ message: "Message is required" });
      }

      let convId = conversationId;
      
      // If authenticated and no conversation ID, create a new conversation
      if (req.user?.claims?.sub && !convId) {
        const conversation = await storage.createConversation({
          userId: req.user.claims.sub,
          title: message.length > 50 ? message.substring(0, 50) + "..." : message,
        });
        convId = conversation.id;
      }

      // Generate AI response
      const aiResponse = await generateAIResponse(message);
      
      if (!aiResponse.content) {
        aiResponse.content = `I apologize, but I wasn't able to generate a response for "${message}". Please try again.`;
      }

      // Save messages if we have a conversation
      if (convId) {
        // Save user message
        await storage.createMessage({
          conversationId: convId,
          role: "user",
          content: message,
        });

        // Save AI response
        await storage.createMessage({
          conversationId: convId,
          role: "assistant", 
          content: aiResponse.content,
          sources: aiResponse.sources,
        });

        // Update conversation timestamp
        await storage.updateConversation(convId, { updatedAt: new Date() });
      }

      res.json({
        conversationId: convId,
        response: aiResponse.content,
        sources: aiResponse.sources || [],
      });

    } catch (error) {
      console.error("Chat error:", error);
      res.status(500).json({ message: "Chat failed" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}