import angularPlugin from "@angular-eslint/eslint-plugin";
import angularTemplatePlugin from "@angular-eslint/eslint-plugin-template";
import angularTemplateParser from "@angular-eslint/template-parser";
import { defineConfig } from "eslint/config";
import { GLOB_ANGULAR_TEMPLATE, GLOB_ANGULAR_TYPESCRIPT } from "../constants";
import { angularRules, angularTemplateAccessibilityRules, angularTemplateRules } from "../rules";
import type { ESLint, Linter } from "eslint";

/**
 * Angular TypeScript 源码与 HTML 模板检查的细分选项
 *
 * @remarks
 * 该对象直接传给 `createAngularConfigs()`。Angular 配置始终包含框架 TypeScript 规则
 * 和外部 `.html` 模板基础规则，本接口只控制成本或迁移影响较高的可选部分。
 *
 * 这些选项不会修改 Angular 编译器、CLI 或模板类型检查配置。调用方应先组合
 * `createBaseConfigs()`，以提供统一的类型感知 TypeScript 配置。
 */
export interface AngularConfigOptions {
	/**
	 * 是否使用 Angular 官方 processor，从 TypeScript 文件的
	 * `@Component({ template: ... })` 元数据中提取内联 HTML 并复用模板规则进行检查。
	 *
	 * 关闭后仍会检查 Angular TypeScript 源码和外部 `.html` 模板，只是不再处理组件中的
	 * 内联模板。大型项目若主要使用外部模板，或 processor 与其他工具发生冲突，可暂时关闭。
	 * @defaultValue `true`
	 */
	inlineTemplates?: boolean;
	/**
	 * 是否在模板基础正确性规则之外启用 Angular 模板无障碍规则组。
	 *
	 * 该规则组检查替代文本、键盘交互、焦点、表单标签和 ARIA 等可访问性问题，适用于
	 * 外部模板与已提取的内联模板。关闭后仍保留模板语法、严格比较和现代控制流等基础规则。
	 * 对旧项目而言可能一次产生较多报告，建议在确认迁移计划后再决定是否临时关闭。
	 * @defaultValue `true`
	 */
	templateAccessibility?: boolean;
}

/**
 * 创建 Angular TypeScript、外部 HTML 模板与内联模板配置。
 *
 * @remarks
 * Angular 支持依赖基础配置先注册 typescript-eslint 解析器；模板由
 * Angular 专用 parser 解析，内联模板通过官方 processor 复用同一套 HTML 规则。
 *
 * @param options - 控制内联模板处理与模板无障碍规则的 Angular 选项。
 * @returns 按 TypeScript 源码、外部模板顺序排列的 ESLint Flat Config 数组。
 */
export const createAngularConfigs = ({ inlineTemplates = true, templateAccessibility = true }: AngularConfigOptions = {}): ReturnType<
	typeof defineConfig
> =>
	defineConfig([
		{
			name: inlineTemplates ? "@fast-china/angular/typescript-with-inline-templates" : "@fast-china/angular/typescript",
			files: [GLOB_ANGULAR_TYPESCRIPT],
			plugins: {
				"@angular-eslint": angularPlugin as unknown as ESLint.Plugin,
			},
			...(inlineTemplates
				? {
						processor: angularTemplatePlugin.processors["extract-inline-html"] as Linter.Processor,
					}
				: {}),
			rules: angularRules,
		},
		{
			name: templateAccessibility ? "@fast-china/angular/template-accessibility" : "@fast-china/angular/template",
			files: [GLOB_ANGULAR_TEMPLATE],
			languageOptions: {
				parser: angularTemplateParser as unknown as Linter.Parser,
			},
			plugins: {
				"@angular-eslint/template": angularTemplatePlugin as unknown as ESLint.Plugin,
			},
			rules: {
				...angularTemplateRules,
				...(templateAccessibility ? angularTemplateAccessibilityRules : {}),
			},
		},
	]);
