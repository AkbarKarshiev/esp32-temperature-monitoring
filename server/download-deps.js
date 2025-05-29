const fs = require('fs');
const https = require('https');
const path = require('path');

// Create directories
const libsDir = path.join(__dirname, 'public', 'libs');
const dirs = [
  'bootstrap',
  'moment', 
  'chart.js',
  'chartjs-adapter-moment',
  'hammer.js',
  'chartjs-plugin-zoom'
];

dirs.forEach(dir => {
  const dirPath = path.join(libsDir, dir);
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
});

// Files to download
const files = [
  {
    url: 'https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css',
    path: 'bootstrap.min.css'
  },
  {
    url: 'https://cdn.jsdelivr.net/npm/moment@2.29.4/moment.min.js',
    path: 'moment.min.js'
  },
  {
    url: 'https://cdn.jsdelivr.net/npm/chart.js@3.9.1/dist/chart.min.js',
    path: 'chart.min.js'
  },
  {
    url: 'https://cdn.jsdelivr.net/npm/chartjs-adapter-moment@1.0.1/dist/chartjs-adapter-moment.min.js',
    path: 'chartjs-adapter-moment.min.js'
  },
  {
    url: 'https://cdn.jsdelivr.net/npm/hammerjs@2.0.8/hammer.min.js',
    path: 'hammer.min.js'
  },
  {
    url: 'https://cdn.jsdelivr.net/npm/chartjs-plugin-zoom@1.2.1/dist/chartjs-plugin-zoom.min.js',
    path: 'chartjs-plugin-zoom.min.js'
  }
];

function downloadFile(url, filePath) {
  return new Promise((resolve, reject) => {
    const fullPath = path.join(libsDir, filePath);
    const file = fs.createWriteStream(fullPath);
    
    https.get(url, (response) => {
      response.pipe(file);
      file.on('finish', () => {
        file.close();
        console.log(`Downloaded: ${filePath}`);
        resolve();
      });
    }).on('error', (err) => {
      fs.unlink(fullPath, () => {}); // Delete the file on error
      reject(err);
    });
  });
}

async function downloadAll() {
  console.log('Downloading dependencies...');
  
  for (const file of files) {
    try {
      await downloadFile(file.url, file.path);
    } catch (error) {
      console.error(`Failed to download ${file.path}:`, error.message);
    }
  }
  
  console.log('All dependencies downloaded!');
}

downloadAll();