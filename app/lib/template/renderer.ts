// Template renderer for LUMI OS template engine
// Evaluates the Abstract Syntax Tree (AST) to produce output

import {
	ASTNode,
	Expression,
	LiteralExpression,
	IdentifierExpression,
	BinaryExpression,
	UnaryExpression,
	FilterExpression,
	GroupExpression,
	MemberExpression,
} from './parser';

// ============================================================================
// Render Context
// ============================================================================

export interface RenderContext {
	variables: Record<string, any>;
	loopVariables?: Record<string, any>;
}

export interface RenderResult {
	output: string;
	errors: string[];
}

// ============================================================================
// Main Render Function
// ============================================================================

export async function render(ast: ASTNode[], context: RenderContext): Promise<RenderResult> {
	const errors: string[] = [];
	let output = '';

	for (const node of ast) {
		try {
			output += await renderNode(node, context);
		} catch (error) {
			errors.push(`Error rendering node at line ${node.line}: ${error instanceof Error ? error.message : String(error)}`);
		}
	}

	return { output, errors };
}

// ============================================================================
// Node Rendering
// ============================================================================

async function renderNode(node: ASTNode, context: RenderContext): Promise<string> {
	switch (node.type) {
		case 'text':
			return node.value;

		case 'variable':
			return await renderVariable(node, context);

		case 'if':
			return await renderIf(node, context);

		case 'for':
			return await renderFor(node, context);

		case 'set':
			return await renderSet(node, context);

		default:
			return '';
	}
}

async function renderVariable(node: any, context: RenderContext): Promise<string> {
	const value = await evaluateExpression(node.expression, context);
	return String(value ?? '');
}

async function renderIf(node: any, context: RenderContext): Promise<string> {
	const condition = await evaluateExpression(node.condition, context);

	if (isTruthy(condition)) {
		let output = '';
		for (const childNode of node.consequent) {
			output += await renderNode(childNode, context);
		}
		return output;
	}

	// Check elseif branches
	for (const elseif of node.elseifs) {
		const elseifCondition = await evaluateExpression(elseif.condition, context);
		if (isTruthy(elseifCondition)) {
			let output = '';
			for (const childNode of elseif.body) {
				output += await renderNode(childNode, context);
			}
			return output;
		}
	}

	// Check else branch
	if (node.alternate) {
		let output = '';
		for (const childNode of node.alternate) {
			output += await renderNode(childNode, context);
		}
		return output;
	}

	return '';
}

async function renderFor(node: any, context: RenderContext): Promise<string> {
	const iterable = await evaluateExpression(node.iterable, context);
	
	if (!iterable) {
		return '';
	}

	let output = '';
	let items: any[] = [];

	// Convert iterable to array
	if (Array.isArray(iterable)) {
		items = iterable;
	} else if (typeof iterable === 'object') {
		items = Object.values(iterable);
	} else {
		return '';
	}

	// Create loop context
	for (let i = 0; i < items.length; i++) {
		const loopContext: RenderContext = {
			variables: context.variables,
			loopVariables: {
				...context.loopVariables,
				[node.iterator]: items[i],
				[node.iterator + '_index']: i,
				'item_index': i,
			},
		};

		for (const childNode of node.body) {
			output += await renderNode(childNode, loopContext);
		}
	}

	return output;
}

async function renderSet(node: any, context: RenderContext): Promise<string> {
	const value = await evaluateExpression(node.value, context);
	
	// Set the variable in the context
	if (!context.loopVariables) {
		context.loopVariables = {};
	}
	context.loopVariables[node.variable] = value;
	
	return '';
}

// ============================================================================
// Expression Evaluation
// ============================================================================

async function evaluateExpression(expr: Expression, context: RenderContext): Promise<any> {
	switch (expr.type) {
		case 'literal':
			return (expr as LiteralExpression).value;

		case 'identifier':
			return evaluateIdentifier(expr as IdentifierExpression, context);

		case 'binary':
			return await evaluateBinaryExpression(expr as BinaryExpression, context);

		case 'unary':
			return await evaluateUnaryExpression(expr as UnaryExpression, context);

		case 'filter':
			return await evaluateFilterExpression(expr as FilterExpression, context);

		case 'group':
			return await evaluateExpression((expr as GroupExpression).expression, context);

		case 'member':
			return await evaluateMemberExpression(expr as MemberExpression, context);

		default:
			return null;
	}
}

