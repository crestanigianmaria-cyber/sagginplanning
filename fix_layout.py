import re

path = '/Users/gian/Documents/saggin/plannig/app/src/app/(office)/layout.tsx'
with open(path, 'r') as f:
    content = f.read()

# Make sure useSession is imported
if 'useSession' not in content:
    content = content.replace("import { signOut } from \"next-auth/react\";", "import { signOut, useSession } from \"next-auth/react\";")

# Make sure session is instantiated
if 'const { data: session } = useSession();' not in content:
    content = content.replace('const pathname = usePathname();', 'const pathname = usePathname();\n  const { data: session } = useSession();')

# Replace the black square and bottom sidebar logic
old_bottom = r'<div className="p-5 md:p-6 border-t border-slate-200 shrink-0 bg-\[\#0c0c0e\]">.*?</div>\s*</aside>'
new_bottom = """<div className="p-4 border-t border-slate-200 shrink-0 bg-white">
          <div className="flex items-center gap-3 px-3 py-3 mb-1 rounded-xl bg-slate-50 border border-slate-100">
            <div className="w-9 h-9 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-900 font-semibold shrink-0 shadow-sm">
              {session?.user?.name?.charAt(0) || 'U'}
            </div>
            <div className="flex flex-col min-w-0 flex-1">
              <span className="text-sm font-semibold text-slate-900 truncate">
                {session?.user?.name || 'Utente Ufficio'}
              </span>
              <p className="text-xs text-slate-500 font-medium">Ufficio</p>
            </div>
          </div>
          <button 
            onClick={() => signOut({ callbackUrl: "/" })} 
            className="flex items-center justify-center w-full px-3 py-2.5 text-sm font-medium text-slate-600 rounded-lg hover:bg-slate-100 hover:text-slate-900 transition-colors group"
          >
            <LogOut strokeWidth={1.5} className="h-4 w-4 mr-3 text-slate-400 group-hover:text-slate-600 transition-colors" />
            Esci
          </button>
        </div>
      </aside>"""

content = re.sub(old_bottom, new_bottom, content, flags=re.DOTALL)

with open(path, 'w') as f:
    f.write(content)
