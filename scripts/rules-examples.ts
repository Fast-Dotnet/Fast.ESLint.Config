/** 规则文档使用的直接代码示例。 */
export interface ReviewedRuleExample {
	/** 能体现规则所禁止或报告结构的代码。 */
	bad: string;
	/** 按规则要求修正后的对应代码。 */
	good: string;
	/** Markdown 代码块语言 */
	language: string;
}

type ExamplePair = readonly [bad: string, good: string];

/** 为同一种代码语言批量补充规则示例。 */
const defineExamples = (language: string, entries: Record<string, ExamplePair>): Record<string, ReviewedRuleExample> =>
	Object.fromEntries(Object.entries(entries).map(([ruleId, [bad, good]]) => [ruleId, { bad, good, language }]));

/** 将 Vue 片段补全为能够被 `vue-eslint-parser` 识别的单文件组件。 */
const normalizeVueSource = (source: string): string => {
	const trimmed = source.trim();
	if (/<(?:i18n|script|style)(?:\s|>)/u.test(trimmed)) return source;
	if (/^<template(?:>|\s+functional>)/u.test(trimmed)) return source;
	if (trimmed.startsWith("<")) return `<template>\n${source}\n</template>`;
	return `<script>\n${source}\n</script>`;
};

/** 规范化规则示例，使文档中的 Vue 代码块是完整且可解析的单文件组件。 */
export const normalizeReviewedRuleExample = (ruleId: string, example: ReviewedRuleExample): ReviewedRuleExample =>
	ruleId.startsWith("vue/") && example.language === "vue"
		? { ...example, bad: normalizeVueSource(example.bad), good: normalizeVueSource(example.good) }
		: example;

const javascriptExamples = defineExamples("js", {
	"constructor-super": ["class User extends Entity { constructor() {} }", "class User extends Entity { constructor() { super(); } }"],
	"default-case-last": [
		'switch (status) { default: reset(); break; case "ready": start(); }',
		'switch (status) { case "ready": start(); break; default: reset(); }',
	],
	"for-direction": ["for (let index = 0; index < 10; index--) process(index);", "for (let index = 0; index < 10; index++) process(index);"],
	"getter-return": ["const user = { get name() { logAccess(); } };", 'const user = { get name() { return "Fast"; } };'],
	"import-x/default": ['import api from "./named-only.js";', 'import { api } from "./named-only.js";'],
	"import-x/export": ["export const value = 1;\nexport { value };", "export const value = 1;"],
	"import-x/named": ['import { missing } from "./api.js";', 'import { request } from "./api.js";'],
	"import-x/namespace": ['import * as api from "./api.js";\napi.missing();', 'import * as api from "./api.js";\napi.request();'],
	"import-x/no-named-as-default": ['import request from "./request.js";\nrequest();', 'import { request } from "./request.js";\nrequest();'],
	"import-x/no-named-as-default-member": ['import api from "./api.js";\napi.request();', 'import { request } from "./api.js";\nrequest();'],
	"import-x/no-unresolved": ['import value from "./missing.js";', 'import value from "./value.js";'],
	"no-alert": ['alert("Saved");', 'showMessage("Saved");'],
	"no-async-promise-executor": ["const value = new Promise(async (resolve) => resolve(await load()));", "const value = Promise.resolve(load());"],
	"no-case-declarations": [
		'switch (kind) { case "user": const name = getName(); use(name); break; }',
		'switch (kind) { case "user": { const name = getName(); use(name); break; } }',
	],
	"no-class-assign": ["class User {}\nUser = class Admin {};", "class User {}\nconst Admin = class extends User {};"],
	"no-compare-neg-zero": ["if (value === -0) handle();", "if (Object.is(value, -0)) handle();"],
	"no-cond-assign": ["if (user = findUser()) render(user);", "const user = findUser();\nif (user) render(user);"],
	"no-const-assign": ["const timeout = 1000;\ntimeout = 2000;", "let timeout = 1000;\ntimeout = 2000;"],
	"no-constant-binary-expression": ["const allowed = true || ready;", "const allowed = ready || fallbackAllowed;"],
	"no-constant-condition": ["if (true) start();", "if (ready) start();"],
	"no-control-regex": ["const separator = /\\x00/;", "const separator = String.fromCharCode(0);"],
	"no-delete-var": ["var token;\ndelete token;", "let token;\ntoken = undefined;"],
	"no-dupe-args": ["function add(value, value) { return value; }", "function add(left, right) { return left + right; }"],
	"no-dupe-class-members": ["class User { save() {} save() {} }", "class User { save() {} cancel() {} }"],
	"no-dupe-else-if": ["if (ready) start(); else if (ready) retry();", "if (ready) start(); else if (retryable) retry();"],
	"no-dupe-keys": ['const user = { name: "A", name: "B" };', 'const user = { firstName: "A", lastName: "B" };'],
	"no-duplicate-case": [
		'switch (status) { case "ready": start(); break; case "ready": retry(); }',
		'switch (status) { case "ready": start(); break; case "failed": retry(); }',
	],
	"no-empty-pattern": ["const {} = user;", "const { id } = user;\nuse(id);"],
	"no-empty-static-block": ["class Cache { static {} }", "class Cache { static { Cache.initialize(); } }"],
	"no-ex-assign": [
		"try { run(); } catch (error) { error = normalize(error); throw error; }",
		"try { run(); } catch (error) { throw normalize(error); }",
	],
	"no-extra-boolean-cast": ["if (!!ready) start();", "if (ready) start();"],
	"no-fallthrough": [
		'switch (status) { case "ready": start(); case "done": finish(); }',
		'switch (status) { case "ready": start(); break; case "done": finish(); }',
	],
	"no-func-assign": ["function load() {}\nload = createLoader();", "let load = createLoader();\nload = createCachedLoader();"],
	"no-global-assign": ["undefined = 1;", "const missingValue = undefined;"],
	"no-implied-eval": ['setTimeout("refresh()", 1000);', "setTimeout(() => refresh(), 1000);"],
	"no-import-assign": ['import * as api from "./api.js";\napi = {};', 'import * as api from "./api.js";\napi.request();'],
	"no-irregular-whitespace": ["const value = 1;", "const value = 1;"],
	"no-loss-of-precision": ["const id = 9007199254740993;", "const id = 9007199254740993n;"],
	"no-misleading-character-class": ["const emoji = /[👍]/;", "const emoji = /[👍]/u;"],
	"no-multi-str": ['const message = "first\\\nsecond";', 'const message = "first" +\n\t"second";'],
	"no-new-func": ['const add = new Function("left", "right", "return left + right");', "const add = (left, right) => left + right;"],
	"no-new-native-nonconstructor": ["const token = new Symbol();", "const token = Symbol();"],
	"no-nonoctal-decimal-escape": ['const digit = "\\8";', 'const digit = "8";'],
	"no-obj-calls": ["const value = Math();", "const value = Math.max(1, 2);"],
	"no-octal": ["const mode = 071;", "const mode = 0o71;"],
	"no-promise-executor-return": ["const value = new Promise((resolve) => resolve(1));", "const value = new Promise((resolve) => { resolve(1); });"],
	"no-prototype-builtins": ["if (payload.hasOwnProperty(key)) use(payload[key]);", "if (Object.hasOwn(payload, key)) use(payload[key]);"],
	"no-regex-spaces": ["const words = /fast  china/;", "const words = /fast {2}china/;"],
	"no-restricted-imports": ['import debounce from "lodash-es/debounce";', 'import debounce from "lodash/debounce";'],
	"no-restricted-syntax": ["retryLoop: while (ready) { break retryLoop; }", "while (ready) { break; }"],
	"no-self-assign": ["user.name = user.name;", "user.name = nextName;"],
	"no-setter-return": ["const user = { set name(value) { return value; } };", "const user = { set name(value) { saveName(value); } };"],
	"no-shadow-restricted-names": ["const undefined = 1;", "const missingValue = undefined;"],
	"no-sparse-arrays": ["const values = [1, , 3];", "const values = [1, undefined, 3];"],
	"no-this-before-super": [
		"class User extends Entity { constructor() { this.ready = true; super(); } }",
		"class User extends Entity { constructor() { super(); this.ready = true; } }",
	],
	"no-unassigned-vars": ["let result;\nrender(result);", "const result = load();\nrender(result);"],
	"no-unreachable": ["function load() { return value; log(value); }", "function load() { log(value); return value; }"],
	"no-unsafe-finally": [
		"function load() { try { return fetchValue(); } finally { return fallback; } }",
		"function load() { try { return fetchValue(); } finally { release(); } }",
	],
	"no-unsafe-negation": ["if (!key in object) handleMissing();", "if (!(key in object)) handleMissing();"],
	"no-unsafe-optional-chaining": ["const { name } = user?.profile;", "const name = user?.profile?.name;"],
	"no-unused-labels": ["retry: run();", "run();"],
	"no-unused-private-class-members": [
		'class User { #secret = 1; getName() { return "Fast"; } }',
		"class User { #name; constructor(name) { this.#name = name; } getName() { return this.#name; } }",
	],
	"no-unused-vars": ["const unusedValue = load();", "const value = load();\nrender(value);"],
	"no-use-before-define": ["const value = load();\nconst load = () => 1;", "const load = () => 1;\nconst value = load();"],
	"no-useless-assignment": [
		'function getStatus() { let status = "idle";\nstatus = "ready";\nreturn status; }',
		'function getStatus() { const status = "ready";\nreturn status; }',
	],
	"no-useless-catch": ["try { run(); } catch (error) { throw error; }", "run();"],
	"no-useless-escape": ['const name = "Fast\\!";', 'const name = "Fast!";'],
	"no-with": ["with (settings) { apply(theme); }", "apply(settings.theme);"],
	"prefer-arrow-callback": ["items.map(function (item) { return item.id; });", "items.map((item) => item.id);"],
	"prefer-exponentiation-operator": ["const area = Math.pow(size, 2);", "const area = size ** 2;"],
	"prefer-object-spread": ["const next = Object.assign({}, current, patch);", "const next = { ...current, ...patch };"],
	"prefer-rest-params": ['function join() { return Array.from(arguments).join(","); }', 'function join(...values) { return values.join(","); }'],
	"prefer-spread": ["items.push.apply(items, nextItems);", "items.push(...nextItems);"],
	"preserve-caught-error": [
		'try { connect(); } catch (error) { throw new Error("Connection failed"); }',
		'try { connect(); } catch (error) { throw new Error("Connection failed", { cause: error }); }',
	],
	"require-yield": ["function* values() { return 1; }", "function* values() { yield 1; }"],
	"use-isnan": ["if (value === NaN) reset();", "if (Number.isNaN(value)) reset();"],
	"valid-typeof": ['if (typeof value === "strnig") reset();', 'if (typeof value === "string") reset();'],
});

