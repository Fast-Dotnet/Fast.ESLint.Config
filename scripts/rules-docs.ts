import fs from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { ESLint } from "eslint";
import { defineConfig } from "eslint/config";
import { builtinRules } from "eslint/use-at-your-own-risk";
import prettier from "prettier";
import ts from "typescript";
import { createAngularConfigs, createLodashConfigs, createMarkdownConfigs, createReactConfigs } from "../src/configs";
import { createBaseConfigs, createUniAppProjectConfigs, createVueProjectConfigs } from "../src/index";
import { normalizeReviewedRuleExample, reviewedRuleExamples } from "./rules-examples";
import type { ESLint as ESLintTypes } from "eslint";
import type { Config } from "eslint/config";
import type { ReviewedRuleExample } from "./rules-examples";

type RuleExample = ReviewedRuleExample;

interface RuleMeta {
	docs?: {
		description?: string;
		url?: string;
	};
	fixable?: string;
	messages?: Record<string, string>;
}

interface RuleProfile {
	config: Config[];
	filePath: string;
	language: string;
	name: string;
}

interface RuleSummary {
	description?: string;
	disabledProfiles: Set<string>;
	documentationUrl?: string;
	fixable: boolean;
	languages: Set<string>;
	messages: Set<string>;
	profilesBySeverity: Map<Severity, Set<string>>;
}

type Severity = "error" | "off" | "warn";

const checkOnly = process.argv.includes("--check");
const outputDirectory = new URL("../docs/rules/", import.meta.url);
const rulesDirectory = new URL("../src/rules/", import.meta.url);
const configsDirectory = new URL("../src/configs/", import.meta.url);
const prettierConfig = (await prettier.resolveConfig(path.join(process.cwd(), "package.json"))) ?? {};

const profiles: RuleProfile[] = [
	{ name: "JavaScript 基础", config: createBaseConfigs(), filePath: "fixtures/example.js", language: "js" },
	{ name: "TypeScript 基础", config: createBaseConfigs(), filePath: "tests/fixtures/promise-safety.ts", language: "ts" },
	{ name: "框架无关 TSX", config: createBaseConfigs(), filePath: "tests/fixtures/promise-safety-component.tsx", language: "tsx" },
	{ name: "Vue SFC", config: createVueProjectConfigs(), filePath: "tests/fixtures/PromiseSafety.vue", language: "vue" },
	{ name: "Vue JSX", config: createVueProjectConfigs(), filePath: "fixtures/VueComponent.jsx", language: "jsx" },
	{
		name: "Vue TSX",
		config: createVueProjectConfigs(),
		filePath: "tests/fixtures/promise-safety-component.tsx",
		language: "tsx",
	},
	{ name: "UniApp NVue", config: createUniAppProjectConfigs(), filePath: "tests/fixtures/home.nvue", language: "vue" },
	{
		name: "UniApp TSX",
		config: createUniAppProjectConfigs(),
		filePath: "tests/fixtures/promise-safety-component.tsx",
		language: "tsx",
	},
	{ name: "JSON", config: createBaseConfigs(), filePath: "fixtures/example.json", language: "json" },
	{ name: "JSONC", config: createBaseConfigs(), filePath: "fixtures/example.jsonc", language: "jsonc" },
	{ name: "JSON5", config: createBaseConfigs(), filePath: "fixtures/example.json5", language: "json5" },
	{ name: "package.json", config: createBaseConfigs(), filePath: "fixtures/package.json", language: "json" },
	{ name: "tsconfig.json", config: createBaseConfigs(), filePath: "fixtures/tsconfig.json", language: "jsonc" },
	{
		name: "React JSX",
		config: defineConfig([...createBaseConfigs(), ...createReactConfigs()]),
		filePath: "fixtures/App.jsx",
		language: "jsx",
	},
	{
		name: "React TSX",
		config: defineConfig([...createBaseConfigs(), ...createReactConfigs()]),
		filePath: "tests/fixtures/promise-safety-component.tsx",
		language: "tsx",
	},
	{
		name: "Angular TypeScript",
		config: defineConfig([...createBaseConfigs(), ...createAngularConfigs()]),
		filePath: "fixtures/app.component.ts",
		language: "ts",
	},
	{
		name: "Angular HTML",
		config: defineConfig([...createBaseConfigs(), ...createAngularConfigs()]),
		filePath: "fixtures/app.component.html",
		language: "html",
	},
	{
		name: "Markdown",
		config: defineConfig([...createBaseConfigs(), ...createMarkdownConfigs()]),
		filePath: "fixtures/example.md",
		language: "markdown",
	},
	{
		name: "Lodash",
		config: defineConfig([...createBaseConfigs(), ...createLodashConfigs("lodash")]),
		filePath: "fixtures/lodash.js",
		language: "js",
	},
	{
		name: "Lodash Unified",
		config: defineConfig([...createBaseConfigs(), ...createLodashConfigs("lodash-unified")]),
		filePath: "fixtures/lodash-unified.js",
		language: "js",
	},
];

