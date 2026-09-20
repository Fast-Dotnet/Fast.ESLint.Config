<p align="left">
	<a href="./README.zh.md">简体中文</a> | <strong>English</strong>
</p>

<p align="center">
	<img src="./Fast.png" alt="logo" width="160" />
</p>

# @fast-china/eslint-config

**[Documentation](http://docs.fastdotnet.cn/eslint-config/) · [Official website](http://fastdotnet.com)**

A practical ESLint Flat Config for Vue 3, UniApp, SDKs, Node.js, React, Angular, TypeScript, and JavaScript projects.

The policy starts from common ecosystem conventions and concise, readable code. It then prioritizes real bugs and type safety, consistency, and finally Fast project preferences. It does not force unusual rewrites merely to satisfy ESLint.

## Highlights

- ESLint 10 with native Flat Config only.
- Separate complete configurations for Vue 3 and UniApp; plain Vue projects do not receive UniApp globals, `.nvue` parsing, or manifest behavior.
- TypeScript uses `recommendedTypeChecked` and Project Service without the complete strict or stylistic presets.
- Exported `.ts`, `.mts`, and `.cts` boundaries are treated as SDK public APIs; `.tsx` retains full type safety and normal component return inference.
- SDKs and applications share one JavaScript, TypeScript, Import, and RegExp policy.
- `package.json` and `tsconfig*.json` sorting is enabled by default; React, Angular, Markdown, and Lodash compose explicitly from `./configs`.
- Schema-generated `RuleOptions` provides precise rule-name and option completion.

## Requirements

- Node.js `^22.18.0` or `^24.18.0`
- ESLint `^10.0.0`
- TypeScript `^6.0.0`

```sh
pnpm add -D eslint typescript @fast-china/eslint-config
```

## Vue 3

```js
import { vueConfig } from "@fast-china/eslint-config";
import { defineConfig } from "eslint/config";

export default defineConfig([
	...vueConfig,
	{
		name: "project/custom",
		rules: {
			"no-console": "warn",
		},
	},
]);
```

This entry covers JavaScript, type-aware TypeScript, Vue SFCs, and standalone `.jsx`/`.tsx` components used by Vue projects. Vue JSX/TSX keeps checks for explicit emits, duplicate keys, readonly props, reactivity loss, and reserved component names without inheriting template-only kebab-case, attribute-order, or `v-text`/`v-html` rules. The entry also includes JSON, Import, RegExp, `.gitignore`, and Prettier compatibility without loading UniApp capabilities.

## UniApp

[Full configuration and examples](http://docs.fastdotnet.cn/eslint-config/guide.en)

## Factories and project overrides

[Full configuration and examples](http://docs.fastdotnet.cn/eslint-config/guide.en)

## TypeScript policy

[Full configuration and examples](http://docs.fastdotnet.cn/eslint-config/guide.en)

## JavaScript, Import, and Vue policy

[Full configuration and examples](http://docs.fastdotnet.cn/eslint-config/guide.en)

## React and Angular

[Full configuration and examples](http://docs.fastdotnet.cn/eslint-config/guide.en)

## Optional capabilities and manifest sorting

[Full configuration and examples](http://docs.fastdotnet.cn/eslint-config/guide.en)

## Public entries

- `@fast-china/eslint-config`: named exports for both complete configurations, the project factories, `defineRules`, `ProjectConfigOptions`, and `RuleOptions`; no default export or legacy aliases are provided.
- `@fast-china/eslint-config/configs`: framework and optional feature fragments.
- `@fast-china/eslint-config/constants`: file globs and UniApp globals.
- `@fast-china/eslint-config/rules`: typed raw rule records.

## Prettier

Prettier does not run as an ESLint rule. The defaults only load `eslint-config-prettier` to disable conflicting rules; projects install and run Prettier separately.

## Documentation

- [Complete rule reference (Chinese)](http://docs.fastdotnet.cn/eslint-config/rules/)
- [Default rules and risk guide](http://docs.fastdotnet.cn/eslint-config/rules-risk.en)
- [Chinese engineering audit](./docs/engineering-audit.zh.md)
- [Changelog](./CHANGELOG.md)

Each rule-reference category lists repository-explicit rules before third-party preset rules, and every rule includes direct incorrect and correct code examples.

## Development

```sh
pnpm install --frozen-lockfile
pnpm typegen
pnpm check
```
