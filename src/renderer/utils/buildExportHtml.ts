import variablesCss from '../styles/variables.css?raw';
import themesCss from '../styles/themes.css?raw';
import previewCss from '../styles/preview.css?raw';

function escapeHtmlTitle(title: string): string {
  return title
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

export function buildExportHtml(args: {
  title: string;
  theme: 'light' | 'dark';
  bodyHtml: string;
  cssVariablesOverride?: Record<string, string>;
}): string {
  const title = escapeHtmlTitle(args.title);

  const overrideLines = Object.entries(args.cssVariablesOverride ?? {})
    .filter(([key, value]) => key.startsWith('--') && value.trim().length > 0)
    .map(([key, value]) => `  ${key}: ${value};`);

  const overrideCss = overrideLines.length > 0 ? `\n:root {\n${overrideLines.join('\n')}\n}\n` : '';

  return `<!doctype html>
<html data-theme="${args.theme}">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${title}</title>
    <style>
${variablesCss}
${themesCss}
${previewCss}
${overrideCss}

      /* Export-only tweaks */
      html, body { overflow: visible; }
      #root { display: block; height: auto; }
      .preview-container { padding: 0; background: transparent; }
    </style>
  </head>
  <body>
    <div class="preview-container">
      <div class="preview-content">${args.bodyHtml}</div>
    </div>
  </body>
</html>`;
}
