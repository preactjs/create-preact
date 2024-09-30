import { useLocation } from 'preact-iso';

export function Header() {
	const { url } = useLocation();

	return (
		<header class="flex justify-end bg-[#673ab8]">
			<nav class="flex items-center">
				<a href="/" class={url == '/' && 'active'}>
					Home
				</a>
				<a href="/404" class={url == '/404' && 'active'}>
					404
				</a>
			</nav>
		</header>
	);
}