const regexpExamples = defineExamples("js", {
	"regexp/confusing-quantifier": ["const pattern = /(?:a*)+/;", "const pattern = /a*/;"],
	"regexp/no-contradiction-with-assertion": ["const pattern = /(?=a)b*/;", "const pattern = /(?=a)a+/;"],
	"regexp/no-dupe-characters-character-class": ["const pattern = /[aa-z]/;", "const pattern = /[a-z]/;"],
	"regexp/no-dupe-disjunctions": ["const pattern = /(?:fast|fast)/;", "const pattern = /(?:fast|slow)/;"],
	"regexp/no-empty-alternative": ["const pattern = /(?:fast|)/;", "const pattern = /(?:fast|slow)/;"],
	"regexp/no-empty-capturing-group": ["const pattern = /()/;", "const pattern = /(fast)/;"],
	"regexp/no-empty-group": ["const pattern = /(?:)/;", "const pattern = /(?:fast)/;"],
	"regexp/no-empty-lookarounds-assertion": ["const pattern = /(?=)fast/;", "const pattern = /(?=fast)fast/;"],
	"regexp/no-extra-lookaround-assertions": ["const pattern = /(?=(?=fast))fast/;", "const pattern = /(?=fast)fast/;"],
	"regexp/no-invisible-character": ["const pattern = /​/u;", "const pattern = /\\u200B/u;"],
	"regexp/no-misleading-capturing-group": ["const pattern = /(a+)+/;", "const pattern = /a+/;"],
	"regexp/no-misleading-unicode-character": ["const pattern = /[👍]/;", "const pattern = /[👍]/u;"],
	"regexp/no-missing-g-flag": [
		'const text = "item item";\nconst matches = text.matchAll(/item/);',
		'const text = "item item";\nconst matches = text.matchAll(/item/g);',
	],
	"regexp/no-non-standard-flag": ['const pattern = new RegExp("item", "x");', 'const pattern = new RegExp("item", "u");'],
	"regexp/no-optional-assertion": ["const pattern = /(?:^)?item/;", "const pattern = /^item/;"],
	"regexp/no-super-linear-backtracking": ["const pattern = /(a+)+$/;", "const pattern = /^a+$/;"],
	"regexp/no-useless-dollar-replacements": [
		'const text = "item";\nconst value = text.replace(/item/g, "$1");',
		'const text = "item";\nconst value = text.replace(/(item)/g, "$1");',
	],
	"regexp/no-zero-quantifier": ["const pattern = /item{0}/;", "const pattern = /item/;"],
	"regexp/strict": ["const pattern = /\\q/;", "const pattern = /q/;"],
});

const jsonExamples = defineExamples("jsonc", {
	"jsonc/comma-dangle": ['{ "name": "Fast", }', '{ "name": "Fast" }'],
	"jsonc/no-bigint-literals": ['{ "id": 1n }', '{ "id": "1" }'],
	"jsonc/no-binary-expression": ['{ "timeout": 1000 + 500 }', '{ "timeout": 1500 }'],
	"jsonc/no-binary-numeric-literals": ['{ "mask": 0b1010 }', '{ "mask": 10 }'],
	"jsonc/no-comments": ['{ // name\n  "name": "Fast"\n}', '{ "name": "Fast" }'],
	"jsonc/no-dupe-keys": ['{ "name": "Fast", "name": "Admin" }', '{ "name": "Fast", "title": "Admin" }'],
	"jsonc/no-escape-sequence-in-identifier": ['{ \\u0061: "Fast" }', '{ a: "Fast" }'],
	"jsonc/no-floating-decimal": ['{ "ratio": .5 }', '{ "ratio": 0.5 }'],
	"jsonc/no-hexadecimal-numeric-literals": ['{ "color": 0xff }', '{ "color": 255 }'],
	"jsonc/no-infinity": ['{ "limit": Infinity }', '{ "limit": null }'],
	"jsonc/no-irregular-whitespace": ['{\n "name": "Fast"\n}', '{\n  "name": "Fast"\n}'],
	"jsonc/no-multi-str": ['{ "text": "first\\\nsecond" }', '{ "text": "first\\nsecond" }'],
	"jsonc/no-nan": ['{ "value": NaN }', '{ "value": null }'],
	"jsonc/no-number-props": ['{ 1: "one" }', '{ "1": "one" }'],
	"jsonc/no-numeric-separators": ['{ "size": 1_000 }', '{ "size": 1000 }'],
	"jsonc/no-octal": ['{ "mode": 071 }', '{ "mode": 57 }'],
	"jsonc/no-octal-numeric-literals": ['{ "mode": 0o71 }', '{ "mode": 57 }'],
	"jsonc/no-parenthesized": ['{ "timeout": (1000) }', '{ "timeout": 1000 }'],
	"jsonc/no-plus-sign": ['{ "offset": +1 }', '{ "offset": 1 }'],
	"jsonc/no-regexp-literals": ['{ "pattern": /fast/i }', '{ "pattern": "fast" }'],
	"jsonc/no-sparse-arrays": ['{ "items": [1, , 3] }', '{ "items": [1, null, 3] }'],
	"jsonc/no-template-literals": ['{ "name": `Fast` }', '{ "name": "Fast" }'],
	"jsonc/no-undefined-value": ['{ "value": undefined }', '{ "value": null }'],
	"jsonc/no-unicode-codepoint-escapes": ['{ "emoji": "\\u{1F600}" }', '{ "emoji": "😀" }'],
	"jsonc/no-useless-escape": ['{ "name": "Fast\\!" }', '{ "name": "Fast!" }'],
	"jsonc/quote-props": ['{ name: "Fast" }', '{ "name": "Fast" }'],
	"jsonc/quotes": ["{ 'name': 'Fast' }", '{ "name": "Fast" }'],
	"jsonc/space-unary-ops": ['{ "offset": - 1 }', '{ "offset": -1 }'],
	"jsonc/valid-json-number": ['{ "value": 01 }', '{ "value": 1 }'],
});

const jsonVueExamples = defineExamples("vue", {
	"jsonc/vue-custom-block/no-parsing-error": ['<i18n>{ "hello": }</i18n>', '<i18n>{ "hello": "Hello" }</i18n>'],
});

const markdownExamples = defineExamples("markdown", {
	"markdown/fenced-code-language": ["```\nconst ready = true;\n```", "```js\nconst ready = true;\n```"],
	"markdown/heading-increment": ["# Guide\n\n### Setup", "# Guide\n\n## Setup"],
	"markdown/no-duplicate-definitions": [
		"[docs]: https://example.com/a\n[docs]: https://example.com/b",
		"[docs]: https://example.com/a\n[api]: https://example.com/b",
	],
	"markdown/no-empty-definitions": ["[docs]: #", "[Guide][docs]\n\n[docs]: https://example.com/docs"],
	"markdown/no-empty-images": ["![Fast logo]()", "![Fast logo](/logo.png)"],
	"markdown/no-empty-links": ["[Fast]()", "[Fast](https://example.com)"],
	"markdown/no-invalid-label-refs": ["[Guide][ ]", "[Guide][guide]\n\n[guide]: /guide"],
	"markdown/no-missing-atx-heading-space": ["##Setup", "## Setup"],
	"markdown/no-missing-label-refs": ["[Guide][missing]", "[Guide][guide]\n\n[guide]: /guide"],
	"markdown/no-missing-link-fragments": ["[Install](#missing)", "## Install\n\n[Install](#install)"],
	"markdown/no-multiple-h1": ["# Guide\n\n# API", "# Guide\n\n## API"],
	"markdown/no-reference-like-urls": ["[docs]: /guide\n\n[Guide](docs)", "[docs]: /guide\n\n[Guide][docs]"],
	"markdown/no-reversed-media-syntax": ["(Guide)[/guide]", "[Guide](/guide)"],
	"markdown/no-space-in-emphasis": ["** emphasized **", "**emphasized**"],
	"markdown/no-unused-definitions": ["Text only.\n\n[docs]: /guide", "[Guide][docs]\n\n[docs]: /guide"],
	"markdown/require-alt-text": ["![](/chart.png)", "![Request volume chart](/chart.png)"],
	"markdown/table-column-count": ["| Name | Value |\n| --- | --- |\n| A | 1 | extra |", "| Name | Value |\n| --- | --- |\n| A | 1 |"],
});

