import { describe, it, expect } from 'vitest';
import {
  normalizeIndianPhoneNumber,
  isValidIndianPhone,
  isValidEmail,
  isValidFullName,
  isValidAge,
  validateForm,
} from './validation';
import { FORM_SCHEMAS } from '../data/formSchemas';

describe('Validation Utility Tests', () => {
  describe('Indian Phone Number Validation', () => {
    it('normalizes numbers with +91 country code', () => {
      expect(normalizeIndianPhoneNumber('+91 98765 43210')).toBe('9876543210');
      expect(normalizeIndianPhoneNumber('+91-9435123456')).toBe('9435123456');
    });

    it('normalizes numbers with leading 0', () => {
      expect(normalizeIndianPhoneNumber('09876543210')).toBe('9876543210');
    });

    it('normalizes Assamese and Bengali numerals to standard 10-digit phone', () => {
      expect(normalizeIndianPhoneNumber('৯৮৭৬৫৪৩২১০')).toBe('9876543210');
      expect(normalizeIndianPhoneNumber('+91 ৯৮৭৬৫-৪৩২১০')).toBe('9876543210');
      expect(isValidIndianPhone('৯৮৭৬৫৪৩২১০')).toBe(true);
    });

    it('validates 10-digit mobile numbers starting with 6, 7, 8, or 9', () => {
      expect(isValidIndianPhone('9876543210')).toBe(true);
      expect(isValidIndianPhone('8877665544')).toBe(true);
      expect(isValidIndianPhone('7002001122')).toBe(true);
      expect(isValidIndianPhone('6003004455')).toBe(true);
      expect(isValidIndianPhone('+919876543210')).toBe(true);
    });

    it('rejects invalid phone numbers', () => {
      expect(isValidIndianPhone('1234567890')).toBe(false); // starts with 1
      expect(isValidIndianPhone('5432167890')).toBe(false); // starts with 5
      expect(isValidIndianPhone('98765')).toBe(false); // too short
      expect(isValidIndianPhone('9876543210123')).toBe(false); // too long
      expect(isValidIndianPhone('')).toBe(false);
    });
  });

  describe('Email Validation', () => {
    it('accepts valid email addresses', () => {
      expect(isValidEmail('rahul.sharma@example.com')).toBe(true);
      expect(isValidEmail('citizen.assam@gov.in')).toBe(true);
      expect(isValidEmail('')).toBe(true); // empty optional
    });

    it('rejects malformed email addresses', () => {
      expect(isValidEmail('rahul.sharma')).toBe(false);
      expect(isValidEmail('rahul@example')).toBe(false);
      expect(isValidEmail('rahul@.com')).toBe(false);
    });
  });

  describe('Age Validation', () => {
    it('validates reasonable age range', () => {
      expect(isValidAge(24, 18, 120)).toBe(true);
      expect(isValidAge('45', 18, 120)).toBe(true);
      expect(isValidAge('২৪', 18, 120)).toBe(true);
      expect(isValidAge('১৭', 18, 120)).toBe(false);
      expect(isValidAge(17, 18, 120)).toBe(false);
      expect(isValidAge(125, 18, 120)).toBe(false);
      expect(isValidAge('invalid', 18, 120)).toBe(false);
    });
  });

  describe('Full Name Validation', () => {
    it('validates Indian and international names', () => {
      expect(isValidFullName('Rahul Sharma')).toBe(true);
      expect(isValidFullName('राहुल शर्मा')).toBe(true);
      expect(isValidFullName('ৰাহুল শৰ্মা')).toBe(true);
      expect(isValidFullName('A')).toBe(false); // too short
      expect(isValidFullName('123456')).toBe(false); // numbers only
    });
  });

  describe('Full Form Validation', () => {
    const fields = FORM_SCHEMAS.citizen_welfare.fields;

    it('detects missing required fields', () => {
      const emptyData = {};
      const result = validateForm(fields, emptyData, 'en-IN');
      expect(result.isValid).toBe(false);
      expect(result.missingFields).toContain('full_name');
      expect(result.missingFields).toContain('phone');
      expect(result.missingFields).toContain('city');
    });

    it('passes for complete valid data', () => {
      const validData = {
        full_name: 'Rahul Sharma',
        age: 24,
        phone: '9876543210',
        email: 'rahul@example.com',
        city: 'Guwahati',
        state: 'Assam',
        address: 'House 42, Zoo Road',
        preferred_language: 'Hindi',
        additional_details: 'Ration support',
      };
      const result = validateForm(fields, validData, 'en-IN');
      expect(result.isValid).toBe(true);
      expect(result.missingFields.length).toBe(0);
      expect(Object.keys(result.errors).length).toBe(0);
    });

    it('flags invalid phone number even if filled', () => {
      const dataWithBadPhone = {
        full_name: 'Rahul Sharma',
        age: 24,
        phone: '12345',
        city: 'Guwahati',
        state: 'Assam',
        address: 'House 42, Zoo Road',
        preferred_language: 'Hindi',
      };
      const result = validateForm(fields, dataWithBadPhone, 'en-IN');
      expect(result.isValid).toBe(false);
      expect(result.invalidFields).toContain('phone');
    });
  });
});
