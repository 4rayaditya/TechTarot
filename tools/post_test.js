const http = require('http');
const data = JSON.stringify({ title: 'Test Card', desc: 'short desc', mode: 'witty', deep: true });

const options = {
    hostname: 'localhost',
    port: 3000,
    path: '/api/reading',
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(data)
    }
};

const req = http.request(options, res => {
    let raw = '';
    res.on('data', chunk => raw += chunk);
    res.on('end', () => {
        console.log('STATUS', res.statusCode);
        console.log('BODY', raw);
    });
});
req.on('error', e => console.error('ERROR', e));
req.write(data);
req.end();