const angularTypeScriptExamples = defineExamples("ts", {
	"@angular-eslint/no-empty-lifecycle-method": [
		'import { Component, OnInit } from "@angular/core";\n@Component({ selector: "app-page", template: `` })\nclass PageComponent implements OnInit { ngOnInit(): void {} }',
		'import { Component, OnInit } from "@angular/core";\n@Component({ selector: "app-page", template: `` })\nclass PageComponent implements OnInit { ngOnInit(): void { console.log("initialized"); } }',
	],
	"@angular-eslint/no-input-rename": [
		'import { Component, Input } from "@angular/core";\n@Component({ selector: "app-user", template: `` })\nclass UserComponent { @Input("userName") name = ""; }',
		'import { Component, Input } from "@angular/core";\n@Component({ selector: "app-user", template: `` })\nclass UserComponent { @Input() userName = ""; }',
	],
	"@angular-eslint/no-inputs-metadata-property": [
		'@Component({ selector: "app-user", inputs: ["name"], template: `` })\nclass UserComponent { name = ""; }',
		'@Component({ selector: "app-user", template: `` })\nclass UserComponent { @Input() name = ""; }',
	],
	"@angular-eslint/no-output-native": [
		'import { Component, EventEmitter, Output } from "@angular/core";\n@Component({ selector: "app-editor", template: `` })\nclass EditorComponent { @Output() click = new EventEmitter<void>(); }',
		'import { Component, EventEmitter, Output } from "@angular/core";\n@Component({ selector: "app-editor", template: `` })\nclass EditorComponent { @Output() saved = new EventEmitter<void>(); }',
	],
	"@angular-eslint/no-output-on-prefix": [
		'import { Component, EventEmitter, Output } from "@angular/core";\n@Component({ selector: "app-editor", template: `` })\nclass EditorComponent { @Output() onSaved = new EventEmitter<void>(); }',
		'import { Component, EventEmitter, Output } from "@angular/core";\n@Component({ selector: "app-editor", template: `` })\nclass EditorComponent { @Output() saved = new EventEmitter<void>(); }',
	],
	"@angular-eslint/no-output-rename": [
		'import { Component, EventEmitter, Output } from "@angular/core";\n@Component({ selector: "app-editor", template: `` })\nclass EditorComponent { @Output("saved") save = new EventEmitter<void>(); }',
		'import { Component, EventEmitter, Output } from "@angular/core";\n@Component({ selector: "app-editor", template: `` })\nclass EditorComponent { @Output() saved = new EventEmitter<void>(); }',
	],
	"@angular-eslint/no-outputs-metadata-property": [
		'@Component({ selector: "app-editor", outputs: ["saved"], template: `` })\nclass EditorComponent { saved = new EventEmitter<void>(); }',
		'@Component({ selector: "app-editor", template: `` })\nclass EditorComponent { @Output() saved = new EventEmitter<void>(); }',
	],
	"@angular-eslint/prefer-on-push-component-change-detection": [
		'import { ChangeDetectionStrategy, Component } from "@angular/core";\n@Component({ selector: "app-user", template: ``, changeDetection: ChangeDetectionStrategy.Eager })\nclass UserComponent {}',
		'import { Component } from "@angular/core";\n@Component({ selector: "app-user", template: `` })\nclass UserComponent {}',
	],
	"@angular-eslint/prefer-standalone": [
		'@Component({ selector: "app-user", standalone: false, template: `` })\nclass UserComponent {}',
		'@Component({ selector: "app-user", standalone: true, template: `` })\nclass UserComponent {}',
	],
	"@angular-eslint/use-lifecycle-interface": [
		'import { Component } from "@angular/core";\n@Component({ selector: "app-page", template: `` })\nclass PageComponent { ngOnInit(): void { console.log("initialized"); } }',
		'import { Component, OnInit } from "@angular/core";\n@Component({ selector: "app-page", template: `` })\nclass PageComponent implements OnInit { ngOnInit(): void { console.log("initialized"); } }',
	],
	"@angular-eslint/use-pipe-transform-interface": [
		'@Pipe({ name: "label" })\nclass LabelPipe { transform(value: string): string { return value.trim(); } }',
		'@Pipe({ name: "label" })\nclass LabelPipe implements PipeTransform { transform(value: string): string { return value.trim(); } }',
	],
});

const angularTemplateExamples = defineExamples("html", {
	"@angular-eslint/template/alt-text": ['<img src="user.png">', '<img src="user.png" alt="User avatar">'],
	"@angular-eslint/template/elements-content": ["<button></button>", "<button>Save</button>"],
	"@angular-eslint/template/interactive-supports-focus": [
		'<div role="button" (click)="save()">Save</div>',
		'<div role="button" tabindex="0" (click)="save()" (keydown.enter)="save()">Save</div>',
	],
	"@angular-eslint/template/label-has-associated-control": ["<label>Name</label><input>", '<label for="name">Name</label><input id="name">'],
	"@angular-eslint/template/mouse-events-have-key-events": [
		'<div (mouseover)="showDetails()">Details</div>',
		'<div (mouseover)="showDetails()" (focus)="showDetails()" tabindex="0">Details</div>',
	],
	"@angular-eslint/template/no-autofocus": ["<input autofocus>", "<input>"],
	"@angular-eslint/template/no-distracting-elements": ["<marquee>News</marquee>", '<p aria-live="polite">News</p>'],
	"@angular-eslint/template/no-negated-async": ['<p *ngIf="!(ready$ | async)">Loading</p>', '<p *ngIf="(ready$ | async) === false">Loading</p>'],
	"@angular-eslint/template/prefer-control-flow": ['<p *ngIf="ready">Ready</p>', "@if (ready) { <p>Ready</p> }"],
	"@angular-eslint/template/role-has-required-aria": [
		'<div role="checkbox">Enabled</div>',
		'<div role="checkbox" aria-checked="false" tabindex="0">Enabled</div>',
	],
	"@angular-eslint/template/table-scope": ['<td scope="col">Name</td>', '<th scope="col">Name</th>'],
	"@angular-eslint/template/valid-aria": ['<button aria-labl="Save">Save</button>', '<button aria-label="Save">Save</button>'],
});

