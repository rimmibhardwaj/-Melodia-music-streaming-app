const https = require('https');

const url = 'https://lrclib.net/api/search?track_name=Raanjhan&artist_name=T-Series';
console.log('Fetching:', url);

https.get(url, { headers: { 'User-Agent': 'Melodia Music Player' } }, (res) => {
  let data = '';
  res.on('data', (chunk) => data += chunk);
  res.on('end', () => console.log('Response:', res.statusCode, data));
}).on('error', (err) => console.error('Error:', err.message));
