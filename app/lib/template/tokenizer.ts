// Template tokenizer for LUMI OS template engine
// Converts template strings into a stream of tokens for parsing

// ============================================================================
// Token Types
// ============================================================================

export type TokenType =
	// Structural tokens
	| 'text'              // Raw text content between tags
	| 'variable_start'    // {{
	| 'variable_end'      // }}
	| 'tag_start'         // {%
	| 'tag_end'           // %}

	// Keywords
	| 'keyword_if'
	| 'keyword_elseif'
	| 'keyword_else'
	| 'keyword_endif'
	| 'keyword_for'
	| 'keyword_in'
	| 'keyword_endfor'
	| 'keyword_set'

	// Operators
	| 'op_eq'             // ==
	| 'op_neq'            // !=
	| 'op_gte'            // >=
	| 'op_lte'            // <=
	| 'op_gt'             // >
	| 'op_lt'             // <
	| 'op_and'            // and, &&
	| 'op_or'             // or, ||
	| 'op_not'            // not, !
	| 'op_contains'       // contains
	| 'op_nullish'        // ??
	| 'op_assign'         // =

	// Literals and identifiers
	| 'identifier'        // variable names
	| 'string'            // "string" or 'string'
	| 'number'            // 123, 45.67
	| 'boolean'           // true, false
	| 'null'              // null

	// Punctuation
	| 'pipe'              // |
	| 'lparen'            // (
	| 'rparen'            // )
	| 'lbracket'          // [
	| 'rbracket'          // ]
	| 'colon'             // :
	| 'comma'             // ,
	| 'dot'               // .

	// Special
	| 'eof';              // End of input

// ============================================================================
// Token Interface
// ============================================================================

export interface Token {
	type: TokenType;
	value: string;
	line: number;
	column: number;
	trimLeft?: boolean;
	trimRight?: boolean;
}

export interface TokenizerError {
	message: string;
	line: number;
	column: number;
}

export interface TokenizerResult {
	tokens: Token[];
	errors: TokenizerError[];
}

// ============================================================================
// Tokenizer State
// ============================================================================

type TokenizerMode = 'text' | 'variable' | 'tag';

interface TokenizerState {
	input: string;
	pos: number;
	line: number;
	column: number;
	mode: TokenizerMode;
	tokens: Token[];
	errors: TokenizerError[];
}

// ============================================================================
// Keywords
// ============================================================================

const KEYWORDS: Record<string, TokenType> = {
	'if': 'keyword_if',
	'elseif': 'keyword_elseif',
	'else': 'keyword_else',
	'endif': 'keyword_endif',
	'for': 'keyword_for',
	'in': 'keyword_in',
	'endfor': 'keyword_endfor',
	'set': 'keyword_set',
	'and': 'op_and',
	'or': 'op_or',
	'not': 'op_not',
	'contains': 'op_contains',
	'true': 'boolean',
	'false': 'boolean',
	'null': 'null',
};

// ============================================================================
// Main Tokenizer Function
// ============================================================================

export function tokenize(input: string): TokenizerResult {
	const state: TokenizerState = {
		input,
		pos: 0,
		line: 1,
		column: 1,
		mode: 'text',
		tokens: [],
		errors: [],
	};

	while (state.pos < state.input.length) {
		switch (state.mode) {
			case 'text':
				tokenizeText(state);
				break;
			case 'variable':
				tokenizeVariable(state);
				break;
			case 'tag':
				tokenizeTag(state);
				break;
		}
	}

	state.tokens.push({
		type: 'eof',
		value: '',
		line: state.line,
		column: state.column,
	});

	return {
		tokens: state.tokens,
		errors: state.errors,
	};
}

// ============================================================================
// Text Mode Tokenization
// ============================================================================

function tokenizeText(state: TokenizerState): void {
	const startPos = state.pos;
	const startLine = state.line;
	const startColumn = state.column;

	while (state.pos < state.input.length) {
		if (lookAhead(state, '{{')) {
			if (state.pos > startPos) {
				state.tokens.push({
					type: 'text',
					value: state.input.slice(startPos, state.pos),
					line: startLine,
					column: startColumn,
				});
			}

			advance(state, 2);
			state.tokens.push({
				type: 'variable_start',
				value: '{{',
				line: state.line,
				column: state.column - 2,
				trimLeft: false,
			});

			state.mode = 'variable';
			return;
		}

		if (lookAhead(state, '{%')) {
			if (state.pos > startPos) {
				state.tokens.push({
					type: 'text',
					value: state.input.slice(startPos, state.pos),
					line: startLine,
					column: startColumn,
				});
			}

			advance(state, 2);
			state.tokens.push({
				type: 'tag_start',
				value: '{%',
				line: state.line,
				column: state.column - 2,
				trimLeft: false,
			});

			state.mode = 'tag';
			return;
		}

		advanceChar(state);
	}

	if (state.pos > startPos) {
		state.tokens.push({
			type: 'text',
			value: state.input.slice(startPos, state.pos),
			line: startLine,
			column: startColumn,
		});
	}
}