const exactExamples: Record<string, RuleExample> = {
	"@angular-eslint/contextual-lifecycle": {
		language: "ts",
		bad: 'import { Injectable } from "@angular/core";\n@Injectable()\nclass UserService { ngOnInit(): void { console.log("initialized"); } }',
		good: 'import { Component, OnInit } from "@angular/core";\n@Component({ selector: "app-page", template: `` })\nclass PageComponent implements OnInit { ngOnInit(): void { console.log("initialized"); } }',
	},
	"@angular-eslint/prefer-inject": {
		language: "ts",
		bad: "@Injectable()\nclass UserService { constructor(private readonly api: ApiService) {} }",
		good: "@Injectable()\nclass UserService { private readonly api = inject(ApiService); }",
	},
	"@angular-eslint/template/banana-in-box": {
		language: "html",
		bad: '<input ([ngModel])="name">',
		good: '<input [(ngModel)]="name">',
	},
	"@angular-eslint/template/click-events-have-key-events": {
		language: "html",
		bad: '<div (click)="open()">Open</div>',
		good: '<button type="button" (click)="open()">Open</button>',
	},
	"@angular-eslint/template/eqeqeq": {
		language: "html",
		bad: '<p *ngIf="count == 0">Empty</p>',
		good: '<p *ngIf="count === 0">Empty</p>',
	},
	"@eslint-react/dom-no-missing-button-type": {
		language: "tsx",
		bad: "<button onClick={save}>Save</button>",
		good: '<button type="button" onClick={save}>Save</button>',
	},
	"@eslint-react/dom-no-missing-iframe-sandbox": {
		language: "tsx",
		bad: '<iframe src="https://example.com" />',
		good: '<iframe src="https://example.com" sandbox="allow-scripts" />',
	},
	"@eslint-react/dom-no-unsafe-target-blank": {
		language: "tsx",
		bad: '<a href="https://example.com" target="_blank">Open</a>',
		good: '<a href="https://example.com" target="_blank" rel="noreferrer">Open</a>',
	},
	"@typescript-eslint/consistent-type-exports": {
		language: "ts",
		bad: "interface User { id: string }\nexport { User };",
		good: "interface User { id: string }\nexport type { User };",
	},
	"@typescript-eslint/consistent-type-imports": {
		language: "ts",
		bad: 'import { Stats } from "node:fs";\nexport const getSize = (stats: Stats): number => stats.size;',
		good: 'import type { Stats } from "node:fs";\nexport const getSize = (stats: Stats): number => stats.size;',
	},
	"@typescript-eslint/explicit-module-boundary-types": {
		language: "ts",
		bad: "export const add = (left, right) => left + right;",
		good: "export const add = (left: number, right: number): number => left + right;",
	},
	"@typescript-eslint/no-confusing-void-expression": {
		language: "ts",
		bad: 'const result = console.log("saved");',
		good: 'console.log("saved");',
	},
	"@typescript-eslint/no-import-type-side-effects": {
		language: "ts",
		bad: 'import { type User } from "./types";',
		good: 'import type { User } from "./types";',
	},
	"@typescript-eslint/no-misused-promises": {
		language: "ts",
		bad: "declare function fetchReady(): Promise<boolean>;\nif (fetchReady()) { start(); }",
		good: "declare function fetchReady(): Promise<boolean>;\nif (await fetchReady()) { start(); }",
	},
	"@typescript-eslint/no-unnecessary-boolean-literal-compare": {
		language: "ts",
		bad: "declare const enabled: boolean;\nif (enabled === true) start();",
		good: "declare const enabled: boolean;\nif (enabled) start();",
	},
	"@typescript-eslint/no-unused-vars": {
		language: "ts",
		bad: "const unused = loadData();",
		good: "const data = loadData();\nrender(data);",
	},
	"@typescript-eslint/prefer-optional-chain": {
		language: "ts",
		bad: "interface User { profile?: { name: string } }\ndeclare const user: User | undefined;\nconst name = user && user.profile && user.profile.name;",
		good: "interface User { profile?: { name: string } }\ndeclare const user: User | undefined;\nconst name = user?.profile?.name;",
	},
	"@typescript-eslint/require-await": {
		language: "ts",
		bad: "async function getValue(): Promise<number> { return 1; }",
		good: "function getValue(): number { return 1; }",
	},
	"@typescript-eslint/switch-exhaustiveness-check": {
		language: "ts",
		bad: 'type State = "idle" | "ready";\ndeclare const state: State;\nswitch (state) { case "idle": break; }',
		good: 'type State = "idle" | "ready";\ndeclare const state: State;\nswitch (state) { case "idle": break; case "ready": break; }',
	},
	"array-callback-return": {
		language: "js",
		bad: "items.map((item) => { item.id; });",
		good: "items.map((item) => item.id);",
	},
	camelcase: {
		language: "js",
		bad: 'const user_name = "Fast";',
		good: 'const userName = "Fast";\nconst payload = { user_name: userName };',
	},
	curly: {
		language: "js",
		bad: "if (ready)\n\tstart();\n\tlog();",
		good: "if (ready) {\n\tstart();\n\tlog();\n}",
	},
	eqeqeq: {
		language: "js",
		bad: "if (count == 0) reset();",
		good: "if (count === 0) reset();\nif (value == null) useFallback();",
	},
	"import-x/first": {
		language: "js",
		bad: 'initialize();\nimport { api } from "./api";',
		good: 'import { api } from "./api";\ninitialize(api);',
	},
	"import-x/no-duplicates": {
		language: "js",
		bad: 'import { readFile } from "node:fs";\nimport { writeFile } from "node:fs";',
		good: 'import { readFile, writeFile } from "node:fs";',
	},
	"import-x/order": {
		language: "ts",
		bad: 'import { local } from "./local";\nimport path from "node:path";\nimport { ref } from "vue";',
		good: 'import path from "node:path";\nimport { ref } from "vue";\nimport { local } from "./local";',
	},
	"import-x/style-imports-last": {
		language: "ts",
		bad: 'import "./app.css";\nimport { createApp } from "vue";',
		good: 'import { createApp } from "vue";\nimport "./app.css";',
	},
	"jsonc/sort-array-values": {
		language: "json",
		bad: '{ "files": ["dist/z.js", "dist/a.js"] }',
		good: '{ "files": ["dist/a.js", "dist/z.js"] }',
	},
	"jsonc/sort-keys": {
		language: "json",
		bad: '{ "version": "1.0.0", "name": "demo" }',
		good: '{ "name": "demo", "version": "1.0.0" }',
	},
	"logical-assignment-operators": {
		language: "js",
		bad: "options.timeout = options.timeout || 3000;",
		good: "options.timeout ||= 3000;",
	},
	"no-console": {
		language: "js",
		bad: 'console.log("debug");',
		good: 'console.warn("retrying");\nconsole.error(error);',
	},
	"no-debugger": {
		language: "js",
		bad: "debugger;\nstart();",
		good: "start();",
	},
	"no-empty": {
		language: "js",
		bad: "if (ready) {}",
		good: "try { connect(); } catch {}",
	},
	"no-empty-character-class": {
		language: "js",
		bad: "const pattern = /[]/;",
		good: "const pattern = /[a-z]/;",
	},
	"no-eval": {
		language: "js",
		bad: 'eval("run()")',
		good: "run()",
	},
	"no-redeclare": {
		language: "js",
		bad: "var value = 1;\nvar value = 2;",
		good: "let value = 1;\nvalue = 2;",
	},
	"no-invalid-regexp": {
		language: "js",
		bad: 'const pattern = new RegExp("[");',
		good: 'const pattern = new RegExp("[a-z]");',
	},
	"no-undef": {
		language: "js",
		bad: "total = price * count;",
		good: "const price = 10;\nconst count = 2;\nconst total = price * count;",
	},
	"no-var": {
		language: "js",
		bad: "var count = 1;",
		good: "let count = 1;\nconst limit = 10;",
	},
	"no-useless-backreference": {
		language: "js",
		bad: "const pattern = /\\1(a)/;",
		good: "const pattern = /(a)\\1/;",
	},
	"no-void": {
		language: "ts",
		bad: "void save();",
		good: "save();",
	},
	"object-shorthand": {
		language: "js",
		bad: "const timeout = 1000;\nconst options = { timeout: timeout };",
		good: "const timeout = 1000;\nconst options = { timeout };",
	},
	"prefer-const": {
		language: "js",
		bad: "let timeout = 3000;",
		good: "const timeout = 3000;",
	},
	"prefer-template": {
		language: "js",
		bad: 'const name = "Fast";\nconst message = "Hello, " + name + "!";',
		good: 'const name = "Fast";\nconst message = `Hello, ${name}!`;',
	},
	"regexp/no-empty-character-class": {
		language: "js",
		bad: "const pattern = /[]/;",
		good: "const pattern = /[a-z]/;",
	},
	"regexp/no-invalid-regexp": {
		language: "js",
		bad: 'const pattern = new RegExp("[");',
		good: 'const pattern = new RegExp("[a-z]");',
	},
	"regexp/no-useless-backreference": {
		language: "js",
		bad: "const pattern = /\\1(a)/;",
		good: "const pattern = /(a)\\1/;",
	},
	"sort-imports": {
		language: "ts",
		bad: 'import { zebra, alpha } from "./names";',
		good: 'import { alpha, zebra } from "./names";',
	},
	"vue/attribute-hyphenation": {
		language: "vue",
		bad: '<UserCard userName="Fast" />',
		good: '<UserCard user-name="Fast" />',
	},
	"vue/attributes-order": {
		language: "vue",
		bad: '<button @click="save" v-if="ready" id="save">Save</button>',
		good: '<button v-if="ready" id="save" @click="save">Save</button>',
	},
	"vue/no-dupe-keys": {
		language: "vue",
		bad: '<script>export default { props: ["name"], data: () => ({ name: "" }) };</script>',
		good: '<script>export default { props: ["name"], data: () => ({ draftName: "" }) };</script>',
	},
	"vue/no-mutating-props": {
		language: "vue",
		bad: '<script setup lang="ts">const props = defineProps<{ count: number }>();\nprops.count++;</script>',
		good: '<script setup lang="ts">const props = defineProps<{ count: number }>();\nconst emit = defineEmits<{ "update:count": [value: number] }>();\nemit("update:count", props.count + 1);</script>',
	},
	"vue/no-reserved-component-names": {
		language: "vue",
		bad: '<script setup>defineOptions({ name: "div" });</script>',
		good: '<script setup>defineOptions({ name: "PageContainer" });</script>',
	},
	"vue/no-v-html": {
		language: "vue",
		bad: '<div v-html="untrustedHtml" />',
		good: "<div>{{ plainText }}</div>",
	},
	"vue/no-v-text-v-html-on-component": {
		language: "vue",
		bad: '<UserCard v-html="content" />',
		good: "<UserCard>{{ content }}</UserCard>",
	},
	"vue/require-explicit-emits": {
		language: "vue",
		bad: '<script setup lang="ts">const emit = defineEmits<{ cancel: [] }>();\nemit("save");</script>',
		good: '<script setup lang="ts">const emit = defineEmits<{ save: [] }>();\nemit("save");</script>',
	},
};

