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
      let cachedOrganizationId = null;
      let cachedLoginOrganizationFields = null;
      let cachedLoginPayloadPreview = null;

      const buildLoginPayloadPreview = (payload) => {
        if (!payload || typeof payload !== 'object') return null;

        const accessToken = typeof payload.accessToken === 'string' ? payload.accessToken : null;

        return {
          ...payload,
          accessTokenPreview: accessToken ? `${accessToken.slice(0, 12)}...` : null,
          accessTokenPresent: Boolean(accessToken),
          accessToken: undefined,
        };
      };

      const buildHotelDetailDebugInfo = (organizationId) => ({
        organizationId: organizationId || cachedOrganizationId || null,
        organizationSource: organizationId ? 'fallback' : (cachedOrganizationId ? 'login' : 'none'),
        loginOrganizationId: cachedOrganizationId || null,
        loginOrganizationFields: cachedLoginOrganizationFields,
        loginPayloadPreview: cachedLoginPayloadPreview,
      });

      const extractOrganizationIdFromLoginPayload = (payload) => payload?.organizationId
        || payload?.organization_id
        || payload?.orgId
        || payload?.org_id
        || payload?.app?.orgId
        || payload?.app?.organizationId
        || payload?.app?.org_id
        || payload?.app?.organization_id
        || payload?.organization?.id
        || payload?.org?.id
        || payload?.user?.organizationId
        || payload?.account?.organizationId
        || null;

      const getLoginOrganizationFields = (payload) => ({
        organization_id: payload?.organization_id ?? null,
        organizationId: payload?.organizationId ?? null,
        org_id: payload?.org_id ?? null,
        orgId: payload?.orgId ?? null,
        appOrgId: payload?.app?.orgId ?? null,
        appOrganizationId: payload?.app?.organizationId ?? null,
        appOrg_id: payload?.app?.org_id ?? null,
        appOrganization_id: payload?.app?.organization_id ?? null,
        organization: payload?.organization ?? null,
        org: payload?.org ?? null,
        userOrganizationId: payload?.user?.organizationId ?? null,
        accountOrganizationId: payload?.account?.organizationId ?? null,
      });

      const extractCentraHotelId = (imageUrls = []) => {
        const urls = Array.isArray(imageUrls) ? imageUrls : [];
        for (const url of urls) {
          const match = String(url).match(/\/(HT-[A-Z0-9]+)\//i);
          if (match) return match[1];
        }
        return null;
      };

      const extractCentraOrganizationId = (imageUrls = []) => {
        const urls = Array.isArray(imageUrls) ? imageUrls : [];
        for (const url of urls) {
          const match = String(url).match(/\/(ORG-[A-Z0-9]+)\//i);
          if (match) return match[1];
        }
        return null;
      };

      const buildPartnerUrl = (apiBaseUrl, endpointPath) => {
        const base = String(apiBaseUrl || '').replace(/\/$/, '');
        const endpoint = String(endpointPath || '');

        if (base.endsWith('/api') && endpoint.startsWith('/api/')) {
          return `${base}${endpoint.slice(4)}`;
        }

        return `${base}${endpoint}`;
      };

  return {
    name: 'partner-api-dev',
    configureServer(server) {
      // ── shared helpers ──
      const sendJson = (res, statusCode, body) => {
        const json = JSON.stringify(body);
        res.writeHead(statusCode, {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(json),
        });
        res.end(json);
      };

      const getEnv = () => {
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
          throw new Error(`Missing env vars: ${missing.join(', ')}. Check your .env file.`);
        }

        return { apiBaseUrl, clientId, clientSecret };
      };

      const appLogin = async (apiBaseUrl, clientId, clientSecret) => {
        const loginUrl = `${apiBaseUrl}/apps/login`;
        console.log(`[partner-api] POST ${loginUrl}  (clientId: ${clientId.substring(0, 16)}...)`);

        const loginRes = await fetch(loginUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ clientId, clientSecret }),
        });

        const contentType = loginRes.headers.get('content-type') || '';
        const rawBody = await loginRes.text();

        console.log(`[partner-api] Login response: status=${loginRes.status}, content-type=${contentType}, body=${rawBody}`);

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
        console.log(`[partner-api] Login response JSON: ${JSON.stringify(loginBody, null, 2)}`);
        console.log(`[partner-api] Login payload JSON: ${JSON.stringify(payload, null, 2)}`);
        const loginOrganizationFields = getLoginOrganizationFields(payload);
        if (!payload.accessToken) {
          throw new Error(
            `Login succeeded (${loginRes.status}) but no accessToken in response.\n` +
            `  Response keys: ${JSON.stringify(Object.keys(loginBody))}\n` +
            `  Payload keys: ${JSON.stringify(Object.keys(payload))}\n` +
            `  Full response: ${rawBody.substring(0, 500)}`
          );
        }

        cachedToken = payload.accessToken;
        cachedOrganizationId = extractOrganizationIdFromLoginPayload(payload);
        cachedLoginOrganizationFields = loginOrganizationFields;
        cachedLoginPayloadPreview = buildLoginPayloadPreview(payload);
        tokenExpiresAt = Date.now() + ((payload.expiresIn || 3600) - 60) * 1000;
        console.log(`[partner-api] Login organization fields: ${JSON.stringify(loginOrganizationFields)}`);
        console.log(`[partner-api] Login OK — token cached, expires in ${payload.expiresIn || 3600}s, organizationId=${cachedOrganizationId || 'none'}`);
        return cachedToken;
      };

      const getValidToken = async (apiBaseUrl, clientId, clientSecret) => {
        // if (cachedToken && Date.now() < tokenExpiresAt) return cachedToken;
        return appLogin(apiBaseUrl, clientId, clientSecret);
      };

      /**
       * Fetch from the partner API with token management and 401 retry.
       */
      const partnerFetch = async (apiBaseUrl, clientId, clientSecret, endpointPath, organizationId) => {
        let token = await getValidToken(apiBaseUrl, clientId, clientSecret);
        let resolvedOrganizationId = organizationId || cachedOrganizationId;
        const debugInfo = buildHotelDetailDebugInfo(organizationId);

        const url = buildPartnerUrl(apiBaseUrl, endpointPath);
        console.log(`[partner-api] GET ${url}`);
        if (/\/partner\/hotels\/[^/]+\/content$/i.test(endpointPath)) {
          console.log(`[partner-api] Final x-organization-id: ${resolvedOrganizationId || 'none'} (source: ${debugInfo.organizationSource})`);
        }

        let apiRes = await fetch(url, {
          headers: {
            Authorization: `Bearer ${token}`,
            ...(resolvedOrganizationId ? { 'x-organization-id': resolvedOrganizationId } : {}),
          },
        });

        console.log(`[partner-api] Response: status=${apiRes.status}`);

        // retry once on 401
        if (apiRes.status === 401) {
          console.log('[partner-api] Got 401 — refreshing token and retrying...');
          cachedToken = null;
          cachedLoginPayloadPreview = null;
          cachedLoginOrganizationFields = null;
          token = await appLogin(apiBaseUrl, clientId, clientSecret);
          resolvedOrganizationId = organizationId || cachedOrganizationId;
          const retryDebugInfo = buildHotelDetailDebugInfo(organizationId);
          if (/\/partner\/hotels\/[^/]+\/content$/i.test(endpointPath)) {
            console.log(`[partner-api] Final retry x-organization-id: ${resolvedOrganizationId || 'none'} (source: ${retryDebugInfo.organizationSource})`);
          }
          apiRes = await fetch(url, {
            headers: {
              Authorization: `Bearer ${token}`,
              ...(resolvedOrganizationId ? { 'x-organization-id': resolvedOrganizationId } : {}),
            },
          });
          console.log(`[partner-api] Retry response: status=${apiRes.status}`);
        }

        const resContentType = apiRes.headers.get('content-type') || '';
        const rawBody = await apiRes.text();

        if (!apiRes.ok) {
          throw new Error(
            `Partner API fetch failed — GET ${url} returned ${apiRes.status}.\n` +
            `  Content-Type: ${resContentType}\n` +
            `  Body: ${rawBody.substring(0, 500)}`
          );
        }

        if (!resContentType.includes('application/json')) {
          throw new Error(
            `Partner API fetch — GET ${url} returned non-JSON response.\n` +
            `  Content-Type: ${resContentType}\n` +
            `  Body (first 300 chars): ${rawBody.substring(0, 300)}`
          );
        }

        let body;
        try {
          body = JSON.parse(rawBody);
        } catch (parseErr) {
          throw new Error(
            `Partner API fetch — could not parse JSON from GET ${url}.\n` +
            `  Parse error: ${parseErr.message}\n` +
            `  Body (first 300 chars): ${rawBody.substring(0, 300)}`
          );
        }

        if (!body.success) {
          throw new Error(
            `Partner API fetch — API returned success=false.\n` +
            `  Message: ${body.message || 'none'}\n` +
            `  Code: ${body.code || 'none'}\n` +
            `  Full response: ${rawBody.substring(0, 500)}`
          );
        }

        return body.data;
      };

      // ── Route: GET /api/partner/hotels[?id=:id] ──
      server.middlewares.use(async (req, res, next) => {
        const url = new URL(req.url || '', 'http://localhost');
        if (url.pathname !== '/api/partner/hotels') return next();
        if (req.method !== 'GET') {
          sendJson(res, 405, { success: false, error: 'Method not allowed' });
          return;
        }

        try {
          const { apiBaseUrl, clientId, clientSecret } = getEnv();
          const hotelId = url.searchParams.get('id');
          const data = await partnerFetch(
            apiBaseUrl,
            clientId,
            clientSecret,
            hotelId ? `/api/partner/hotels/${hotelId}/content` : '/partner/hotels/content?limit=all'
          );

          if (hotelId) {
            console.log(`[partner-api] Success — returning hotel ${hotelId}`);
            sendJson(res, 200, { success: true, data });
            return;
          }

          const count = Array.isArray(data) ? data.length : 'N/A';
          console.log(`[partner-api] Success — returning ${count} hotels`);
          sendJson(res, 200, { success: true, data });
        } catch (err) {
          console.error(`[partner-api] ERROR:\n${err.message}`);
          sendJson(res, 500, { success: false, error: err.message });
        }
      });

      // ── Route: GET /api/partner/hotels/:id/content ──
      server.middlewares.use(async (req, res, next) => {
        const match = req.url?.match(/^\/api\/partner\/hotels\/([^/?]+)\/content(?:\?.*)?$/);
        if (!match) return next();
        if (req.method !== 'GET') {
          sendJson(res, 405, { success: false, error: 'Method not allowed' });
          return;
        }

        const hotelId = decodeURIComponent(match[1]);

        try {
          const { apiBaseUrl, clientId, clientSecret } = getEnv();
          const endpoint = `/api/partner/hotels/${hotelId}/content`;
          let data;
          let debug;
          let fallbackAttempted = false;
          try {
            console.log(`[partner-api] Attempting detail fetch with organization source: ${cachedOrganizationId ? 'login' : 'none'}`);
            data = await partnerFetch(apiBaseUrl, clientId, clientSecret, endpoint);
            debug = {
              hotelId,
              requestOrganizationId: null,
              fallbackAttempted,
              ...buildHotelDetailDebugInfo(),
            };
          } catch (err) {
            fallbackAttempted = true;
            console.log(`[partner-api] Initial detail fetch failed, attempting organization fallback for ${hotelId}: ${err.message}`);
            const hotels = await partnerFetch(apiBaseUrl, clientId, clientSecret, '/partner/hotels/content?limit=all');
            const matchedHotel = Array.isArray(hotels)
              ? hotels.find((item) => extractCentraHotelId(item.image_urls) === hotelId)
              : null;
            const organizationId = matchedHotel ? extractCentraOrganizationId(matchedHotel.image_urls) : undefined;
            console.log(`[partner-api] Matched hotel from list: ${matchedHotel ? JSON.stringify({
              id: matchedHotel.id,
              centraHotelId: extractCentraHotelId(matchedHotel.image_urls),
              organizationId,
              firstImageUrl: matchedHotel.image_urls?.[0] || null,
            }) : 'not found'}`);
            console.log(`[partner-api] Resolved organizationId: ${organizationId || 'not found'}`);
            console.log(`[partner-api] Retrying detail fetch with fallback organizationId: ${organizationId || 'none'}`);
            data = await partnerFetch(apiBaseUrl, clientId, clientSecret, endpoint, organizationId);
            debug = {
              hotelId,
              requestOrganizationId: organizationId || null,
              fallbackAttempted,
              ...buildHotelDetailDebugInfo(organizationId),
            };
          }
          console.log(`[partner-api] Upstream endpoint called: ${apiBaseUrl}${endpoint}`);
          console.log(`[partner-api] Upstream parsed response: ${JSON.stringify(data)}`);
          console.log(`[partner-api] Success — returning hotel ${hotelId}`);
          sendJson(res, 200, { success: true, data, debug });
        } catch (err) {
          console.error(`[partner-api] ERROR (hotel ${hotelId}):\n${err.message}`);
          sendJson(res, 500, {
            success: false,
            error: err.message,
            debug: {
              hotelId,
              requestOrganizationId: req.headers['x-partner-organization-id'] || null,
              ...buildHotelDetailDebugInfo(req.headers['x-partner-organization-id']),
            },
          });
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
