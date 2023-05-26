#!/usr/bin/env node
import { promises as fs, existsSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import * as prompts from '@clack/prompts';
import { install, projectInstall } from 'pkg-install';
import * as kl from 'kolorist';

(async function createPreact() {
	prompts.intro(kl.lightMagenta('Preact - Fast 3kB alternative to React with the same modern API'));

	const { dir, language, useRouter, useESLint } = await prompts.group(
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
	const useTS = language === 'ts';

	const s = prompts.spinner();

	const targetDir = resolve(process.cwd(), dir);

	s.start('Setting up your project directory...');
	await scaffold(targetDir, { useTS, useRouter, useESLint });
	s.stop(kl.green('Set up project directory'));

	const packageManager = /yarn/.test(process.env.npm_execpath) ? 'yarn' : 'npm';

	s.start('Installing project dependencies...');
	await installDeps(targetDir, packageManager, { useTS, useRouter, useESLint });
	s.stop(kl.green('Installed project dependencies'));

	const gettingStarted = `
		${kl.dim('$')} ${kl.lightBlue(`cd ${dir}`)}
		${kl.dim('$')} ${kl.lightBlue(`${packageManager === 'npm' ? 'npm run' : 'yarn'} dev`)}
	`;
	prompts.note(gettingStarted.trim().replace(/^\t\t/gm, ''), 'Getting Started');

	prompts.outro(kl.green(`You're all set!`));
})();

/**
 * Copy template files to user's chosen directory
 *
 * @param {string} to
 * @param {object} opts
 * @param {boolean} opts.useTS
 * @param {boolean} opts.useRouter
 * @param {boolean} opts.useESLint
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

	if (opts.useTS) {
		await fs.rename(resolve(to, 'jsconfig.json'), resolve(to, 'tsconfig.json'));

		const htmlPath = resolve(to, 'index.html');
		const html = (await fs.readFile(htmlPath, 'utf-8')).replace('index.jsx', 'index.tsx');
		return await fs.writeFile(htmlPath, html);
	}

	if (opts.useESLint) {
		const pkgPath = resolve(to, 'package.json');
		const pkg = JSON.parse(await fs.readFile(pkgPath, 'utf-8'));
		pkg.eslintConfig = {
			extends: 'preact',
		};
		await fs.writeFile(pkgPath, JSON.stringify(pkg, null, '\t'));
	}

	// Publishing to npm renames the .gitignore to .npmignore
	// https://github.com/npm/npm/issues/7252#issuecomment-253339460
	await fs.rename(resolve(to, '_gitignore'), resolve(to, '.gitignore'));
}

/**
 * Recursive fs copy, adopted from create-wmr
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
			await fs.copyFile(filename, resolve(to, f));
		}),
	);
	return results.flat(99);
}

/**
 * @param {string} to
 * @param {'yarn' | 'npm'} packageManager
 * @param {object} opts
 * @param {boolean} opts.useTS
 * @param {boolean} opts.useRouter
 * @param {boolean} opts.useESLint
 */
async function installDeps(to, packageManager, opts) {
	await projectInstall({ prefer: packageManager, cwd: to });

	if (opts.useTS) {
		await install(['typescript'], { prefer: packageManager, cwd: to, dev: true });
	}

	if (opts.useRouter) {
		await install(['preact-iso', 'preact-render-to-string'], {
			prefer: packageManager,
			cwd: to,
		});
	}

	if (opts.useESLint) {
		await install(['eslint', 'eslint-config-preact'], {
			prefer: packageManager,
			cwd: to,
			dev: true,
		});
	}
}
