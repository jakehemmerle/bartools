import { describe, test, expect } from 'bun:test';
import {
  nameCorrect,
  volumeAbsErr,
  nameAccSummary,
  volumeMaeSummary,
} from './evaluators';

const args = (
  out: { name?: string; volume?: number; error?: string },
  ref: { name?: string; volume?: number },
) => ({
  outputs: { file: 'IMG_TEST.jpg', ...out },
  referenceOutputs: ref,
});

describe('nameCorrect', () => {
  test('exact match scores 1 with expected/got comment', async () => {
    const result = await nameCorrect(
      args({ name: 'Verbena Gin' }, { name: 'Verbena Gin' }),
    );
    expect(result.key).toBe('name_correct');
    expect(result.score).toBe(1);
    expect(result.comment).toBe('expected="Verbena Gin" got="Verbena Gin"');
  });

  test('different names score 0 and comment includes both', async () => {
    const result = await nameCorrect(
      args({ name: 'Verbena Vodka' }, { name: 'Verbena Gin' }),
    );
    expect(result.score).toBe(0);
    expect(result.comment).toContain('Verbena Gin');
    expect(result.comment).toContain('Verbena Vodka');
  });

  test('empty outputs.name vs non-empty reference scores 0', async () => {
    const result = await nameCorrect(
      args({ name: '', error: 'model refused' }, { name: 'Verbena Gin' }),
    );
    expect(result.score).toBe(0);
    expect(result.comment).toBe('expected="Verbena Gin" got=""');
  });

  test('both empty scores 1', async () => {
    // Technically "match". This is acceptable because empty-vs-empty would
    // only happen in adversarial input — the seed/sync layer filters out
    // unlabeled rows before they reach evaluators.
    const result = await nameCorrect(args({ name: '' }, { name: '' }));
    expect(result.score).toBe(1);
  });
});

describe('volumeAbsErr', () => {
  test('equal volumes score 0', async () => {
    const result = await volumeAbsErr(
      args({ volume: 0.5 }, { volume: 0.5 }),
    );
    expect(result.key).toBe('volume_abs_err');
    expect(result.score).toBe(0);
  });

  test('0.5 vs 0.8 scores ~0.3', async () => {
    const result = await volumeAbsErr(
      args({ volume: 0.5 }, { volume: 0.8 }),
    );
    expect(result.score).toBeCloseTo(0.3, 5);
  });

  test('1.0 vs 0.0 scores 1', async () => {
    const result = await volumeAbsErr(
      args({ volume: 1.0 }, { volume: 0.0 }),
    );
    expect(result.score).toBe(1);
  });

  test('missing outputs.volume falls back to 0', async () => {
    const result = await volumeAbsErr(
      args({ error: 'timeout' }, { volume: 0.4 }),
    );
    expect(result.score).toBeCloseTo(0.4, 5);
  });

  test('negative output volume is handled defensively', async () => {
    const result = await volumeAbsErr(
      args({ volume: -0.1 }, { volume: 0.5 }),
    );
    expect(result.score).toBeCloseTo(0.6, 5);
  });
});

describe('nameAccSummary', () => {
  test('empty outputs return 0', async () => {
    const result = await nameAccSummary({ outputs: [], referenceOutputs: [] });
    expect(result.key).toBe('name_acc');
    expect(result.score).toBe(0);
  });

  test('two rows, one hit → 0.5', async () => {
    const result = await nameAccSummary({
      outputs: [{ name: 'Verbena Gin' }, { name: 'Wrong' }],
      referenceOutputs: [{ name: 'Verbena Gin' }, { name: 'Verbena Vodka' }],
    });
    expect(result.score).toBe(0.5);
  });
});

describe('volumeMaeSummary', () => {
  test('empty outputs return 0', async () => {
    const result = await volumeMaeSummary({ outputs: [], referenceOutputs: [] });
    expect(result.key).toBe('volume_mae');
    expect(result.score).toBe(0);
  });

  test('two rows (|0.5-0.8| + |1.0-1.0|) / 2 = 0.15', async () => {
    const result = await volumeMaeSummary({
      outputs: [{ volume: 0.5 }, { volume: 1.0 }],
      referenceOutputs: [{ volume: 0.8 }, { volume: 1.0 }],
    });
    expect(result.score).toBeCloseTo(0.15, 5);
  });
});
