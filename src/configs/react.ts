import eslintReact from "@eslint-react/eslint-plugin";
import { defineConfig } from "eslint/config";
import eslintPluginReactHooks from "eslint-plugin-react-hooks";
import { GLOBS_JAVASCRIPT, GLOBS_TYPESCRIPT } from "../constants";
import { reactRules } from "../rules";
import type { Linter } from "eslint";

/**
 * React 与兼容 JSX 运行时的检测设置
 *
 * @remarks
 * 该对象直接传给 `createReactConfigs()`，用于调整 React 运行时识别设置。配置会在
 * JavaScript/JSX 和 TypeScript/TSX 文件上加载对应的 `@eslint-react` 推荐预置、React
 * 官方 Hooks 推荐预置以及本库 DOM 安全规则。
 *
 * 这些字段只传给 ESLint 插件用于理解项目的 React 语义，不会改变 JSX 编译方式、自动
 * 导入 React、设置打包器别名或安装兼容运行时。
 */
export interface ReactConfigOptions {
	/**
	 * 提供 React API 与 JSX 运行时的包入口名称。
	 *
	 * 标准 React 项目保持 `"react"`；Preact 等兼容运行时可填写自身包名，使
	 * `@eslint-react` 按正确的导入来源识别组件和 API。该设置不会修改 TypeScript
	 * `jsxImportSource`、Babel、Vite 或其他构建工具配置，两侧需要由项目自行保持一致。
	 * @defaultValue `"react"`
	 */
	importSource?: string;
	/**
	 * 项目约定用于切换多态组件底层元素或组件类型的属性名。
	 *
	 * 例如 `<Button as="a" />` 中的 `as`。插件会据此理解多态组件最终渲染元素的语义，
	 * 从而提高 DOM 与可访问性相关规则的判断准确度；未采用多态组件时通常无需修改。
	 * @defaultValue `"as"`
	 */
	polymorphicPropName?: string;
	/**
	 * 供插件选择版本相关行为的 React 版本号或自动检测标记。
	 *
	 * `"detect"` 会尝试从当前项目依赖解析已安装的 React 版本。monorepo、PnP、兼容运行时
	 * 或依赖不可见的执行环境若无法可靠检测，可传入明确版本号，例如 `"19.1.0"`。
	 * 该值只影响 lint 规则判断，不会限制或安装 React 依赖版本。
	 * @defaultValue `"detect"`
	 */
	version?: string;
}

/**
 * 创建 React、JSX/TSX 与 Hooks 配置。
 *
 * @remarks
 * JavaScript 和 TypeScript 分别继承对应的 @eslint-react 推荐预置；Hooks 使用 React
 * 官方 Flat Recommended。组件、Hooks 即使不返回 JSX 也能在普通 `.js`/`.ts` 中
 * 定义，因此规则覆盖全部已启用脚本扩展名，而不仅是 `.jsx`/`.tsx`。
 *
 * @param options - React 版本、运行时导入来源与多态组件属性设置。
 * @returns React JavaScript、类型感知 TypeScript 与 Hooks Flat Config 数组。
 */
export const createReactConfigs = ({ importSource = "react", polymorphicPropName = "as", version = "detect" }: ReactConfigOptions = {}): ReturnType<
	typeof defineConfig
> => {
	const createConfig = (name: string, files: readonly string[], preset: Linter.Config): ReturnType<typeof defineConfig> =>
		defineConfig([
			{
				name,
				files: [...files],
				extends: [preset, eslintPluginReactHooks.configs.flat.recommended],
				settings: {
					"react-x": {
						importSource,
						polymorphicPropName,
						version,
					},
				},
				rules: reactRules,
			},
		]);

	return defineConfig([
		...createConfig("@fast-china/react/javascript", GLOBS_JAVASCRIPT, eslintReact.configs.recommended),
		...createConfig("@fast-china/react/typescript-type-checked", GLOBS_TYPESCRIPT, eslintReact.configs["recommended-type-checked"]),
	]);
};