const categoryDefinitions = [
	{
		id: "core",
		title: "ESLint 核心、Import 与 RegExp",
		matches: (ruleId: string): boolean =>
			!ruleId.startsWith("@") &&
			!ruleId.startsWith("vue/") &&
			!ruleId.startsWith("jsonc/") &&
			!ruleId.startsWith("markdown/") &&
			!ruleId.startsWith("react-hooks/"),
	},
	{ id: "typescript", title: "TypeScript", matches: (ruleId: string): boolean => ruleId.startsWith("@typescript-eslint/") },
	{ id: "vue", title: "Vue 3、JSX/TSX 与 UniApp", matches: (ruleId: string): boolean => ruleId.startsWith("vue/") },
	{ id: "json", title: "JSON、JSONC 与 JSON5", matches: (ruleId: string): boolean => ruleId.startsWith("jsonc/") },
	{
		id: "react",
		title: "React 与 React Hooks",
		matches: (ruleId: string): boolean => ruleId.startsWith("@eslint-react/") || ruleId.startsWith("react-hooks/"),
	},
	{ id: "angular", title: "Angular 与 Angular 模板", matches: (ruleId: string): boolean => ruleId.startsWith("@angular-eslint/") },
	{ id: "markdown", title: "Markdown", matches: (ruleId: string): boolean => ruleId.startsWith("markdown/") },
] as const;

