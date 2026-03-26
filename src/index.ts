import express from 'express';
import authRoutes from './routes/auth.routes';
import contactRoutes from './routes/contacts.routes';
import dealRoutes from './routes/deals.routes';
import taskRoutes from './routes/tasks.routes';
import ticketRoutes from './routes/tickets.routes';
import { logs } from './data/store';
import { mockAuth, requireRoles } from './middleware/auth';

const app = express();
app.use(express.json());

app.get('/health', (_req, res) => res.json({ status: 'ok' }));

app.use('/auth', authRoutes);
app.use(mockAuth);

app.use('/contacts', contactRoutes);
app.use('/deals', dealRoutes);
app.use('/tasks', taskRoutes);
app.use('/tickets', ticketRoutes);
app.get('/audit-logs', requireRoles(['admin', 'manager']), (_req, res) => res.json(logs));

app.use((err: unknown, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error(err);
  return res.status(500).json({ message: 'Internal server error' });
});

const port = Number(process.env.PORT || 3000);
app.listen(port, () => {
  console.log(`CRM API listening on port ${port}`);
});
