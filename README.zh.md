**简体中文** | [English](./README.md)

<p align="center">
	<img src="./Fast.png" width="128" alt="Fast.ESLint.Config Logo" />
</p>

<h1 align="center">Fast.ESLint.Config</h1>

<p align="center">
	<a href="https://www.npmjs.com/package/@fast-china/eslint-config"><img src="https://img.shields.io/npm/v/@fast-china/eslint-config?logo=npm" alt="npm version" /></a>
	<a href="https://www.npmjs.com/package/@fast-china/eslint-config"><img src="https://img.shields.io/npm/dm/@fast-china/eslint-config" alt="npm downloads" /></a>
	<a href="./LICENSE"><img src="https://img.shields.io/npm/l/@fast-china/eslint-config" alt="License" /></a>
</p>

面向 Vue 3、uni-app、TypeScript 与 Node.js 的 ESLint Flat Config，提供按需框架配置与规则类型。

**[使用文档](http://docs.fastdotnet.cn/zh-CN/frontend/eslint-config/) · [官方网站](http://fastdotnet.com)**

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

## 安装

```sh
pnpm add -D eslint typescript @fast-china/eslint-config
```

## 快速开始

在 Vue 3 项目中创建 `eslint.config.mjs`：

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

类型感知检查的源码应属于项目 tsconfig 范围。Vue 配置不包含 uni-app 平台能力。

## 常见用法

uni-app 使用独立入口，不与 Vue 完整配置叠加：

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

不绑定框架的 Node.js 项目：

```js
import { createBaseConfigs } from "@fast-china/eslint-config";

export default createBaseConfigs({ environment: "node" });
```

将项目自定义配置放在共享配置之后；`rules: {}` 留给项目按需填写。需要调整运行环境时，可使用配置工厂。Fast 生态的本地规则副本继续按各仓库 AGENTS.md 同步，不因示例而改成安装配置包。

## 公共入口

- `@fast-china/eslint-config`：具名导出两个完整配置、项目配置工厂、`defineRules`、`ProjectConfigOptions` 和 `RuleOptions`；不提供默认导出或旧入口别名。
- `@fast-china/eslint-config/configs`：框架和可选功能片段。
- `@fast-china/eslint-config/constants`：文件 glob 与 UniApp globals。
- `@fast-china/eslint-config/rules`：带类型的原始规则记录。

## Prettier

Prettier 不作为 ESLint 规则运行。默认配置只加载 `eslint-config-prettier` 关闭冲突规则；项目需要自行安装并执行格式化。

## 文档

- [完整规则手册](http://docs.fastdotnet.cn/zh-CN/frontend/eslint-config/rules/)
- [默认规则与风险指南](http://docs.fastdotnet.cn/zh-CN/frontend/eslint-config/rules-risk)
- [工程质量审查报告](./docs/engineering-audit.zh.md)
- [更新日志](./CHANGELOG.md)

完整规则手册在每个分类中优先列出仓库显式配置的规则，再列第三方预置规则；全部规则均提供直接的错误与正确代码示例。

## 开发

```sh
pnpm install --frozen-lockfile
pnpm typegen
pnpm check
```

## 贡献与安全

[贡献指南](./CONTRIBUTING.md) · [安全策略](./SECURITY.md)

## 版权、许可证与使用声明

版权所有 © 2018-Now 小方。本项目依据 [Apache License 2.0](./LICENSE) 开源；在遵守许可证的前提下，可以使用、修改和分发本软件，包括商业使用。

再分发时，应按许可证要求提供许可证副本、对修改的文件作出显著说明，并保留适用的版权和归属声明；包含需要保留的 NOTICE 信息时一并处理。本说明不替代正式许可证，也不额外要求在产品界面展示作者或项目标识。

使用者应就自身使用、二次开发、部署、数据处理及运营活动遵守适用法律和第三方合法权益，自行取得依法需要的授权。上述内容为合规提醒，不构成附加许可条件。

除适用法律另有规定或另有书面约定外，本软件按“原样”提供；保证排除与责任限制以许可证第 7、8 条为准。提供本项目不代表原作者为使用者的二次开发和运营活动背书，也不当然承担其对第三方作出的合同承诺。本说明不排除依法不得排除的责任。
