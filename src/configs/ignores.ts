import { defineConfig, globalIgnores } from "eslint/config";
import eslintConfigFlatGitignore from "eslint-config-flat-gitignore";
import { GLOBS_LOCKFILES } from "../constants";

/**
 * 默认忽略依赖、构建结果、缓存、生成文件、AI 技能内容和工具锁文件。
 *
 * @remarks
 * 不忽略 `src`、`public`、测试夹具或普通 Markdown 文档，避免共享配置静默漏检
 * 应由项目维护的文件。
 */
export const DEFAULT_IGNORE_PATTERNS = Object.freeze([
	"**/{.pnpm-store,node_modules}/**",
	"**/{dist,build,coverage,output,temp,tmp}/**",
	"**/{.cache,.nuxt,.output,.vercel,.nitro}/**",
	"**/{.vitepress/cache,.vite-inspect}/**",
	"**/.agents/**",
	"**/__snapshots__/**",
	"**/*.min.*",
	"**/auto-import?(s).d.ts",
	"**/components.d.ts",
	...GLOBS_LOCKFILES,
]);

/**
 * 创建全局忽略配置，并在默认集合之后追加项目自定义模式。
 *
 * @param additionalPatterns - 追加到 {@link DEFAULT_IGNORE_PATTERNS} 之后的 ESLint 全局忽略模式。
 * @returns 包含单个命名全局忽略片段的 Flat Config 数组。
 */
export const createGlobalIgnores = (additionalPatterns: readonly string[] = []): ReturnType<typeof defineConfig> =>
	defineConfig([globalIgnores([...DEFAULT_IGNORE_PATTERNS, ...additionalPatterns], "@fast-china/ignores/global")]);

/**
 * 创建读取项目 `.gitignore` 的全局忽略配置。
 *
 * @remarks
 * `.gitignore` 的查找位置由 `eslint-config-flat-gitignore` 根据 ESLint 当前工作目录确定。
 * 未找到文件时不会抛错；该片段也不会替代 {@link createGlobalIgnores} 的内置模式。
 *
 * @returns 包含 `.gitignore` 转换结果的 Flat Config 数组。
 */
export const createGitignoreConfigs = (): ReturnType<typeof defineConfig> =>
	defineConfig([
		{
			...eslintConfigFlatGitignore({ strict: false }),
			name: "@fast-china/ignores/git",
		},
	]);