// ============================================================================
// Variable Mode Tokenization
// ============================================================================

function tokenizeVariable(state: TokenizerState): void {
	skipWhitespace(state);

	if (lookAhead(state, '}}')) {
		state.tokens.push({
			type: 'variable_end',
			value: '}}',
			line: state.line,
			column: state.column,
			trimRight: false,
		});
		advance(state, 2);
		state.mode = 'text';
		return;
	}

	tokenizeExpression(state, 'variable');
}

// ============================================================================
// Tag Mode Tokenization
// ============================================================================

function tokenizeTag(state: TokenizerState): void {
	skipWhitespace(state);

	if (lookAhead(state, '%}')) {
		state.tokens.push({
			type: 'tag_end',
			value: '%}',
			line: state.line,
			column: state.column,
			trimRight: true,
		});
		advance(state, 2);
		state.mode = 'text';
		return;
	}

	tokenizeExpression(state, 'tag');
}

// ============================================================================
// Expression Tokenization
// ============================================================================

function tokenizeExpression(state: TokenizerState, mode: 'variable' | 'tag'): void {
	skipWhitespace(state);

	if (state.pos >= state.input.length) {
		state.errors.push({
			message: `Unexpected end of input in ${mode}`,
			line: state.line,
			column: state.column,
		});
		return;
	}

	const char = state.input[state.pos];
	const startLine = state.line;
	const startColumn = state.column;

	// String literal
	if (char === '"' || char === "'") {
		tokenizeString(state);
		return;
	}

	// Number literal
	if (isDigit(char) || (char === '-' && isDigit(state.input[state.pos + 1]))) {
		tokenizeNumber(state);
		return;
	}

	// Multi-character operators
	if (lookAhead(state, '==')) {
		state.tokens.push({ type: 'op_eq', value: '==', line: startLine, column: startColumn });
		advance(state, 2);
		return;
	}
	if (lookAhead(state, '!=')) {
		state.tokens.push({ type: 'op_neq', value: '!=', line: startLine, column: startColumn });
		advance(state, 2);
		return;
	}
	if (lookAhead(state, '>=')) {
		state.tokens.push({ type: 'op_gte', value: '>=', line: startLine, column: startColumn });
		advance(state, 2);
		return;
	}
	if (lookAhead(state, '<=')) {
		state.tokens.push({ type: 'op_lte', value: '<=', line: startLine, column: startColumn });
		advance(state, 2);
		return;
	}
	if (lookAhead(state, '&&')) {
		state.tokens.push({ type: 'op_and', value: '&&', line: startLine, column: startColumn });
		advance(state, 2);
		return;
	}
	if (lookAhead(state, '||')) {
		state.tokens.push({ type: 'op_or', value: '||', line: startLine, column: startColumn });
		advance(state, 2);
		return;
	}
	if (lookAhead(state, '??')) {
		state.tokens.push({ type: 'op_nullish', value: '??', line: startLine, column: startColumn });
		advance(state, 2);
		return;
	}

	// Single-character operators and punctuation
	switch (char) {
		case '>':
			state.tokens.push({ type: 'op_gt', value: '>', line: startLine, column: startColumn });
			advanceChar(state);
			return;
		case '<':
			state.tokens.push({ type: 'op_lt', value: '<', line: startLine, column: startColumn });
			advanceChar(state);
			return;
		case '!':
			state.tokens.push({ type: 'op_not', value: '!', line: startLine, column: startColumn });
			advanceChar(state);
			return;
		case '=':
			state.tokens.push({ type: 'op_assign', value: '=', line: startLine, column: startColumn });
			advanceChar(state);
			return;
		case '|':
			state.tokens.push({ type: 'pipe', value: '|', line: startLine, column: startColumn });
			advanceChar(state);
			return;
		case '(':
			state.tokens.push({ type: 'lparen', value: '(', line: startLine, column: startColumn });
			advanceChar(state);
			return;
		case ')':
			state.tokens.push({ type: 'rparen', value: ')', line: startLine, column: startColumn });
			advanceChar(state);
			return;
		case '[':
			state.tokens.push({ type: 'lbracket', value: '[', line: startLine, column: startColumn });
			advanceChar(state);
			return;
		case ']':
			state.tokens.push({ type: 'rbracket', value: ']', line: startLine, column: startColumn });
			advanceChar(state);
			return;
		case ':':
			state.tokens.push({ type: 'colon', value: ':', line: startLine, column: startColumn });
			advanceChar(state);
			return;
		case ',':
			state.tokens.push({ type: 'comma', value: ',', line: startLine, column: startColumn });
			advanceChar(state);
			return;
		case '.':
			state.tokens.push({ type: 'dot', value: '.', line: startLine, column: startColumn });
			advanceChar(state);
			return;
	}

	// Identifier or keyword
	if (isIdentifierStart(char)) {
		tokenizeIdentifier(state);
		return;
	}

	// Unknown character
	state.errors.push({
		message: `Unexpected character: ${char}`,
		line: startLine,
		column: startColumn,
	});
	advanceChar(state);
}