const typeScriptExamples = defineExamples("ts", {
	"@typescript-eslint/await-thenable": ["const value = await 42;", "const value = await Promise.resolve(42);"],
	"@typescript-eslint/ban-ts-comment": [
		"// @ts-ignore\nconst count: number = loadValue();",
		"// @ts-expect-error -- legacy API returns an invalid declaration\nconst count: number = loadValue();",
	],
	"@typescript-eslint/class-literal-property-style": [
		'class Status { get ready(): "ready" { return "ready"; } }',
		'class Status { readonly ready = "ready" as const; }',
	],
	"@typescript-eslint/consistent-indexed-object-style": ["type Scores = { [name: string]: number };", "type Scores = Record<string, number>;"],
	"@typescript-eslint/consistent-type-definitions": ["type User = { id: number };", "interface User { id: number }"],
	"@typescript-eslint/explicit-function-return-type": ["function load() { return 1; }", "function load(): number { return 1; }"],
	"@typescript-eslint/no-array-constructor": ["const values = new Array();", "const values: unknown[] = [];"],
	"@typescript-eslint/no-array-delete": [
		"declare const items: string[];\ndelete items[index];",
		"declare const items: string[];\nitems.splice(index, 1);",
	],
	"@typescript-eslint/no-base-to-string": [
		"interface User { name: string }\ndeclare const user: User;\nconst label = `User: ${user}`;",
		"interface User { name: string }\ndeclare const user: User;\nconst label = `User: ${user.name}`;",
	],
	"@typescript-eslint/no-deprecated": [
		"/** @deprecated Use loadCurrent instead. */\ndeclare function loadLegacy(): void;\nloadLegacy();",
		"declare function loadCurrent(): void;\nloadCurrent();",
	],
	"@typescript-eslint/no-duplicate-enum-values": ["enum Status { Ready = 1, Done = 1 }", "enum Status { Ready = 1, Done = 2 }"],
	"@typescript-eslint/no-duplicate-type-constituents": ["type Id = string | string;", "type Id = string | number;"],
	"@typescript-eslint/no-dynamic-delete": [
		"declare const record: Record<string, number>;\ndeclare const key: string;\ndelete record[key];",
		"declare const record: Record<string, number>;\ndeclare const key: string;\nconst { [key]: removedValue, ...remaining } = record;\nuse(removedValue, remaining);",
	],
	"@typescript-eslint/no-empty-function": ["const save = (): void => {};", "const save = (): void => { persist(); };"],
	"@typescript-eslint/no-empty-object-type": ["type Empty = {};", "type Empty = Record<string, never>;"],
	"@typescript-eslint/no-explicit-any": [
		"function parse(value: any): any { return value; }",
		"function parse(value: unknown): unknown { return value; }",
	],
	"@typescript-eslint/no-extra-non-null-assertion": ["const name = user!!.name;", "const name = user!.name;"],
	"@typescript-eslint/no-extraneous-class": [
		"class MathTools { static double(value: number): number { return value * 2; } }",
		"const double = (value: number): number => value * 2;",
	],
	"@typescript-eslint/no-floating-promises": [
		"declare function loadData(): Promise<void>;\nloadData();",
		"declare function loadData(): Promise<void>;\nawait loadData();",
	],
	"@typescript-eslint/no-for-in-array": [
		"declare const items: readonly string[];\nfor (const index in items) use(items[index]);",
		"declare const items: readonly string[];\nfor (const item of items) use(item);",
	],
	"@typescript-eslint/no-implied-eval": ['setTimeout("refresh()", 1000);', "setTimeout(() => refresh(), 1000);"],
	"@typescript-eslint/no-inferrable-types": ["const count: number = 1;", "const count = 1;"],
	"@typescript-eslint/no-meaningless-void-operator": [
		"declare function logSaved(): void;\nvoid logSaved();",
		"declare function logSaved(): void;\nlogSaved();",
	],
	"@typescript-eslint/no-misused-new": ["interface User { new (): User; }", "interface UserConstructor { new (): User; }"],
	"@typescript-eslint/no-misused-spread": [
		"interface User { name: string }\ndeclare function loadUser(): Promise<User>;\nconst result = { ...loadUser() };",
		"interface User { name: string }\ndeclare function loadUser(): Promise<User>;\nconst result = { ...(await loadUser()) };",
	],
	"@typescript-eslint/no-mixed-enums": ['enum Status { Ready = "ready", Failed = 1 }', 'enum Status { Ready = "ready", Failed = "failed" }'],
	"@typescript-eslint/no-namespace": [
		"namespace Format { export const trim = (value: string): string => value.trim(); }",
		"export const trim = (value: string): string => value.trim();",
	],
	"@typescript-eslint/no-non-null-asserted-nullish-coalescing": ["const value = input! ?? fallback;", "const value = input ?? fallback;"],
	"@typescript-eslint/no-non-null-asserted-optional-chain": ["const profile = user?.profile!;", "const profile = user?.profile;"],
	"@typescript-eslint/no-non-null-assertion": ["const name = user!.name;", 'const name = user?.name ?? "Anonymous";'],
	"@typescript-eslint/no-redeclare": ["let value = 1;\nlet value = 2;", "let value = 1;\nvalue = 2;"],
	"@typescript-eslint/no-redundant-type-constituents": ['type Name = string | "Fast";', "type Name = string;"],
	"@typescript-eslint/no-require-imports": ['const path = require("node:path");', 'import path from "node:path";'],
	"@typescript-eslint/no-this-alias": ["const self = this;\nself.save();", "this.save();"],
	"@typescript-eslint/no-unnecessary-condition": ["const ready = true;\nif (ready) start();", "const ready = true;\nstart();"],
	"@typescript-eslint/no-unnecessary-template-expression": ['const status = `${"ready"}`;', 'const status = "ready";'],
	"@typescript-eslint/no-unnecessary-type-arguments": [
		"declare function createValue<T = string>(): T;\nconst value = createValue<string>();",
		"declare function createValue<T = string>(): T;\nconst value = createValue();",
	],
	"@typescript-eslint/no-unnecessary-type-assertion": [
		"declare const name: string;\nconst normalized = name as string;",
		"declare const name: string;\nconst normalized = name;",
	],
	"@typescript-eslint/no-unnecessary-type-constraint": [
		"function identity<T extends unknown>(value: T): T { return value; }",
		"function identity<T>(value: T): T { return value; }",
	],
	"@typescript-eslint/no-unnecessary-type-conversion": ["const enabled = Boolean(true);", "const enabled = true;"],
	"@typescript-eslint/no-unsafe-argument": [
		"interface User { id: number }\ndeclare function saveUser(user: User): void;\ndeclare const input: any;\nsaveUser(input);",
		"interface User { id: number }\ndeclare function isUser(value: unknown): value is User;\ndeclare function saveUser(user: User): void;\ndeclare const input: unknown;\nif (isUser(input)) saveUser(input);",
	],
	"@typescript-eslint/no-unsafe-assignment": [
		"declare const input: any;\nconst user = input;",
		"interface User { id: number }\ndeclare function parseUser(value: unknown): User;\ndeclare const input: unknown;\nconst user = parseUser(input);",
	],
	"@typescript-eslint/no-unsafe-call": ["declare const callback: any;\ncallback();", "declare const callback: () => void;\ncallback();"],
	"@typescript-eslint/no-unsafe-declaration-merging": [
		"interface User { id: number }\nclass User {}",
		"interface UserData { id: number }\nclass User {}",
	],
	"@typescript-eslint/no-unsafe-enum-comparison": [
		'enum Status { Ready = "ready" }\ndeclare const status: Status;\nif (status === "ready") start();',
		'enum Status { Ready = "ready" }\ndeclare const status: Status;\nif (status === Status.Ready) start();',
	],
	"@typescript-eslint/no-unsafe-function-type": ["let callback: Function;", "let callback: (...args: unknown[]) => unknown;"],
	"@typescript-eslint/no-unsafe-member-access": [
		"declare const input: any;\nconst id = input.id;",
		"interface User { id: number }\ndeclare function isUser(value: unknown): value is User;\ndeclare const input: unknown;\nconst id = isUser(input) ? input.id : undefined;",
	],
	"@typescript-eslint/no-unsafe-return": [
		"interface User { id: number }\ndeclare const input: any;\nfunction load(): User { return input; }",
		"interface User { id: number }\ndeclare function parseUser(value: unknown): User;\ndeclare const input: unknown;\nfunction load(): User { return parseUser(input); }",
	],
	"@typescript-eslint/no-unsafe-unary-minus": [
		"declare const value: string;\nconst result = -value;",
		"declare const value: number;\nconst result = -value;",
	],
	"@typescript-eslint/no-unused-expressions": ["ready;", "if (ready) start();"],
	"@typescript-eslint/no-useless-default-assignment": [
		"interface Options { limit: number }\ndeclare const options: Options;\nconst { limit = 10 } = options;",
		"interface Options { limit: number }\ndeclare const options: Options;\nconst { limit } = options;",
	],
	"@typescript-eslint/no-wrapper-object-types": ['const name: String = "Fast";', 'const name: string = "Fast";'],
	"@typescript-eslint/only-throw-error": ['throw "Failed";', 'throw new Error("Failed");'],
	"@typescript-eslint/prefer-as-const": ['let status: "ready" = "ready";', 'let status = "ready" as const;'],
	"@typescript-eslint/prefer-namespace-keyword": [
		"module Format { export const trim = String.prototype.trim; }",
		"namespace Format { export const trim = String.prototype.trim; }",
	],
	"@typescript-eslint/prefer-nullish-coalescing": [
		"interface Config { timeout: number }\ndeclare const input: Config | null;\ndeclare const defaultConfig: Config;\nconst config = input || defaultConfig;",
		"interface Config { timeout: number }\ndeclare const input: Config | null;\ndeclare const defaultConfig: Config;\nconst config = input ?? defaultConfig;",
	],
	"@typescript-eslint/prefer-promise-reject-errors": [
		'function fail(): Promise<never> { return Promise.reject("Failed"); }',
		'function fail(): Promise<never> { return Promise.reject(new Error("Failed")); }',
	],
	"@typescript-eslint/prefer-readonly": [
		"class User { private id: number; constructor(id: number) { this.id = id; } getId(): number { return this.id; } }",
		"class User { private readonly id: number; constructor(id: number) { this.id = id; } getId(): number { return this.id; } }",
	],
	"@typescript-eslint/prefer-regexp-exec": [
		"declare const text: string;\nconst match = text.match(/fast/);",
		"declare const text: string;\nconst match = /fast/.exec(text);",
	],
	"@typescript-eslint/related-getter-setter-pairs": [
		'class User { get name(): string { return "Fast"; } set name(value: number) { save(value); } }',
		'class User { get name(): string { return "Fast"; } set name(value: string) { save(value); } }',
	],
	"@typescript-eslint/restrict-plus-operands": [
		"declare const count: number;\ndeclare const offset: bigint;\nconst total = count + offset;",
		"declare const count: number;\ndeclare const offset: number;\nconst total = count + offset;",
	],
	"@typescript-eslint/restrict-template-expressions": [
		"interface User { name: string }\ndeclare const user: User;\nconst label = `User: ${user}`;",
		"interface User { name: string }\ndeclare const user: User;\nconst label = `User: ${user.name}`;",
	],
	"@typescript-eslint/return-await": [
		"interface User { id: number }\ndeclare function fetchUser(): Promise<User>;\nasync function load(): Promise<User> { try { return fetchUser(); } catch (error) { recover(error); throw error; } }",
		"interface User { id: number }\ndeclare function fetchUser(): Promise<User>;\nasync function load(): Promise<User> { try { return await fetchUser(); } catch (error) { recover(error); throw error; } }",
	],
	"@typescript-eslint/strict-void-return": ["const callback: () => void = () => 42;", "const callback: () => void = () => { log(); };"],
	"@typescript-eslint/triple-slash-reference": [
		'/// <reference path="./types.d.ts" />\nconst user: User = loadUser();',
		'import type { User } from "./types";\nconst user: User = loadUser();',
	],
	"@typescript-eslint/unbound-method": [
		'class Logger { prefix = "Fast"; log(message: string): void { console.log(this.prefix, message); } }\nconst logger = new Logger();\nconst log = logger.log;\nlog("Saved");',
		'class Logger { prefix = "Fast"; log(message: string): void { console.log(this.prefix, message); } }\nconst logger = new Logger();\nconst log = logger.log.bind(logger);\nlog("Saved");',
	],
	"@typescript-eslint/unified-signatures": [
		"function format(value: string): string;\nfunction format(value: number): string;",
		"function format(value: string | number): string;",
	],
	"@typescript-eslint/use-unknown-in-catch-callback-variable": [
		"declare const promise: Promise<void>;\npromise.catch((error: any) => report(error));",
		"declare const promise: Promise<void>;\npromise.catch((error: unknown) => report(normalizeError(error)));",
	],
});

