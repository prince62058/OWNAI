import {
  users,
  searches,
  trendingTopics,
  spaces,
  searchHistory,
  conversations,
  messages,
  type User,
  type UpsertUser,
  type InsertSearch,
  type Search,
  type InsertTrendingTopic,
  type TrendingTopic,
  type InsertSpace,
  type Space,
  type SearchHistory,
  type InsertConversation,
  type Conversation,
  type InsertMessage,
  type Message,
} from "@shared/schema";
import { randomUUID } from "crypto";

// Interface for storage operations
export interface IStorage {
  // User operations (mandatory for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  
  // Search operations
  createSearch(search: InsertSearch): Promise<Search>;
  getSearchById(id: string): Promise<Search | undefined>;
  getSearchesByUser(userId: string, limit?: number): Promise<Search[]>;
  getSearchHistory(userId: string, limit?: number): Promise<SearchHistory[]>;
  addToSearchHistory(userId: string, searchId: string): Promise<SearchHistory>;
  
  // Conversation operations
  createConversation(conversation: InsertConversation): Promise<Conversation>;
  getConversation(id: string): Promise<Conversation | undefined>;
  getConversationsByUser(userId: string, limit?: number): Promise<Conversation[]>;
  getRecentConversations(limit?: number): Promise<Conversation[]>;
  updateConversation(id: string, updates: Partial<Conversation>): Promise<Conversation>;
  deleteConversation(id: string): Promise<void>;
  searchConversations(query: string, limit?: number): Promise<Conversation[]>;
  
  // Message operations
  createMessage(message: InsertMessage): Promise<Message>;
  getMessagesByConversation(conversationId: string): Promise<Message[]>;
  deleteMessagesByConversation(conversationId: string): Promise<void>;
  
  // Trending topics operations
  getTrendingTopics(limit?: number): Promise<TrendingTopic[]>;
  createTrendingTopic(topic: InsertTrendingTopic): Promise<TrendingTopic>;
  incrementTopicViews(id: string): Promise<void>;
  
  // Spaces operations
  getSpaces(limit?: number): Promise<Space[]>;
  createSpace(space: InsertSpace): Promise<Space>;
  getSpacesByCategory(category: string): Promise<Space[]>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User> = new Map();
  private searches: Map<string, Search> = new Map();
  private trendingTopics: Map<string, TrendingTopic> = new Map();
  private spaces: Map<string, Space> = new Map();
  private searchHistoryRecords: Map<string, SearchHistory> = new Map();
  private conversations: Map<string, Conversation> = new Map();
  private messages: Map<string, Message> = new Map();

  constructor() {
    this.seedData();
  }

