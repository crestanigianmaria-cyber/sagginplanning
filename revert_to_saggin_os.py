import os
import re

replacements = {
    # Typography & Base Colors (Saggin OS Palette)
    r'bg-slate-50': 'bg-[var(--color-saggin-bg)]',
    r'bg-slate-100': 'bg-[var(--color-saggin-surface)]',
    r'bg-white': 'bg-[var(--color-saggin-surface)]',
    r'text-slate-900': 'text-[var(--color-saggin-text-primary)]',
    r'text-gray-900': 'text-[var(--color-saggin-text-primary)]',
    r'text-slate-700': 'text-[var(--color-saggin-text-secondary)]',
    r'text-gray-700': 'text-[var(--color-saggin-text-secondary)]',
    r'text-slate-600': 'text-[var(--color-saggin-text-secondary)]',
    r'text-slate-500': 'text-[var(--color-saggin-text-secondary)]',
    r'text-slate-400': 'text-[var(--color-saggin-text-secondary)]',
    r'border-slate-200': 'border-[var(--color-saggin-border)]',
    r'border-slate-300': 'border-[var(--color-saggin-border)]',
    r'border-gray-200': 'border-[var(--color-saggin-border)]',
    r'border-gray-300': 'border-[var(--color-saggin-border)]',
    
    # Shadows
    r'shadow-sm': '', 
    r'shadow-md': '',
    
    # Accent Colors (Brand Red)
    r'bg-rose-900': 'bg-[var(--color-brand-red)]',
    r'bg-[#dc2626]': 'bg-[var(--color-brand-red)]',
    r'hover:bg-rose-950': 'hover:bg-[#b91c1c]',
    r'border-rose-900': 'border-[var(--color-brand-red)]',
    r'text-rose-900': 'text-[var(--color-brand-red)]',
    
    # Status Colors mapping (Success, Warning)
    r'bg-emerald-600': 'bg-[var(--color-success)]',
    r'hover:bg-emerald-700': 'hover:bg-[#329267]',
    r'text-emerald-600': 'text-[var(--color-success)]',
    r'border-emerald-600': 'border-[var(--color-success)]',
    
    r'bg-amber-600': 'bg-[var(--color-warning)]',
    r'text-amber-600': 'text-[var(--color-warning)]',
    r'border-amber-600': 'border-[var(--color-warning)]',
}

def file_replace(filepath):
    with open(filepath, 'r') as f:
        content = f.read()
    
    orig = content
    for old, new in replacements.items():
        content = re.sub(old, new, content)
        
    if content != orig:
        with open(filepath, 'w') as f:
            f.write(content)

os.chdir('/Users/gian/Documents/saggin/plannig/app/src')
for root, _, files in os.walk('.'):
    for file in files:
        if file.endswith('.tsx') or file.endswith('.ts'):
            file_replace(os.path.join(root, file))

print("Saggin OS Theme Tokens applied.")
