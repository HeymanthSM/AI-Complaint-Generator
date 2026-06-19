import { Request, Response, Router } from 'express';
import { prisma } from '../config/database';
import { authenticate, AuthRequest, optionalAuth } from '../middleware/auth';
import { complaintSchema } from '../utils/validators';
import { estimateResolutionDate, getPaginationMeta, parseSortParam } from '../utils/helpers';
import { detectDepartment } from '../services/ai/departmentDetector';
import { generateComplaintLetter } from '../services/ai/complaintGenerator';
import { detectEmergency } from '../services/ai/emergencyDetector';
import { detectDuplicates } from '../services/ai/duplicateDetector';
import { createGenesisBlock, createBlock, verifyChain, formatAuditTrail } from '../services/blockchain/auditTrail';
import { uploadFields } from '../middleware/upload';
import { logger } from '../utils/logger';
import { v4 as uuidv4 } from 'uuid';

const router = Router();

// Mock complaints for demo mode
const mockComplaints: any[] = [
  {
    id: 'mock-1', title: 'Large Pothole on Main Road', description: 'There is a large pothole on MG Road near the bus stop that is causing accidents.',
    category: 'POTHOLE', priority: 'HIGH', status: 'IN_PROGRESS', department: { name: 'Public Works Department', code: 'PWD' },
    address: 'MG Road, Near City Bus Stop', municipality: 'Chennai Corporation', district: 'Chennai', state: 'Tamil Nadu',
    latitude: 13.0827, longitude: 80.2707, isEmergency: false, language: 'en',
    userId: 'demo-user-1', createdAt: new Date(Date.now() - 86400000 * 3), updatedAt: new Date(Date.now() - 86400000),
    sentimentScore: -0.3, sentimentLabel: 'negative', images: [],
  },
  {
    id: 'mock-2', title: 'Garbage Not Collected for a Week', description: 'The municipal garbage collection has not happened for the past 7 days in our area.',
    category: 'GARBAGE', priority: 'MEDIUM', status: 'ASSIGNED', department: { name: 'Municipal Sanitation Department', code: 'SAN' },
    address: 'Anna Nagar, 3rd Street', municipality: 'Chennai Corporation', district: 'Chennai', state: 'Tamil Nadu',
    latitude: 13.0850, longitude: 80.2101, isEmergency: false, language: 'en',
    userId: 'demo-user-1', createdAt: new Date(Date.now() - 86400000 * 5), updatedAt: new Date(Date.now() - 86400000 * 2),
    sentimentScore: -0.5, sentimentLabel: 'negative', images: [],
  },
  {
    id: 'mock-3', title: 'Broken Streetlight Near School', description: 'The streetlight near Government School on Park Road is not working for 2 weeks, making the area unsafe at night.',
    category: 'STREETLIGHT', priority: 'HIGH', status: 'SUBMITTED', department: { name: 'Electricity Board', code: 'ELEC' },
    address: 'Park Road, Near Govt. Higher Secondary School', municipality: 'Coimbatore Corporation', district: 'Coimbatore', state: 'Tamil Nadu',
    latitude: 11.0168, longitude: 76.9558, isEmergency: false, language: 'en',
    userId: 'demo-user-1', createdAt: new Date(Date.now() - 86400000 * 1), updatedAt: new Date(Date.now() - 86400000),
    sentimentScore: -0.4, sentimentLabel: 'negative', images: [],
  },
  {
    id: 'mock-4', title: 'Water Pipeline Burst', description: 'A major water pipeline has burst on NH Road causing water wastage and road flooding. This needs emergency attention.',
    category: 'WATER_LEAK', priority: 'EMERGENCY', status: 'ESCALATED', department: { name: 'Water Supply & Sewerage Board', code: 'WATER' },
    address: 'NH Road, KK Nagar Junction', municipality: 'Madurai Corporation', district: 'Madurai', state: 'Tamil Nadu',
    latitude: 9.9252, longitude: 78.1198, isEmergency: true, emergencyReason: 'Major water pipeline burst causing road flooding',
    language: 'en', userId: 'demo-user-1', createdAt: new Date(Date.now() - 3600000 * 6), updatedAt: new Date(Date.now() - 3600000),
    sentimentScore: -0.7, sentimentLabel: 'very_negative', images: [],
  },
  {
    id: 'mock-5', title: 'Illegal Construction on Lake Bed', description: 'Unauthorized construction activity is happening on the Porur lake bed area destroying the water body.',
    category: 'ILLEGAL_CONSTRUCTION', priority: 'HIGH', status: 'UNDER_REVIEW', department: { name: 'Town Planning Department', code: 'PLAN' },
    address: 'Porur Lake Bed, Near Arcot Road', municipality: 'Chennai Corporation', district: 'Chennai', state: 'Tamil Nadu',
    latitude: 13.0382, longitude: 80.1563, isEmergency: false, language: 'en',
    userId: 'demo-user-1', createdAt: new Date(Date.now() - 86400000 * 7), updatedAt: new Date(Date.now() - 86400000 * 3),
    sentimentScore: -0.6, sentimentLabel: 'negative', images: [],
  },
  {
    id: 'mock-6', title: 'Stray Dog Menace in Residential Area', description: 'Pack of aggressive stray dogs in T Nagar making it dangerous for morning walkers and children.',
    category: 'STRAY_ANIMALS', priority: 'MEDIUM', status: 'ASSIGNED', department: { name: 'Animal Husbandry Department', code: 'ANIM' },
    address: 'T Nagar, South Usman Road', municipality: 'Chennai Corporation', district: 'Chennai', state: 'Tamil Nadu',
    latitude: 13.0418, longitude: 80.2341, isEmergency: false, language: 'en',
    userId: 'demo-user-1', createdAt: new Date(Date.now() - 86400000 * 10), updatedAt: new Date(Date.now() - 86400000 * 4),
    sentimentScore: -0.3, sentimentLabel: 'negative', images: [],
  },
  {
    id: 'mock-7', title: 'Resolved: Park Bench Repair', description: 'The broken benches in Semmozhi Poonga have been repaired. Thank you for the quick action!',
    category: 'PARKS_GARDENS', priority: 'LOW', status: 'RESOLVED', department: { name: 'Parks & Gardens Department', code: 'PARK' },
    address: 'Semmozhi Poonga, Cathedral Road', municipality: 'Chennai Corporation', district: 'Chennai', state: 'Tamil Nadu',
    latitude: 13.0596, longitude: 80.2593, isEmergency: false, language: 'en',
    userId: 'demo-user-1', createdAt: new Date(Date.now() - 86400000 * 20), updatedAt: new Date(Date.now() - 86400000 * 2),
    resolvedAt: new Date(Date.now() - 86400000 * 2),
    sentimentScore: 0.8, sentimentLabel: 'very_positive', images: [],
  },
  {
    id: 'mock-8', title: 'Noise Pollution from Factory', description: 'A factory in SIDCO Industrial Estate operates heavy machinery during night hours causing severe noise pollution in nearby residential areas.',
    category: 'NOISE_POLLUTION', priority: 'MEDIUM', status: 'IN_PROGRESS', department: { name: 'Environment & Pollution Control Board', code: 'ENV' },
    address: 'SIDCO Industrial Estate, Ambattur', municipality: 'Chennai Corporation', district: 'Chennai', state: 'Tamil Nadu',
    latitude: 13.1143, longitude: 80.1548, isEmergency: false, language: 'en',
    userId: 'demo-user-1', createdAt: new Date(Date.now() - 86400000 * 8), updatedAt: new Date(Date.now() - 86400000 * 1),
    sentimentScore: -0.4, sentimentLabel: 'negative', images: [],
  },
];

