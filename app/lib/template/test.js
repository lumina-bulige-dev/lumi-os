// Quick test script for template engine
const { compileTemplate } = require('./index.ts');

async function test() {
  console.log('Testing LUMI OS Template Engine...\n');
  
  // Test 1: Simple variable
  const r1 = await compileTemplate('Hello {{name}}!', { name: 'World' });
  console.log('Test 1:', r1.output);
  console.log('Errors:', r1.errors);
  
  // Test 2: If statement
  const r2 = await compileTemplate('{% if x %}Yes{% else %}No{% endif %}', { x: true });
  console.log('\nTest 2:', r2.output);
  console.log('Errors:', r2.errors);
  
  // Test 3: For loop
  const r3 = await compileTemplate('{% for i in items %}{{i}} {% endfor %}', { items: [1, 2, 3] });
  console.log('\nTest 3:', r3.output);
  console.log('Errors:', r3.errors);
  
  console.log('\nAll tests completed!');
}

test();
