const fs = require('fs');

async function testFetch() {
    const form = new FormData();
    form.append('prompt', 'A test prompt');
    form.append('ratio', '9:16');
    form.append('imageCount', '1');

    const buffer = fs.readFileSync('test.png');
    const blob = new Blob([buffer], { type: 'image/png' });
    form.append('image0', blob, 'test.png');

    const res = await fetch('http://localhost:3000/api/generate-video', {
        method: 'POST',
        body: form,
    });
    const data = await res.json();
    console.log('Status:', res.status);
    console.dir(data, { depth: null });
}
testFetch().catch(console.error);