  private seedData() {
    // Seed trending topics
    const topics: InsertTrendingTopic[] = [
      {
        title: "Latest AI Breakthroughs in 2024",
        description: "Discover the most significant AI developments this year",
        category: "Technology",
        readTime: "2 min read",
        icon: "fas fa-fire",
        viewCount: 1250,
        isActive: true,
      },
      {
        title: "Sustainable Investment Strategies",
        description: "How to build an eco-friendly investment portfolio",
        category: "Finance",
        readTime: "4 min read",
        icon: "fas fa-leaf",
        viewCount: 890,
        isActive: true,
      },
      {
        title: "Hidden Gems in Southeast Asia",
        description: "Off-the-beaten-path destinations for adventurous travelers",
        category: "Travel",
        readTime: "6 min read",
        icon: "fas fa-map-marked-alt",
        viewCount: 567,
        isActive: true,
      },
      {
        title: "Quantum Computing Fundamentals",
        description: "Understanding the basics of quantum computation",
        category: "Academic",
        readTime: "8 min read",
        icon: "fas fa-graduation-cap",
        viewCount: 432,
        isActive: true,
      },
      {
        title: "Best Tech Deals This Week",
        description: "Top technology products with significant discounts",
        category: "Shopping",
        readTime: "3 min read",
        icon: "fas fa-shopping-cart",
        viewCount: 1120,
        isActive: true,
      },
      {
        title: "Mental Health in Remote Work",
        description: "Strategies for maintaining wellbeing while working from home",
        category: "Health",
        readTime: "5 min read",
        icon: "fas fa-heartbeat",
        viewCount: 678,
        isActive: true,
      },
    ];

    topics.forEach((topic) => {
      const id = randomUUID();
      this.trendingTopics.set(id, {
        ...topic,
        id,
        createdAt: new Date(),
      });
    });

    // Seed spaces
    const spacesData: InsertSpace[] = [
      {
        title: "Business Strategy",
        description: "Market analysis, competitive research, and business planning",
        category: "Business",
        templateCount: 12,
        icon: "fas fa-briefcase",
        gradient: "from-blue-500 to-purple-600",
        tags: ["SWOT Analysis", "Market Research"],
        isActive: true,
      },
      {
        title: "Developer Tools",
        description: "Code review, debugging, and technical documentation",
        category: "Technology",
        templateCount: 8,
        icon: "fas fa-code",
        gradient: "from-green-500 to-teal-600",
        tags: ["Code Review", "Documentation"],
        isActive: true,
      },
      {
        title: "Creative Writing",
        description: "Content creation, storytelling, and copywriting assistance",
        category: "Creative",
        templateCount: 15,
        icon: "fas fa-pen-fancy",
        gradient: "from-orange-500 to-red-600",
        tags: ["Blog Posts", "Marketing Copy"],
        isActive: true,
      },
    ];

    spacesData.forEach((space) => {
      const id = randomUUID();
      this.spaces.set(id, {
        ...space,
        id,
        createdAt: new Date(),
      });
    });
  }

  // User operations
  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const existingUser = Array.from(this.users.values()).find(u => u.id === userData.id);
    
    if (existingUser) {
      const updatedUser = {
        ...existingUser,
        ...userData,
        updatedAt: new Date(),
      };
      this.users.set(existingUser.id, updatedUser);
      return updatedUser;
    } else {
      const user: User = {
        ...userData,
        id: userData.id || randomUUID(),
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      this.users.set(user.id, user);
      return user;
    }
  }

  // Search operations
  async createSearch(searchData: InsertSearch): Promise<Search> {
    const id = randomUUID();
    const search: Search = {
      ...searchData,
      id,
      createdAt: new Date(),
    };
    this.searches.set(id, search);
    return search;
  }

  async getSearchById(id: string): Promise<Search | undefined> {
    return this.searches.get(id);
  }

  async getSearchesByUser(userId: string, limit = 50): Promise<Search[]> {
    return Array.from(this.searches.values())
      .filter(search => search.userId === userId)
      .sort((a, b) => (b.createdAt?.getTime() || 0) - (a.createdAt?.getTime() || 0))
      .slice(0, limit);
  }

  async getSearchHistory(userId: string, limit = 50): Promise<SearchHistory[]> {
    return Array.from(this.searchHistoryRecords.values())
      .filter(record => record.userId === userId)
      .sort((a, b) => (b.createdAt?.getTime() || 0) - (a.createdAt?.getTime() || 0))
      .slice(0, limit);
  }

  async addToSearchHistory(userId: string, searchId: string): Promise<SearchHistory> {
    const id = randomUUID();
    const record: SearchHistory = {
      id,
      userId,
      searchId,
      createdAt: new Date(),
    };
    this.searchHistoryRecords.set(id, record);
    return record;
  }

  // Trending topics operations
  async getTrendingTopics(limit = 10): Promise<TrendingTopic[]> {
    return Array.from(this.trendingTopics.values())
      .filter(topic => topic.isActive)
      .sort((a, b) => (b.viewCount || 0) - (a.viewCount || 0))
      .slice(0, limit);
  }

