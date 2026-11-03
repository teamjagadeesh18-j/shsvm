import { spawn } from 'child_process';
import http from 'http';

const chromeProc = spawn('C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', [
  '--headless=new',
  '--no-sandbox',
  '--disable-gpu',
  '--remote-debugging-port=9222',
  'about:blank'
]);

setTimeout(() => {
  http.get({ host: '::1', port: 9222, path: '/json/version' }, res => {
    let data = '';
    res.on('data', c => data += c);
    res.on('end', () => {
      console.log('SUCCESS! Version info:', data);
      chromeProc.kill();
      process.exit(0);
    });
  }).on('error', err => {
    console.error('HTTP ERROR:', err.message);
    chromeProc.kill();
    process.exit(1);
  });
}, 3000);