const vueExamples = defineExamples("vue", {
	"vue/block-order": [
		"<style scoped>.page { color: red; }</style>\n<script setup>const title = 'Page';</script>\n<template><h1>{{ title }}</h1></template>",
		"<script setup>const title = 'Page';</script>\n<template><h1>{{ title }}</h1></template>\n<style scoped>.page { color: red; }</style>",
	],
	"vue/comment-directive": [
		'<template>\n// eslint-disable-next-line vue/no-v-html\n<div v-html="html" />\n</template>',
		'<!-- eslint-disable-next-line vue/no-v-html -->\n<div v-html="html" />',
	],
	"vue/component-definition-name-casing": ["export default { name: 'user-card' };", "export default { name: 'UserCard' };"],
	"vue/custom-event-name-casing": [
		'<script setup>const emit = defineEmits(["saveItem"]);\nemit("save-item");</script>',
		'<script setup>const emit = defineEmits(["saveItem"]);\nemit("saveItem");</script>',
	],
	"vue/first-attribute-linebreak": ['<UserCard name="Fast"\n  :active="true" />', '<UserCard\n  name="Fast"\n  :active="true"\n/>'],
	"vue/multi-word-component-names": ["export default { name: 'Card' };", "export default { name: 'UserCard' };"],
	"vue/no-arrow-functions-in-watch": [
		"export default { watch: { count: () => { this.save(); } } };",
		"export default { watch: { count() { this.save(); } } };",
	],
	"vue/no-async-in-computed-properties": [
		"export default { computed: { async user() { return await loadUser(); } } };",
		"export default { data: () => ({ user: null }), async mounted() { this.user = await loadUser(); } };",
	],
	"vue/no-child-content": ['<div v-html="html">Fallback</div>', '<div v-html="html" />'],
	"vue/no-computed-properties-in-data": [
		"export default { data() { return { label: this.fullName }; }, computed: { fullName() { return this.name.trim(); } } };",
		"export default { data: () => ({ name: '' }), computed: { fullName() { return this.name.trim(); } } };",
	],
	"vue/no-deprecated-data-object-declaration": [
		"export default { data: { ready: false } };",
		"export default { data() { return { ready: false }; } };",
	],
	"vue/no-deprecated-delete-set": [
		"export default { methods: { update() { this.$set(this.user, 'name', 'Fast'); this.$delete(this.user, 'legacy'); } } };",
		"export default { methods: { update() { this.user.name = 'Fast'; delete this.user.legacy; } } };",
	],
	"vue/no-deprecated-destroyed-lifecycle": ["export default { destroyed() { cleanup(); } };", "export default { unmounted() { cleanup(); } };"],
	"vue/no-deprecated-dollar-listeners-api": [
		"export default { mounted() { use(this.$listeners); } };",
		"export default { mounted() { use(this.$attrs); } };",
	],
	"vue/no-deprecated-dollar-scopedslots-api": [
		"export default { mounted() { use(this.$scopedSlots); } };",
		"export default { mounted() { use(this.$slots); } };",
	],
	"vue/no-deprecated-events-api": [
		"export default { mounted() { this.$on('save', this.handleSave); } };",
		"export default { mounted() { eventBus.on('save', this.handleSave); } };",
	],
	"vue/no-deprecated-filter": ["<p>{{ total | currency }}</p>", "<p>{{ formatCurrency(total) }}</p>"],
	"vue/no-deprecated-functional-template": [
		"<template functional><div /></template>",
		"<script>export default (props) => h('div', props);</script>",
	],
	"vue/no-deprecated-html-element-is": ['<table><tr is="UserRow" /></table>', '<table><tr is="vue:UserRow" /></table>'],
	"vue/no-deprecated-inline-template": [
		"<UserCard inline-template><p>{{ name }}</p></UserCard>",
		"<UserCard><template #default><p>{{ name }}</p></template></UserCard>",
	],
	"vue/no-deprecated-model-definition": [
		"export default { model: { prop: 'value', event: 'input' } };",
		"export default { props: { modelValue: String }, emits: ['update:modelValue'] };",
	],
	"vue/no-deprecated-props-default-this": [
		"export default { props: { color: { default() { return this.theme.color; } } } };",
		"export default { props: { color: { default: 'blue' } } };",
	],
	"vue/no-deprecated-router-link-tag-prop": [
		'<RouterLink to="/home" tag="button">Home</RouterLink>',
		'<RouterLink to="/home" custom v-slot="{ navigate }"><button @click="navigate">Home</button></RouterLink>',
	],
	"vue/no-deprecated-scope-attribute": [
		'<template scope="slotProps">{{ slotProps.name }}</template>',
		'<template #default="slotProps">{{ slotProps.name }}</template>',
	],
	"vue/no-deprecated-slot-attribute": ['<p slot="header">Title</p>', "<template #header><p>Title</p></template>"],
	"vue/no-deprecated-slot-scope-attribute": [
		'<template slot-scope="slotProps">{{ slotProps.name }}</template>',
		'<template #default="slotProps">{{ slotProps.name }}</template>',
	],
	"vue/no-deprecated-v-bind-sync": ['<UserCard :name.sync="name" />', '<UserCard v-model:name="name" />'],
	"vue/no-deprecated-v-is": ['<div v-is="componentName" />', '<component :is="componentName" />'],
	"vue/no-deprecated-v-on-native-modifier": ['<UserCard @click.native="open" />', '<UserCard @click="open" />'],
	"vue/no-deprecated-v-on-number-modifiers": ['<input @keyup.13="submit" />', '<input @keyup.enter="submit" />'],
	"vue/no-deprecated-vue-config-keycodes": [
		"Vue.config.keyCodes.f1 = 112;",
		"const onKeydown = (event) => { if (event.key === 'F1') openHelp(); };",
	],
	"vue/no-dupe-v-else-if": [
		"<p v-if=\"status === 'ready'\">Ready</p><p v-else-if=\"status === 'ready'\">Again</p>",
		"<p v-if=\"status === 'ready'\">Ready</p><p v-else-if=\"status === 'failed'\">Failed</p>",
	],
	"vue/no-duplicate-attributes": ['<UserCard name="A" name="B" />', '<UserCard first-name="A" last-name="B" />'],
	"vue/no-export-in-script-setup": ["<script setup>export const ready = true;</script>", "<script setup>const ready = true;</script>"],
	"vue/no-expose-after-await": [
		"<script setup>await load();\ndefineExpose({ refresh });</script>",
		"<script setup>defineExpose({ refresh });\nawait load();</script>",
	],
	"vue/no-lifecycle-after-await": [
		"<script>import { onMounted } from 'vue';\nexport default { async setup() { await load(); onMounted(start); } };</script>",
		"<script>import { onMounted } from 'vue';\nexport default { async setup() { onMounted(start); await load(); } };</script>",
	],
	"vue/no-lone-template": ["<template><template><p>Content</p></template></template>", "<template><p>Content</p></template>"],
	"vue/no-multiple-slot-args": [
		"export default { mounted() { this.$slots.default({ name: 'Fast' }, 0); } };",
		"export default { mounted() { this.$slots.default({ name: 'Fast', index: 0 }); } };",
	],
	"vue/no-parsing-error": ["<template><div></span></template>", "<template><div /></template>"],
	"vue/no-ref-as-operand": [
		"<script setup>import { ref } from 'vue';\nconst count = ref(0);\nconst next = count + 1;</script>",
		"<script setup>import { ref } from 'vue';\nconst count = ref(0);\nconst next = count.value + 1;</script>",
	],
	"vue/no-ref-object-reactivity-loss": [
		"<script setup>import { ref } from 'vue';\nconst count = ref(0).value;</script>",
		"<script setup>import { ref } from 'vue';\nconst count = ref(0);</script>\n<template><p>{{ count }}</p></template>",
	],
	"vue/no-required-prop-with-default": [
		"export default { props: { name: { type: String, required: true, default: 'Fast' } } };",
		"export default { props: { name: { type: String, default: 'Fast' } } };",
	],
	"vue/no-reserved-keys": ["export default { data: () => ({ $el: null }) };", "export default { data: () => ({ element: null }) };"],
	"vue/no-reserved-props": ["export default { props: { key: String } };", "export default { props: { itemKey: String } };"],
	"vue/no-setup-props-reactivity-loss": [
		"export default { setup({ count }) { return { count }; } };",
		"export default { setup(props) { return { count: toRef(props, 'count') }; } };",
	],
	"vue/no-shared-component-data": ["export default { data: { ready: false } };", "export default { data() { return { ready: false }; } };"],
	"vue/no-side-effects-in-computed-properties": [
		"export default { computed: { fullName() { this.name = this.name.trim(); return this.name; } } };",
		"export default { computed: { fullName() { return this.name.trim(); } } };",
	],
	"vue/no-template-key": ['<template :key="item.id"><UserRow /></template>', '<UserRow :key="item.id" />'],
	"vue/no-template-shadow": [
		'<div v-for="user in users"><span v-for="user in user.friends">{{ user.name }}</span></div>',
		'<div v-for="user in users"><span v-for="friend in user.friends">{{ friend.name }}</span></div>',
	],
	"vue/no-textarea-mustache": ["<textarea>{{ message }}</textarea>", '<textarea v-model="message" />'],
	"vue/no-unused-components": [
		"<script>import UserCard from './UserCard.vue';\nexport default { components: { UserCard } };</script>\n<template><div /></template>",
		"<script>import UserCard from './UserCard.vue';\nexport default { components: { UserCard } };</script>\n<template><UserCard /></template>",
	],
	"vue/no-unused-vars": ['<li v-for="item in items">Static</li>', '<li v-for="item in items">{{ item.name }}</li>'],
	"vue/no-use-computed-property-like-method": [
		"export default { computed: { fullName() { return 'Fast'; } }, mounted() { use(this.fullName()); } };",
		"export default { computed: { fullName() { return 'Fast'; } }, mounted() { use(this.fullName); } };",
	],
	"vue/no-use-v-if-with-v-for": [
		'<li v-for="item in items" v-if="item.visible">{{ item.name }}</li>',
		'<li v-for="item in visibleItems">{{ item.name }}</li>',
	],
	"vue/no-useless-template-attributes": [
		'<template v-if="ready" class="wrapper"><p>Text</p></template>',
		'<template v-if="ready"><p class="wrapper">Text</p></template>',
	],
	"vue/no-v-for-template-key-on-child": [
		'<template v-for="item in items"><UserRow :key="item.id" /></template>',
		'<template v-for="item in items" :key="item.id"><UserRow /></template>',
	],
	"vue/no-watch-after-await": [
		"<script>import { watch } from 'vue';\nexport default { async setup() { await load(); watch(source, update); } };</script>",
		"<script>import { watch } from 'vue';\nexport default { async setup() { watch(source, update); await load(); } };</script>",
	],
	"vue/one-component-per-file": [
		"export const Header = defineComponent({});\nexport const Footer = defineComponent({});",
		"export default defineComponent({ name: 'PageHeader' });",
	],
	"vue/order-in-components": [
		"export default { methods: { save() {} }, props: { name: String }, data: () => ({ ready: false }) };",
		"export default { props: { name: String }, data: () => ({ ready: false }), methods: { save() {} } };",
	],
	"vue/prefer-import-from-vue": ["import { ref } from '@vue/reactivity';", "import { ref } from 'vue';"],
	"vue/prop-name-casing": ["export default { props: { user_name: String } };", "export default { props: { userName: String } };"],
	"vue/require-component-is": ["<component />", '<component :is="currentComponent" />'],
	"vue/require-default-prop": ["export default { props: { name: String } };", "export default { props: { name: { type: String, default: '' } } };"],
	"vue/require-prop-type-constructor": [
		"export default { props: { name: { type: 'string' } } };",
		"export default { props: { name: { type: String } } };",
	],
	"vue/require-prop-types": ["export default { props: ['name'] };", "export default { props: { name: String } };"],
	"vue/require-render-return": [
		"export default { render() { createVNode('div'); } };",
		"export default { render() { return createVNode('div'); } };",
	],
	"vue/require-slots-as-functions": [
		"export default { mounted() { const content = [this.$slots.default]; use(content); } };",
		"export default { mounted() { const content = [this.$slots.default?.()]; use(content); } };",
	],
	"vue/require-toggle-inside-transition": [
		"<Transition><div>Always visible</div></Transition>",
		'<Transition><div v-if="visible">Visible</div></Transition>',
	],
	"vue/require-v-for-key": ['<div v-for="item in items">{{ item.name }}</div>', '<div v-for="item in items" :key="item.id">{{ item.name }}</div>'],
	"vue/require-valid-default-prop": [
		"export default { props: { items: { type: Array, default: [] } } };",
		"export default { props: { items: { type: Array, default: () => [] } } };",
	],
	"vue/return-in-computed-property": [
		"export default { computed: { label() { if (this.name) return this.name; } } };",
		"export default { computed: { label() { return this.name || 'Anonymous'; } } };",
	],
	"vue/return-in-emits-validator": [
		"<script setup>const emit = defineEmits({ save(payload) { validate(payload); } });</script>",
		"<script setup>const emit = defineEmits({ save(payload) { return validate(payload); } });</script>",
	],
	"vue/this-in-template": ["<p>{{ this.name }}</p>", "<p>{{ name }}</p>"],
	"vue/use-v-on-exact": [
		'<button @click="select" @click.ctrl="selectMultiple">Select</button>',
		'<button @click.exact="select" @click.ctrl.exact="selectMultiple">Select</button>',
	],
	"vue/v-bind-style": ['<UserCard v-bind:name="name" />', '<UserCard :name="name" />'],
	"vue/v-on-event-hyphenation": ['<UserCard @saveItem="save" />', '<UserCard @save-item="save" />'],
	"vue/v-on-style": ['<button v-on:click="save">Save</button>', '<button @click="save">Save</button>'],
	"vue/v-slot-style": ["<template v-slot:header>Title</template>", "<template #header>Title</template>"],
	"vue/valid-attribute-name": ['<div bad"name="value" />', '<div data-name="value" />'],
	"vue/valid-define-emits": [
		"<script setup>defineEmits(['save']);\ndefineEmits(['cancel']);</script>",
		"<script setup>const emit = defineEmits(['save', 'cancel']);</script>",
	],
	"vue/valid-define-options": [
		"<script setup>const componentName = getComponentName();\ndefineOptions({ name: componentName });</script>",
		"<script setup>defineOptions({ name: 'UserCard' });</script>",
	],
	"vue/valid-define-props": [
		"<script setup>defineProps(['name']);\ndefineProps(['age']);</script>",
		"<script setup>const props = defineProps(['name', 'age']);</script>",
	],
	"vue/valid-next-tick": [
		"export default { mounted() { this.$nextTick(); } };",
		"export default { mounted() { this.$nextTick(() => updateLayout()); } };",
	],
	"vue/valid-template-root": ["<template></template>", "<template><main>Content</main></template>"],
	"vue/valid-v-bind": ["<div v-bind:class />", '<div :class="classes" />'],
	"vue/valid-v-cloak": ['<div v-cloak="ready" />', "<div v-cloak />"],
	"vue/valid-v-else": ['<p v-else="ready">Fallback</p>', '<p v-if="ready">Ready</p><p v-else>Fallback</p>'],
	"vue/valid-v-else-if": ["<p v-else-if>Loading</p>", '<p v-if="ready">Ready</p><p v-else-if="loading">Loading</p>'],
	"vue/valid-v-for": ["<li v-for>Item</li>", '<li v-for="item in items" :key="item.id">{{ item.name }}</li>'],
	"vue/valid-v-html": ["<div v-html />", '<div v-html="sanitizedHtml" />'],
	"vue/valid-v-if": ["<p v-if>Ready</p>", '<p v-if="ready">Ready</p>'],
	"vue/valid-v-is": ["<div v-is />", '<component :is="currentComponent" />'],
	"vue/valid-v-memo": ["<div v-memo />", '<div v-memo="[count]" />'],
	"vue/valid-v-model": ['<input v-model:color="color" />', '<input v-model="color" />'],
	"vue/valid-v-on": ["<button v-on>Save</button>", '<button @click="save">Save</button>'],
	"vue/valid-v-once": ["<p v-once:label>Static</p>", "<p v-once>Static</p>"],
	"vue/valid-v-pre": ['<p v-pre="enabled">{{ raw }}</p>', "<p v-pre>{{ raw }}</p>"],
	"vue/valid-v-show": ["<p v-show>Visible</p>", '<p v-show="visible">Visible</p>'],
	"vue/valid-v-slot": ["<div #header>Title</div>", "<UserCard><template #header>Title</template></UserCard>"],
	"vue/valid-v-text": ["<p v-text />", '<p v-text="message" />'],
});

