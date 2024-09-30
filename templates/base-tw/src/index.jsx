import { render } from 'preact';

import preactLogo from './assets/preact.svg';
import './style.css';

export function App() {
	return (
		<div>
			<a href="https://preactjs.com" target="_blank" class="flex justify-center">
				<img
					src={preactLogo}
					alt="Preact logo"
					height="160"
					width="160"
					class="mb-6 hover:drop-shadow-[0_0_2em_#673ab8aa]"
				/>
			</a>
			<h1>Get Started building Vite-powered Preact Apps </h1>
			<section class="mt-20 grid auto-cols-auto gap-4 sm:grid-cols-3 sm:gap-6">
				<Resource
					title="Learn Preact"
					description="If you're new to Preact, try the interactive tutorial to learn important concepts"
					href="https://preactjs.com/tutorial"
				/>
				<Resource
					title="Differences to React"
					description="If you're coming from React, you may want to check out our docs to see where Preact differs"
					href="https://preactjs.com/guide/v10/differences-to-react"
				/>
				<Resource
					title="Learn Vite"
					description="To learn more about Vite and how you can customize it to fit your needs, take a look at their excellent documentation"
					href="https://vitejs.dev"
				/>
			</section>
		</div>
	);
}

function Resource(props) {
	return (
		<a
			href={props.href}
			target="_blank"
			class="py-3 px-6 rounded-lg text-left text-[#222] bg-[#f1f1f1] border border-transparent hover:border-[#000] shadow-[0_25px_50px_-12px_#673ab888] dark:text-[#ccc] dark:bg-[#161616] dark:hover:border-[#bbb]"
		>
			<h2>{props.title}</h2>
			<p>{props.description}</p>
		</a>
	);
}

render(<App />, document.getElementById('app'));