// POST /api/complaints
router.post('/', authenticate, uploadFields, async (req: AuthRequest, res: Response) => {
  try {
    const data = complaintSchema.parse(req.body);

    // AI: Detect department
    const deptResult = await detectDepartment(data.description, data.title);

    // AI: Check for emergency
    const emergencyResult = detectEmergency(`${data.title} ${data.description}`);

    // Determine priority
    const priority = emergencyResult.isEmergency ? 'EMERGENCY' : (data.priority || deptResult.priority);

    // Generate complaint letter
    const letterResult = await generateComplaintLetter({
      ...data,
      department: deptResult.department,
      priority,
      isEmergency: emergencyResult.isEmergency,
      userName: req.user?.email,
    });

    const complaintData = {
      id: uuidv4(),
      ...data,
      category: data.category || deptResult.category,
      priority,
      status: emergencyResult.isEmergency ? 'ESCALATED' : 'SUBMITTED',
      generatedLetter: letterResult.letter,
      isEmergency: emergencyResult.isEmergency,
      emergencyReason: emergencyResult.reason,
      aiConfidence: deptResult.confidence,
      estimatedResolution: estimateResolutionDate(priority),
      userId: req.user!.id,
      department: { name: deptResult.department, code: deptResult.departmentCode },
      createdAt: new Date(),
      updatedAt: new Date(),
      images: [],
    };

    try {
      // Try to save to database
      const complaint = await prisma.complaint.create({
        data: {
          title: data.title,
          description: data.description,
          category: data.category || deptResult.category as any,
          priority: priority as any,
          status: (emergencyResult.isEmergency ? 'ESCALATED' : 'SUBMITTED') as any,
          generatedLetter: letterResult.letter,
          latitude: data.latitude,
          longitude: data.longitude,
          address: data.address,
          ward: data.ward,
          municipality: data.municipality,
          district: data.district,
          state: data.state,
          language: data.language,
          isEmergency: emergencyResult.isEmergency,
          emergencyReason: emergencyResult.reason,
          aiConfidence: deptResult.confidence,
          estimatedResolution: estimateResolutionDate(priority),
          userId: req.user!.id,
        },
        include: { department: true },
      });

      // Create blockchain genesis block
      const genesisBlock = createGenesisBlock(complaint.id, {
        title: data.title,
        category: data.category,
        priority,
      });

      try {
        await prisma.auditBlock.create({
          data: {
            blockIndex: genesisBlock.blockIndex,
            complaintId: complaint.id,
            action: genesisBlock.action as any,
            data: genesisBlock.data,
            hash: genesisBlock.hash,
            previousHash: genesisBlock.previousHash,
            nonce: genesisBlock.nonce,
          },
        });
      } catch (e) { /* audit block creation is non-critical */ }

      res.status(201).json({
        complaint,
        aiAnalysis: {
          department: deptResult,
          emergency: emergencyResult,
          letter: letterResult,
        },
      });
    } catch (dbError) {
      // Demo mode - return the data without DB save
      logger.warn('DB unavailable, returning demo complaint');
      mockComplaints.unshift(complaintData);
      res.status(201).json({
        complaint: complaintData,
        aiAnalysis: {
          department: deptResult,
          emergency: emergencyResult,
          letter: letterResult,
        },
        demo: true,
      });
    }
  } catch (error: any) {
    logger.error('Create complaint error:', error);
    if (error.name === 'ZodError') {
      res.status(400).json({ error: 'Validation error', details: error.errors });
      return;
    }
    res.status(500).json({ error: 'Failed to create complaint' });
  }
});

