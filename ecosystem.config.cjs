/**
 * PM2 ecosystem file. Run from repo root:
 *   pm2 start ecosystem.config.cjs
 *
 * Version column is read from each app's package.json (via cwd).
 */
module.exports = {
  apps: [
    {
      name: 'agentsmem',
      cwd: './agentsmem',
      script: 'node',
      args: 'dist/server.js',
      interpreter: 'none',
      env: { NODE_ENV: 'production', PORT: 3011 },
    },
    {
      name: 'agentsmem-web',
      cwd: '.',
      script: 'node_modules/.bin/next',
      args: 'start',
      interpreter: 'none',
      env: { NODE_ENV: 'production', PORT: 3010 },
    },
  ],
};
