import fs from 'fs';

const files = [
  'app/login/page.tsx',
  'app/delivery/login/page.tsx',
  'app/register/page.tsx'
];

for (const file of files) {
  let content = fs.readFileSync(file, 'utf8');
  
  // Skip if already has LoginContent or RegisterContent
  if (content.includes('export function LoginContent()') || content.includes('export function RegisterContent()')) {
    console.log(`Skipping ${file} - already wrapped`);
    continue;
  }

  // Rename "export default function LoginPage()" to "export function LoginContent()"
  content = content.replace('export default function LoginPage()', 'import { Suspense } from "react";\n\nexport function LoginContent()');
  // Rename "export default function RegisterPage()" to "export function RegisterContent()"
  content = content.replace('export default function RegisterPage()', 'import { Suspense } from "react";\n\nexport function RegisterContent()');

  // Append the wrapper
  const isRegister = file.includes('register');
  const componentName = isRegister ? 'RegisterPage' : 'LoginPage';
  const contentName = isRegister ? 'RegisterContent' : 'LoginContent';

  const wrapper = `\n\nexport default function ${componentName}() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <${contentName} />
    </Suspense>
  )
}\n`;

  fs.writeFileSync(file, content + wrapper);
  console.log(`Wrapped ${file}`);
}
