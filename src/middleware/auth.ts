import { NextFunction, Request, Response } from 'express';
import { users } from '../data/store';
import { Role, User } from '../types';

export interface AuthenticatedRequest extends Request {
  user: User;
}

export function mockAuth(req: Request, res: Response, next: NextFunction) {
  const userId = req.header('x-user-id') || 'u-admin';
  const user = users.find((u) => u.id === userId);

  if (!user) {
    return res.status(401).json({ message: 'Invalid user' });
  }

  (req as AuthenticatedRequest).user = user;
  return next();
}

export function requireRoles(roles: Role[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    const { user } = req as AuthenticatedRequest;
    if (!roles.includes(user.role)) {
      return res.status(403).json({ message: 'Forbidden' });
    }
    return next();
  };
}
