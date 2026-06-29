import { describe, it, expect } from 'vitest';
import { validateFileSize, checkPageCountDivisibility } from './validation';

describe('validateFileSize', () => {
  // Boundary values: < 50MB = 'ok', >= 50MB && < 100MB = 'warn', >= 100MB = 'reject'
  const MB_50 = 52428800;  // 50 * 1024 * 1024
  const MB_100 = 104857600; // 100 * 1024 * 1024

  it('returns "ok" for 0 bytes', () => {
    expect(validateFileSize(0)).toBe('ok');
  });

  it('returns "ok" for 1 byte', () => {
    expect(validateFileSize(1)).toBe('ok');
  });

  it('returns "ok" for 52428799 bytes (50MB - 1 byte)', () => {
    expect(validateFileSize(52428799)).toBe('ok');
  });

  it('returns "warn" for 52428800 bytes (exactly 50MB)', () => {
    expect(validateFileSize(52428800)).toBe('warn');
  });

  it('returns "warn" for 52428801 bytes (50MB + 1 byte)', () => {
    expect(validateFileSize(52428801)).toBe('warn');
  });

  it('returns "warn" for 104857599 bytes (100MB - 1 byte)', () => {
    expect(validateFileSize(104857599)).toBe('warn');
  });

  it('returns "reject" for 104857600 bytes (exactly 100MB)', () => {
    expect(validateFileSize(104857600)).toBe('reject');
  });

  it('returns "reject" for 104857601 bytes (100MB + 1 byte)', () => {
    expect(validateFileSize(104857601)).toBe('reject');
  });

  it('returns "reject" for very large files', () => {
    expect(validateFileSize(1_000_000_000)).toBe('reject');
  });

  it('uses correct boundary constants', () => {
    // Verify constants
    expect(MB_50).toBe(52428800);
    expect(MB_100).toBe(104857600);
  });
});

describe('checkPageCountDivisibility', () => {
  it('returns { divisible: true, blanksNeeded: 0 } for 4 pages', () => {
    expect(checkPageCountDivisibility(4)).toEqual({ divisible: true, blanksNeeded: 0 });
  });

  it('returns { divisible: true, blanksNeeded: 0 } for 8 pages', () => {
    expect(checkPageCountDivisibility(8)).toEqual({ divisible: true, blanksNeeded: 0 });
  });

  it('returns { divisible: true, blanksNeeded: 0 } for 12 pages', () => {
    expect(checkPageCountDivisibility(12)).toEqual({ divisible: true, blanksNeeded: 0 });
  });

  it('returns { divisible: true, blanksNeeded: 0 } for 16 pages', () => {
    expect(checkPageCountDivisibility(16)).toEqual({ divisible: true, blanksNeeded: 0 });
  });

  it('returns { divisible: false, blanksNeeded: 3 } for 1 page', () => {
    expect(checkPageCountDivisibility(1)).toEqual({ divisible: false, blanksNeeded: 3 });
  });

  it('returns { divisible: false, blanksNeeded: 2 } for 2 pages', () => {
    expect(checkPageCountDivisibility(2)).toEqual({ divisible: false, blanksNeeded: 2 });
  });

  it('returns { divisible: false, blanksNeeded: 1 } for 3 pages', () => {
    expect(checkPageCountDivisibility(3)).toEqual({ divisible: false, blanksNeeded: 1 });
  });

  it('returns { divisible: false, blanksNeeded: 3 } for 5 pages', () => {
    expect(checkPageCountDivisibility(5)).toEqual({ divisible: false, blanksNeeded: 3 });
  });

  it('returns { divisible: false, blanksNeeded: 1 } for 7 pages', () => {
    expect(checkPageCountDivisibility(7)).toEqual({ divisible: false, blanksNeeded: 1 });
  });

  it('returns { divisible: false, blanksNeeded: 3 } for 9 pages', () => {
    expect(checkPageCountDivisibility(9)).toEqual({ divisible: false, blanksNeeded: 3 });
  });

  it('returns { divisible: false, blanksNeeded: 3 } for 17 pages', () => {
    expect(checkPageCountDivisibility(17)).toEqual({ divisible: false, blanksNeeded: 3 });
  });

  it('returns { divisible: true, blanksNeeded: 0 } for 20 pages', () => {
    expect(checkPageCountDivisibility(20)).toEqual({ divisible: true, blanksNeeded: 0 });
  });

  it('returns { divisible: true, blanksNeeded: 0 } for 24 pages', () => {
    expect(checkPageCountDivisibility(24)).toEqual({ divisible: true, blanksNeeded: 0 });
  });
});
