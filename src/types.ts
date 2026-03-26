export type Role = 'admin' | 'manager' | 'staff';

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  teamId?: string;
}

export interface Contact {
  id: string;
  name: string;
  phone?: string;
  email?: string;
  status: 'New Lead' | 'Contacted' | 'Qualified' | 'Customer' | 'Lost';
  ownerId: string;
  isDuplicate?: boolean;
  createdAt: string;
}

export type DealStage = 'Lead' | 'Qualified' | 'Proposal' | 'Negotiation' | 'Won' | 'Lost';

export interface Deal {
  id: string;
  contactId: string;
  title: string;
  value: number;
  stage: DealStage;
  probability: number;
  ownerId: string;
  lostReason?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Task {
  id: string;
  title: string;
  status: 'Todo' | 'In Progress' | 'Done';
  deadline: string;
  assignedTo: string;
  relatedType?: 'deal' | 'contact' | 'ticket';
  relatedId?: string;
  createdAt: string;
}

export interface Ticket {
  id: string;
  contactId: string;
  title: string;
  status: 'Open' | 'In Progress' | 'Resolved' | 'Closed';
  priority: 'Low' | 'Medium' | 'High' | 'Urgent';
  assignedTo: string;
  resolutionNote?: string;
  createdAt: string;
}

export interface ActivityLog {
  id: string;
  userId: string;
  action: string;
  entity: string;
  entityId: string;
  timestamp: string;
}

export interface RequestContext {
  user: User;
}
