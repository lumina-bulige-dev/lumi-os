'use client';

import { useState } from 'react';

export default function TemplateDemoPage() {
const [template, setTemplate] = useState('Hello, {{name}}!');
const [variables, setVariables] = useState('{"name": "LUMI User"}');
const [output, setOutput] = useState('');
const [errors, setErrors] = useState<string[]>([]);

const handleCompile = async () => {
try {
const { compileTemplate } = await import('../lib/template');
const vars = JSON.parse(variables);
const result = await compileTemplate(template, vars);
setOutput(result.output);
setErrors(result.errors);
} catch (error) {
setErrors([String(error)]);
setOutput('');
}
};

const loadExample = (exampleNum: number) => {
switch (exampleNum) {
case 1:
setTemplate('Hello, {{name}}!');
setVariables('{"name": "LUMI User"}');
break;
case 2:
setTemplate('{% if balance > 100000 %}Rich 💰{% else %}Saving 💪{% endif %}');
setVariables('{"balance": 123456}');
break;
case 3:
setTemplate('{% for item in items %}{{item_index}}. {{item}}\n{% endfor %}');
setVariables('{"items": ["Apple", "Banana", "Cherry"]}');
break;
case 4:
setTemplate('{{text|upper}} - {{text|lower}}');
setVariables('{"text": "Hello World"}');
break;
case 5:
setTemplate(`Balance: ¥{{balance_total}}
Status: {{floor_status|upper}}

{% if floor_status == "SAFE" %}
✓ Safe zone
{% else %}
⚠ Warning
{% endif %}`);
setVariables('{"balance_total": 123456, "floor_status": "SAFE"}');
break;
}
};

return (
<div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto', fontFamily: 'system-ui' }}>
<h1>🎨 LUMI OS Template Engine Demo</h1>
<p style={{ color: '#666', marginBottom: '30px' }}>
Interactive demonstration of the AST-based template compiler with logic support.
</p>

<div style={{ display: 'flex', gap: '10px', marginBottom: '20px', flexWrap: 'wrap' }}>
<button onClick={() => loadExample(1)} style={buttonStyle}>Example 1: Variable</button>
<button onClick={() => loadExample(2)} style={buttonStyle}>Example 2: Conditional</button>
<button onClick={() => loadExample(3)} style={buttonStyle}>Example 3: Loop</button>
<button onClick={() => loadExample(4)} style={buttonStyle}>Example 4: Filters</button>
<button onClick={() => loadExample(5)} style={buttonStyle}>Example 5: LUMI Status</button>
</div>

<div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
<div>
<label style={labelStyle}>Template:</label>
<textarea
value={template}
onChange={(e) => setTemplate(e.target.value)}
style={textareaStyle}
rows={10}
placeholder="Enter your template here..."
/>
</div>

<div>
<label style={labelStyle}>Variables (JSON):</label>
<textarea
value={variables}
onChange={(e) => setVariables(e.target.value)}
style={textareaStyle}
rows={10}
placeholder='{"key": "value"}'
/>
</div>
</div>

<button onClick={handleCompile} style={compileButtonStyle}>
🚀 Compile Template
</button>

<div style={{ marginTop: '30px' }}>
<h2>Output:</h2>
<pre style={outputStyle}>
{output || 'Click "Compile Template" to see output'}
</pre>

{errors.length > 0 && (
<div>
<h3 style={{ color: '#d32f2f' }}>Errors:</h3>
<pre style={{ ...outputStyle, backgroundColor: '#ffebee', color: '#d32f2f' }}>
{errors.join('\n')}
</pre>
</div>
)}
</div>

<div style={{ marginTop: '40px', padding: '20px', backgroundColor: '#f5f5f5', borderRadius: '8px' }}>
<h2>Supported Features:</h2>
<ul style={{ lineHeight: '1.8' }}>
<li><strong>Variables:</strong> <code>{'{{variable}}'}</code></li>
<li><strong>Conditionals:</strong> <code>{'{% if condition %}...{% endif %}'}</code></li>
<li><strong>Loops:</strong> <code>{'{% for item in items %}...{% endfor %}'}</code></li>
<li><strong>Variable Assignment:</strong> <code>{'{% set name = value %}'}</code></li>
<li><strong>Filters:</strong> <code>{'{{value|filter}}'}</code> (lower, upper, trim, length, etc.)</li>
<li><strong>Operators:</strong> <code>==, !=, &gt;, &lt;, &gt;=, &lt;=, contains, and, or, not</code></li>
<li><strong>Nullish Coalescing:</strong> <code>{'{{value ?? "default"}}'}</code></li>
</ul>
</div>
</div>
);
}

const buttonStyle: React.CSSProperties = {
padding: '8px 16px',
backgroundColor: '#1976d2',
color: 'white',
border: 'none',
borderRadius: '4px',
cursor: 'pointer',
fontSize: '14px',
};

const compileButtonStyle: React.CSSProperties = {
...buttonStyle,
backgroundColor: '#2e7d32',
fontSize: '16px',
padding: '12px 24px',
fontWeight: 'bold',
};

const labelStyle: React.CSSProperties = {
display: 'block',
fontWeight: 'bold',
marginBottom: '8px',
};

const textareaStyle: React.CSSProperties = {
width: '100%',
padding: '12px',
fontFamily: 'monospace',
fontSize: '14px',
border: '1px solid #ccc',
borderRadius: '4px',
resize: 'vertical',
};

const outputStyle: React.CSSProperties = {
padding: '16px',
backgroundColor: '#f5f5f5',
borderRadius: '4px',
border: '1px solid #ddd',
fontFamily: 'monospace',
fontSize: '14px',
whiteSpace: 'pre-wrap',
wordWrap: 'break-word',
minHeight: '100px',
};
