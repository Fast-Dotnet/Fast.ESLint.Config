import { defineConfig } from "eslint/config";
import globals from "globals";
import { GLOBS_CODE, GLOBS_JAVASCRIPT, GLOBS_NODE_TOOLING } from "../constants";
import type { Linter } from "eslint";

/**
 * 应用源码可声明的运行时环境。
 *
 * - `"browser"` 仅提供浏览器全局变量。
 * - `"node"` 仅提供 Node.js 全局变量。
 * - `"universal"` 同时提供浏览器与 Node.js 全局变量。
 */
export type RuntimeEnvironment = "browser" | "node" | "universal";

/**
 * 运行时全局变量配置片段的选项
 *
 * @remarks
 * 固定项目组合会根据自身处理的语言和框架传入 `files`、`nodeFiles`。该接口仍保持独立，
 * 以便低层组合明确控制环境片段的文件范围。
 *
 * 应用代码与 Node.js 工程文件使用两个独立 Flat Config 片段，避免浏览器源码无条件获得
 * `process`、`Buffer` 等 Node.js 全局变量，也避免配置文件误报这些合法全局变量未定义。
 */
export interface EnvironmentConfigOptions {
	/**
	 * 应用代码实际运行的环境，决定 `files` 范围内注入哪组标准全局变量。
	 *
	 * `"browser"` 只注入浏览器全局变量，`"node"` 只注入 Node.js 全局变量，
	 * `"universal"` 同时注入两组。该值不会影响 `nodeFiles` 对应的工程文件；后者始终
	 * 使用 Node.js 全局变量。
	 * @defaultValue `"browser"`
	 */
	environment?: RuntimeEnvironment;
	/**
	 * 需要获得所选运行时全局变量的应用代码 glob 列表。
	 *
	 * 项目组合会把自身负责的 JavaScript、TypeScript 和框架文件范围传入这里。数组会
	 * 复制到生成配置中，不会在函数内部修改调用方传入的值。
	 * @defaultValue {@link GLOBS_CODE}
	 */
	files?: readonly string[];
	/**
	 * 当前启用且允许作为 Node.js 工程文件执行的脚本扩展名 glob 列表。
	 *
	 * 每一项都会与内置的配置文件、脚本目录、测试文件和 CLI 文件模式组合为 ESLint
	 * Flat Config 的 AND 文件条件，避免工程文件模式意外接管组合范围之外的扩展名。
	 * @defaultValue {@link GLOBS_JAVASCRIPT}
	 */
	nodeFiles?: readonly string[];
	/**
	 * 追加到应用代码环境中的项目级全局变量及其读写权限。
	 *
	 * 该记录在标准环境全局变量之后合并，所以同名条目可以覆盖预置权限。它应用于完整
	 * `files` 范围；其中属于 Node.js 工程文件的子集还会由后续片段追加标准 Node.js 全局
	 * 变量。值格式遵循 ESLint `Linter.Globals`。
	 * @defaultValue `{}`
	 */
	globals?: Linter.Globals;
}

/**
 * 创建运行时环境相关的 ESLint 配置。
 *
 * @remarks
 * 返回两个相互独立的 Flat Config 片段：第一个为应用源码配置所选环境和项目级全局
 * 变量；第二个仅命中配置、脚本、测试与 CLI 等工程文件，为它们配置 Node.js 全局变量。
 * Node 工具文件的规则覆写由 {@link createNodeToolingConfigs} 在语言规则之后应用。
 *
 * @param options - 运行时环境、目标文件范围与项目级全局变量。
 * @returns 依次包含应用运行时环境和 Node.js 工程文件环境的 Flat Config 数组。
 */
export const createEnvironmentConfigs = ({
	environment = "browser",
	files = GLOBS_CODE,
	nodeFiles = GLOBS_JAVASCRIPT,
	globals: projectGlobals = {},
}: EnvironmentConfigOptions = {}): ReturnType<typeof defineConfig> => {
	const runtimeGlobals = {
		...(environment !== "node" ? globals.browser : {}),
		...(environment !== "browser" ? globals.node : {}),
		...projectGlobals,
	};
	const nodeToolingFiles = GLOBS_NODE_TOOLING.flatMap((nodeGlob) => nodeFiles.map((fileGlob) => [nodeGlob, fileGlob]));

	return defineConfig([
		{
			name: `@fast-china/globals/${environment}`,
			files: [...files],
			languageOptions: {
				globals: runtimeGlobals,
			},
		},
		{
			name: "@fast-china/globals/node-tooling",
			files: nodeToolingFiles,
			languageOptions: {
				globals: globals.node,
			},
		},
	]);
};

/**
 * 创建 Node.js 配置、脚本、测试和 CLI 文件的末尾规则覆写。
 *
 * @remarks
 * 该片段必须放在 JavaScript 与 TypeScript 规则之后，确保工具文件可以输出日志并使用
 * CommonJS 兼容加载，而不会放宽浏览器业务源码。
 *
 * @param nodeFiles - 当前已启用的 JavaScript/TypeScript 文件 glob。
 * @returns Node 工具文件规则覆写数组。
 */
export const createNodeToolingConfigs = (nodeFiles: readonly string[] = GLOBS_JAVASCRIPT): ReturnType<typeof defineConfig> => {
	const files = GLOBS_NODE_TOOLING.flatMap((nodeGlob) => nodeFiles.map((fileGlob) => [nodeGlob, fileGlob]));

	return defineConfig([
		{
			name: "@fast-china/node-tooling",
			files,
			rules: {
				/** Node.js 配置和脚本可能需要加载 CommonJS 包，只在工具文件范围关闭 ESM `import` 限制。 */
				"@typescript-eslint/no-require-imports": "off",
				/** 构建、测试和 CLI 脚本允许把执行进度与诊断信息输出到终端。 */
				"no-console": "off",
			},
		},
	]);
};
