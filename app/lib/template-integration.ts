/**
 * LUMI OS Template Integration Example
 * 
 * This file demonstrates how to use the template engine
 * with existing LUMI OS types and data structures.
 */

import { compileTemplate } from './template';
import { HomeState } from './types';

/**
 * Generate a formatted status report for the home state
 */
export async function generateStatusReport(state: HomeState): Promise<string> {
	const template = `
=== LUMI OS Status Report ===

💰 Financial Status:
   Current Balance: ¥{{balance_total|default:0}}
   Floor (paket_bigzoon): ¥{{paket_bigzoon|default:0}}
   Status: {{floor_status|upper}}

{% if floor_status == "SAFE" %}
   ✓ You're in a safe financial zone
{% elseif floor_status == "WARNING" %}
   ⚠ Approaching floor limit - Exercise caution
{% else %}
   ✗ FLOOR BREACH - Emergency protocols active
{% endif %}

🎯 Challenge Progress:
   Day {{challenge.day_in_challenge}} of your current challenge
   Safe moves remaining: {{challenge.safe_move_limit}}
{% if challenge.is_safe_null_today %}
   
   🛑 SAFE NULL DAY ACTIVE
   No major financial decisions today - Rest and reflect
{% endif %}

❤️ Mental State:
   Risk Mode: {{heart.risk_mode}}
{% if heart.risk_mode == "RED" %}
   🔴 High stress detected - Avoid important decisions
   Focus on rest and recovery
{% elseif heart.risk_mode == "TIRED" %}
   🟡 Moderate fatigue - Take it easy
   Consider postponing non-urgent actions
{% else %}
   🟢 Normal operating state
   All systems functioning optimally
{% endif %}

================================
Generated: {{timestamp ?? "Now"}}
`;

	const result = await compileTemplate(template, {
		...state,
		timestamp: new Date().toISOString(),
	});

	if (result.errors.length > 0) {
		console.error('Template errors:', result.errors);
	}

	return result.output;
}

/**
 * Generate a simple balance summary card
 */
export async function generateBalanceCard(balance: number, floor: number): Promise<string> {
	const template = `
┌─────────────────────────────┐
│  LUMI Balance Card          │
├─────────────────────────────┤
│  Balance: ¥{{balance}}      │
│  Floor:   ¥{{floor}}        │
│  Margin:  ¥{{margin}}       │
│                             │
│  {{status_icon}} {{status_text}}  │
└─────────────────────────────┘
`;

	const margin = balance - floor;
	const percentage = (margin / floor) * 100;

	let statusIcon = '✓';
	let statusText = 'SAFE';

	if (percentage < 10) {
		statusIcon = '✗';
		statusText = 'DANGER';
	} else if (percentage < 25) {
		statusIcon = '⚠';
		statusText = 'WARNING';
	}

	const result = await compileTemplate(template, {
		balance: balance.toLocaleString(),
		floor: floor.toLocaleString(),
		margin: margin.toLocaleString(),
		status_icon: statusIcon,
		status_text: statusText,
	});

	return result.output;
}

/**
 * Generate a risk assessment message
 */
export async function generateRiskMessage(riskMode: 'NORMAL' | 'TIRED' | 'RED'): Promise<string> {
	const template = `
{% if risk_mode == "RED" %}
⛔ HIGH RISK MODE ACTIVE

Your system has detected elevated stress levels.

Recommendations:
• Avoid making important financial decisions
• Postpone non-urgent actions for 24-48 hours
• Focus on rest and recovery
• Review decisions when in NORMAL mode

This is a protective measure from your LUMI OS.
{% elseif risk_mode == "TIRED" %}
⚠️ MODERATE RISK MODE

Your system shows signs of decision fatigue.

Recommendations:
• Be extra cautious with decisions
• Double-check important actions
• Consider taking a break
• Return to decisions after rest

Stay mindful of your mental state.
{% else %}
✅ NORMAL MODE

All systems operating normally.

You are clear to:
• Make financial decisions
• Execute planned actions
• Review and adjust strategies

Stay aware of your mental state throughout the day.
{% endif %}
`;

	const result = await compileTemplate(template, {
		risk_mode: riskMode,
	});

	return result.output;
}

/**
 * Example usage showing how to integrate with existing components
 */
export async function exampleUsage() {
	// Example with HomeState
	const exampleState: HomeState = {
		balance_total: 123456,
		paket_bigzoon: 80000,
		floor_status: 'SAFE',
		challenge: {
			day_in_challenge: 15,
			is_safe_null_today: false,
			safe_move_limit: 3,
		},
		heart: {
			risk_mode: 'NORMAL',
		},
	};

	console.log('=== Status Report ===');
	const report = await generateStatusReport(exampleState);
	console.log(report);

	console.log('\n=== Balance Card ===');
	const card = await generateBalanceCard(123456, 80000);
	console.log(card);

	console.log('\n=== Risk Message ===');
	const message = await generateRiskMessage('NORMAL');
	console.log(message);
}

// Export functions for use in the app
export default {
	generateStatusReport,
	generateBalanceCard,
	generateRiskMessage,
	exampleUsage,
};
