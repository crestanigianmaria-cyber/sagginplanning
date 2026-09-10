import re

path = '/Users/gian/Documents/saggin/plannig/app/src/app/(office)/layout.tsx'
with open(path, 'r') as f:
    content = f.read()

# Make the sidebar buttons use 1.5px stroke
content = content.replace('<item.icon className="h-5 w-5 mr-3"', '<item.icon strokeWidth={1.5} className="h-5 w-5 mr-3"')
content = content.replace('<Menu className="h-6 w-6" />', '<Menu strokeWidth={1.5} className="h-6 w-6" />')

# Redesign bottom user section
old_bottom = """        <div className="p-4 border-t border-slate-200 shrink-0 bg-white">
          <div className="flex items-center gap-3 px-2 py-2 mb-2">
            <div className="w-10 h-10 rounded-full bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-700 font-bold shrink-0">
              {session?.user?.name?.charAt(0) || 'U'}
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-sm font-semibold text-slate-900 truncate">
                {session?.user?.name}
              </span>
              <p className="text-xs text-slate-500">Portale Ufficio</p>
            </div>
          </div>
          <button onClick={() => signOut({ callbackUrl: "/" })} className="flex items-center justify-center w-full px-4 py-2.5 mt-2 text-sm font-semibold bg-rose-900/10 text-rose-900 border border-rose-900/20 rounded-xl hover:bg-rose-900 hover:text-white transition-all ">
            <LogOut className="h-4 w-4 mr-3" />
            Esci
          </button>
        </div>"""

new_bottom = """        <div className="p-4 border-t border-slate-200 shrink-0 bg-white">
          <div className="flex items-center gap-3 px-3 py-3 mb-1 rounded-xl bg-slate-50 border border-slate-100">
            <div className="w-9 h-9 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-900 font-semibold shrink-0 shadow-sm">
              {session?.user?.name?.charAt(0) || 'U'}
            </div>
            <div className="flex flex-col min-w-0 flex-1">
              <span className="text-sm font-semibold text-slate-900 truncate">
                {session?.user?.name}
              </span>
              <p className="text-xs text-slate-500 font-medium">Ufficio</p>
            </div>
          </div>
          <button 
            onClick={() => signOut({ callbackUrl: "/" })} 
            className="flex items-center w-full px-3 py-2.5 text-sm font-medium text-slate-600 rounded-lg hover:bg-slate-100 hover:text-slate-900 transition-colors group"
          >
            <LogOut strokeWidth={1.5} className="h-4 w-4 mr-3 text-slate-400 group-hover:text-slate-600 transition-colors" />
            Esci
          </button>
        </div>"""

content = content.replace(old_bottom, new_bottom)

with open(path, 'w') as f:
    f.write(content)
