import { describe, it } from 'node:test';
import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';

// Note: To successfully run these tests, the Next.js development server must be running.

describe('POST /api/generate-video', () => {

    it('should return 400 if no prompt is provided', async () => {
        const formData = new FormData();
        formData.append('imageCount', '1');
        // We do not append prompt to test security handler

        const res = await fetch('http://localhost:3000/api/generate-video', {
            method: 'POST',
            body: formData,
        });

        const data = await res.json();
        assert.strictEqual(res.status, 400);
        assert.ok(data.error.includes('Invalid prompt'));
    });

    it('should return 400 if no image count is attached', async () => {
        const formData = new FormData();
        formData.append('prompt', 'A cinematic test');
        formData.append('imageCount', '0');

        const res = await fetch('http://localhost:3000/api/generate-video', {
            method: 'POST',
            body: formData,
        });

        const data = await res.json();
        assert.strictEqual(res.status, 400);
        assert.strictEqual(data.error, 'No character image uploaded');
    });

    it('should return 400 if primary image is missing but count > 0', async () => {
        const formData = new FormData();
        formData.append('prompt', 'A cinematic test');
        formData.append('imageCount', '1');

        const res = await fetch('http://localhost:3000/api/generate-video', {
            method: 'POST',
            body: formData,
        });

        const data = await res.json();
        assert.strictEqual(res.status, 400);
        assert.strictEqual(data.error, 'Primary character image missing');
    });

    // In a real environment we would mock GoogleGenAI to test the 200 OK
    // But this integration test gives us immediate safety feedback constraints
});
