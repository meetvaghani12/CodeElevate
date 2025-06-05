import express, { Request, Response } from 'express';
import { authenticateToken } from '../../auth/middleware/auth';
import { CodeReviewService } from '../../services/codeReview.service';
import { PrismaClient } from '@prisma/client';

const router = express.Router();
const prisma = new PrismaClient();

interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
  };
}

// Get all code reviews for a user
router.get('/', authenticateToken, async (req: AuthRequest, res: Response): Promise<Response> => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'User not authenticated' });
    }
    const userId = req.user.id;
    const reviews = await prisma.codeReview.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' }
    });
    return res.json(reviews);
  } catch (error) {
    console.error('Error fetching code reviews:', error);
    return res.status(500).json({ message: 'Error fetching code reviews' });
  }
});

// Get subscription status and remaining reviews
router.get('/subscription-status', authenticateToken, async (req: AuthRequest, res: Response): Promise<Response> => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'User not authenticated' });
    }
    const userId = req.user.id;
    const status = await CodeReviewService.getSubscriptionStatus(userId);
    return res.json(status);
  } catch (error) {
    console.error('Error fetching subscription status:', error);
    return res.status(500).json({ message: 'Error fetching subscription status' });
  }
});

// Get a single code review by ID
router.get('/:id', authenticateToken, async (req: AuthRequest, res: Response): Promise<Response> => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'User not authenticated' });
    }
    const { id } = req.params;
    const userId = req.user.id;
    
    const codeReview = await CodeReviewService.getReviewById(id, userId);

    if (!codeReview) {
      return res.status(404).json({ message: 'Code review not found' });
    }

    return res.json(codeReview);
  } catch (error) {
    console.error('Error fetching code review:', error);
    return res.status(500).json({ message: 'Error fetching code review' });
  }
});

// Create a new code review
router.post('/', authenticateToken, async (req: AuthRequest, res: Response): Promise<Response> => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'User not authenticated' });
    }
    const userId = req.user.id;
    const { fileName, code, review, score, issuesCount, language } = req.body;

    const newCodeReview = await CodeReviewService.createReview({
      fileName,
      code,
      review,
      score,
      issuesCount,
      language
    }, userId);

    return res.status(201).json(newCodeReview);
  } catch (error: any) {
    console.error('Error creating code review:', error);
    if (error.message.includes('code review limit')) {
      return res.status(403).json({ message: error.message });
    }
    return res.status(500).json({ message: 'Error creating code review' });
  }
});

// Delete a code review
router.delete('/:id', authenticateToken, async (req: AuthRequest, res: Response): Promise<Response> => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'User not authenticated' });
    }
    const { id } = req.params;
    const userId = req.user.id;

    await CodeReviewService.deleteReview(id, userId);

    return res.status(204).send();
  } catch (error) {
    console.error('Error deleting code review:', error);
    return res.status(500).json({ message: 'Error deleting code review' });
  }
});

export default router; 