/** 将规则严重级别规范化为文档使用的固定值。 */
const normalizeSeverity = (setting: unknown): Severity => {
	const value: unknown = Array.isArray(setting) ? (setting as unknown[])[0] : setting;

	if (value === 0 || value === "off") return "off";
	if (value === 1 || value === "warn") return "warn";
	return "error";
};

/** 从 TypeScript AST 的 JSDoc 节点读取纯文本说明。 */
const getJsDocText = (node: ts.Node): string | undefined => {
	const documentation = ts.getJSDocCommentsAndTags(node).filter(ts.isJSDoc).at(-1);
	const comment = documentation?.comment;

	if (typeof comment === "string") return comment.trim();
	if (comment == null) return undefined;
	return comment
		.map((part) => part.text)
		.join("")
		.trim();
};

/** 移除 `satisfies`、类型断言与括号，取得规则记录的对象字面量。 */
const unwrapObjectLiteral = (expression: ts.Expression): ts.ObjectLiteralExpression | undefined => {
	let current = expression;

	while (
		ts.isSatisfiesExpression(current) ||
		ts.isAsExpression(current) ||
		ts.isTypeAssertionExpression(current) ||
		ts.isParenthesizedExpression(current)
	) {
		current = current.expression;
	}

	return ts.isObjectLiteralExpression(current) ? current : undefined;
};