const vueJsxExamples = defineExamples("tsx", {
	"vue/jsx-uses-vars": [
		"const UserCard = defineComponent({});\nconst view = <div />;",
		"const UserCard = defineComponent({});\nconst view = <UserCard />;",
	],
});

const rulesOfHooksExample: ExamplePair = [
	"function UserCard({ ready }: Props) { if (ready) { useEffect(load, []); } return <div />; }",
	"function UserCard({ ready }: Props) { useEffect(() => { if (ready) load(); }, [ready]); return <div />; }",
];
const exhaustiveDepsExample: ExamplePair = [
	"function UserCard({ id }: Props) { useEffect(() => load(id), []); return <div />; }",
	"function UserCard({ id }: Props) { useEffect(() => load(id), [id]); return <div />; }",
];
const purityExample: ExamplePair = [
	"function Token() { const value = Math.random(); return <span>{value}</span>; }",
	"function Token() { const [value] = useState(() => Math.random()); return <span>{value}</span>; }",
];
const setStateInEffectExample: ExamplePair = [
	"function User({ name }: Props) { const [label, setLabel] = useState(''); useEffect(() => { setLabel(name.trim()); }, [name]); return <p>{label}</p>; }",
	"function User({ name }: Props) { const label = name.trim(); return <p>{label}</p>; }",
];
const setStateInRenderExample: ExamplePair = [
	"function Counter() { const [count, setCount] = useState(0); setCount(count + 1); return <span>{count}</span>; }",
	"function Counter() { const [count, setCount] = useState(0); return <button onClick={() => setCount(count + 1)}>{count}</button>; }",
];
const staticComponentsExample: ExamplePair = [
	"function Page() { function Header() { return <h1>Title</h1>; } return <Header />; }",
	"function Header() { return <h1>Title</h1>; }\nfunction Page() { return <Header />; }",
];
const useMemoExample: ExamplePair = [
	"function User({ name }: Props) { useMemo(() => name.trim(), [name]); return <p>{name}</p>; }",
	"function User({ name }: Props) { const label = useMemo(() => name.trim(), [name]); return <p>{label}</p>; }",
];
const errorBoundariesExample: ExamplePair = [
	"function Page() { try { return <Profile />; } catch { return <Fallback />; } }",
	"function Page() { return <ErrorBoundary fallback={<Fallback />}><Profile /></ErrorBoundary>; }",
];
const unsupportedSyntaxExample: ExamplePair = [
	"function Page({ source }: Props) { return <div>{eval(source)}</div>; }",
	"function Page({ source }: Props) { return <div>{JSON.parse(source)}</div>; }",
];

