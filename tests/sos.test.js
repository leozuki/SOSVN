/**
 * sos.test.js — SOSVN (SOS Vietnam) emergency system tests
 * 
 * Tests emergency case management, priority handling, and dispatch logic.
 * Pure unit tests — no external APIs needed.
 */

const EmergencySystem = {
  classifyEmergency: (type) => {
    const priorities = {
      'FIRE': 1,
      'MEDICAL': 1,
      'CRIME': 2,
      'ACCIDENT': 1,
      'NATURAL_DISASTER': 1,
      'UTILITY': 3,
      'OTHER': 3,
    };
    return {
      priority: priorities[type?.toUpperCase()] || 3,
      type: type?.toUpperCase() || 'OTHER',
    };
  },

  isValidEmergencyReport: (report) => {
    if (!report?.type) return { valid: false, error: 'Emergency type is required' };
    if (!report?.location?.lat || !report?.location?.lng) {
      return { valid: false, error: 'Location coordinates are required' };
    }
    if (!report?.reporterId) return { valid: false, error: 'Reporter ID is required' };
    return { valid: true };
  },

  calculateResponseTime: (distance, unitType) => {
    // Average response times in minutes
    const speeds = {
      ambulance: 60,    // km/h in city
      fire_truck: 50,
      police: 80,
    };
    const speed = speeds[unitType] || 60;
    return Math.ceil((distance / speed) * 60); // in minutes
  },

  formatEmergencyAlert: (emergency) => {
    const priorityLabels = { 1: '🚨 CRITICAL', 2: '⚠️ HIGH', 3: 'ℹ️ NORMAL' };
    return {
      title: `${priorityLabels[emergency.priority] || '❓'} Emergency Alert`,
      message: `${emergency.type} reported at ${emergency.address || 'Unknown location'}`,
      urgency: emergency.priority === 1 ? 'IMMEDIATE' : 'STANDARD',
    };
  },

  validatePhoneNumber: (phone) => {
    // Vietnamese phone number validation
    return /^(0|\+84)(3[2-9]|5[6|8|9]|7[0|6-9]|8[0-9]|9[0-9])[0-9]{7}$/.test(phone);
  },
};

describe('SOSVN — Emergency System', () => {
  describe('classifyEmergency', () => {
    it('classifies FIRE as priority 1 (critical)', () => {
      const result = EmergencySystem.classifyEmergency('FIRE');
      expect(result.priority).toBe(1);
    });

    it('classifies MEDICAL as priority 1', () => {
      expect(EmergencySystem.classifyEmergency('MEDICAL').priority).toBe(1);
    });

    it('classifies CRIME as priority 2', () => {
      expect(EmergencySystem.classifyEmergency('CRIME').priority).toBe(2);
    });

    it('defaults unknown types to priority 3', () => {
      expect(EmergencySystem.classifyEmergency('UNKNOWN').priority).toBe(3);
      expect(EmergencySystem.classifyEmergency(null).priority).toBe(3);
    });

    it('handles case-insensitive input', () => {
      expect(EmergencySystem.classifyEmergency('fire').priority).toBe(1);
      expect(EmergencySystem.classifyEmergency('Fire').priority).toBe(1);
    });
  });

  describe('isValidEmergencyReport', () => {
    const validReport = {
      type: 'FIRE',
      location: { lat: 10.7769, lng: 106.7009 },
      reporterId: 'user123',
    };

    it('validates a complete report', () => {
      expect(EmergencySystem.isValidEmergencyReport(validReport).valid).toBe(true);
    });

    it('rejects report without type', () => {
      const result = EmergencySystem.isValidEmergencyReport({ ...validReport, type: undefined });
      expect(result.valid).toBe(false);
    });

    it('rejects report without location', () => {
      const result = EmergencySystem.isValidEmergencyReport({ type: 'FIRE', reporterId: 'u1' });
      expect(result.valid).toBe(false);
      expect(result.error).toContain('Location');
    });
  });

  describe('calculateResponseTime', () => {
    it('calculates ambulance response time correctly', () => {
      // 10km at 60km/h = 10 minutes
      expect(EmergencySystem.calculateResponseTime(10, 'ambulance')).toBe(10);
    });

    it('calculates police response time correctly', () => {
      // 8km at 80km/h = 6 minutes (rounded up)
      expect(EmergencySystem.calculateResponseTime(8, 'police')).toBe(6);
    });

    it('uses default speed for unknown unit type', () => {
      const time = EmergencySystem.calculateResponseTime(5, 'unknown');
      expect(time).toBeGreaterThan(0);
    });
  });

  describe('formatEmergencyAlert', () => {
    it('formats critical alert correctly', () => {
      const alert = EmergencySystem.formatEmergencyAlert({
        priority: 1, type: 'FIRE', address: '123 Nguyen Hue, District 1'
      });
      expect(alert.title).toContain('CRITICAL');
      expect(alert.urgency).toBe('IMMEDIATE');
    });

    it('formats non-critical alert as STANDARD', () => {
      const alert = EmergencySystem.formatEmergencyAlert({ priority: 3, type: 'UTILITY' });
      expect(alert.urgency).toBe('STANDARD');
    });
  });

  describe('validatePhoneNumber', () => {
    it('validates Vietnamese mobile numbers', () => {
      expect(EmergencySystem.validatePhoneNumber('0901234567')).toBe(true);
      expect(EmergencySystem.validatePhoneNumber('0771234567')).toBe(true);
      expect(EmergencySystem.validatePhoneNumber('+84901234567')).toBe(true);
    });

    it('rejects invalid phone numbers', () => {
      expect(EmergencySystem.validatePhoneNumber('123456')).toBe(false);
      expect(EmergencySystem.validatePhoneNumber('abcdefghij')).toBe(false);
    });
  });
});
