import path from 'node:path';
import { fileURLToPath } from 'node:url';
import react from '@vitejs/plugin-react';
import { createLogger, defineConfig, loadEnv } from 'vite';
import inlineEditPlugin from './plugins/visual-editor/vite-plugin-react-inline-editor.js';
import editModeDevPlugin from './plugins/visual-editor/vite-plugin-edit-mode.js';
import iframeRouteRestorationPlugin from './plugins/vite-plugin-iframe-route-restoration.js';

const isDev = process.env.NODE_ENV !== 'production';
const __dirname = path.dirname(fileURLToPath(import.meta.url));

/**
 * Vite dev-server middleware that serves /api/partner/hotels locally,
 * mirroring the Vercel serverless function. Credentials stay server-side.
 *
 * All partner-API logic is inlined here to avoid dynamic-import issues on Windows.
 */
function partnerApiDevPlugin() {
  // ── token cache (lives for the lifetime of the dev server) ──
  let cachedToken = null;
  let tokenExpiresAt = 0;

  return {
    name: 'partner-api-dev',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        // Only handle our specific route
        if (req.url !== '/api/partner/hotels') return next();
        if (req.method !== 'GET') {
          res.writeHead(405, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ success: false, error: 'Method not allowed' }));
          return;
        }

        const sendJson = (statusCode, body) => {
          const json = JSON.stringify(body);
          res.writeHead(statusCode, {
            'Content-Type': 'application/json',
            'Content-Length': Buffer.byteLength(json),
          });
          res.end(json);
        };

        try {
          const env = loadEnv('development', process.cwd(), '');
          const apiBaseUrl = env.API_BASE_URL;
          const clientId = env.PARTNER_APP_CLIENT_ID;
          const clientSecret = env.PARTNER_APP_CLIENT_SECRET;

          if (!apiBaseUrl || !clientId || !clientSecret) {
            const missing = [
              !apiBaseUrl && 'API_BASE_URL',
              !clientId && 'PARTNER_APP_CLIENT_ID',
              !clientSecret && 'PARTNER_APP_CLIENT_SECRET',
            ].filter(Boolean);
            console.error(`[partner-api] Missing env vars: ${missing.join(', ')}`);
            sendJson(500, {
              success: false,
              error: `Missing env vars: ${missing.join(', ')}. Check your .env file.`,
            });
            return;
          }

          // ── helper: app login ──
          const appLogin = async () => {
            const loginUrl = `${apiBaseUrl}/apps/login`;
            console.log(`[partner-api] POST ${loginUrl}  (clientId: ${clientId.substring(0, 16)}...)`);

            const loginRes = await fetch(loginUrl, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ clientId, clientSecret }),
            });

            const contentType = loginRes.headers.get('content-type') || '';
            const rawBody = await loginRes.text();

            console.log(`[partner-api] Login response: status=${loginRes.status}, content-type=${contentType}, body=${rawBody.substring(0, 300)}`);

            if (!loginRes.ok) {
              throw new Error(
                `Login failed — POST ${loginUrl} returned ${loginRes.status}.\n` +
                `  Content-Type: ${contentType}\n` +
                `  Body: ${rawBody.substring(0, 500)}`
              );
            }

            if (!contentType.includes('application/json')) {
              throw new Error(
                `Login failed — POST ${loginUrl} returned non-JSON response.\n` +
                `  Content-Type: ${contentType}\n` +
                `  Body (first 300 chars): ${rawBody.substring(0, 300)}`
              );
            }

            let loginBody;
            try {
              loginBody = JSON.parse(rawBody);
            } catch (parseErr) {
              throw new Error(
                `Login failed — could not parse JSON from POST ${loginUrl}.\n` +
                `  Parse error: ${parseErr.message}\n` +
                `  Body (first 300 chars): ${rawBody.substring(0, 300)}`
              );
            }

            const payload = loginBody.data ?? loginBody;
            if (!payload.accessToken) {
              throw new Error(
                `Login succeeded (${loginRes.status}) but no accessToken in response.\n` +
                `  Response keys: ${JSON.stringify(Object.keys(loginBody))}\n` +
                `  Payload keys: ${JSON.stringify(Object.keys(payload))}\n` +
                `  Full response: ${rawBody.substring(0, 500)}`
              );
            }

            cachedToken = payload.accessToken;
            tokenExpiresAt = Date.now() + ((payload.expiresIn || 3600) - 60) * 1000;
            console.log(`[partner-api] Login OK — token cached, expires in ${payload.expiresIn || 3600}s`);
            return cachedToken;
          };

          // ── get a valid token ──
          let token = (cachedToken && Date.now() < tokenExpiresAt)
            ? cachedToken
            : await appLogin();

          // ── fetch hotels ──
          const hotelsUrl = `${apiBaseUrl}/partner/hotels/content?limit=all`;
          console.log(`[partner-api] GET ${hotelsUrl}`);

          let hotelsRes = await fetch(hotelsUrl, {
            headers: { Authorization: `Bearer ${token}` },
          });

          console.log(`[partner-api] Hotels response: status=${hotelsRes.status}`);

          // retry once on 401
          if (hotelsRes.status === 401) {
            console.log('[partner-api] Got 401 — refreshing token and retrying...');
            cachedToken = null;
            token = await appLogin();
            hotelsRes = await fetch(hotelsUrl, {
              headers: { Authorization: `Bearer ${token}` },
            });
            console.log(`[partner-api] Hotels retry response: status=${hotelsRes.status}`);
          }

          const hotelsContentType = hotelsRes.headers.get('content-type') || '';
          const hotelsRaw = await hotelsRes.text();

          if (!hotelsRes.ok) {
            throw new Error(
              `Hotel fetch failed — GET ${hotelsUrl} returned ${hotelsRes.status}.\n` +
              `  Content-Type: ${hotelsContentType}\n` +
              `  Body: ${hotelsRaw.substring(0, 500)}`
            );
          }

          if (!hotelsContentType.includes('application/json')) {
            throw new Error(
              `Hotel fetch failed — GET ${hotelsUrl} returned non-JSON response.\n` +
              `  Content-Type: ${hotelsContentType}\n` +
              `  Body (first 300 chars): ${hotelsRaw.substring(0, 300)}`
            );
          }

          let hotelsBody;
          try {
            hotelsBody = JSON.parse(hotelsRaw);
          } catch (parseErr) {
            throw new Error(
              `Hotel fetch — could not parse JSON from GET ${hotelsUrl}.\n` +
              `  Parse error: ${parseErr.message}\n` +
              `  Body (first 300 chars): ${hotelsRaw.substring(0, 300)}`
            );
          }

          if (!hotelsBody.success) {
            throw new Error(
              `Hotel fetch — API returned success=false.\n` +
              `  Message: ${hotelsBody.message || 'none'}\n` +
              `  Code: ${hotelsBody.code || 'none'}\n` +
              `  Full response: ${hotelsRaw.substring(0, 500)}`
            );
          }

          const count = Array.isArray(hotelsBody.data) ? hotelsBody.data.length : 'N/A';
          console.log(`[partner-api] Success — returning ${count} hotels`);

          sendJson(200, { success: true, data: hotelsBody.data });
        } catch (err) {
          console.error(`[partner-api] ERROR:\n${err.message}`);
          sendJson(500, { success: false, error: err.message });
        }
      });
    },
  };
}