/** 读取一段规则对象，并强制每个显式规则属性都带有 TSDoc。 */
const collectRuleRecordDocumentation = (ruleRecord: ts.ObjectLiteralExpression, sourcePath: string, result: Map<string, string>): void => {
	for (const property of ruleRecord.properties) {
		if (!ts.isPropertyAssignment(property)) continue;

		const ruleId = ts.isStringLiteral(property.name) || ts.isIdentifier(property.name) ? property.name.text : undefined;
		if (ruleId == null) continue;

		const documentation = getJsDocText(property);
		if (documentation == null) throw new Error(`${sourcePath} 中的 ${ruleId} 缺少 TSDoc 注释。`);
		result.set(ruleId, documentation);
	}
};

/** 读取本地显式规则记录和配置内联覆写，并强制每个规则属性都带有 TSDoc。 */
const readLocalRuleDocumentation = async (): Promise<Map<string, string>> => {
	const result = new Map<string, string>();

	for (const [directory, relativeDirectory] of [
		[rulesDirectory, path.join("src", "rules")],
		[configsDirectory, path.join("src", "configs")],
	] as const) {
		const fileNames = (await fs.readdir(directory)).filter((fileName) => fileName.endsWith(".ts") && fileName !== "index.ts");

		for (const fileName of fileNames) {
			const sourceText = await fs.readFile(new URL(fileName, directory), "utf8");
			const sourceFile = ts.createSourceFile(fileName, sourceText, ts.ScriptTarget.Latest, true, ts.ScriptKind.TS);
			const sourcePath = path.join(relativeDirectory, fileName);

			const visit = (node: ts.Node): void => {
				if (ts.isVariableDeclaration(node) && ts.isIdentifier(node.name) && node.name.text.endsWith("Rules") && node.initializer != null) {
					const ruleRecord = unwrapObjectLiteral(node.initializer);
					if (ruleRecord != null) collectRuleRecordDocumentation(ruleRecord, sourcePath, result);
				}
				if (ts.isPropertyAssignment(node) && (ts.isIdentifier(node.name) || ts.isStringLiteral(node.name)) && node.name.text === "rules") {
					const ruleRecord = unwrapObjectLiteral(node.initializer);
					if (ruleRecord != null) collectRuleRecordDocumentation(ruleRecord, sourcePath, result);
				}
				ts.forEachChild(node, visit);
			};

			visit(sourceFile);
		}
	}

	return result;
};

/** 在 ESLint 最终插件映射中定位规则实现并读取元数据。 */
const resolveRuleMeta = (ruleId: string, plugins: Record<string, ESLintTypes.Plugin>): RuleMeta | undefined => {
	const definition: unknown = !ruleId.includes("/")
		? // ESLint 暂无用于枚举核心规则的非弃用公开 API，生成文档需要读取内置规则元数据。
			// eslint-disable-next-line @typescript-eslint/no-deprecated -- 生成文档需要读取内置规则元数据，暂无非弃用公开 API
			builtinRules.get(ruleId)
		: Object.keys(plugins)
				.filter((pluginName) => ruleId.startsWith(`${pluginName}/`))
				.sort((left, right) => right.length - left.length)
				.map((pluginName) => plugins[pluginName]?.rules?.[ruleId.slice(pluginName.length + 1)])
				.find((rule) => rule != null);

	if (typeof definition !== "object" || definition == null || !("meta" in definition)) return undefined;
	return definition.meta as RuleMeta;
};

