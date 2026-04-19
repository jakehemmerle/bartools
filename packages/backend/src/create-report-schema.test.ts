import { describe, expect, test } from 'bun:test';
import { createReportSchema } from './report-lifecycle';

// Locks in the contract that POST /reports accepts what the mobile client
// actually sends — including null locationId and the all-zeros placeholder
// UUIDs that Postgres accepts but Zod 4's strict .uuid() rejects.
describe('createReportSchema', () => {
  // Mobile-client defaults. Third group "0000" has no valid RFC 4122 version
  // nibble, so these fail z.string().uuid() but are valid Postgres UUIDs.
  const MOBILE_USER = '00000000-0000-0000-0000-000000000001';
  const MOBILE_VENUE = '00000000-0000-0000-0000-000000000001';
  const RFC_V4 = '550e8400-e29b-41d4-a716-446655440000';

  test('accepts mobile-client payload with locationId omitted', () => {
    const result = createReportSchema.safeParse({
      userId: MOBILE_USER,
      venueId: MOBILE_VENUE,
    });
    expect(result.success).toBe(true);
  });

  test('accepts mobile-client payload with locationId: null', () => {
    const result = createReportSchema.safeParse({
      userId: MOBILE_USER,
      venueId: MOBILE_VENUE,
      locationId: null,
    });
    expect(result.success).toBe(true);
  });

  test('accepts RFC 4122 v4 UUIDs', () => {
    const result = createReportSchema.safeParse({
      userId: RFC_V4,
      venueId: RFC_V4,
      locationId: RFC_V4,
    });
    expect(result.success).toBe(true);
  });

  test('rejects payload with non-UUID locationId', () => {
    const result = createReportSchema.safeParse({
      userId: MOBILE_USER,
      venueId: MOBILE_VENUE,
      locationId: 'not-a-uuid',
    });
    expect(result.success).toBe(false);
  });

  test('rejects payload with wrong-length user id', () => {
    const result = createReportSchema.safeParse({
      userId: '12345',
      venueId: MOBILE_VENUE,
    });
    expect(result.success).toBe(false);
  });

  test('rejects payload missing userId', () => {
    const result = createReportSchema.safeParse({ venueId: MOBILE_VENUE });
    expect(result.success).toBe(false);
  });

  test('rejects payload missing venueId', () => {
    const result = createReportSchema.safeParse({ userId: MOBILE_USER });
    expect(result.success).toBe(false);
  });
});