  async createTrendingTopic(topicData: InsertTrendingTopic): Promise<TrendingTopic> {
    const id = randomUUID();
    const topic: TrendingTopic = {
      ...topicData,
      id,
      createdAt: new Date(),
    };
    this.trendingTopics.set(id, topic);
    return topic;
  }

  async incrementTopicViews(id: string): Promise<void> {
    const topic = this.trendingTopics.get(id);
    if (topic) {
      topic.viewCount = (topic.viewCount || 0) + 1;
      this.trendingTopics.set(id, topic);
    }
  }

  // Spaces operations
  async getSpaces(limit = 10): Promise<Space[]> {
    return Array.from(this.spaces.values())
      .filter(space => space.isActive)
      .sort((a, b) => (a.createdAt?.getTime() || 0) - (b.createdAt?.getTime() || 0))
      .slice(0, limit);
  }

  async createSpace(spaceData: InsertSpace): Promise<Space> {
    const id = randomUUID();
    const space: Space = {
      ...spaceData,
      id,
      createdAt: new Date(),
    };
    this.spaces.set(id, space);
    return space;
  }

  async getSpacesByCategory(category: string): Promise<Space[]> {
    return Array.from(this.spaces.values())
      .filter(space => space.isActive && space.category === category);
  }

  // Conversation operations
  async createConversation(conversationData: InsertConversation): Promise<Conversation> {
    const id = randomUUID();
    const conversation: Conversation = {
      ...conversationData,
      id,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.conversations.set(id, conversation);
    return conversation;
  }

  async getConversation(id: string): Promise<Conversation | undefined> {
    return this.conversations.get(id);
  }

  async getConversationsByUser(userId: string, limit = 50): Promise<Conversation[]> {
    return Array.from(this.conversations.values())
      .filter(conv => conv.userId === userId)
      .sort((a, b) => (b.updatedAt?.getTime() || 0) - (a.updatedAt?.getTime() || 0))
      .slice(0, limit);
  }

  async updateConversation(id: string, updates: Partial<Conversation>): Promise<Conversation> {
    const conversation = this.conversations.get(id);
    if (!conversation) {
      throw new Error('Conversation not found');
    }
    const updated = {
      ...conversation,
      ...updates,
      updatedAt: new Date(),
    };
    this.conversations.set(id, updated);
    return updated;
  }

  async getRecentConversations(limit = 50): Promise<Conversation[]> {
    return Array.from(this.conversations.values())
      .sort((a, b) => (b.updatedAt?.getTime() || 0) - (a.updatedAt?.getTime() || 0))
      .slice(0, limit);
  }

  async deleteConversation(id: string): Promise<void> {
    this.conversations.delete(id);
  }

  async searchConversations(query: string, limit = 50): Promise<Conversation[]> {
    const lowerQuery = query.toLowerCase();
    return Array.from(this.conversations.values())
      .filter(conv => 
        conv.title?.toLowerCase().includes(lowerQuery) ||
        conv.summary?.toLowerCase().includes(lowerQuery)
      )
      .sort((a, b) => (b.updatedAt?.getTime() || 0) - (a.updatedAt?.getTime() || 0))
      .slice(0, limit);
  }

  // Message operations
  async createMessage(messageData: InsertMessage): Promise<Message> {
    const id = randomUUID();
    const message: Message = {
      ...messageData,
      id,
      createdAt: new Date(),
    };
    this.messages.set(id, message);
    return message;
  }

  async getMessagesByConversation(conversationId: string): Promise<Message[]> {
    return Array.from(this.messages.values())
      .filter(msg => msg.conversationId === conversationId)
      .sort((a, b) => (a.createdAt?.getTime() || 0) - (b.createdAt?.getTime() || 0));
  }

  async deleteMessagesByConversation(conversationId: string): Promise<void> {
    const messageIds = Array.from(this.messages.entries())
      .filter(([_, msg]) => msg.conversationId === conversationId)
      .map(([id, _]) => id);
    
    messageIds.forEach(id => this.messages.delete(id));
  }
}

export const storage = new MemStorage();