/** 将上游英文元数据与本地中文决策说明合并为规则介绍。 */
const createIntroduction = (ruleId: string, summary: RuleSummary, localDocumentation?: string): string => {
	if (localDocumentation != null) return localDocumentation.replace(/^\[[^\]]+\](?:\[[^\]]+\])?\s*/, "");

	const upstream = summary.description ?? `检查 ${ruleId} 所定义的代码约束`;
	if (ruleId.includes("/no-") || ruleId.startsWith("no-")) return `禁止出现该规则定义的不安全、无效或易误解结构。上游说明：${upstream}`;
	if (ruleId.includes("/prefer-") || ruleId.startsWith("prefer-")) return `要求优先使用该规则指定的现代或更清晰写法。上游说明：${upstream}`;
	if (ruleId.includes("/require-") || ruleId.startsWith("require-")) return `要求补齐该规则所需的声明、属性或结构。上游说明：${upstream}`;
	if (ruleId.includes("/valid-") || ruleId.startsWith("valid-")) return `校验对应语法、属性或参数是否合法。上游说明：${upstream}`;
	return `检查该规则对应的代码约束。上游说明：${upstream}`;
};

/** 生成单条规则的 Markdown 章节。 */
const renderRule = (ruleId: string, summary: RuleSummary, example: RuleExample, localDocumentation?: string): string => {
	const activeSeverities = (["error", "warn"] as const)
		.map((severity) => {
			const profileNames = summary.profilesBySeverity.get(severity);
			return profileNames == null || profileNames.size === 0 ? undefined : `${severity}: ${[...profileNames].join("、")}`;
		})
		.filter((value): value is string => value != null);
	const status = activeSeverities.length > 0 ? activeSeverities.join("；") : "默认关闭（本地显式覆写）";
	const disabled = summary.disabledProfiles.size > 0 ? `\n- 关闭范围：${[...summary.disabledProfiles].join("、")}` : "";
	const documentation = summary.documentationUrl == null ? "未提供" : `[官方文档](${summary.documentationUrl})`;
	const exampleKind = localDocumentation == null ? "第三方预置规则的直接代码示例" : "仓库显式规则的直接代码示例";
	const commonMessages = [...summary.messages].slice(0, 3);
	const messages =
		commonMessages.length === 0 ? "" : `\n- 常见报告：${commonMessages.map((message) => `\`${message.replaceAll("`", "'")}\``).join("；")}`;

	return `### \`${ruleId}\`

${createIntroduction(ruleId, summary, localDocumentation)}

- 生效级别与范围：${status}${disabled}
- 自动修复：${summary.fixable ? "支持；执行前仍应检查语义和差异" : "不支持或上游未声明"}
- 规则来源：${documentation}${messages}
- 示例类型：${exampleKind}

错误示例：

<!-- prettier-ignore -->
\`\`\`\`${example.language}
${example.bad}
\`\`\`\`

正确示例：

<!-- prettier-ignore -->
\`\`\`\`${example.language}
${example.good}
\`\`\`\`
`;
};