const configHorizonsViteErrorHandler = `
const observer = new MutationObserver((mutations) => {
	for (const mutation of mutations) {
		for (const addedNode of mutation.addedNodes) {
			if (
				addedNode.nodeType === Node.ELEMENT_NODE &&
				(
					addedNode.tagName?.toLowerCase() === 'vite-error-overlay' ||
					addedNode.classList?.contains('backdrop')
				)
			) {
				handleViteOverlay(addedNode);
			}
		}
	}
});

observer.observe(document.documentElement, {
	childList: true,
	subtree: true
});

function handleViteOverlay(node) {
	if (!node.shadowRoot) {
		return;
	}

	const backdrop = node.shadowRoot.querySelector('.backdrop');

	if (backdrop) {
		const overlayHtml = backdrop.outerHTML;
		const parser = new DOMParser();
		const doc = parser.parseFromString(overlayHtml, 'text/html');
		const messageBodyElement = doc.querySelector('.message-body');
		const fileElement = doc.querySelector('.file');
		const messageText = messageBodyElement ? messageBodyElement.textContent.trim() : '';
		const fileText = fileElement ? fileElement.textContent.trim() : '';
		const error = messageText + (fileText ? ' File:' + fileText : '');

		window.parent.postMessage({
			type: 'horizons-vite-error',
			error,
		}, '*');
	}
}
`;

