import type { FormFieldDefinition, Language } from '../types';

/**
 * Normalizes Indian phone numbers:
 * Strips whitespace, dashes, parens, and leading "+91" or "0" if 10 digits follow.
 */
export function normalizeIndianPhoneNumber(rawPhone: string | number | null | undefined): string {
  if (rawPhone === null || rawPhone === undefined) return '';
  const str = String(rawPhone).trim();
  // Remove all non-digit characters
  const digits = str.replace(/\D/g, '');

  // If 12 digits and starts with 91, extract the 10 digits
  if (digits.length === 12 && digits.startsWith('91')) {
    return digits.slice(2);
  }
  // If 11 digits and starts with 0, extract the 10 digits
  if (digits.length === 11 && digits.startsWith('0')) {
    return digits.slice(1);
  }
  return digits;
}

/**
 * Validates 10-digit Indian mobile number starting with 6, 7, 8, or 9
 */
export function isValidIndianPhone(phone: string): boolean {
  const normalized = normalizeIndianPhoneNumber(phone);
  return /^[6-9]\d{9}$/.test(normalized);
}

/**
 * Validates Email Address format
 */
export function isValidEmail(email: string): boolean {
  if (!email || email.trim() === '') return true; // empty checked by required rule
  const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;
  return emailRegex.test(email.trim());
}

/**
 * Validates Full Name
 */
export function isValidFullName(name: string): boolean {
  if (!name || name.trim().length < 2) return false;
  // Should have at least some letters or Indian unicode script characters
  const hasLetters = /[\p{L}]/u.test(name);
  // Should not be purely digits
  const purelyDigits = /^\d+$/.test(name.trim());
  return hasLetters && !purelyDigits;
}

/**
 * Validates Age within reasonable range
 */
export function isValidAge(age: number | string, min = 18, max = 120): boolean {
  const num = typeof age === 'number' ? age : parseInt(String(age).trim(), 10);
  if (isNaN(num)) return false;
  return num >= min && num <= max;
}

export interface ValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
  missingFields: string[];
  invalidFields: string[];
}

export function validateSingleField(
  field: FormFieldDefinition,
  value: any,
  lang: Language = 'en-IN'
): string | null {
  const isValueEmpty =
    value === undefined ||
    value === null ||
    (typeof value === 'string' && value.trim() === '');

  if (field.required && isValueEmpty) {
    if (lang === 'hi-IN') return `${field.label['hi-IN']} भरना आवश्यक है।`;
    if (lang === 'as-IN') return `${field.label['as-IN']} পূৰণ কৰাটো প্ৰয়োজনীয়।`;
    return `${field.label['en-IN']} is required.`;
  }

  if (isValueEmpty) {
    return null; // optional and empty is valid
  }

  // Type specific validations
  if (field.id === 'phone' || field.type === 'tel') {
    if (!isValidIndianPhone(String(value))) {
      if (lang === 'hi-IN') return 'कृपया 10 अंकों का मान्य भारतीय मोबाइल नंबर दर्ज करें (6, 7, 8 या 9 से शुरू)।';
      if (lang === 'as-IN') return 'অনুগ্ৰহ কৰি ১০ টা সংখ্যাৰ বৈধ ম’বাইল নম্বৰ দিয়ক (৬, ৭, ৮ বা ৯ ৰে আৰম্ভ)।';
      return 'Please enter a valid 10-digit Indian phone number starting with 6, 7, 8, or 9.';
    }
  }

  if (field.id === 'email' || field.type === 'email') {
    if (!isValidEmail(String(value))) {
      if (lang === 'hi-IN') return 'कृपया सही ईमेल पता दर्ज करें (उदा: name@example.com)।';
      if (lang === 'as-IN') return 'অনুগ্ৰহ কৰি এটা সঠিক ইমেইল ঠিকনা দিয়ক।';
      return 'Please enter a valid email address (e.g. name@example.com).';
    }
  }

  if (field.id === 'age' || field.type === 'number') {
    const min = field.min ?? 18;
    const max = field.max ?? 120;
    if (!isValidAge(value, min, max)) {
      if (lang === 'hi-IN') return `उम्र ${min} और ${max} वर्ष के बीच होनी चाहिए।`;
      if (lang === 'as-IN') return `বয়স ${min} আৰু ${max} বছৰৰ ভিতৰত হ’ব লাগিব।`;
      return `Age must be between ${min} and ${max} years.`;
    }
  }

  if (field.id === 'full_name') {
    if (!isValidFullName(String(value))) {
      if (lang === 'hi-IN') return 'कृपया सही पूरा नाम दर्ज करें।';
      if (lang === 'as-IN') return 'অনুগ্ৰহ কৰি সঠিক সম্পূৰ্ণ নাম লিখক।';
      return 'Please enter a valid full name (at least 2 letters).';
    }
  }

  return null;
}

export function validateForm(
  fields: FormFieldDefinition[],
  values: Record<string, any>,
  lang: Language = 'en-IN'
): ValidationResult {
  const errors: Record<string, string> = {};
  const missingFields: string[] = [];
  const invalidFields: string[] = [];

  for (const field of fields) {
    const val = values[field.id];
    const isValueEmpty =
      val === undefined ||
      val === null ||
      (typeof val === 'string' && val.trim() === '');

    if (field.required && isValueEmpty) {
      missingFields.push(field.id);
      errors[field.id] = validateSingleField(field, val, lang) || 'Required field';
    } else if (!isValueEmpty) {
      const err = validateSingleField(field, val, lang);
      if (err) {
        invalidFields.push(field.id);
        errors[field.id] = err;
      }
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
    missingFields,
    invalidFields,
  };
}
