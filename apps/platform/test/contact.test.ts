import { describe, expect, it } from 'vitest';
import { contactSchema } from '../lib/validation/contact';

/**
 * The contact form is public, so the schema is the only thing standing between the database and
 * whatever a stranger types. These are the rules the page relies on.
 */
const valid = {
  name: 'Ada Okonkwo',
  email: 'ada@example.com',
  company: '',
  topic: 'Beta access',
  message: 'We publish a deck for every unit and it takes an afternoon each time.',
  company_url_confirm: '',
};

describe('contact form rules', () => {
  it('accepts a complete message', () => {
    expect(contactSchema.safeParse(valid).success).toBe(true);
  });

  it('treats company and topic as optional', () => {
    const { company, topic, ...rest } = valid;
    expect(contactSchema.safeParse({ ...rest, company: '', topic: '' }).success).toBe(true);
  });

  it('asks for a name and a real email', () => {
    expect(contactSchema.safeParse({ ...valid, name: 'A' }).success).toBe(false);
    expect(contactSchema.safeParse({ ...valid, email: 'not-an-email' }).success).toBe(false);
  });

  it('refuses a message too short to answer', () => {
    const result = contactSchema.safeParse({ ...valid, message: 'hi' });
    expect(result.success).toBe(false);
  });

  it('refuses a message long enough to be an attack on the inbox', () => {
    expect(contactSchema.safeParse({ ...valid, message: 'x'.repeat(4001) }).success).toBe(false);
  });

  it('rejects a filled honeypot', () => {
    expect(contactSchema.safeParse({ ...valid, company_url_confirm: 'http://spam.example' }).success).toBe(false);
  });

  it('trims what it stores', () => {
    const result = contactSchema.safeParse({ ...valid, name: '  Ada Okonkwo  ', email: ' ada@example.com ' });
    expect(result.success && result.data.name).toBe('Ada Okonkwo');
    expect(result.success && result.data.email).toBe('ada@example.com');
  });
});
