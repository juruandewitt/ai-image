import fs from 'fs';

const p = 'tailwind.config.ts';
if (!fs.existsSync(p)) {
  console.log('tailwind.config.ts not found — writing a minimal one.');
  fs.writeFileSync(p, `import type { Config } from 'tailwindcss'

const config: Config = {
  content: ['./app/**/*.{ts,tsx}','./components/**/*.{ts,tsx}'],
  theme: { extend: {} },
  plugins: [],
}
export default config
`);
  process.exit(0);
}

let s = fs.readFileSync(p, 'utf8');

if (/content:\s*\[[\s\S]*?\]/m.test(s)) {
  if (!s.includes("./app/**/*.{ts,tsx}") || !s.includes("./components/**/*.{ts,tsx}")) {
    s = s.replace(
      /content:\s*\[[\s\S]*?\]/m,
      "content: ['./app/**/*.{ts,tsx}','./components/**/*.{ts,tsx}']"
    );
    fs.writeFileSync(p, s);
    console.log('Patched content paths in tailwind.config.ts');
  } else {
    console.log('Tailwind content paths already OK');
  }
} else {
  s = s.replace(
    /\{\s*/,
    "{\n  content: ['./app/**/*.{ts,tsx}','./components/**/*.{ts,tsx}'],\n"
  );
  fs.writeFileSync(p, s);
  console.log('Inserted content paths in tailwind.config.ts');
}
