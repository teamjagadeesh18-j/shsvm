import http from 'http';

http.get({ host: '::1', port: 9222, path: '/json/version' }, (res) => {
  console.log('Chrome is listening');
}).on('error', (err) => {
  console.log('No Chrome process running on 9222 right now');
});

