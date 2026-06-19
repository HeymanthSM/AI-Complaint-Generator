import { Request, Response, Router } from 'express';
import { chatWithBot } from '../services/ai/chatbotEngine';
import { ChatHistory } from '../config/mongodb';
import { optionalAuth, AuthRequest } from '../middleware/auth';
import { v4 as uuidv4 } from 'uuid';
import { logger } from '../utils/logger';

const router = Router();

// In-memory chat storage for demo mode
const memoryChats = new Map<string, Array<{ role: string; content: string; timestamp: Date }>>();

// POST /api/chatbot/message
router.post('/message', optionalAuth, async (req: AuthRequest, res: Response) => {
  try {
    const { message, conversationId } = req.body;

    if (!message) {
      res.status(400).json({ error: 'Message is required' });
      return;
    }

    const convId = conversationId || uuidv4();
    const userId = req.user?.id || 'anonymous';

    // Get conversation history
    let history: Array<{ role: string; content: string }> = [];

    try {
      const chatDoc = await ChatHistory.findOne({ conversationId: convId });
      if (chatDoc) {
        history = (chatDoc as any).messages || [];
      }
    } catch {
      // Use in-memory fallback
      history = (memoryChats.get(convId) || []).map(m => ({ role: m.role, content: m.content }));
    }

    // Get AI response
    const response = await chatWithBot(message, history);

    // Save to history
    const userMsg = { role: 'user', content: message, timestamp: new Date() };
    const botMsg = { role: 'assistant', content: response.reply, timestamp: new Date() };

    try {
      await ChatHistory.findOneAndUpdate(
        { conversationId: convId },
        {
          $push: { messages: { $each: [userMsg, botMsg] } },
          $set: { userId, updatedAt: new Date() },
          $setOnInsert: { createdAt: new Date() },
        },
        { upsert: true }
      );
    } catch {
      // In-memory fallback
      if (!memoryChats.has(convId)) memoryChats.set(convId, []);
      memoryChats.get(convId)!.push(userMsg, botMsg);
    }

    res.json({
      conversationId: convId,
      reply: response.reply,
      suggestions: response.suggestions,
      timestamp: new Date(),
    });
  } catch (error) {
    logger.error('Chatbot error:', error);
    res.status(500).json({ error: 'Chatbot service unavailable' });
  }
});

// GET /api/chatbot/history/:conversationId
router.get('/history/:conversationId', optionalAuth, async (req: AuthRequest, res: Response) => {
  try {
    const { conversationId } = req.params;

    try {
      const chatDoc = await ChatHistory.findOne({ conversationId });
      if (chatDoc) {
        res.json({ conversationId, messages: (chatDoc as any).messages || [] });
        return;
      }
    } catch {
      // In-memory fallback
    }

    const memMessages = memoryChats.get(conversationId) || [];
    res.json({ conversationId, messages: memMessages });
  } catch (error) {
    logger.error('Chat history error:', error);
    res.status(500).json({ error: 'Failed to fetch chat history' });
  }
});

export default router;
