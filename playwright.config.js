// @ts-check
const { defineConfig, devices } = require('@playwright/test');

module.exports = defineConfig({
  testDir: './tests',
  timeout: 30000,
  expect: { timeout: 5000 },
  fullyParallel: false,
  retries: 0,
  workers: 1,
  reporter: 'list',
  use: {
    baseURL: 'http://localhost:8080',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  webServer: {
    command: 'node -e "const http=require(\'http\'); const fs=require(\'fs\'); const path=require(\'path\'); const root=process.cwd(); const types={html:\'text/html\',css:\'text/css\',js:\'application/javascript\',json:\'application/json\',png:\'image/png\',jpg:\'image/jpeg\',jpeg:\'image/jpeg\',webp:\'image/webp\',svg:\'image/svg+xml\',ico:\'image/x-icon\',txt:\'text/plain\'}; http.createServer((req,res)=>{ let reqPath=decodeURIComponent((req.url||\'/\').split(\'?\')[0]); if(reqPath===\'/\') reqPath=\'/index.html\'; const filePath=path.join(root, reqPath.replace(/^\\/+/,\'\')); fs.readFile(filePath,(err,data)=>{ if(err){ res.statusCode=404; res.end(\'Not found\'); return; } res.setHeader(\'Content-Type\', types[path.extname(filePath).slice(1)]||\'application/octet-stream\'); res.end(data); }); }).listen(8080); setInterval(()=>{},1<<30);"',
    port: 8080,
    reuseExistingServer: !process.env.CI,
    timeout: 10000,
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'mobile-chrome',
      use: { ...devices['Pixel 7'] },
    },
    {
      name: 'mobile-safari',
      use: { ...devices['iPhone 13'] },
    },
  ],
});
