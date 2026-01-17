/**
 * Simple test examples for the LUMI OS Template Engine
 * Run with: node -r ts-node/register app/lib/template/examples.ts
 * Or import and use in your Next.js app
 */

import { compileTemplate } from './index';

async function runExamples() {
	console.log('=== LUMI OS Template Engine Examples ===\n');

	// Example 1: Simple variable interpolation
	console.log('1. Simple Variable:');
	const result1 = await compileTemplate(
		'Hello, {{name}}!',
		{ name: 'LUMI User' }
	);
	console.log('Output:', result1.output);
	console.log('Errors:', result1.errors.length ? result1.errors : 'None');
	console.log();

	// Example 2: Conditionals
	console.log('2. Conditional Logic:');
	const result2 = await compileTemplate(
		'Balance: ¥{{balance}}\n{% if balance > 100000 %}Status: Rich 💰{% elseif balance > 50000 %}Status: Comfortable 😊{% else %}Status: Saving 💪{% endif %}',
		{ balance: 123456 }
	);
	console.log('Output:', result2.output);
	console.log();

	// Example 3: Loops
	console.log('3. Looping through items:');
	const result3 = await compileTemplate(
		'Items:\n{% for item in items %}- {{item}} (index: {{item_index}})\n{% endfor %}',
		{ items: ['Apple', 'Banana', 'Cherry'] }
	);
	console.log('Output:', result3.output);
	console.log();

	// Example 4: Filters
	console.log('4. Using filters:');
	const result4 = await compileTemplate(
		'Original: {{text}}\nUpper: {{text|upper}}\nLower: {{text|lower}}',
		{ text: 'Hello World' }
	);
	console.log('Output:', result4.output);
	console.log();

	// Example 5: Nullish coalescing
	console.log('5. Nullish coalescing operator:');
	const result5 = await compileTemplate(
		'Title: {{title ?? "Untitled"}}\nName: {{name ?? "Anonymous"}}',
		{ title: 'My Document' }
	);
	console.log('Output:', result5.output);
	console.log();

	// Example 6: Variable assignment
	console.log('6. Variable assignment:');
	const result6 = await compileTemplate(
		'{% set greeting = "Welcome" %}{% set user = name|upper %}{{greeting}}, {{user}}!',
		{ name: 'lumi' }
	);
	console.log('Output:', result6.output);
	console.log();

	// Example 7: Complex LUMI OS example
	console.log('7. LUMI OS Financial Status:');
	const result7 = await compileTemplate(
		`
--- LUMI OS Status Report ---
Current Balance: ¥{{balance_total|default:0}}
Floor: ¥{{paket_bigzoon}}
Status: {{floor_status|upper}}

{% if floor_status == "SAFE" %}
✓ You're in a safe zone
  Safe moves remaining: {{safe_move_limit}}
{% elseif floor_status == "WARNING" %}
⚠ Approaching floor limit - Be careful!
{% else %}
✗ FLOOR BREACH - Emergency mode active
{% endif %}

Risk Mode: {{heart.risk_mode}}
{% if heart.risk_mode == "RED" %}
🔴 High risk - Avoid major decisions
{% elseif heart.risk_mode == "TIRED" %}
🟡 Moderate risk - Take it easy
{% else %}
🟢 Normal - Operating normally
{% endif %}

{% if is_safe_null_today %}
🛑 SAFE NULL DAY - No major actions today
{% endif %}
`,
		{
			balance_total: 123456,
			paket_bigzoon: 80000,
			floor_status: "SAFE",
			safe_move_limit: 3,
			heart: { risk_mode: "NORMAL" },
			is_safe_null_today: false
		}
	);
	console.log('Output:', result7.output);
	console.log();

	// Example 8: Nested loops and conditions
	console.log('8. Nested structures:');
	const result8 = await compileTemplate(
		`
Categories:
{% for category in categories %}
  {{category.name}}:
  {% for item in category.items %}
    {% if item.active %}✓{% else %}✗{% endif %} {{item.name}}
  {% endfor %}
{% endfor %}
`,
		{
			categories: [
				{ name: 'Finance', items: [{ name: 'Budget', active: true }, { name: 'Invest', active: false }] },
				{ name: 'Health', items: [{ name: 'Exercise', active: true }, { name: 'Diet', active: true }] }
			]
		}
	);
	console.log('Output:', result8.output);
	console.log();

	console.log('=== All examples completed successfully! ===');
}

// Run examples if this file is executed directly
if (require.main === module) {
	runExamples().catch(console.error);
}

export { runExamples };
