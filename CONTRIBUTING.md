# Contributing

Thank you for improving `@fast-china/eslint-config`.

## Prerequisites

- A supported Node.js version from `package.json`
- pnpm `11.x`

## Local workflow

```sh
pnpm install
pnpm typegen
pnpm check
```

Use `pnpm dev` to inspect the active Flat Config interactively while changing factories or rules.

Use `pnpm lint:fix` and `pnpm format` for safe mechanical fixes. `pnpm test` first rebuilds `dist`, then runs consumer type-contract, runtime integration, and package-contract suites. `pnpm check` is the same quality gate used by CI and adds source type-checking, full-repository linting, and formatting verification.

`src/typegen.d.ts` is generated from ESLint rule schemas and is part of the public type API. Run `pnpm typegen` after changing ESLint or plugin versions, inspect and commit the generated diff, and use `pnpm typegen:check` to verify it. Never edit the generated declaration manually.

## Changing rules or factory behavior

1. Keep correctness rules separate from formatting rules.
2. Scope every rule group with `files` unless it is intentionally global.
3. Register each plugin in a configuration that matches the same files as its rules.
4. Prefer upstream recommended configs before adding local overrides.
5. Preserve the documented JavaScript, TypeScript, and Vue behavior unless a release explicitly changes it; keep historical comparisons in the changelog rather than source comments.
6. Keep organization-specific dependency restrictions out of this general-purpose package; projects should own those policies.
7. Explain the purpose, rationale, and important exception or risk immediately above every local rule override.
8. Document every default rule's severity and valid exceptions; every generated rule entry must have explicitly reviewed incorrect and correct code rather than placeholder comments. Keep repository overrides before third-party preset rules, verify `meta.fixable` before claiming auto-fix support, run `pnpm run docs:rules` after any rule or dependency change, and keep [rules-risk.en](http://docs.fastdotnet.cn/eslint-config/rules-risk.en) plus [rules-risk](http://docs.fastdotnet.cn/eslint-config/rules-risk) synchronized.
9. Never sort a map whose key order has semantics, including conditional objects under `package.json#exports`.
10. Regenerate `src/typegen.d.ts` whenever ESLint or a bundled plugin changes; confirm new rules and changed option schemas intentionally.
11. Add or update an integration test for every parser, plugin, option, auto-fix, generated type, or public export change. The root API is intentionally limited to the Vue, UniApp, and framework-neutral project factories, their ready configurations, `defineRules`, and related types.
12. Document behavior changes in `CHANGELOG.md` and both README files.

## Pull requests

Keep changes focused and explain user-visible compatibility effects. Do not commit credentials or publish from a pull request. Changes to the Node.js, ESLint, TypeScript, Vue, React, Angular, Prettier, or module-format contract should be treated as release-significant changes.

## Releases

The package is ESM-only and publication is maintainer-controlled. Update `CHANGELOG.md` and `package.json`, commit the release state, then run:

```sh
pnpm check
pnpm pack --dry-run
pnpm publish --access public --registry https://registry.npmjs.org/
```

`prepack` reruns the complete quality gate before pnpm creates the publish archive. Inspect the dry-run list and verify that both root and `./rules` entry points contain JavaScript and declarations, together with the generated JavaScript and declaration source maps. After publication, verify the registry result and tag the exact commit:

```sh
pnpm view @fast-china/eslint-config version --registry https://registry.npmjs.org/
VERSION=$(node -p "require('./package.json').version")
git tag -a "v$VERSION" -m "release: v$VERSION"
git push origin master
git push origin "v$VERSION"
```

npm versions are immutable; never reuse an already published version.
