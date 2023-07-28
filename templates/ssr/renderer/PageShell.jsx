import { PageContextProvider } from './usePageContext'

export { PageShell }

function PageShell({ pageContext, children }) {
  return (
	<PageContextProvider pageContext={pageContext}>
		<main>{children}</main>
	</PageContextProvider>
  )
}
