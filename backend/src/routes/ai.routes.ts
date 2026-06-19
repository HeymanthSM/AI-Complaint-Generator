import { Request, Response, Router } from 'express';
import { detectDepartment } from '../services/ai/departmentDetector';
import { generateComplaintLetter } from '../services/ai/complaintGenerator';
import { analyzeImage } from '../services/ai/imageAnalyzer';
import { analyzeSentiment } from '../services/ai/sentimentAnalyzer';
import { detectDuplicates } from '../services/ai/duplicateDetector';
import { translateText } from '../services/ai/translationService';
import { detectEmergency } from '../services/ai/emergencyDetector';
import { uploadSingle } from '../middleware/upload';
import { logger } from '../utils/logger';

const router = Router();

// POST /api/ai/detect-department
router.post('/detect-department', async (req: Request, res: Response) => {
  try {
    const { description, title } = req.body;
    if (!description) {
      res.status(400).json({ error: 'Description is required' });
      return;
    }
    const result = await detectDepartment(description, title);
    res.json(result);
  } catch (error) {
    logger.error('Department detection error:', error);
    res.status(500).json({ error: 'Department detection failed' });
  }
});

// POST /api/ai/generate-complaint
router.post('/generate-complaint', async (req: Request, res: Response) => {
  try {
    const { title, description, category, department, priority, language, address, municipality, district, state } = req.body;
    if (!title || !description) {
      res.status(400).json({ error: 'Title and description are required' });
      return;
    }
    const result = await generateComplaintLetter({
      title, description, category: category || 'OTHER',
      department: department || 'Municipal Corporation',
      priority: priority || 'MEDIUM', language, address, municipality, district, state,
    });
    res.json(result);
  } catch (error) {
    logger.error('Complaint generation error:', error);
    res.status(500).json({ error: 'Complaint generation failed' });
  }
});

// POST /api/ai/analyze-image
router.post('/analyze-image', uploadSingle, async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      res.status(400).json({ error: 'Image file is required' });
      return;
    }
    const result = await analyzeImage(req.file.path);
    res.json({ ...result, imagePath: req.file.filename });
  } catch (error) {
    logger.error('Image analysis error:', error);
    res.status(500).json({ error: 'Image analysis failed' });
  }
});

// POST /api/ai/sentiment
router.post('/sentiment', async (req: Request, res: Response) => {
  try {
    const { text } = req.body;
    if (!text) {
      res.status(400).json({ error: 'Text is required' });
      return;
    }
    const result = await analyzeSentiment(text);
    res.json(result);
  } catch (error) {
    logger.error('Sentiment analysis error:', error);
    res.status(500).json({ error: 'Sentiment analysis failed' });
  }
});

// POST /api/ai/check-duplicates
router.post('/check-duplicates', async (req: Request, res: Response) => {
  try {
    const { title, description, category, latitude, longitude, existingComplaints } = req.body;
    if (!title || !description) {
      res.status(400).json({ error: 'Title and description are required' });
      return;
    }
    const result = await detectDuplicates(
      { title, description, category, latitude, longitude },
      existingComplaints || []
    );
    res.json(result);
  } catch (error) {
    logger.error('Duplicate detection error:', error);
    res.status(500).json({ error: 'Duplicate detection failed' });
  }
});

// POST /api/ai/translate
router.post('/translate', async (req: Request, res: Response) => {
  try {
    const { text, targetLanguage, sourceLanguage } = req.body;
    if (!text || !targetLanguage) {
      res.status(400).json({ error: 'Text and target language are required' });
      return;
    }
    const result = await translateText(text, targetLanguage, sourceLanguage);
    res.json(result);
  } catch (error) {
    logger.error('Translation error:', error);
    res.status(500).json({ error: 'Translation failed' });
  }
});

// POST /api/ai/detect-emergency
router.post('/detect-emergency', async (req: Request, res: Response) => {
  try {
    const { text } = req.body;
    if (!text) {
      res.status(400).json({ error: 'Text is required' });
      return;
    }
    const result = detectEmergency(text);
    res.json(result);
  } catch (error) {
    logger.error('Emergency detection error:', error);
    res.status(500).json({ error: 'Emergency detection failed' });
  }
});

export default router;
