const https = require('https');

https.get('https://saavn.dev/api/search/songs?query=Raanjhan', (res) => {
  let data = '';
  res.on('data', (chunk) => data += chunk);
  res.on('end', () => {
    try {
      const json = JSON.parse(data);
      if (json.data && json.data.results && json.data.results.length > 0) {
        const trackId = json.data.results[0].id;
        console.log('Found track ID:', trackId);
        
        https.get(`https://saavn.dev/api/songs/${trackId}/lyrics`, (res2) => {
          let data2 = '';
          res2.on('data', (chunk) => data2 += chunk);
          res2.on('end', () => {
            console.log('Lyrics response:', data2.substring(0, 500));
          });
        });
      } else {
        console.log('No results found for Raanjhan');
      }
    } catch (e) {
      console.log('Error parsing:', e);
    }
  });
});
