# create-preact

Create a Vite-powered Preact app in seconds

<p align="center">
  <img src="https://github.com/preactjs/create-preact/blob/master/media/demo.gif?raw=true">
</p>

## Interactive Usage

Interactive usage will walk you through the process of creating a new Preact project, offering options for you to select from.

```sh
$ npm init preact [<project-name>]

$ yarn create preact [<project-name>]

$ pnpm create preact [<project-name>]
```

`<project-name>` is an optional argument, mainly for use in other initializers (such as `create-vite`).

## Non-interactive Usage

Non-interactive usage will create a new Preact project based upon passed CLI flags. At least one must be specified, even if it matches the default.

- `--lang`
  - Language to use for the project. Defaults to `js`
  - Options: `js`, `ts`
- `--use-router`
  - Whether to include the Preact Router. Defaults to `false`
- `--use-prerender`
  - Whether to initialize your app for prerendering. Defaults to `false`
- `--use-eslint`
  - Whether to include ESLint configuration. Defaults to `false`

## License

[MIT](https://github.com/preactjs/create-preact/blob/master/LICENSE)
