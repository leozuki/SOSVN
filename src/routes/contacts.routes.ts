import { Router } from 'express';
import { v4 as uuid } from 'uuid';
import { addLog, contacts } from '../data/store';
import { AuthenticatedRequest } from '../middleware/auth';

const router = Router();

router.get('/', (req, res) => {
  const { user } = req as AuthenticatedRequest;
  const data = user.role === 'admin' || user.role === 'manager'
    ? contacts
    : contacts.filter((c) => c.ownerId === user.id);

  return res.json(data);
});

router.post('/', (req, res) => {
  const { user } = req as AuthenticatedRequest;
  const { name, phone, email, allowDuplicate } = req.body as {
    name: string;
    phone?: string;
    email?: string;
    allowDuplicate?: boolean;
  };

  if (!name || (!phone && !email)) {
    return res.status(400).json({ message: 'name and at least one of phone/email are required' });
  }

  const duplicate = contacts.find((c) => (phone && c.phone === phone) || (email && c.email === email));
  if (duplicate && !allowDuplicate) {
    return res.status(409).json({
      message: 'Duplicate contact detected',
      duplicateContactId: duplicate.id,
      canMerge: true
    });
  }

  const contact = {
    id: uuid(),
    name,
    phone,
    email,
    status: 'New Lead' as const,
    ownerId: user.id,
    isDuplicate: Boolean(duplicate),
    createdAt: new Date().toISOString()
  };

  contacts.push(contact);
  addLog(user.id, 'create', 'contact', contact.id);
  return res.status(201).json(contact);
});

router.put('/:id', (req, res) => {
  const { user } = req as AuthenticatedRequest;
  const contact = contacts.find((c) => c.id === req.params.id);

  if (!contact) {
    return res.status(404).json({ message: 'Contact not found' });
  }

  if (user.role === 'staff' && contact.ownerId !== user.id) {
    return res.status(403).json({ message: 'Forbidden' });
  }

  Object.assign(contact, req.body);
  addLog(user.id, 'update', 'contact', contact.id);
  return res.json(contact);
});

router.delete('/:id', (req, res) => {
  const { user } = req as AuthenticatedRequest;
  const index = contacts.findIndex((c) => c.id === req.params.id);

  if (index === -1) {
    return res.status(404).json({ message: 'Contact not found' });
  }

  const contact = contacts[index];
  if (user.role === 'staff' && contact.ownerId !== user.id) {
    return res.status(403).json({ message: 'Forbidden' });
  }

  contacts.splice(index, 1);
  addLog(user.id, 'delete', 'contact', contact.id);
  return res.status(204).send();
});

export default router;
