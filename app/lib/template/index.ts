// Template compiler for LUMI OS
// Main entry point for template compilation

import { parse } from './parser';
import { render, RenderContext } from './renderer';

export interface CompileResult {
	output: string;
	errors: string[];
}

/**
 * Compile a template string with the given variables.
 * 
 * @param template - Template string to compile
 * @param variables - Variables available in the template
 * @returns Compiled template string and any errors
 */
export async function compileTemplate(
	template: string,
	variables: Record<string, any> = {}
): Promise<CompileResult> {
	try {
		// Parse template into AST
		const parserResult = parse(template);

		// Check for parser errors
		if (parserResult.errors.length > 0) {
			const errorMessages = parserResult.errors.map(
				e => `Parse error at line ${e.line}, column ${e.column}: ${e.message}`
			);
			return {
				output: '',
				errors: errorMessages,
			};
		}

		// Render AST
		const context: RenderContext = {
			variables,
		};

		const renderResult = await render(parserResult.ast, context);

		return {
			output: renderResult.output,
			errors: renderResult.errors,
		};
	} catch (error) {
		return {
			output: '',
			errors: [`Compilation error: ${error instanceof Error ? error.message : String(error)}`],
		};
	}
}

// Re-export types for convenience
export type { RenderContext } from './renderer';
export type { ParserResult, ParserError } from './parser';
export type { TokenizerResult, TokenizerError } from './tokenizer';