const reactExamples = defineExamples("tsx", {
	"@eslint-react/error-boundaries": errorBoundariesExample,
	"@eslint-react/exhaustive-deps": exhaustiveDepsExample,
	"@eslint-react/jsx-no-children-prop": ["<UserCard children={<span>Name</span>} />", "<UserCard><span>Name</span></UserCard>"],
	"@eslint-react/jsx-no-children-prop-with-children": [
		"<UserCard children={<span>A</span>}><span>B</span></UserCard>",
		"<UserCard><span>B</span></UserCard>",
	],
	"@eslint-react/jsx-no-comment-textnodes": ["<div>// temporary note</div>", "<div>{/* temporary note */}</div>"],
	"@eslint-react/jsx-no-key-after-spread": [
		"const props = { className: 'row' };\n<div {...props} key=\"row\" />;",
		"const props = { className: 'row' };\n<div key=\"row\" {...props} />;",
	],
	"@eslint-react/jsx-no-leaked-dollar": ["<span>Total: ${total}</span>", "<span>Total: {total}</span>"],
	"@eslint-react/jsx-no-leaked-semicolon": ["<span>;\n{label}</span>", "<span>{label}</span>"],
	"@eslint-react/jsx-no-namespace": ["<svg:path />", "<path />"],
	"@eslint-react/naming-convention-context-name": ["const Theme = createContext('light');", "const ThemeContext = createContext('light');"],
	"@eslint-react/naming-convention-id-name": ["const userIdentifier = useId();", "const userId = useId();"],
	"@eslint-react/naming-convention-ref-name": ["const element = useRef<HTMLDivElement>(null);", "const elementRef = useRef<HTMLDivElement>(null);"],
	"@eslint-react/no-access-state-in-setstate": [
		"class Counter extends Component { increment() { this.setState({ count: this.state.count + 1 }); } render() { return <span>{this.state.count}</span>; } }",
		"class Counter extends Component { increment() { this.setState((state) => ({ count: state.count + 1 })); } render() { return <span>{this.state.count}</span>; } }",
	],
	"@eslint-react/no-array-index-key": [
		"items.map((item, index) => <Row key={index} item={item} />)",
		"items.map((item) => <Row key={item.id} item={item} />)",
	],
	"@eslint-react/no-children-count": ["const count = Children.count(children);", "const count = items.length;"],
	"@eslint-react/no-children-for-each": ["Children.forEach(children, renderChild);", "items.forEach(renderItem);"],
	"@eslint-react/no-children-map": ["const rows = Children.map(children, wrapChild);", "const rows = items.map(renderItem);"],
	"@eslint-react/no-children-only": ["const child = Children.only(children);", "const child = Array.isArray(children) ? children[0] : children;"],
	"@eslint-react/no-children-to-array": ["const list = Children.toArray(children);", "const list = items.slice();"],
	"@eslint-react/no-clone-element": ["const button = cloneElement(child, { disabled: true });", "const button = <Button {...props} disabled />;"],
	"@eslint-react/no-component-will-mount": [
		"class Page extends Component { componentWillMount() { load(); } }",
		"class Page extends Component { componentDidMount() { load(); } }",
	],
	"@eslint-react/no-component-will-receive-props": [
		"class Page extends Component { componentWillReceiveProps(next: Props) { sync(next); } }",
		"class Page extends Component { componentDidUpdate(previous: Props) { if (previous.id !== this.props.id) sync(this.props); } }",
	],
	"@eslint-react/no-component-will-update": [
		"class Page extends Component { componentWillUpdate() { saveLayout(); } }",
		"class Page extends Component { componentDidUpdate() { saveLayout(); } }",
	],
	"@eslint-react/no-context-provider": [
		"<ThemeContext.Provider value={theme}><Page /></ThemeContext.Provider>",
		"<ThemeContext value={theme}><Page /></ThemeContext>",
	],
	"@eslint-react/no-create-ref": [
		"function Input() { const inputRef = createRef<HTMLInputElement>(); return <input ref={inputRef} />; }",
		"function Input() { const inputRef = useRef<HTMLInputElement>(null); return <input ref={inputRef} />; }",
	],
	"@eslint-react/no-direct-mutation-state": [
		"class Counter extends Component { increment() { this.state.count += 1; } render() { return <span>{this.state.count}</span>; } }",
		"class Counter extends Component { increment() { this.setState((state) => ({ count: state.count + 1 })); } render() { return <span>{this.state.count}</span>; } }",
	],
	"@eslint-react/no-forward-ref": [
		"const Input = forwardRef<HTMLInputElement, Props>((props, ref) => <input ref={ref} />);",
		"function Input({ ref, ...props }: Props & { ref?: Ref<HTMLInputElement> }) { return <input ref={ref} {...props} />; }",
	],
	"@eslint-react/no-leaked-conditional-rendering": [
		"interface Props { count: number }\nfunction List({ count }: Props) { return <div>{count && <Items />}</div>; }",
		"interface Props { count: number }\nfunction List({ count }: Props) { return <div>{count > 0 ? <Items /> : null}</div>; }",
	],
	"@eslint-react/no-missing-key": ["items.map((item) => <Row item={item} />)", "items.map((item) => <Row key={item.id} item={item} />)"],
	"@eslint-react/no-nested-component-definitions": staticComponentsExample,
	"@eslint-react/no-nested-lazy-component-declarations": [
		"function Page() { const Settings = lazy(() => import('./Settings')); return <Settings />; }",
		"const Settings = lazy(() => import('./Settings'));\nfunction Page() { return <Settings />; }",
	],
	"@eslint-react/no-set-state-in-component-did-mount": [
		"class Page extends Component { componentDidMount() { this.setState({ ready: true }); } }",
		"class Page extends Component { componentDidMount() { subscribe(() => this.setState({ ready: true })); } }",
	],
	"@eslint-react/no-set-state-in-component-did-update": [
		"class Page extends Component { componentDidUpdate() { this.setState({ ready: true }); } }",
		"class Page extends Component { componentDidUpdate() { schedule(() => this.setState({ ready: true })); } }",
	],
	"@eslint-react/no-set-state-in-component-will-update": [
		"class Page extends Component { componentWillUpdate() { this.setState({ ready: true }); } }",
		"class Page extends Component { componentWillUpdate() { schedule(() => this.setState({ ready: true })); } }",
	],
	"@eslint-react/no-unnecessary-use-prefix": [
		"function useFormatter(value: string) { return value.trim(); }",
		"function formatValue(value: string) { return value.trim(); }",
	],
	"@eslint-react/no-unsafe-component-will-mount": [
		"class Page extends Component { UNSAFE_componentWillMount() { load(); } }",
		"class Page extends Component { componentDidMount() { load(); } }",
	],
	"@eslint-react/no-unsafe-component-will-receive-props": [
		"class Page extends Component { UNSAFE_componentWillReceiveProps(next: Props) { sync(next); } }",
		"class Page extends Component { componentDidUpdate(previous: Props) { if (previous.id !== this.props.id) sync(this.props); } }",
	],
	"@eslint-react/no-unsafe-component-will-update": [
		"class Page extends Component { UNSAFE_componentWillUpdate() { saveLayout(); } }",
		"class Page extends Component { componentDidUpdate() { saveLayout(); } }",
	],
	"@eslint-react/no-unused-class-component-members": [
		"class Page extends Component { unused = 1; render() { return <div />; } }",
		"class Page extends Component { title = 'Page'; render() { return <div>{this.title}</div>; } }",
	],
	"@eslint-react/no-use-context": ["const theme = useContext(ThemeContext);", "const theme = use(ThemeContext);"],
	"@eslint-react/purity": purityExample,
	"@eslint-react/rsc-function-definition": [
		'"use server";\nexport function save() { persist(); }',
		'"use server";\nexport async function save(): Promise<void> { await persist(); }',
	],
	"@eslint-react/rules-of-hooks": rulesOfHooksExample,
	"@eslint-react/set-state-in-effect": setStateInEffectExample,
	"@eslint-react/set-state-in-render": setStateInRenderExample,
	"@eslint-react/static-components": staticComponentsExample,
	"@eslint-react/unsupported-syntax": unsupportedSyntaxExample,
	"@eslint-react/use-memo": useMemoExample,
	"@eslint-react/use-state": ["const state = useState(0);", "const [count, setCount] = useState(0);"],
	"@eslint-react/dom-no-dangerously-set-innerhtml": ["<div dangerouslySetInnerHTML={{ __html: html }} />", "<div>{plainText}</div>"],
	"@eslint-react/dom-no-dangerously-set-innerhtml-with-children": [
		"<div dangerouslySetInnerHTML={{ __html: html }}>Fallback</div>",
		"<div dangerouslySetInnerHTML={{ __html: html }} />",
	],
	"@eslint-react/dom-no-find-dom-node": ["const node = findDOMNode(component);", "const nodeRef = useRef<HTMLDivElement>(null);"],
	"@eslint-react/dom-no-flush-sync": ["flushSync(() => setReady(true));", "setReady(true);"],
	"@eslint-react/dom-no-hydrate": [
		'import ReactDOM from "react-dom";\nReactDOM.hydrate(<App />, root);',
		'import { hydrateRoot } from "react-dom/client";\nhydrateRoot(root, <App />);',
	],
	"@eslint-react/dom-no-render": ["ReactDOM.render(<App />, root);", "createRoot(root).render(<App />);"],
	"@eslint-react/dom-no-render-return-value": ["const instance = ReactDOM.render(<App />, root);", "createRoot(root).render(<App />);"],
	"@eslint-react/dom-no-script-url": ['<a href="javascript:alert(1)">Open</a>', '<button type="button" onClick={open}>Open</button>'],
	"@eslint-react/dom-no-unknown-property": ['<label class="field" for="name">Name</label>', '<label className="field" htmlFor="name">Name</label>'],
	"@eslint-react/dom-no-unsafe-iframe-sandbox": [
		'<iframe sandbox="allow-scripts allow-same-origin" src={url} />',
		'<iframe sandbox="allow-scripts" src={url} />',
	],
	"@eslint-react/dom-no-use-form-state": [
		"import { useFormState } from 'react-dom';\nfunction Form() { const [state, action] = useFormState(save, initialState); return <form action={action}>{state.message}</form>; }",
		"import { useActionState } from 'react';\nfunction Form() { const [state, action] = useActionState(save, initialState); return <form action={action}>{state.message}</form>; }",
	],
	"@eslint-react/dom-no-void-elements-with-children": ["<img src={url}>Avatar</img>", '<img src={url} alt="Avatar" />'],
	"@eslint-react/web-api-no-leaked-event-listener": [
		"useEffect(() => { window.addEventListener('resize', resize); }, []);",
		"useEffect(() => { window.addEventListener('resize', resize); return () => window.removeEventListener('resize', resize); }, []);",
	],
	"@eslint-react/web-api-no-leaked-fetch": [
		"useEffect(() => { fetch(url).then(read); }, [url]);",
		"useEffect(() => { const controller = new AbortController(); fetch(url, { signal: controller.signal }).then(read); return () => controller.abort(); }, [url]);",
	],
	"@eslint-react/web-api-no-leaked-intersection-observer": [
		"useEffect(() => { const observer = new IntersectionObserver(update); observer.observe(node); }, [node]);",
		"useEffect(() => { const observer = new IntersectionObserver(update); observer.observe(node); return () => observer.disconnect(); }, [node]);",
	],
	"@eslint-react/web-api-no-leaked-interval": [
		"useEffect(() => { setInterval(refresh, 1000); }, []);",
		"useEffect(() => { const timer = setInterval(refresh, 1000); return () => clearInterval(timer); }, []);",
	],
	"@eslint-react/web-api-no-leaked-resize-observer": [
		"useEffect(() => { const observer = new ResizeObserver(update); observer.observe(node); }, [node]);",
		"useEffect(() => { const observer = new ResizeObserver(update); observer.observe(node); return () => observer.disconnect(); }, [node]);",
	],
	"@eslint-react/web-api-no-leaked-timeout": [
		"useEffect(() => { setTimeout(refresh, 1000); }, []);",
		"useEffect(() => { const timer = setTimeout(refresh, 1000); return () => clearTimeout(timer); }, []);",
	],
	"react-hooks/error-boundaries": errorBoundariesExample,
	"react-hooks/exhaustive-deps": exhaustiveDepsExample,
	"react-hooks/globals": [
		"let currentUser = null;\nfunction User({ user }: Props) { currentUser = user; return <p>{user.name}</p>; }",
		"function User({ user }: Props) { return <p>{user.name}</p>; }",
	],
	"react-hooks/immutability": [
		"function User({ user }: Props) { user.name = 'Fast'; return <p>{user.name}</p>; }",
		"function User({ user }: Props) { const nextUser = { ...user, name: 'Fast' }; return <p>{nextUser.name}</p>; }",
	],
	"react-hooks/incompatible-library": [
		"import { useForm } from 'react-hook-form';\nfunction Form() { const form = useForm(); const name = form.watch('name'); return <p>{name}</p>; }",
		"import { useWatch } from 'react-hook-form';\nfunction Form() { const name = useWatch({ name: 'name' }); return <p>{name}</p>; }",
	],
	"react-hooks/preserve-manual-memoization": [
		"import { useCallback } from 'react';\nfunction User({ user }: Props) { const open = useCallback(() => { if (user?.id) console.log(user.id); }, [user?.id]); return <button onClick={open}>Open</button>; }",
		"import { useCallback } from 'react';\nfunction User({ user }: Props) { const id = user?.id; const open = useCallback(() => { if (id) console.log(id); }, [id]); return <button onClick={open}>Open</button>; }",
	],
	"react-hooks/purity": purityExample,
	"react-hooks/refs": [
		"function Input() { const inputRef = useRef<HTMLInputElement>(null); return <span>{inputRef.current?.value}</span>; }",
		"function Input() { const inputRef = useRef<HTMLInputElement>(null); return <input ref={inputRef} />; }",
	],
	"react-hooks/rules-of-hooks": rulesOfHooksExample,
	"react-hooks/set-state-in-effect": setStateInEffectExample,
	"react-hooks/set-state-in-render": setStateInRenderExample,
	"react-hooks/static-components": staticComponentsExample,
	"react-hooks/unsupported-syntax": unsupportedSyntaxExample,
	"react-hooks/use-memo": [
		"function User({ name }: Props) { const label = useMemo(async () => name.trim(), [name]); return <p>{label}</p>; }",
		"function User({ name }: Props) { const label = useMemo(() => name.trim(), [name]); return <p>{label}</p>; }",
	],
});

