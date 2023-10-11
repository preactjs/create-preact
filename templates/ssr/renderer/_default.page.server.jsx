export { render };
// See https://vike.dev/data-fetching
export const passToClient = ['pageProps', 'urlPathname'];

import { renderToString } from 'preact-render-to-string';
import { PageShell } from './PageShell';
import { escapeInject, dangerouslySkipEscape } from 'vike/server';

async function render(pageContext) {
	const { Page, pageProps } = pageContext;
	// This render() hook only supports SSR, see https://vike.dev/render-modes for how to modify render() to support SPA
	if (!Page) throw new Error('My render() hook expects pageContext.Page to be defined');
	const pageHtml = renderToString(
		<PageShell pageContext={pageContext}>
			<Page {...pageProps} />
		</PageShell>,
	);

	// See https://vike.dev/head
	const { documentProps } = pageContext.exports;
	const title = (documentProps && documentProps.title) || 'Vite SSR + Preact';
	const desc =
		(documentProps && documentProps.description) || 'Preact app with Vite and vike';

	const documentHtml = escapeInject`<!DOCTYPE html>
		<html lang="en">
		<head>
			<meta charset="UTF-8" />
			<link rel="icon" type="image/svg+xml" href="/vite.svg" />
			<meta name="viewport" content="width=device-width, initial-scale=1.0" />
			<meta name="color-scheme" content="light dark" />
			<meta name="description" content="${desc}" />
			<title>${title}</title>
		</head>
		<body>
			<div id="app">${dangerouslySkipEscape(pageHtml)}</div>
		</body>
		</html>`;

	return {
		documentHtml,
		pageContext: {
			// We can add some `pageContext` here, which is useful if we want to do page redirection https://vike.dev/page-redirection
		},
	};
}
