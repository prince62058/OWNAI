import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { generateAIResponse, generateSearchSuggestions } from "./openai";
import { insertSearchSchema } from "@shared/schema";

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

      // Generate AI response
      const aiResponse = await generateAIResponse(query, category);
      
      // Create search record
      const searchData = {
        userId: req.user?.claims?.sub || null,
        query,
        response: aiResponse.content,
        category: category || null,
        sources: aiResponse.sources,
      };

      const search = await storage.createSearch(searchData);

      // Add to user's search history if authenticated
      if (req.user?.claims?.sub) {
        await storage.addToSearchHistory(req.user.claims.sub, search.id);
      }

      res.json({
        searchId: search.id,
        query,
        response: aiResponse.content,
        sources: aiResponse.sources,
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
          icon: 'fas fa-chart-line',
          color: 'green',
          href: '/finance'
        },
        {
          id: 'travel',
          name: 'Travel',
          description: 'Discover destinations, plan trips, and travel tips',
          icon: 'fas fa-plane',
          color: 'blue',
          href: '/travel'
        },
        {
          id: 'shopping',
          name: 'Shopping',
          description: 'Find products, compare prices, and shopping advice',
          icon: 'fas fa-shopping-bag',
          color: 'purple',
          href: '/shopping'
        },
        {
          id: 'academic',
          name: 'Academic',
          description: 'Research assistance and educational content',
          icon: 'fas fa-graduation-cap',
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

  const httpServer = createServer(app);
  return httpServer;
}
