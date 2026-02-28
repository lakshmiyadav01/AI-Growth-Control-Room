import { describe, it } from 'node:test';
import assert from 'node:assert';
import { calculateHookScore } from '../src/lib/scoring';

describe('Scoring Logic', () => {

    it('should return default baselines for empty or simple text', () => {
        const result = calculateHookScore("Simple hook");
        assert.ok(result.retention >= 50);
        assert.ok(result.emotion >= 50);
        assert.strictEqual(result.overall, 50);
    });

    it('should boost retention for optimal length', () => {
        // Optimal length is 8-18 words
        const hook = "This is a great hook that has exactly ten words to score.";
        const result = calculateHookScore(hook);
        assert.ok(result.retention > 50);
    });

    it('should detect curiosity from question marks and specific words', () => {
        const hook = "What if I told you the secret?";
        const result = calculateHookScore(hook);
        assert.ok(result.curiosity > 50);
    });

    it('should max out at 100 for all attributes', () => {
        const intenseHook = "Secret secret secret! What if what if how? Stop now don't never today today today! Ultimate power reclaim superhuman power.";
        const result = calculateHookScore(intenseHook);
        assert.ok(result.emotion <= 100);
        assert.ok(result.curiosity <= 100);
        assert.ok(result.impact <= 100);
        assert.ok(result.retention <= 100);
    });
});