const configHorizonsRuntimeErrorHandler = `
window.onerror = (message, source, lineno, colno, errorObj) => {
	const errorDetails = errorObj ? JSON.stringify({
		name: errorObj.name,
		message: errorObj.message,
		stack: errorObj.stack,
		source,
		lineno,
		colno,
	}) : null;

	window.parent.postMessage({
		type: 'horizons-runtime-error',
		message,
		error: errorDetails
	}, '*');
};
`;

const configHorizonsConsoleErrroHandler = `
const originalConsoleError = console.error;
console.error = function(...args) {
	originalConsoleError.apply(console, args);

	let errorString = '';

	for (let i = 0; i < args.length; i++) {
		const arg = args[i];
		if (arg instanceof Error) {
			errorString = arg.stack || \`\${arg.name}: \${arg.message}\`;
			break;
		}
	}

	if (!errorString) {
		errorString = args.map(arg => typeof arg === 'object' ? JSON.stringify(arg) : String(arg)).join(' ');
	}

	window.parent.postMessage({
		type: 'horizons-console-error',
		error: errorString
	}, '*');
};
`;

const configWindowFetchMonkeyPatch = `
const originalFetch = window.fetch;

window.fetch = function(...args) {
	const url = args[0] instanceof Request ? args[0].url : args[0];

	// Skip WebSocket URLs
	if (url.startsWith('ws:') || url.startsWith('wss:')) {
		return originalFetch.apply(this, args);
	}

	return originalFetch.apply(this, args)
		.then(async response => {
			const contentType = response.headers.get('Content-Type') || '';

			// Exclude HTML document responses
			const isDocumentResponse =
				contentType.includes('text/html') ||
				contentType.includes('application/xhtml+xml');

			if (!response.ok && !isDocumentResponse) {
					const responseClone = response.clone();
					const errorFromRes = await responseClone.text();
					const requestUrl = response.url;
					console.error(\`Fetch error from \${requestUrl}: \${errorFromRes}\`);
			}

			return response;
		})
		.catch(error => {
			if (!url.match(/\.html?$/i)) {
				console.error(error);
			}

			throw error;
		});
};
`;

const addTransformIndexHtml = {
	name: 'add-transform-index-html',
	transformIndexHtml(html) {
		const tags = [
			{
				tag: 'script',
				attrs: { type: 'module' },
				children: configHorizonsRuntimeErrorHandler,
				injectTo: 'head',
			},
			{
				tag: 'script',
				attrs: { type: 'module' },
				children: configHorizonsViteErrorHandler,
				injectTo: 'head',
			},
			{
				tag: 'script',
				attrs: {type: 'module'},
				children: configHorizonsConsoleErrroHandler,
				injectTo: 'head',
			},
			{
				tag: 'script',
				attrs: { type: 'module' },
				children: configWindowFetchMonkeyPatch,
				injectTo: 'head',
			},
		];

		if (!isDev && process.env.TEMPLATE_BANNER_SCRIPT_URL && process.env.TEMPLATE_REDIRECT_URL) {
			tags.push(
				{
					tag: 'script',
					attrs: {
						src: process.env.TEMPLATE_BANNER_SCRIPT_URL,
						'template-redirect-url': process.env.TEMPLATE_REDIRECT_URL,
					},
					injectTo: 'head',
				}
			);
		}

		return {
			html,
			tags,
		};
	},
};

console.warn = () => {};

const logger = createLogger()
const loggerError = logger.error

logger.error = (msg, options) => {
	if (options?.error?.toString().includes('CssSyntaxError: [postcss]')) {
		return;
	}

	loggerError(msg, options);
}

export default defineConfig({
	customLogger: logger,
	plugins: [
		...(isDev ? [inlineEditPlugin(), editModeDevPlugin(), iframeRouteRestorationPlugin(), partnerApiDevPlugin()] : []),
		react(),
		addTransformIndexHtml
	],
	server: {
		cors: true,
		headers: {
			'Cross-Origin-Embedder-Policy': 'credentialless',
		},
		allowedHosts: true,
	},
	resolve: {
		extensions: ['.jsx', '.js', '.tsx', '.ts', '.json', ],
		alias: {
			'@': path.resolve(__dirname, './src'),
		},
	},
	build: {
		rollupOptions: {
			external: [
				'@babel/parser',
				'@babel/traverse',
				'@babel/generator',
				'@babel/types'
			]
		}
	}
});