// GET /api/complaints
router.get('/', optionalAuth, async (req: AuthRequest, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const status = req.query.status as string;
    const category = req.query.category as string;
    const priority = req.query.priority as string;
    const search = req.query.search as string;
    const { field, order } = parseSortParam(req.query.sort as string);

    try {
      const where: any = {};
      if (req.user) where.userId = req.user.id;
      if (status) where.status = status;
      if (category) where.category = category;
      if (priority) where.priority = priority;
      if (search) {
        where.OR = [
          { title: { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } },
        ];
      }

      const [complaints, total] = await Promise.all([
        prisma.complaint.findMany({
          where,
          include: { department: true },
          orderBy: { [field]: order },
          skip: (page - 1) * limit,
          take: limit,
        }),
        prisma.complaint.count({ where }),
      ]);

      res.json({
        complaints,
        pagination: getPaginationMeta(total, page, limit),
      });
    } catch (dbError) {
      // Demo mode
      let filtered = [...mockComplaints];
      if (status) filtered = filtered.filter(c => c.status === status);
      if (category) filtered = filtered.filter(c => c.category === category);
      if (priority) filtered = filtered.filter(c => c.priority === priority);
      if (search) {
        const s = search.toLowerCase();
        filtered = filtered.filter(c =>
          c.title.toLowerCase().includes(s) || c.description.toLowerCase().includes(s)
        );
      }

      const start = (page - 1) * limit;
      const paged = filtered.slice(start, start + limit);

      res.json({
        complaints: paged,
        pagination: getPaginationMeta(filtered.length, page, limit),
        demo: true,
      });
    }
  } catch (error) {
    logger.error('List complaints error:', error);
    res.status(500).json({ error: 'Failed to fetch complaints' });
  }
});

