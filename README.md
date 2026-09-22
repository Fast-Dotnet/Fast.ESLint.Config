[简体中文](./README.zh.md) | **English**

<p align="center">
	<img src="./Fast.png" width="128" alt="Fast.ESLint.Config Logo" />
</p>

<h1 align="center">Fast.ESLint.Config</h1>

<p align="center">
	<a href="https://www.npmjs.com/package/@fast-china/eslint-config"><img src="https://img.shields.io/npm/v/@fast-china/eslint-config?logo=npm" alt="npm version" /></a>
	<a href="https://www.npmjs.com/package/@fast-china/eslint-config"><img src="https://img.shields.io/npm/dm/@fast-china/eslint-config" alt="npm downloads" /></a>
	<a href="./LICENSE"><img src="https://img.shields.io/npm/l/@fast-china/eslint-config" alt="License" /></a>
</p>

Typed ESLint Flat Config for Vue 3, uni-app, TypeScript and Node.js, with optional framework integrations.

**[Documentation](http://docs.fastdotnet.cn/en-US/frontend/eslint-config/) · [Official website](http://fastdotnet.com)**

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

## Installation

```sh
pnpm add -D eslint typescript @fast-china/eslint-config
```

## Quick start

Create `eslint.config.mjs` in the Vue 3 project:

```js
import { vueConfig } from "@fast-china/eslint-config";
import { defineConfig } from "eslint/config";

export default defineConfig([
	...vueConfig,
	{
		name: "project/custom",
		rules: {},
	},
]);
```

```sh
pnpm exec eslint .
```

Type-aware source files must belong to the project tsconfig. The Vue configuration does not include uni-app capabilities.

## Common usage

Use the independent uni-app entry rather than stacking both complete configurations:

```js
import { uniAppConfig } from "@fast-china/eslint-config";
import { defineConfig } from "eslint/config";

export default defineConfig([
	...uniAppConfig,
	{
		name: "project/custom",
		rules: {},
	},
]);
```

For framework-independent Node.js projects:

```js
import { createBaseConfigs } from "@fast-china/eslint-config";

export default createBaseConfigs({ environment: "node" });
```

Append project configuration after the shared preset; leave `rules: {}` empty until project-specific rules are needed. Use the configuration factories to customize the runtime environment. Fast repositories maintaining local rule copies continue following their own AGENTS.md synchronization policy.

## Public entries

- `@fast-china/eslint-config`: named exports for both complete configurations, the project factories, `defineRules`, `ProjectConfigOptions`, and `RuleOptions`; no default export or legacy aliases are provided.
- `@fast-china/eslint-config/configs`: framework and optional feature fragments.
- `@fast-china/eslint-config/constants`: file globs and UniApp globals.
- `@fast-china/eslint-config/rules`: typed raw rule records.

## Prettier

Prettier does not run as an ESLint rule. The defaults only load `eslint-config-prettier` to disable conflicting rules; projects install and run Prettier separately.

## Documentation

- [Complete rule reference (Chinese)](http://docs.fastdotnet.cn/en-US/frontend/eslint-config/rules/)
- [Default rules and risk guide](http://docs.fastdotnet.cn/en-US/frontend/eslint-config/rules-risk)
- [Chinese engineering audit](./docs/engineering-audit.zh.md)
- [Changelog](./CHANGELOG.md)

Each rule-reference category lists repository-explicit rules before third-party preset rules, and every rule includes direct incorrect and correct code examples.

## Development

```sh
pnpm install --frozen-lockfile
pnpm typegen
pnpm check
```

## Contribution and security

[Contributing](./CONTRIBUTING.md) · [Security policy](./SECURITY.md)

## Copyright, license and use

Copyright © 2018-Now 小方. This project uses [Apache License 2.0](./LICENSE). Use, modification, distribution and commercial use are permitted subject to its terms.

When redistributing, provide the license, mark modified files and preserve applicable copyright, attribution and supplied NOTICE information as required. This summary does not replace the license or impose additional UI attribution.

Users are responsible for the legal compliance and authorization of their own modifications, deployment, data processing and operations. This reminder is not an additional license condition.

Except as required by applicable law or agreed in writing, the software is provided on an "AS IS" basis. Sections 7 and 8 govern warranty disclaimers and liability limits. Providing the project does not endorse downstream activities or assume users' contractual commitments. This statement does not exclude liability that cannot lawfully be excluded.
