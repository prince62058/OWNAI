import mongoose from 'mongoose';

// Chat Thread Schema
const ChatThreadSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    maxLength: 100
  },
  messages: [{
    type: {
      type: String,
      enum: ['user', 'ai'],
      required: true
    },
    content: {
      type: String,
      required: true
    },
    timestamp: {
      type: Date,
      default: Date.now
    },
    sources: [{
      title: String,
      url: String,
      snippet: String
    }]
  }],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Auto-update updatedAt field
ChatThreadSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

export const ChatThread = mongoose.model('ChatThread', ChatThreadSchema);

// Connect to MongoDB
export async function connectMongoDB() {
  try {
    // Use environment variable with proper password substitution
    let mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/princetech-ai';
    
    // Replace <db_password> with actual password if present
    if (mongoUri.includes('<db_password>')) {
      mongoUri = mongoUri.replace('<db_password>', 'Prince123');
    }
    
    await mongoose.connect(mongoUri);
    
    console.log('✅ MongoDB connected successfully');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    // Continue without database for development
  }
}

// MongoDB Storage Implementation
export class MongoDBStorage {
  // Create new chat thread
  async createChatThread(title, firstMessage) {
    try {
      const thread = new ChatThread({
        title: title.substring(0, 50) + (title.length > 50 ? '...' : ''),
        messages: [firstMessage]
      });
      
      const savedThread = await thread.save();
      return savedThread;
    } catch (error) {
      console.error('Error creating chat thread:', error);
      throw error;
    }
  }

  // Add message to existing thread
  async addMessageToThread(threadId, message) {
    try {
      const thread = await ChatThread.findById(threadId);
      if (!thread) {
        throw new Error('Thread not found');
      }

      thread.messages.push(message);
      thread.updatedAt = new Date();
      
      const updatedThread = await thread.save();
      return updatedThread;
    } catch (error) {
      console.error('Error adding message to thread:', error);
      throw error;
    }
  }

  // Get recent chat threads
  async getRecentThreads(limit = 10) {
    try {
      const threads = await ChatThread
        .find({})
        .sort({ updatedAt: -1 })
        .limit(limit)
        .select('_id title createdAt updatedAt messages')
        .lean();

      return threads.map(thread => ({
        id: thread._id.toString(),
        title: thread.title,
        createdAt: thread.createdAt,
        updatedAt: thread.updatedAt,
        lastMessage: thread.messages[thread.messages.length - 1]?.content?.substring(0, 100) + '...' || '',
        messageCount: thread.messages.length
      }));
    } catch (error) {
      console.error('Error getting recent threads:', error);
      return [];
    }
  }

  // Get thread by ID
  async getThreadById(threadId) {
    try {
      const thread = await ChatThread.findById(threadId).lean();
      if (!thread) {
        return null;
      }

      return {
        id: thread._id.toString(),
        title: thread.title,
        messages: thread.messages,
        createdAt: thread.createdAt,
        updatedAt: thread.updatedAt
      };
    } catch (error) {
      console.error('Error getting thread by ID:', error);
      return null;
    }
  }

  // Delete thread
  async deleteThread(threadId) {
    try {
      await ChatThread.findByIdAndDelete(threadId);
      return true;
    } catch (error) {
      console.error('Error deleting thread:', error);
      return false;
    }
  }

  // Search threads
  async searchThreads(query, limit = 10) {
    try {
      const threads = await ChatThread
        .find({
          $or: [
            { title: { $regex: query, $options: 'i' } },
            { 'messages.content': { $regex: query, $options: 'i' } }
          ]
        })
        .sort({ updatedAt: -1 })
        .limit(limit)
        .select('_id title createdAt updatedAt messages')
        .lean();

      return threads.map(thread => ({
        id: thread._id.toString(),
        title: thread.title,
        createdAt: thread.createdAt,
        updatedAt: thread.updatedAt,
        lastMessage: thread.messages[thread.messages.length - 1]?.content?.substring(0, 100) + '...' || '',
        messageCount: thread.messages.length
      }));
    } catch (error) {
      console.error('Error searching threads:', error);
      return [];
    }
  }
}

export const mongoStorage = new MongoDBStorage();