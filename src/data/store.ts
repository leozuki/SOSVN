import { v4 as uuid } from 'uuid';
import { ActivityLog, Contact, Deal, Task, Ticket, User } from '../types';

export const users: User[] = [
  { id: 'u-admin', name: 'Admin', email: 'admin@crm.local', role: 'admin' },
  { id: 'u-manager', name: 'Manager', email: 'manager@crm.local', role: 'manager', teamId: 't-1' },
  { id: 'u-sales-1', name: 'Sales 1', email: 'sales1@crm.local', role: 'staff', teamId: 't-1' }
];

export const contacts: Contact[] = [];
export const deals: Deal[] = [];
export const tasks: Task[] = [];
export const tickets: Ticket[] = [];
export const logs: ActivityLog[] = [];

export function addLog(userId: string, action: string, entity: string, entityId: string) {
  logs.push({
    id: uuid(),
    userId,
    action,
    entity,
    entityId,
    timestamp: new Date().toISOString()
  });
}
