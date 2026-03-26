import { Router } from 'express';
import { v4 as uuid } from 'uuid';
import { addLog, contacts, deals, tasks } from '../data/store';
import { AuthenticatedRequest } from '../middleware/auth';
import { DealStage } from '../types';

const router = Router();

router.get('/', (req, res) => {
  const { user } = req as AuthenticatedRequest;
  const data = user.role === 'admin' || user.role === 'manager'
    ? deals
    : deals.filter((d) => d.ownerId === user.id);
  return res.json(data);
});

router.post('/', (req, res) => {
  const { user } = req as AuthenticatedRequest;
  const { contactId, title, value, probability = 0.3 } = req.body as {
    contactId: string;
    title: string;
    value: number;
    probability?: number;
  };

  if (!contactId || !title || typeof value !== 'number' || value <= 0) {
    return res.status(400).json({ message: 'contactId, title and value > 0 are required' });
  }

  const contact = contacts.find((c) => c.id === contactId);
  if (!contact) {
    return res.status(400).json({ message: 'Invalid contactId' });
  }

  const now = new Date().toISOString();
  const deal = {
    id: uuid(),
    contactId,
    title,
    value,
    stage: 'Lead' as DealStage,
    probability,
    ownerId: user.id,
    createdAt: now,
    updatedAt: now
  };

  deals.push(deal);
  addLog(user.id, 'create', 'deal', deal.id);

  const followUpTask = {
    id: uuid(),
    title: `Follow up deal: ${title}`,
    status: 'Todo' as const,
    deadline: new Date(Date.now() + 24 * 3600 * 1000).toISOString(),
    assignedTo: user.id,
    relatedType: 'deal' as const,
    relatedId: deal.id,
    createdAt: now
  };

  tasks.push(followUpTask);
  addLog(user.id, 'create', 'task', followUpTask.id);

  return res.status(201).json({ deal, followUpTask });
});

router.put('/:id/stage', (req, res) => {
  const { user } = req as AuthenticatedRequest;
  const { stage, lostReason } = req.body as { stage: DealStage; lostReason?: string };
  const deal = deals.find((d) => d.id === req.params.id);

  if (!deal) {
    return res.status(404).json({ message: 'Deal not found' });
  }

  if (user.role === 'staff' && deal.ownerId !== user.id) {
    return res.status(403).json({ message: 'Forbidden' });
  }

  if (stage === 'Lost' && !lostReason) {
    return res.status(400).json({ message: 'lostReason is required when stage=Lost' });
  }

  deal.stage = stage;
  deal.updatedAt = new Date().toISOString();
  if (stage === 'Lost') {
    deal.lostReason = lostReason;
  }

  if (stage === 'Won') {
    const contact = contacts.find((c) => c.id === deal.contactId);
    if (contact) {
      contact.status = 'Customer';
    }
  }

  addLog(user.id, 'move_stage', 'deal', deal.id);
  return res.json(deal);
});

export default router;
