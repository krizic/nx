# cypress-project

Add cypress e2e app to test a ui library that is set up for storybook

## Usage

```bash
ng generate cypress-project ...
```

By default, Nx will search for `cypress-project` in the default collection provisioned in `angular.json`.

You can specify the collection explicitly as follows:

```bash
ng g @yolkai/storybook:cypress-project ...
```

Show what will be generated without writing to disk:

```bash
ng g cypress-project ... --dry-run
```

## Options

### js

Default: `false`

Type: `boolean`

Generate JavaScript files rather than TypeScript files

### name

Type: `string`

Library name
