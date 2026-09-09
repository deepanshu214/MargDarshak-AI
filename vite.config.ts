import path from 'path';
import fs from 'fs';
import { defineConfig, loadEnv, Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import { verifyGmail, sendOtpEmail } from './services/gmailVerifyServer';

function emailAuthPlugin(): Plugin {
  return {
    name: 'email-auth-plugin',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (!req.url?.startsWith('/api/')) {
          return next();
        }

        if (req.method === 'POST') {
          let body = '';
          req.on('data', chunk => { body += chunk; });
          req.on('end', async () => {
            try {
              const data = body ? JSON.parse(body) : {};

              if (req.url === '/api/verify-gmail') {
                const result = await verifyGmail(data.email);
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify(result));
                return;
              }

              if (req.url === '/api/send-otp-email') {
                const result = await sendOtpEmail(data.email, data.code);
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify(result));
                return;
              }

              if (req.url === '/api/save-smtp-config') {
                const { gmailUser, appPassword } = data;
                if (!gmailUser || !appPassword) {
                  res.statusCode = 400;
                  res.setHeader('Content-Type', 'application/json');
                  res.end(JSON.stringify({ success: false, message: 'Missing user or password' }));
                  return;
                }
                const envPath = path.resolve(process.cwd(), '.env.local');
                let existing = fs.existsSync(envPath) ? fs.readFileSync(envPath, 'utf8') : '';
                const lines = existing.split('\n').filter(l => !l.startsWith('GMAIL_USER=') && !l.startsWith('GMAIL_APP_PASSWORD='));
                lines.push(`GMAIL_USER=${gmailUser.trim()}`);
                lines.push(`GMAIL_APP_PASSWORD=${appPassword.trim()}`);
                fs.writeFileSync(envPath, lines.join('\n') + '\n', 'utf8');
                process.env.GMAIL_USER = gmailUser.trim();
                process.env.GMAIL_APP_PASSWORD = appPassword.trim();
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({ success: true, message: 'SMTP credentials saved successfully!' }));
                return;
              }

              res.statusCode = 404;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ error: 'Endpoint not found' }));
            } catch (err: any) {
              res.statusCode = 500;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ error: err.message || 'Server error' }));
            }
          });
          return;
        }

        next();
      });
    }
  };
}

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    return {
      server: {
        port: 3000,
        host: '0.0.0.0',
      },
      plugins: [react(), emailAuthPlugin()],
      define: {
        'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
        'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY)
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      }
    };
});
