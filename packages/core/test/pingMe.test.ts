import { pingMe } from '../src';
import { describe, it, expect } from 'vitest';

describe('pingMe', () => {
  it('should run without throwing', () => {
    expect(() => pingMe({ url: 'http://example.com', log: () => {} })).not.toThrow();
  });
});