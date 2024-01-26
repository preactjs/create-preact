#!/usr/bin/env node
import { promises as fs, existsSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import * as prompts from '@clack/prompts';
import { installPackage, detectPackageManager } from '@antfu/install-pkg';
import * as kl from 'kolorist';

const s = prompts.spinner();
const brandColor = /** @type {const} */ ([174, 128, 255]);

(async function createPreact() {
	// Silences the 'Getting Started' info, mainly
	// for use in other initializers that may wrap this
	// one but provide their own scripts/instructions.
	//
	// Don't love the flag, need to find a better name.
	const skipHint = process.argv.slice(2).includes('--skip-hints');
	const packageManager =
		(await detectPackageManager()) ??
		(/yarn/.test(process.env.npm_execpath)
			? 'yarn'
			: process.env.PNPM_PACKAGE_NAME
			? 'pnpm'
			: 'npm');

	prompts.intro(
		kl.trueColor(...brandColor)(
			'Preact - Fast 3kB alternative to React with the same modern API',
		),
	);

	const { dir, language, useRouter, usePrerender, useESLint } = await prompts.group(
		{
			dir: () =>
				prompts.text({
					message: 'Project directory:',
					placeholder: 'my-preact-app',
					validate(value) {
						if (value.length == 0) {
							return 'Directory name is required!';
						} else if (existsSync(value)) {
							return 'Refusing to overwrite existing directory or file! Please provide a non-clashing name.';
						}
					},
				}),
			language: () =>
				prompts.select({
					message: 'Project language:',
					initialValue: 'js',
					options: [
						{ value: 'js', label: 'JavaScript' },
						{ value: 'ts', label: 'TypeScript' },
					],
				}),
			useRouter: () =>
				prompts.confirm({
					message: 'Use router?',
					initialValue: false,
				}),
			usePrerender: () =>
				prompts.confirm({
					message: 'Prerender app (SSG)?',
					initialValue: false,
				}),
			useESLint: () =>
				prompts.confirm({
					message: 'Use ESLint?',
					initialValue: false,
				}),
		},
		{
			onCancel: () => {
				prompts.cancel(kl.yellow('Cancelled'));
				process.exit(0);
			},
		},
	);
	const targetDir = resolve(process.cwd(), dir);
	const useTS = language === 'ts';

	await useSpinner(
		'Setting up your project directory...',
		() => scaffold(targetDir, { useTS, useRouter, usePrerender, useESLint }),
		'Set up project directory',
	);

	await useSpinner(
		'Installing project dependencies...',
		() => installDeps(targetDir, packageManager, { useTS, useRouter, usePrerender, useESLint }),
		'Installed project dependencies',
	);

	if (!skipHint) {
		const gettingStarted = `
			${kl.dim('$')} ${kl.lightBlue(`cd ${dir}`)}
			${kl.dim('$')} ${kl.lightBlue(
			`${
				packageManager.includes('yarn')
					? 'yarn'
					: packageManager.includes('pnpm')
					? 'pnpm'
					: 'npm run'
			} dev`,
		)}
		`;
		prompts.note(gettingStarted.trim().replace(/^\t\t\t/gm, ''), 'Getting Started');
	}

	prompts.outro(kl.green(`You're all set!`));
})();

/**
 * @param {string} startMessage
 * @param {() => Promise<void>} fn
 * @param {string} finishMessage
 */
async function useSpinner(startMessage, fn, finishMessage) {
	s.start(startMessage);
	await fn();
	s.stop(kl.green(finishMessage));
}

/**
 * @typedef {Object} ConfigOptions
 * @property {boolean} useTS
 * @property {boolean} useRouter
 * @property {boolean} usePrerender
 * @property {boolean} useESLint
 */

/**
 * Copy template files to user's chosen directory
 *
 * @param {string} to
 * @param {ConfigOptions} opts
 */
async function scaffold(to, opts) {
	await fs.mkdir(to, { recursive: true });

	const __dirname = dirname(fileURLToPath(import.meta.url));
	await templateDir(resolve(__dirname, '../templates', 'base'), to, opts.useTS);

	if (opts.useRouter) {
		await templateDir(
			resolve(__dirname, '../templates', 'config', 'router'),
			resolve(to, 'src'),
			opts.useTS,
		);
	}

	if (opts.usePrerender) {
		await templateDir(
			resolve(
				__dirname,
				'../templates',
				'config',
				opts.useRouter ? 'prerender-router' : 'prerender',
			),
			to,
			opts.useTS,
		);

		const htmlPath = resolve(to, 'index.html');
		const html = (await fs.readFile(htmlPath, 'utf-8')).replace('<script', '<script prerender');
		await fs.writeFile(htmlPath, html);
	}

	if (opts.useTS) {
		await fs.rename(resolve(to, 'jsconfig.json'), resolve(to, 'tsconfig.json'));

		const htmlPath = resolve(to, 'index.html');
		const html = (await fs.readFile(htmlPath, 'utf-8')).replace('index.jsx', 'index.tsx');
		await fs.writeFile(htmlPath, html);
	}

	if (opts.useESLint) {
		const pkgPath = resolve(to, 'package.json');
		const pkg = JSON.parse(await fs.readFile(pkgPath, 'utf-8'));
		pkg.eslintConfig = {
			extends: 'preact',
		};
		await fs.writeFile(pkgPath, JSON.stringify(pkg, null, '\t'));
	}
}

/**
 * Recursive fs copy, swiped from `create-wmr`:
 * https://github.com/preactjs/wmr/blob/3c5672ecd2f958c8eaf372d33c084dc69228ae3f/packages/create-wmr/src/index.js#L108-L124
 *
 * @param {string} from
 * @param {string} to
 * @param {boolean} useTS
 */
async function templateDir(from, to, useTS) {
	const files = await fs.readdir(from);
	const results = await Promise.all(
		files.map(async (f) => {
			if (f == '.' || f == '..') return;
			const filename = resolve(from, f);
			if ((await fs.stat(filename)).isDirectory()) {
				await fs.mkdir(resolve(to, f), { recursive: true });
				return templateDir(filename, resolve(to, f), useTS);
			}
			if (useTS && /\.jsx?$/.test(f)) f = f.replace('.js', '.ts');
			// Publishing to npm renames the .gitignore to .npmignore
			// https://github.com/npm/npm/issues/7252#issuecomment-253339460
			if (f === '_gitignore') f = '.gitignore';
			await fs.copyFile(filename, resolve(to, f));
		}),
	);
	return results.flat(99);
}

/**
 * @param {string} to
 * @param {import('@antfu/install-pkg').Agent} packageManager
 * @param {ConfigOptions} opts
 */
async function installDeps(to, packageManager, opts) {
	await installPackage(['preact'], { packageManager, cwd: to });

	if (opts.useTS) {
		await installPackage(['typescript'], { packageManager, cwd: to, dev: true });
	}

	if (opts.useRouter || opts.usePrerender) {
		await installPackage(['preact-iso', 'preact-render-to-string'], {
			packageManager,
			cwd: to,
		});
	}

	if (opts.useESLint) {
		await installPackage(['eslint', 'eslint-config-preact'], {
			packageManager,
			cwd: to,
			dev: true,
		});
	}
}
