import re
import os

path = '/Users/gian/Documents/saggin/plannig/app/src/app/globals.css'
with open(path, 'r') as f:
    content = f.read()

new_css = """@import "tailwindcss";

@theme inline {
  --color-brand-red: #E31E24;
  --color-success: #3FB27F;
  --color-warning: #F5A623;
  
  --color-saggin-bg: #0E0F11;
  --color-saggin-surface: #17191C;
  --color-saggin-elevated: #1E2024;
  --color-saggin-border: #2A2D31;
  
  --color-saggin-text-primary: #F5F5F4;
  --color-saggin-text-secondary: #9A9DA3;

  --font-space: var(--font-space-grotesk);
  --font-inter: var(--font-inter);
}

body {
  background: var(--color-saggin-bg);
  color: var(--color-saggin-text-primary);
  font-family: var(--font-inter), system-ui, sans-serif;
  -webkit-font-smoothing: antialiased;
}

h1, h2, h3, h4, h5, h6, .font-space {
  font-family: var(--font-space), system-ui, sans-serif;
}
"""

with open(path, 'w') as f:
    f.write(new_css)

layout_path = '/Users/gian/Documents/saggin/plannig/app/src/app/layout.tsx'
with open(layout_path, 'r') as f:
    layout = f.read()

if 'Space_Grotesk' not in layout:
    imports = "import { Providers } from './providers'\nimport { Space_Grotesk, Inter } from 'next/font/google'\n\nconst spaceGrotesk = Space_Grotesk({ subsets: ['latin'], variable: '--font-space-grotesk' })\nconst inter = Inter({ subsets: ['latin'], variable: '--font-inter' })"
    layout = layout.replace("import { Providers } from './providers'", imports)
    body_tag = '<body className={`${spaceGrotesk.variable} ${inter.variable} antialiased bg-[#0E0F11] text-[#F5F5F4]`}>'
    layout = layout.replace('<body className="font-sans antialiased">', body_tag)
    with open(layout_path, 'w') as f:
        f.write(layout)

print("Design System Foundation Applied")
