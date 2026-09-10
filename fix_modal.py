import re

path = '/Users/gian/Documents/saggin/plannig/app/src/components/trips/TripForm.tsx'
with open(path, 'r') as f:
    content = f.read()

# Replace the action buttons area in TripForm to align right in a fixed footer
old_buttons = """            <div className="flex gap-4 pt-6 mt-6 border-t border-slate-200">
              <button 
                type="button" 
                onClick={onClose} 
                className="flex-1 py-3 bg-slate-50 text-slate-700 font-semibold rounded-xl hover:bg-slate-200 transition-colors border border-slate-200"
              >
                Annulla
              </button>
              <button 
                type="submit" 
                disabled={isSubmitting || safetyCheckStatus === 'error'}
                className={`flex-1 py-3 text-white font-semibold rounded-xl transition-colors flex justify-center items-center gap-2 ${
                  isSubmitting || safetyCheckStatus === 'error' 
                  ? "bg-slate-400 cursor-not-allowed" 
                  : "bg-rose-900 hover:bg-rose-950 text-white"
                }`}
              >
                {isSubmitting ? 'Salvataggio...' : 'Salva Viaggio'}
              </button>
            </div>"""

new_buttons = """            {/* FIXED BOTTOM FOOTER FOR MODAL ACTIONS */}
            <div className="sticky bottom-0 -mx-5 md:-mx-6 -mb-5 md:-mb-6 mt-8 p-5 md:p-6 bg-slate-50 border-t border-slate-200 flex justify-end gap-3 rounded-b-2xl">
              <button 
                type="button" 
                onClick={onClose} 
                className="px-6 py-2.5 bg-transparent text-slate-600 font-medium rounded-lg hover:bg-slate-200/50 transition-colors"
              >
                Annulla
              </button>
              <button 
                type="submit" 
                disabled={isSubmitting || safetyCheckStatus === 'error'}
                className={`px-8 py-2.5 font-medium rounded-lg transition-all flex justify-center items-center gap-2 ${
                  isSubmitting || safetyCheckStatus === 'error' 
                  ? "bg-slate-300 text-slate-500 cursor-not-allowed" 
                  : "bg-rose-900 hover:bg-rose-950 text-white shadow-[0_2px_10px_rgba(159,18,57,0.2)]"
                }`}
              >
                {isSubmitting ? 'Salvataggio...' : 'Salva Viaggio'}
              </button>
            </div>"""

content = content.replace(old_buttons, new_buttons)

with open(path, 'w') as f:
    f.write(content)

