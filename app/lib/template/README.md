# LUMI OS Template Engine

A powerful AST-based template engine with logic support for LUMI OS.

## Features

### Logic Constructs

**Conditionals:**
- `{% if variable %}...{% endif %}`
- `{% if x %}...{% else %}...{% endif %}`
- `{% if x %}...{% elseif y %}...{% else %}...{% endif %}`

**Loops:**
- `{% for item in items %}...{% endfor %}`
- Access loop index with `item_index`

**Variable Assignment:**
- `{% set name = value %}`
- Works with filters: `{% set slug = title|lower %}`

### Operators

**Comparison:** `==`, `!=`, `>`, `<`, `>=`, `<=`, `contains`  
**Logical:** `and`, `or`, `not`, parentheses for grouping  
**Nullish coalescing:** `??` - e.g., `{{title ?? "Untitled"}}`

### Filters

Apply filters to variables using the pipe operator:
- `{{name|lower}}` - Convert to lowercase
- `{{name|upper}}` - Convert to uppercase
- `{{text|trim}}` - Trim whitespace
- `{{items|length}}` - Get length
- `{{value|default:"fallback"}}` - Default value
- `{{items|join:", "}}` - Join array
- `{{text|split:","}}` - Split string
- `{{text|replace:"old":"new"}}` - Replace text
- And more...

## Usage

```typescript
import { compileTemplate } from './app/lib/template';

// Simple variable interpolation
const result1 = await compileTemplate(
  'Hello, {{name}}!',
  { name: 'World' }
);
console.log(result1.output); // "Hello, World!"

// Conditionals
const result2 = await compileTemplate(
  '{% if balance > 1000 %}Rich{% else %}Poor{% endif %}',
  { balance: 1500 }
);
console.log(result2.output); // "Rich"

// Loops
const result3 = await compileTemplate(
  '{% for item in items %}{{item}}{% if not (item_index == 2) %}, {% endif %}{% endfor %}',
  { items: ['a', 'b', 'c'] }
);
console.log(result3.output); // "a, b, c"

// Filters
const result4 = await compileTemplate(
  '{{title|upper}}',
  { title: 'hello world' }
);
console.log(result4.output); // "HELLO WORLD"

// Variable assignment
const result5 = await compileTemplate(
  '{% set greeting = "Hello" %}{{greeting}}, {{name}}!',
  { name: 'User' }
);
console.log(result5.output); // "Hello, User!"
```

## Architecture

The template engine uses a three-phase AST-based architecture:

1. **Tokenizer** - Single-pass lexical analysis converting template to token stream
2. **Parser** - Recursive descent parser building an Abstract Syntax Tree
3. **Renderer** - AST walker that evaluates and produces output

### Benefits:

- Proper nesting support (nested if/for statements work correctly)
- Better error reporting with line/column positions
- Cleaner separation of concerns
- Easier to extend with new syntax
- Handles edge cases that regex approaches miss

## Examples for LUMI OS

### Financial Status Display
```typescript
const template = `
Current Balance: ¥{{balance_total|default:0}}
Floor Status: {{floor_status|upper}}

{% if floor_status == "SAFE" %}
  ✓ You're in a safe zone
{% elseif floor_status == "WARNING" %}
  ⚠ Approaching floor limit
{% else %}
  ✗ Floor breach detected
{% endif %}
`;

const result = await compileTemplate(template, {
  balance_total: 123456,
  floor_status: "SAFE"
});
```

### Challenge Day Counter
```typescript
const template = `
Day {{day_in_challenge}} of your challenge

{% if is_safe_null_today %}
  🛑 SAFE NULL DAY - No major decisions today
{% else %}
  Safe moves remaining: {{safe_move_limit}}
{% endif %}
`;

const result = await compileTemplate(template, {
  day_in_challenge: 5,
  is_safe_null_today: false,
  safe_move_limit: 3
});
```

### Risk Mode Status
```typescript
const template = `
{% set status_emoji = "🟢" %}
{% if risk_mode == "TIRED" %}
  {% set status_emoji = "🟡" %}
{% elseif risk_mode == "RED" %}
  {% set status_emoji = "🔴" %}
{% endif %}

{{status_emoji}} Risk Mode: {{risk_mode}}
`;

const result = await compileTemplate(template, {
  risk_mode: "NORMAL"
});
```

## Error Handling

The compiler returns both output and errors:

```typescript
const result = await compileTemplate('{% if x %}test', { x: true });
if (result.errors.length > 0) {
  console.error('Template errors:', result.errors);
}
```

Errors include:
- Line and column numbers
- Clear error messages
- Both parser and runtime errors
