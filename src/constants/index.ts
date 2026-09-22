/**
 * `@fast-china/eslint-config/constants` 公开的文件匹配常量。
 *
 * @remarks
 * 所有模式均使用 ESLint Flat Config 的 glob 语义，可直接用于配置的 `files` 或
 * `ignores` 字段。数组常量使用只读元组类型，调用方组合时应复制而非原地修改。
 *
 * @packageDocumentation
 */

/** JavaScript 与 JSX 文件；扩展名列表与 Node.js ESM/CJS 约定保持一致。 */
export const GLOBS_JAVASCRIPT = ["**/*.{js,cjs,mjs,jsx}"] as const;

/** TypeScript 与 TSX 文件；包含 TypeScript 的 ESM/CJS 专用扩展名。 */
export const GLOBS_TYPESCRIPT = ["**/*.{ts,cts,mts,tsx}"] as const;

/** 独立 JSX 文件；用于为 Vue 等 JSX 运行时叠加组件脚本语义规则。 */
export const GLOB_JSX = "**/*.jsx";

/** 独立 TSX 文件；用于在完整 TypeScript 范围内叠加 UI 组件专项规则。 */
export const GLOB_TSX = "**/*.tsx";

/** Vue 3 单文件组件。 */
export const GLOB_VUE = "**/*.vue";

/** UniApp 原生渲染页面使用的 Vue 单文件组件。 */
export const GLOB_NVUE = "**/*.nvue";

/** Angular 组件、指令、服务等框架源码；Angular CLI 项目以 `.ts` 为标准源码扩展名。 */
export const GLOB_ANGULAR_TYPESCRIPT = "**/*.ts";

/** Angular 外部模板；内联模板由 Angular 处理器提取后复用同一模板配置。 */
export const GLOB_ANGULAR_TEMPLATE = "**/*.html";

/** 严格 JSON 文件。 */
export const GLOB_JSON = "**/*.json";
/** 允许注释与尾随逗号的 JSONC 文件。 */
export const GLOB_JSONC = "**/*.jsonc";
/** 使用 JSON5 语法的配置文件。 */
export const GLOB_JSON5 = "**/*.json5";

/** Markdown 文档。 */
export const GLOB_MARKDOWN = "**/*.md";

/** UniApp 项目允许使用注释的应用清单和页面路由配置。 */
export const GLOBS_UNIAPP_JSON = ["**/manifest.json", "**/pages.json"] as const;

/** UniApp 跨端运行时提供的公共全局变量。 */
export const UNIAPP_GLOBALS = {
	getApp: "readonly",
	getCurrentPages: "readonly",
	getCurrentSubNVue: "readonly",
	uni: "readonly",
	uniCloud: "readonly",
} as const;

/**
 * UniApp 条件编译分支中可能由目标平台注入的全局变量。
 *
 * @remarks
 * ESLint 不执行 `#ifdef`/`#endif` 预处理，因此启用 UniApp 后统一声明这些对象。它们只解决
 * 静态 `no-undef`，不会验证当前发行目标是否真的提供对应 API。
 */
export const UNIAPP_CONDITIONAL_GLOBALS = {
	dd: "readonly",
	jd: "readonly",
	ks: "readonly",
	my: "readonly",
	plus: "readonly",
	qh: "readonly",
	qq: "readonly",
	swan: "readonly",
	tt: "readonly",
	weex: "readonly",
	wx: "readonly",
} as const;

/** 默认由 JavaScript、TypeScript 和 Vue 规则处理的全部代码文件。 */
export const GLOBS_CODE = [...GLOBS_JAVASCRIPT, ...GLOBS_TYPESCRIPT, GLOB_VUE] as const;

/**
 * 应额外获得 Node.js 全局变量的工程文件。
 *
 * 这些模式还会与当前已启用的 JavaScript/TypeScript 文件模式做 AND 匹配，
 * 因而关闭 TypeScript 后不会意外让 ESLint 接管 `.ts` 文件。
 */
export const GLOBS_NODE_TOOLING = [
	"**/*.{config,setup}.{js,cjs,mjs,jsx,ts,cts,mts,tsx}",
	"**/{scripts,bin}/**/*.{js,cjs,mjs,jsx,ts,cts,mts,tsx}",
	"**/{test,tests}/**/*.{js,cjs,mjs,jsx,ts,cts,mts,tsx}",
	"**/*.{test,spec}.{js,cjs,mjs,jsx,ts,cts,mts,tsx}",
	"**/cli.{js,cjs,mjs,ts,cts,mts}",
] as const;

/** TypeScript 配置文件；它们使用 JSONC 语法并允许注释。 */
export const GLOBS_TSCONFIG = ["**/tsconfig.json", "**/tsconfig.*.json"] as const;

/** 不应交给 JSON/Markdown 解析器处理的包管理器及开发工具锁文件。 */
export const GLOBS_LOCKFILES = [
	"**/package-lock.json",
	"**/yarn.lock",
	"**/pnpm-lock.yaml",
	"**/bun.lock",
	"**/bun.lockb",
	"**/deno.lock",
	"**/skills-lock.json",
] as const;