const reactConfigExamples = defineExamples("js", {
	"react-hooks/config": [
		'export default [{ rules: { "react-hooks/config": ["error", { compilationMode: "invalid" }] } }];',
		'export default [{ rules: { "react-hooks/config": ["error", { compilationMode: "infer" }] } }];',
	],
	"react-hooks/gating": [
		'export default [{ rules: { "react-hooks/gating": ["error", { gating: { source: "" } }] } }];',
		'export default [{ rules: { "react-hooks/gating": ["error", { gating: { source: "featureFlags", importSpecifierName: "isCompilerEnabled" } }] } }];',
	],
});

/**
 * 已逐条审阅的补充规则示例。
 *
 * @remarks
 * 仓库重点规则的示例仍与生成器中的配置说明放在一起；这里补齐其余仓库规则与
 * 第三方预置规则。生成器会验证该记录与最终规则集合完全对应。
 */
export const reviewedRuleExamples: Record<string, ReviewedRuleExample> = {
	...javascriptExamples,
	...regexpExamples,
	...jsonExamples,
	...jsonVueExamples,
	...markdownExamples,
	...angularTypeScriptExamples,
	...angularTemplateExamples,
	...typeScriptExamples,
	...vueExamples,
	...vueJsxExamples,
	...reactExamples,
	...reactConfigExamples,
};
