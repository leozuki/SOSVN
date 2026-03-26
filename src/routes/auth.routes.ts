import { Router } from 'express';
import { users } from '../data/store';

const router = Router();

router.post('/login', (req, res) => {
  const email = String(req.body?.email || '').trim();
  const user = users.find((u) => u.email === email);

  if (!user) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }

  return res.json({
    token: `mock-token-${user.id}`,
    user
  });
});

router.post('/register', (req, res) => {
  return res.status(501).json({ message: 'Register endpoint scaffolded, implementation pending' });
});

export default router;