// GET /api/complaints/:id
router.get('/:id', optionalAuth, async (req: AuthRequest, res: Response) => {
  try {
    try {
      const complaint = await prisma.complaint.findUnique({
        where: { id: req.params.id },
        include: { department: true, user: { select: { name: true, email: true } } },
      });

      if (!complaint) {
        const mock = mockComplaints.find(c => c.id === req.params.id);
        if (mock) {
          res.json({ complaint: mock, demo: true });
          return;
        }
        res.status(404).json({ error: 'Complaint not found' });
        return;
      }

      res.json({ complaint });
    } catch (dbError) {
      const mock = mockComplaints.find(c => c.id === req.params.id);
      if (mock) {
        res.json({ complaint: mock, demo: true });
        return;
      }
      res.status(404).json({ error: 'Complaint not found' });
    }
  } catch (error) {
    logger.error('Get complaint error:', error);
    res.status(500).json({ error: 'Failed to fetch complaint' });
  }
});

// GET /api/complaints/:id/audit
router.get('/:id/audit', async (req: Request, res: Response) => {
  try {
    try {
      const blocks = await prisma.auditBlock.findMany({
        where: { complaintId: req.params.id },
        orderBy: { blockIndex: 'asc' },
      });

      const formatted = formatAuditTrail(blocks.map(b => ({
        blockIndex: b.blockIndex,
        complaintId: b.complaintId,
        action: b.action,
        data: b.data,
        hash: b.hash,
        previousHash: b.previousHash,
        timestamp: b.timestamp,
        nonce: b.nonce,
      })));

      res.json({ auditTrail: formatted, blockCount: blocks.length });
    } catch (dbError) {
      // Demo audit trail
      const isMockDefault = req.params.id.startsWith('mock-');
      const currentComplaint = mockComplaints.find(c => c.id === req.params.id);
      const title = currentComplaint ? currentComplaint.title : 'Complaint';
      
      const demoBlocks = isMockDefault
        ? [
            { index: 0, action: 'CREATED', description: 'Complaint created', hash: 'a3f29b4e7c108a9f0d2c3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b', previousHash: '0000000000000000000000000000000000000000000000000000000000000000', timestamp: new Date(Date.now() - 86400000 * 3).toISOString(), verified: true },
            { index: 1, action: 'STATUS_CHANGED', description: 'Status changed to: UNDER_REVIEW', hash: 'b7e4f9b8c6a0d2f1e5c8d9a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2', previousHash: 'a3f29b4e7c108a9f0d2c3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b', timestamp: new Date(Date.now() - 86400000 * 2).toISOString(), verified: true },
            { index: 2, action: 'ASSIGNED', description: 'Assigned to: Public Works Department', hash: 'c9d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1', previousHash: 'b7e4f9b8c6a0d2f1e5c8d9a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2', timestamp: new Date(Date.now() - 86400000).toISOString(), verified: true },
          ]
        : [
            { index: 0, action: 'CREATED', description: `Complaint created: ${title}`, hash: 'a3f29b4e7c108a9f0d2c3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b', previousHash: '0000000000000000000000000000000000000000000000000000000000000000', timestamp: (currentComplaint ? currentComplaint.createdAt : new Date()).toISOString(), verified: true }
          ];
      res.json({ auditTrail: demoBlocks, blockCount: demoBlocks.length, demo: true });
    }
  } catch (error) {
    logger.error('Get audit trail error:', error);
    res.status(500).json({ error: 'Failed to fetch audit trail' });
  }
});

export default router;
