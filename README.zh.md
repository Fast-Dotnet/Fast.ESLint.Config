<p align="left">
	<strong>简体中文</strong> | <a href="./README.md">English</a>
</p>

<p align="center">
	<img src="./Fast.png" alt="logo" width="160" />
</p>

# @fast-china/eslint-config

**[使用文档](http://docs.fastdotnet.cn/eslint-config/) · [官方网站](http://fastdotnet.com)**

面向 Vue 3、UniApp、SDK、Node.js、React、Angular、TypeScript 与 JavaScript 项目的实用型 ESLint Flat Config。

规则取舍遵循：先尊重社区通用写法并保持代码简洁、易读，再依次考虑真实 Bug / 类型安全、代码一致性和 Fast 系列项目偏好。不会为了满足 ESLint 强制改写语义正常、普遍使用的代码。

## 特性

- 基于 ESLint 10，仅提供原生 Flat Config。
- Vue 3 与 UniApp 使用两个独立完整配置；普通 Vue 项目不会获得 UniApp globals、`.nvue` 解析或清单适配。
- TypeScript 使用 `recommendedTypeChecked` 与 Project Service，不叠加完整 strict/stylistic 预置。
- `.ts`、`.mts`、`.cts` 导出边界按 SDK 公共 API 对待；`.tsx` 保留完整类型安全和常见组件返回类型推断。
- JavaScript、TypeScript、Import 与 RegExp 规则在 SDK 和应用项目之间保持一致。
- 默认统一排序 `package.json` 和 `tsconfig*.json`；React、Angular、Markdown 和 Lodash 通过 `./configs` 按需组合。
- 根据规则 schema 生成精确 `RuleOptions`，提供规则名和选项自动补全。

## 环境要求

- Node.js `^22.18.0` 或 `^24.18.0`
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

该入口处理 JavaScript、类型感知 TypeScript、Vue SFC，以及 Vue 项目常用的独立 `.jsx`/`.tsx` 组件文件；Vue JSX/TSX 继续检查显式 emits、重复键、只读 props、响应性丢失和保留组件名，但不会套用模板专属的 kebab-case、模板属性排序或 `v-text`/`v-html` 规则。配置同时包含 JSON、Import、RegExp、`.gitignore` 和 Prettier 兼容规则，但不包含任何 UniApp 能力。

## UniApp

[完整配置与示例](http://docs.fastdotnet.cn/eslint-config/guide)

## 工厂与项目覆写

[完整配置与示例](http://docs.fastdotnet.cn/eslint-config/guide)

## TypeScript 策略

[完整配置与示例](http://docs.fastdotnet.cn/eslint-config/guide)

## JavaScript、Import 与 Vue 策略

[完整配置与示例](http://docs.fastdotnet.cn/eslint-config/guide)

## React 与 Angular

[完整配置与示例](http://docs.fastdotnet.cn/eslint-config/guide)

## 可选能力与清单排序

[完整配置与示例](http://docs.fastdotnet.cn/eslint-config/guide)

## 公共入口

- `@fast-china/eslint-config`：具名导出两个完整配置、项目配置工厂、`defineRules`、`ProjectConfigOptions` 和 `RuleOptions`；不提供默认导出或旧入口别名。
- `@fast-china/eslint-config/configs`：框架和可选功能片段。
- `@fast-china/eslint-config/constants`：文件 glob 与 UniApp globals。
- `@fast-china/eslint-config/rules`：带类型的原始规则记录。

## Prettier

Prettier 不作为 ESLint 规则运行。默认配置只加载 `eslint-config-prettier` 关闭冲突规则；项目需要自行安装并执行格式化。

## 文档

- [完整规则手册](http://docs.fastdotnet.cn/eslint-config/rules/)
- [默认规则与风险指南](http://docs.fastdotnet.cn/eslint-config/rules-risk)
- [工程质量审查报告](./docs/engineering-audit.zh.md)
- [更新日志](./CHANGELOG.md)

完整规则手册在每个分类中优先列出仓库显式配置的规则，再列第三方预置规则；全部规则均提供直接的错误与正确代码示例。

## 开发

```sh
pnpm install --frozen-lockfile
pnpm typegen
pnpm check
```
