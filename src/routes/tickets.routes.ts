import { Router } from 'express';
import { v4 as uuid } from 'uuid';
import { addLog, contacts, tickets } from '../data/store';
import { AuthenticatedRequest } from '../middleware/auth';

const router = Router();

router.get('/', (_req, res) => {
  return res.json(tickets);
});

router.post('/', (req, res) => {
  const { user } = req as AuthenticatedRequest;
  const { contactId, title, priority = 'Medium', assignedTo = user.id } = req.body as {
    contactId: string;
    title: string;
    priority?: 'Low' | 'Medium' | 'High' | 'Urgent';
    assignedTo?: string;
  };

  if (!contactId || !title) {
    return res.status(400).json({ message: 'contactId and title are required' });
  }

  if (!contacts.find((c) => c.id === contactId)) {
    return res.status(400).json({ message: 'Invalid contactId' });
  }

  const ticket = {
    id: uuid(),
    contactId,
    title,
    status: 'Open' as const,
    priority,
    assignedTo,
    createdAt: new Date().toISOString()
  };

  tickets.push(ticket);
  addLog(user.id, 'create', 'ticket', ticket.id);
  return res.status(201).json(ticket);
});

export default router;
