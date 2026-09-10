import re
import os

layout_path = '/Users/gian/Documents/saggin/plannig/app/src/app/(office)/layout.tsx'
with open(layout_path, 'r') as f:
    content = f.read()

# 1. Update Sidebar Nav Items to include Dashboard
old_nav = """  const navItems = [
    { name: 'Planning', href: '/planning', icon: CalendarDays },"""
new_nav = """  const navItems = [
    { name: 'Panoramica', href: '/dashboard', icon: BarChart3 },
    { name: 'Planning', href: '/planning', icon: CalendarDays },"""
content = content.replace(old_nav, new_nav)
content = content.replace("{ name: 'Report', href: '#', icon: BarChart3, disabled: true },", "")

# 2. Sidebar bottom removal (Profile moves to Topbar)
old_sidebar_bottom = r'<div className="p-4 border-t border-\[var\(--color-saggin-border\)\] shrink-0 bg-\[var\(--color-saggin-surface\)\]">.*?</div>\s*</aside>'
new_sidebar_bottom = "</aside>"
content = re.sub(old_sidebar_bottom, new_sidebar_bottom, content, flags=re.DOTALL)

# 3. Add Topbar
import_lucide = "import {\n  CalendarDays,"
new_import_lucide = "import {\n  Search,\n  Bell,\n  CalendarDays,"
if 'Search' not in content:
    content = content.replace(import_lucide, new_import_lucide)

old_main_area = """      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden min-w-0 bg-[var(--color-saggin-bg)]">
        {/* Mobile Header */}
        <header className="h-16 flex items-center justify-between px-4 bg-[var(--color-saggin-surface)] border-b border-[var(--color-saggin-border)] md:hidden shrink-0">"""

topbar_html = """      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden min-w-0 bg-[var(--color-saggin-bg)]">
        
        {/* TOPBAR (Desktop & Mobile Unified) */}
        <header className="h-16 flex items-center justify-between px-4 md:px-6 bg-[var(--color-saggin-surface)] border-b border-[var(--color-saggin-border)] shrink-0 z-10">
          <div className="flex items-center flex-1">
            <button
              onClick={() => setSidebarOpen(true)}
              className="text-[var(--color-saggin-text-secondary)] hover:text-[var(--color-saggin-text-primary)] p-1 -ml-1 mr-3 rounded-lg md:hidden"
            >
              <Menu strokeWidth={1.5} className="h-6 w-6" />
            </button>
            <div className="hidden md:flex items-center text-lg font-semibold font-space tracking-tight">
              {/* Il titolo pagina dinamico potrebbe andare qui, per ora mostriamo un greeting */}
              Bentornato, {session?.user?.name?.split(' ')[0] || 'Utente'}
            </div>
            
            {/* Ricerca Globale */}
            <div className="flex-1 max-w-xl mx-auto ml-4 md:ml-12 hidden md:block relative">
              <div className="relative flex items-center w-full h-10 rounded-lg bg-[var(--color-saggin-bg)] border border-[var(--color-saggin-border)] focus-within:border-[var(--color-brand-red)] transition-colors overflow-hidden px-3">
                <Search className="h-4 w-4 text-[var(--color-saggin-text-secondary)] shrink-0" />
                <input 
                  type="text" 
                  placeholder="Cerca viaggio, targa, autista, cliente..." 
                  className="flex-1 bg-transparent border-none outline-none text-sm text-[var(--color-saggin-text-primary)] px-3 placeholder:text-[var(--color-saggin-text-secondary)]"
                />
                <div className="flex items-center gap-1">
                  <kbd className="hidden lg:inline-flex items-center gap-1 px-1.5 font-mono text-[10px] font-medium text-[var(--color-saggin-text-secondary)] bg-[var(--color-saggin-surface)] border border-[var(--color-saggin-border)] rounded">
                    <span className="text-xs">⌘</span>K
                  </kbd>
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-4 ml-auto">
            {/* Data e Ora */}
            <div className="hidden lg:block text-sm font-medium text-[var(--color-saggin-text-secondary)] mr-2">
              {new Date().toLocaleDateString('it-IT', { weekday: 'short', day: 'numeric', month: 'short' })}
            </div>
            
            {/* Notifiche */}
            <button className="relative p-2 text-[var(--color-saggin-text-secondary)] hover:text-[var(--color-saggin-text-primary)] transition-colors">
              <Bell strokeWidth={1.5} className="h-5 w-5" />
              <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-[var(--color-brand-red)]"></span>
            </button>
            
            <div className="w-px h-6 bg-[var(--color-saggin-border)] hidden md:block mx-1"></div>
            
            {/* Profilo Menu Dropdown (Semplificato) */}
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-[var(--color-saggin-elevated)] border border-[var(--color-saggin-border)] flex items-center justify-center text-[var(--color-saggin-text-primary)] font-semibold text-sm shrink-0">
                {session?.user?.name?.charAt(0) || 'U'}
              </div>
              <button 
                onClick={() => signOut({ callbackUrl: "/" })}
                className="hidden md:flex items-center text-sm font-medium text-[var(--color-saggin-text-secondary)] hover:text-[var(--color-brand-red)] transition-colors"
                title="Esci dal portale"
              >
                <LogOut strokeWidth={1.5} className="h-4 w-4 ml-1" />
              </button>
            </div>
          </div>
        </header>
"""
content = content.replace(old_main_area, topbar_html)

# We must also remove the old mobile header since we merged it into Topbar
old_mobile_header = """        <header className="h-16 flex items-center justify-between px-4 bg-[var(--color-saggin-surface)] border-b border-[var(--color-saggin-border)] md:hidden shrink-0">
          <div className="flex items-center">
            <button
              onClick={() => setSidebarOpen(true)}
              className="text-[var(--color-saggin-text-secondary)] hover:text-[var(--color-saggin-text-primary)] p-1 -ml-1 rounded-lg hover:bg-[var(--color-saggin-bg)]"
            >
              <Menu strokeWidth={1.5} className="h-6 w-6" />
            </button>
            <span className="ml-3 font-semibold text-[var(--color-saggin-text-primary)] flex items-center gap-2">
              <div className="bg-[var(--color-saggin-surface)] p-1 rounded-lg shrink-0">
                <img src="/logo.png" alt="Logo" className="w-5 h-5 object-contain" />
              </div>
              Saggin Planning
            </span>
          </div>
        </header>"""
content = content.replace(old_mobile_header, "")

with open(layout_path, 'w') as f:
    f.write(content)

# Update Login Redirect
login_path = '/Users/gian/Documents/saggin/plannig/app/src/app/(auth)/login/page.tsx'
with open(login_path, 'r') as f:
    login_content = f.read()
login_content = login_content.replace("callbackUrl: '/planning'", "callbackUrl: '/dashboard'")
with open(login_path, 'w') as f:
    f.write(login_content)

print("Layout and Auth Redirect updated")