/** 判断代码块是否至少包含一条非注释内容。 */
const hasCodeContent = (example: string): boolean => {
	const withoutBlockComments = example.replaceAll(/\/\*[\s\S]*?\*\//g, "").replaceAll(/<!--[\s\S]*?-->/g, "");
	return withoutBlockComments.split("\n").some((line) => {
		const trimmed = line.trim();
		return trimmed.length > 0 && !trimmed.startsWith("//");
	});
};

/** 判断代码示例是否包含会破坏 Markdown 文本文件的控制字符。 */
const hasUnexpectedControlCharacter = (source: string): boolean => {
	for (let index = 0; index < source.length; index++) {
		const code = source.charCodeAt(index);
		if (code <= 8 || code === 11 || code === 12 || (code >= 14 && code <= 31) || code === 127) {
			return true;
		}
	}

	return false;
};

/** 校验每条已记录规则都有经过显式编写且包含真实代码的正反示例。 */
const validateExamples = (rules: Map<string, RuleSummary>, examples: Record<string, RuleExample>): void => {
	const missingRuleIds = [...rules.keys()].filter((ruleId) => examples[ruleId] == null);
	if (missingRuleIds.length > 0) throw new Error(`以下规则缺少直接代码示例：${missingRuleIds.join("、")}`);

	const unusedRuleIds = Object.keys(examples).filter((ruleId) => !rules.has(ruleId));
	if (unusedRuleIds.length > 0) throw new Error(`以下直接代码示例已无对应规则：${unusedRuleIds.join("、")}`);

	for (const ruleId of rules.keys()) {
		const example = examples[ruleId];
		if (example == null) continue;
		if (example.bad.trim() === example.good.trim()) throw new Error(`${ruleId} 的错误示例与正确示例相同。`);
		if (!hasCodeContent(example.bad)) throw new Error(`${ruleId} 的错误示例只有注释，没有实际代码。`);
		if (!hasCodeContent(example.good)) throw new Error(`${ruleId} 的正确示例只有注释，没有实际代码。`);
		if (hasUnexpectedControlCharacter(example.bad) || hasUnexpectedControlCharacter(example.good)) {
			throw new Error(`${ruleId} 的代码示例包含不可写入 Markdown 的控制字符。`);
		}
	}
};

/** 按仓库显式规则在前、第三方预置规则在后的顺序生成分类正文。 */
const renderRuleGroups = (rules: [string, RuleSummary][], localDocumentation: Map<string, string>, examples: Record<string, RuleExample>): string => {
	const renderGroup = (title: string, entries: [string, RuleSummary][]): string =>
		entries.length === 0
			? ""
			: `## ${title}（${entries.length} 条）\n\n${entries
					.map(([ruleId, summary]) => renderRule(ruleId, summary, examples[ruleId]!, localDocumentation.get(ruleId)))
					.join("\n")}`;
	const localRules = rules.filter(([ruleId]) => localDocumentation.has(ruleId));
	const presetRules = rules.filter(([ruleId]) => !localDocumentation.has(ruleId));

	return [renderGroup("仓库显式规则", localRules), renderGroup("第三方预置规则", presetRules)].filter(Boolean).join("\n\n");
};

/** 计算全部代表性文件的最终规则配置及插件元数据。 */
const collectRules = async (localRuleIds: Set<string>): Promise<Map<string, RuleSummary>> => {
	const rules = new Map<string, RuleSummary>();

	for (const profile of profiles) {
		const eslint = new ESLint({
			cwd: process.cwd(),
			ignore: false,
			overrideConfig: profile.config,
			overrideConfigFile: true,
		});
		const calculated: unknown = await eslint.calculateConfigForFile(profile.filePath);
		if (typeof calculated !== "object" || calculated == null) continue;
		const calculatedRecord = calculated as Record<string, unknown>;
		const plugins =
			typeof calculatedRecord.plugins === "object" && calculatedRecord.plugins != null
				? (calculatedRecord.plugins as Record<string, ESLintTypes.Plugin>)
				: {};
		const configuredRules =
			typeof calculatedRecord.rules === "object" && calculatedRecord.rules != null ? (calculatedRecord.rules as Record<string, unknown>) : {};

		for (const [ruleId, setting] of Object.entries(configuredRules)) {
			const severity = normalizeSeverity(setting);
			if (severity === "off" && !localRuleIds.has(ruleId)) continue;

			const meta = resolveRuleMeta(ruleId, plugins);
			const summary = rules.get(ruleId) ?? {
				description: meta?.docs?.description,
				disabledProfiles: new Set<string>(),
				documentationUrl: meta?.docs?.url,
				fixable: meta?.fixable != null,
				languages: new Set<string>(),
				messages: new Set<string>(),
				profilesBySeverity: new Map<Severity, Set<string>>(),
			};

			summary.languages.add(profile.language);
			for (const message of Object.values(meta?.messages ?? {})) summary.messages.add(message);
			if (severity === "off") {
				summary.disabledProfiles.add(profile.name);
			} else {
				const severityProfiles = summary.profilesBySeverity.get(severity) ?? new Set<string>();
				severityProfiles.add(profile.name);
				summary.profilesBySeverity.set(severity, severityProfiles);
			}
			rules.set(ruleId, summary);
		}
	}

	return rules;
};

/** 写入生成文档，或在 `--check` 模式验证仓库文档未过期。 */
const updateFile = async (fileName: string, content: string): Promise<boolean> => {
	const fileUrl = new URL(fileName, outputDirectory);
	const formatOptions = {
		...prettierConfig,
		filepath: path.join(process.cwd(), "docs", "rules", fileName),
	};
	const firstPass = await prettier.format(`${content.trimEnd()}\n`, formatOptions);
	const normalizedContent = await prettier.format(firstPass, formatOptions);

	if (checkOnly) {
		const current = await fs.readFile(fileUrl, "utf8").catch(() => "");
		return current === normalizedContent;
	}

	await fs.mkdir(outputDirectory, { recursive: true });
	await fs.writeFile(fileUrl, normalizedContent, "utf8");
	return true;
};

const localRuleDocumentation = await readLocalRuleDocumentation();
const allRules = await collectRules(new Set(localRuleDocumentation.keys()));
const allExamples = Object.fromEntries(
	Object.entries({ ...reviewedRuleExamples, ...exactExamples }).map(([ruleId, example]) => [ruleId, normalizeReviewedRuleExample(ruleId, example)])
) as Record<string, RuleExample>;
validateExamples(allRules, allExamples);
const sortedRules = [...allRules.entries()].sort(([left], [right]) => {
	const localDifference = Number(localRuleDocumentation.has(right)) - Number(localRuleDocumentation.has(left));
	return localDifference === 0 ? left.localeCompare(right) : localDifference;
});
const generatedFiles = new Map<string, string>();

for (const category of categoryDefinitions) {
	const categoryRules = sortedRules.filter(([ruleId]) => category.matches(ruleId));
	generatedFiles.set(
		`${category.id}.zh.md`,
		`<!-- 此文件由 scripts/rules-docs.ts 生成，请勿手工编辑。 -->

# ${category.title}

本页记录当前依赖版本和仓库配置最终产生的 ${categoryRules.length} 条规则。每条规则均列出实际严重级别、生效范围、上游说明、常见报告以及错误/正确示例。

${renderRuleGroups(categoryRules, localRuleDocumentation, allExamples)}`
	);
}

const categorizedRuleIds = new Set(
	categoryDefinitions.flatMap((category) => sortedRules.filter(([ruleId]) => category.matches(ruleId)).map(([ruleId]) => ruleId))
);
const uncategorizedRules = sortedRules.filter(([ruleId]) => !categorizedRuleIds.has(ruleId));
if (uncategorizedRules.length > 0) {
	generatedFiles.set(
		"other.zh.md",
		`<!-- 此文件由 scripts/rules-docs.ts 生成，请勿手工编辑。 -->

# 其他规则

${renderRuleGroups(uncategorizedRules, localRuleDocumentation, allExamples)}`
	);
}

const activeRuleCount = sortedRules.filter(([, summary]) => summary.profilesBySeverity.size > 0).length;
const disabledRuleCount = sortedRules.length - activeRuleCount;
const categoryLinks = categoryDefinitions.map((category) => {
	const count = sortedRules.filter(([ruleId]) => category.matches(ruleId)).length;
	return `- [${category.title}](./${category.id}.zh.md)：${count} 条`;
});
if (uncategorizedRules.length > 0) categoryLinks.push(`- [其他规则](./other.zh.md)：${uncategorizedRules.length} 条`);
const indexContent = `<!-- 此文件由 scripts/rules-docs.ts 生成，请勿手工编辑。 -->

# 完整规则手册

本手册从仓库的 Flat Config 工厂计算最终配置，不只枚举本地覆写，还包含 ESLint、typescript-eslint、Vue、Import、RegExp、JSONC、React、Angular 和 Markdown 等第三方预置带入的规则。

- 当前记录 ${activeRuleCount} 条至少在一个配置范围内启用的规则。
- 另记录 ${disabledRuleCount} 条由本仓库显式关闭的规则，避免用户误以为仍会报告。
- \`error\`、\`warn\` 和关闭范围均来自代表性文件的 \`ESLint.calculateConfigForFile()\` 结果。
- “自动修复”来自规则 \`meta.fixable\`；即使支持修复，也应审查最终差异。
- 每条规则都提供经过显式编写的错误与正确代码示例；生成器会拒绝缺失、相同或只有注释的代码块。
- 代码示例保留刻意展示的错误格式，不由 Prettier 自动改写为另一种结构。
- 每个分类先列仓库显式配置的规则，再列第三方预置带入的规则；组内按规则名排序。
- Prettier 兼容层中仅用于关闭冲突、且从未由本仓库启用的规则不计入“使用的规则”。

## 分类

${categoryLinks.join("\n")}

## 维护方式

修改规则或升级依赖后运行：

\`\`\`bash
pnpm run docs:rules
\`\`\`

CI 使用以下命令检查文档是否与实际配置一致：

\`\`\`bash
pnpm run docs:rules:check
\`\`\`
`;
generatedFiles.set("index.zh.md", indexContent);

const results = await Promise.all([...generatedFiles].map(([fileName, content]) => updateFile(fileName, content)));
if (results.some((isCurrent) => !isCurrent)) {
	console.error("规则文档已过期，请运行 `pnpm run docs:rules` 并提交 docs/rules。 ");
	process.exitCode = 1;
} else if (!checkOnly) {
	console.log(`已生成 ${generatedFiles.size} 个规则文档，共记录 ${sortedRules.length} 条规则。`);
}
