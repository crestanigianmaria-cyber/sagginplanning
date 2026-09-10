import os
import re

replacements = {
    # Typography & Base Colors (Slate Palette)
    r'bg-gray-50': 'bg-slate-50',
    r'bg-gray-100': 'bg-slate-50',
    r'text-gray-900': 'text-slate-900',
    r'text-gray-700': 'text-slate-700',
    r'text-gray-500': 'text-slate-500',
    r'text-gray-400': 'text-slate-400',
    r'border-gray-200': 'border-slate-200',
    r'border-gray-300': 'border-slate-200',
    
    # Remove heavy shadows, favor borders
    r'shadow-sm': '', # Remove default shadows on cards to keep them flat with borders
    r'shadow-md': 'shadow-sm',
    r'shadow-lg': 'shadow-sm',
    r'shadow-2xl': 'shadow-md',
    r'shadow-\[0_0_15px_rgba[^\]]+\]': '',
    r'shadow-\[0_0_20px_rgba[^\]]+\]': '',
    r'shadow-\[0_-10px_20px_rgba[^\]]+\]': '',
    
    # Accent Colors (Burgundy / Crimson instead of basic red)
    r'bg-\[\#dc2626\]': 'bg-rose-900',
    r'bg-red-600': 'bg-rose-900',
    r'hover:bg-\[\#b91c1c\]': 'hover:bg-rose-950',
    r'hover:bg-red-700': 'hover:bg-rose-950',
    r'border-\[\#dc2626\]': 'border-rose-900',
    r'text-\[\#dc2626\]': 'text-rose-900',
    
    # Secondary Buttons (Make them ghost/outline)
    # E.g. Reset PIN in drivers page, or Modify
    
    # Layout spacing improvements (Breathability)
    r'p-4': 'p-5 md:p-6',
    r'rounded-lg': 'rounded-xl',
    r'rounded-md': 'rounded-lg',
    
    # Font weights for hierarchy
    r'font-bold': 'font-semibold',
    r'font-black': 'font-bold',
    
    # Sidebar cleanup
    r'bg-[#111113]': 'bg-white',
    r'bg-[#09090b]': 'bg-slate-50',
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

print("Linear/Vercel UX applied.")