function evaluateIdentifier(expr: IdentifierExpression, context: RenderContext): any {
	const name = expr.name;

	// Check loop variables first
	if (context.loopVariables && name in context.loopVariables) {
		return context.loopVariables[name];
	}

	// Check regular variables
	if (name in context.variables) {
		return context.variables[name];
	}

	// Handle dot notation for nested properties
	if (name.includes('.')) {
		const parts = name.split('.');
		let value: any = context.loopVariables?.[parts[0]] ?? context.variables[parts[0]];
		
		for (let i = 1; i < parts.length && value != null; i++) {
			value = value[parts[i]];
		}
		
		return value;
	}

	return null;
}

async function evaluateBinaryExpression(expr: BinaryExpression, context: RenderContext): Promise<any> {
	const left = await evaluateExpression(expr.left, context);
	const right = await evaluateExpression(expr.right, context);

	switch (expr.operator) {
		case '==':
			return left == right;
		case '!=':
			return left != right;
		case '>':
			return left > right;
		case '<':
			return left < right;
		case '>=':
			return left >= right;
		case '<=':
			return left <= right;
		case 'and':
			return isTruthy(left) && isTruthy(right);
		case 'or':
			return isTruthy(left) || isTruthy(right);
		case 'contains':
			if (typeof left === 'string') {
				return left.includes(String(right));
			}
			if (Array.isArray(left)) {
				return left.includes(right);
			}
			return false;
		case '??':
			return left != null ? left : right;
		default:
			return null;
	}
}

async function evaluateUnaryExpression(expr: UnaryExpression, context: RenderContext): Promise<any> {
	const argument = await evaluateExpression(expr.argument, context);

	switch (expr.operator) {
		case 'not':
			return !isTruthy(argument);
		default:
			return null;
	}
}

async function evaluateFilterExpression(expr: FilterExpression, context: RenderContext): Promise<any> {
	const value = await evaluateExpression(expr.value, context);
	const args = await Promise.all(expr.args.map(arg => evaluateExpression(arg, context)));

	return applyFilter(expr.name, value, args);
}

async function evaluateMemberExpression(expr: MemberExpression, context: RenderContext): Promise<any> {
	const object = await evaluateExpression(expr.object, context);
	const property = await evaluateExpression(expr.property, context);

	if (object == null) {
		return null;
	}

	return object[property];
}

// ============================================================================
// Filters
// ============================================================================

function applyFilter(name: string, value: any, args: any[]): any {
	switch (name) {
		case 'lower':
		case 'lowercase':
			return String(value).toLowerCase();

		case 'upper':
		case 'uppercase':
			return String(value).toUpperCase();

		case 'trim':
			return String(value).trim();

		case 'length':
			if (Array.isArray(value)) {
				return value.length;
			}
			if (typeof value === 'string') {
				return value.length;
			}
			return 0;

		case 'default':
			return value != null && value !== '' ? value : (args[0] ?? '');

		case 'join':
			if (Array.isArray(value)) {
				const separator = args[0] ?? ', ';
				return value.join(separator);
			}
			return value;

		case 'split':
			if (typeof value === 'string') {
				const separator = args[0] ?? ',';
				return value.split(separator);
			}
			return value;

		case 'replace':
			if (typeof value === 'string' && args.length >= 2) {
				const search = String(args[0]);
				const replace = String(args[1]);
				return value.replace(new RegExp(search, 'g'), replace);
			}
			return value;

		case 'slice':
			if (Array.isArray(value) || typeof value === 'string') {
				const start = args[0] ?? 0;
				const end = args[1];
				return value.slice(start, end);
			}
			return value;

		case 'first':
			if (Array.isArray(value) && value.length > 0) {
				return value[0];
			}
			return null;

		case 'last':
			if (Array.isArray(value) && value.length > 0) {
				return value[value.length - 1];
			}
			return null;

		case 'reverse':
			if (Array.isArray(value)) {
				return [...value].reverse();
			}
			if (typeof value === 'string') {
				return value.split('').reverse().join('');
			}
			return value;

		case 'unique':
			if (Array.isArray(value)) {
				return Array.from(new Set(value));
			}
			return value;

		case 'sort':
			if (Array.isArray(value)) {
				return [...value].sort();
			}
			return value;

		default:
			// Unknown filter - return value unchanged
			return value;
	}
}

// ============================================================================
// Helper Functions
// ============================================================================

function isTruthy(value: any): boolean {
	if (value == null) return false;
	if (typeof value === 'boolean') return value;
	if (typeof value === 'number') return value !== 0;
	if (typeof value === 'string') return value.length > 0;
	if (Array.isArray(value)) return value.length > 0;
	if (typeof value === 'object') return Object.keys(value).length > 0;
	return Boolean(value);
}
