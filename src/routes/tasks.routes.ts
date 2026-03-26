import { Router } from 'express';
import { v4 as uuid } from 'uuid';
import { addLog, tasks } from '../data/store';
import { AuthenticatedRequest } from '../middleware/auth';

const router = Router();

router.get('/', (req, res) => {
  const { user } = req as AuthenticatedRequest;
  const data = user.role === 'admin' || user.role === 'manager'
    ? tasks
    : tasks.filter((t) => t.assignedTo === user.id);

  return res.json(data);
});

router.post('/', (req, res) => {
  const { user } = req as AuthenticatedRequest;
  const { title, deadline, assignedTo = user.id, relatedType, relatedId } = req.body as {
    title: string;
    deadline: string;
    assignedTo?: string;
    relatedType?: 'deal' | 'contact' | 'ticket';
    relatedId?: string;
  };

  if (!title || !deadline) {
    return res.status(400).json({ message: 'title and deadline are required' });
  }

  const task = {
    id: uuid(),
    title,
    status: 'Todo' as const,
    deadline,
    assignedTo,
    relatedType,
    relatedId,
    createdAt: new Date().toISOString()
  };

  tasks.push(task);
  addLog(user.id, 'create', 'task', task.id);
  return res.status(201).json(task);
});

export default router;
