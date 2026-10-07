/**
 * 根入口提供彼此独立的 Vue 3 与 UniApp 完整 ESLint 配置。
 *
 * 配置片段、glob 常量与原始规则分别由 `./configs`、`./constants` 与 `./rules` 子路径提供。
 *
 * @packageDocumentation
 */
import { defineConfig } from "eslint/config";
import { createCommonConfigs } from "./configs/common";
import { createEnvironmentConfigs, createNodeToolingConfigs } from "./configs/environment";
import { createGitignoreConfigs, createGlobalIgnores } from "./configs/ignores";
import { createImportConfigs } from "./configs/import";
import { createJavaScriptConfigs } from "./configs/javascript";
import { createJsonConfigs } from "./configs/json";
import { createPrettierConfigs } from "./configs/prettier";
import { createRegexpConfigs } from "./configs/regexp";
import { createPackageJsonSortConfigs } from "./configs/sort-package";
import { createTsconfigSortConfigs } from "./configs/sort-tsconfig";
import { createTypeScriptConfigs } from "./configs/typescript";
import { createUniAppConfigs } from "./configs/uniapp";
import { createVueConfigs, createVueJsxConfigs } from "./configs/vue";
import { GLOBS_CODE, GLOBS_JAVASCRIPT, GLOBS_TYPESCRIPT, GLOB_NVUE, GLOB_VUE } from "./constants";
import type { Linter } from "eslint";
import type { Config } from "eslint/config";
import type { RuntimeEnvironment } from "./configs/environment";
import type { RuleOptions } from "./typegen";

type RejectUnknownRuleNames<Rules extends RuleOptions> = Rules & Record<Exclude<keyof Rules, keyof RuleOptions>, never>;

/**
 * 定义带有完整规则名与选项类型检查的 ESLint 规则记录。
 *
 * @remarks
 * 该辅助函数只提供 TypeScript 类型约束，不会克隆、规范化或修改传入对象。规则记录可以
 * 直接放入 Flat Config 的 `rules` 字段，也可以与本包导出的规则记录组合。
 *
 * @typeParam Rules - 基于生成规则 schema 推断出的具体规则记录类型。
 * @param rules - 需要验证的 ESLint 规则记录；未知规则名和无效规则选项会产生类型错误。
 * @returns 原样返回传入的规则记录，并补充 ESLint `RulesRecord` 兼容类型。
 *
 * @example
 * ```ts
 * const rules = defineRules({
 *   eqeqeq: ["error", "always"],
 * });
 * ```
 */
export const defineRules = <const Rules extends RuleOptions>(rules: RejectUnknownRuleNames<Rules>): Rules & Linter.RulesRecord => rules;

export type { RuleOptions } from "./typegen";

/** Vue、UniApp 与框架无关项目完整配置共享的运行环境选项 */
export interface ProjectConfigOptions {
	/**
	 * 应用代码实际运行的环境。配置、脚本、测试和 CLI 文件始终单独获得 Node.js globals。
	 * @defaultValue `"browser"`
	 */
	environment?: RuntimeEnvironment;
}

const SCRIPT_FILES = [...GLOBS_JAVASCRIPT, ...GLOBS_TYPESCRIPT];
const UNIAPP_PROJECT_FILES = [...GLOBS_CODE, GLOB_NVUE];

const createProjectConfigs = (
	environment: RuntimeEnvironment,
	codeFiles: readonly string[],
	extraFileExtensions: readonly string[] = [],
	frameworkConfigs: readonly Config[] = []
): Config[] =>
	defineConfig([
		...createGlobalIgnores(),
		...createGitignoreConfigs(),
		...createEnvironmentConfigs({
			environment,
			files: codeFiles,
			nodeFiles: SCRIPT_FILES,
		}),
		...createCommonConfigs(codeFiles),
		...createJavaScriptConfigs(),
		...createImportConfigs(codeFiles),
		...createRegexpConfigs(codeFiles),
		...createTypeScriptConfigs(GLOBS_TYPESCRIPT, extraFileExtensions),
		...createJsonConfigs(),
		...createPackageJsonSortConfigs(),
		...createTsconfigSortConfigs(),
		...frameworkConfigs,
		...createPrettierConfigs(),
		...createNodeToolingConfigs(SCRIPT_FILES),
	]);

/**
 * 创建不绑定前端框架的 JavaScript 与 TypeScript 完整配置。
 *
 * @remarks
 * TypeScript 模块的导出成员按 SDK 公共 API 检查，内部实现保留类型推断。
 * React、Angular、Markdown 与 Lodash 等能力从 `./configs` 子路径按需组合。
 *
 * @param options - 应用源码的运行环境；默认仅注入浏览器全局变量。
 * @returns 可直接传给 `eslint.config.*` 的 Flat Config 数组。
 */
export const createBaseConfigs = ({ environment = "browser" }: ProjectConfigOptions = {}): Config[] =>
	createProjectConfigs(environment, SCRIPT_FILES);

/**
 * 创建处理 `.vue`、Vue JSX 与 Vue TSX，且不注入任何 UniApp 能力的 Vue 3 完整配置。
 *
 * @param options - 应用源码的运行环境；默认仅注入浏览器全局变量。
 * @param overrides - 追加在内置配置之后的项目级 Flat Config 覆写。
 * @returns Vue 3 项目可直接使用的 Flat Config 数组。
 */
export const createVueProjectConfigs = ({ environment = "browser" }: ProjectConfigOptions = {}, ...overrides: Config[]): Config[] =>
	defineConfig([
		...createProjectConfigs(environment, GLOBS_CODE, [".vue"], [...createVueConfigs([GLOB_VUE], [".vue"]), ...createVueJsxConfigs([".vue"])]),
		...overrides,
	]);

/**
 * 创建处理 `.vue`、`.nvue`、Vue JSX/TSX、UniApp globals 与应用清单的完整配置。
 *
 * @param options - 应用源码的运行环境；默认仅注入浏览器全局变量。
 * @param overrides - 追加在内置配置之后的项目级 Flat Config 覆写。
 * @returns UniApp 项目可直接使用的 Flat Config 数组。
 */
export const createUniAppProjectConfigs = ({ environment = "browser" }: ProjectConfigOptions = {}, ...overrides: Config[]): Config[] =>
	defineConfig([
		...createProjectConfigs(
			environment,
			UNIAPP_PROJECT_FILES,
			[".vue", ".nvue"],
			[
				...createVueConfigs([GLOB_VUE, GLOB_NVUE], [".vue", ".nvue"]),
				...createVueJsxConfigs([".vue", ".nvue"]),
				...createUniAppConfigs(UNIAPP_PROJECT_FILES),
			]
		),
		...overrides,
	]);

/** 不带项目级覆写、可直接导入使用的 Vue 3 默认配置。 */
export const vueConfig: Config[] = createVueProjectConfigs();

/** 不带项目级覆写、可直接导入使用的 UniApp 默认配置。 */
export const uniAppConfig: Config[] = createUniAppProjectConfigs();