// ============================================================================
// Helper Tokenizers
// ============================================================================

function tokenizeString(state: TokenizerState): void {
	const quote = state.input[state.pos];
	const startLine = state.line;
	const startColumn = state.column;
	advanceChar(state); // consume opening quote

	let value = '';
	while (state.pos < state.input.length && state.input[state.pos] !== quote) {
		if (state.input[state.pos] === '\\' && state.pos + 1 < state.input.length) {
			advanceChar(state);
			const escapedChar = state.input[state.pos];
			switch (escapedChar) {
				case 'n':
					value += '\n';
					break;
				case 't':
					value += '\t';
					break;
				case 'r':
					value += '\r';
					break;
				case '\\':
				case '"':
				case "'":
					value += escapedChar;
					break;
				default:
					value += escapedChar;
			}
			advanceChar(state);
		} else {
			value += state.input[state.pos];
			advanceChar(state);
		}
	}

	if (state.pos < state.input.length) {
		advanceChar(state); // consume closing quote
	} else {
		state.errors.push({
			message: 'Unterminated string',
			line: startLine,
			column: startColumn,
		});
	}

	state.tokens.push({
		type: 'string',
		value,
		line: startLine,
		column: startColumn,
	});
}

function tokenizeNumber(state: TokenizerState): void {
	const startLine = state.line;
	const startColumn = state.column;
	let value = '';

	// Handle negative numbers
	if (state.input[state.pos] === '-') {
		value += '-';
		advanceChar(state);
	}

	// Integer part
	while (state.pos < state.input.length && isDigit(state.input[state.pos])) {
		value += state.input[state.pos];
		advanceChar(state);
	}

	// Decimal part
	if (state.pos < state.input.length && state.input[state.pos] === '.') {
		value += '.';
		advanceChar(state);
		while (state.pos < state.input.length && isDigit(state.input[state.pos])) {
			value += state.input[state.pos];
			advanceChar(state);
		}
	}

	state.tokens.push({
		type: 'number',
		value,
		line: startLine,
		column: startColumn,
	});
}

function tokenizeIdentifier(state: TokenizerState): void {
	const startLine = state.line;
	const startColumn = state.column;
	let value = '';

	while (state.pos < state.input.length && isIdentifierPart(state.input[state.pos])) {
		value += state.input[state.pos];
		advanceChar(state);
	}

	const tokenType = KEYWORDS[value] || 'identifier';

	state.tokens.push({
		type: tokenType,
		value,
		line: startLine,
		column: startColumn,
	});
}

// ============================================================================
// Helper Functions
// ============================================================================

function lookAhead(state: TokenizerState, str: string): boolean {
	return state.input.slice(state.pos, state.pos + str.length) === str;
}

function advance(state: TokenizerState, count: number): void {
	for (let i = 0; i < count; i++) {
		advanceChar(state);
	}
}

function advanceChar(state: TokenizerState): void {
	if (state.pos < state.input.length) {
		if (state.input[state.pos] === '\n') {
			state.line++;
			state.column = 1;
		} else {
			state.column++;
		}
		state.pos++;
	}
}

function skipWhitespace(state: TokenizerState): void {
	while (state.pos < state.input.length && isWhitespace(state.input[state.pos])) {
		advanceChar(state);
	}
}

function isWhitespace(char: string): boolean {
	return /\s/.test(char);
}

function isDigit(char: string): boolean {
	return /[0-9]/.test(char);
}

function isIdentifierStart(char: string): boolean {
	return /[a-zA-Z_]/.test(char);
}

function isIdentifierPart(char: string): boolean {
	return /[a-zA-Z0-9_]/.test(char);
}
