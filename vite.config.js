import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { defineConfig } from 'vite';

const includePattern = /<!--\s*@include\s+([^\s]+)\s*-->/g;

const htmlIncludes = () => ({
  name: 'spiceland-html-includes',
  transformIndexHtml: {
    order: 'pre',
    handler(html) {
      return html.replace(includePattern, (_, filePath) => {
        return readFileSync(resolve(process.cwd(), filePath), 'utf8');
      });
    },
  },
});

export default defineConfig({
  base: process.env.GITHUB_ACTIONS === 'true' ? '/SpiceLandM/' : '/',
  plugins: [htmlIncludes()],
});
