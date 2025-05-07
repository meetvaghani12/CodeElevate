import express, { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateToken } from '../../auth/middleware/auth';

const router = express.Router();
const prisma = new PrismaClient();

interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
  };
}

// Get all code reviews for the authenticated user
router.get('/', authenticateToken, async (req: AuthRequest, res: Response): Promise<Response> => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'User not authenticated' });
    }
    const userId = req.user.id;
    const codeReviews = await prisma.codeReview.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
    return res.json(codeReviews);
  } catch (error) {
    console.error('Error fetching code reviews:', error);
    return res.status(500).json({ message: 'Error fetching code reviews' });
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
    
    const codeReview = await prisma.codeReview.findFirst({
      where: { id, userId },
    });

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
    const { fileName, code, review, score, issuesCount } = req.body;

    const newCodeReview = await prisma.codeReview.create({
      data: {
        userId,
        fileName,
        code,
        review,
        score,
        issuesCount,
        status: 'COMPLETED',
      },
    });

    return res.status(201).json(newCodeReview);
  } catch (error) {
    console.error('Error creating code review:', error);
    return res.status(500).json({ message: 'Error creating code review' });
  }
});

// Update a code review
router.put('/:id', authenticateToken, async (req: AuthRequest, res: Response): Promise<Response> => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'User not authenticated' });
    }
    const { id } = req.params;
    const { fileName, code, review, score, issuesCount, status } = req.body;

    const updatedCodeReview = await prisma.codeReview.update({
      where: { id },
      data: {
        fileName,
        code,
        review,
        score,
        issuesCount,
        status,
      },
    });

    return res.json(updatedCodeReview);
  } catch (error) {
    console.error('Error updating code review:', error);
    return res.status(500).json({ message: 'Error updating code review' });
  }
});

// Delete a code review
router.delete('/:id', authenticateToken, async (req: AuthRequest, res: Response): Promise<Response> => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'User not authenticated' });
    }
    const { id } = req.params;

    await prisma.codeReview.delete({
      where: { id },
    });

    return res.status(204).send();
  } catch (error) {
    console.error('Error deleting code review:', error);
    return res.status(500).json({ message: 'Error deleting code review' });
  }
});

export default router; 