const fs = require('fs');
const https = require('https');
const http = require('http');

function fetch(url) {
  return new Promise((resolve, reject) => {
    const client = url.startsWith('https') ? https : http;
    client.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(data));
    }).on('error', reject);
  });
}

async function run() {
  try {
    console.log('Fetching main page...');
    const html = await fetch('https://davidwhyte.com/experience/');
    const scriptRegex = /<script[^>]+src=["']([^"']+)["']/gi;
    let match;
    let scripts = [];
    while ((match = scriptRegex.exec(html)) !== null) {
      let src = match[1];
      if (!src.startsWith('http')) {
        src = new URL(src, 'https://davidwhyte.com/experience/').href;
      }
      scripts.push(src);
    }
    console.log('Found scripts:', scripts);
    
    for (let src of scripts) {
      if (!src.includes('davidwhyte.com')) continue;
      console.log('\nFetching', src);
      const js = await fetch(src);
      
      // Look for fragment shaders loosely
      const glslRegex = /(uniform|varying|in|out)\s+\w+\s+\w+;[\s\S]{50,1500}?void main\s*\([^)]*\)\s*\{/g;
      const glslMatches = js.match(glslRegex);
      if (glslMatches) {
        glslMatches.forEach((m, i) => {
          console.log('\n--- SHADER ' + i + ' in ' + src.split('/').pop() + ' ---');
          console.log(m.substring(0, 800) + '...');
        });
      }

      // If that didn't work, just search for texture names
      const texNames = ['texture_mask', 'sdf', 'rgb-fractal', 'atlas', 'noise'];
      texNames.forEach(t => {
        if (js.includes(t)) {
           console.log('\nFound mention of texture:', t);
           let idx = -1;
           while ((idx = js.indexOf(t, idx + 1)) !== -1) {
             console.log('Context:', js.substring(Math.max(0, idx - 100), idx + 100).replace(/\n/g, ' '));
           }
        }
      });
      
      // Look for FBO or RenderTarget
      if (js.includes('WebGLRenderTarget')) {
         console.log('Found WebGLRenderTarget in this file!');
      }
    }
  } catch (e) {
    console.error(e);
  }
}
run();
