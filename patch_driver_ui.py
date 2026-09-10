import re

path = '/Users/gian/Documents/saggin/plannig/app/src/app/(driver)/my-trips/[id]/page.tsx'
with open(path, 'r') as f:
    content = f.read()

# Add the map and redesign the top section
old_header = """      {/* TOP HEADER */}
      <div className="bg-white p-4 shadow-sm border-b border-gray-200 flex items-center gap-4 sticky top-0 z-10 shrink-0">
        <button onClick={() => router.push('/my-trips')} className="p-2 bg-gray-50 rounded-full text-gray-700 hover:text-gray-900 shadow-sm border border-gray-200 active:scale-95 transition-transform">
          <ArrowLeft size={24} />
        </button>
        <div>
          <div className="text-xs text-gray-500 font-bold uppercase tracking-wider">Viaggio in programma</div>
          <div className="text-xl font-bold text-gray-900 leading-tight">
            {new Date(trip.date).toLocaleDateString('it-IT', { weekday: 'long', day: 'numeric', month: 'long' })}
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto pb-32">
        <div className="p-4 space-y-4">
          
          {/* ORARIO E STATO */}"""

new_header = """      {/* TOP HEADER */}
      <div className="bg-white p-4 shadow-sm border-b border-gray-200 flex items-center gap-4 sticky top-0 z-10 shrink-0">
        <button onClick={() => router.push('/my-trips')} className="p-2 bg-gray-50 rounded-full text-gray-700 hover:text-gray-900 shadow-sm border border-gray-200 active:scale-95 transition-transform">
          <ArrowLeft size={24} />
        </button>
        <div>
          <div className="text-xs text-gray-500 font-bold uppercase tracking-wider">Dettaglio Viaggio</div>
          <div className="text-xl font-bold text-gray-900 leading-tight">
            {new Date(trip.date).toLocaleDateString('it-IT', { weekday: 'long', day: 'numeric', month: 'long' })}
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto pb-32">
        {/* MAPPA INTERATTIVA OSM */}
        {trip.latitude && trip.longitude ? (
          <div className="w-full h-48 bg-gray-200 relative pointer-events-none">
            <iframe 
              width="100%" 
              height="100%" 
              frameBorder="0" 
              scrolling="no" 
              marginHeight={0} 
              marginWidth={0} 
              src={`https://www.openstreetmap.org/export/embed.html?bbox=${trip.longitude-0.01}%2C${trip.latitude-0.01}%2C${trip.longitude+0.01}%2C${trip.latitude+0.01}&layer=mapnik&marker=${trip.latitude}%2C${trip.longitude}`}
              className="absolute inset-0"
            ></iframe>
            {/* Sfumatura sotto la mappa per fondersi col contenuto */}
            <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-gray-50 to-transparent"></div>
          </div>
        ) : (
          <div className="w-full h-24 bg-gray-200 flex items-center justify-center text-gray-500 text-sm">
            Mappa non disponibile
          </div>
        )}

        <div className="p-4 space-y-4 -mt-6 relative z-10">
          
          {/* STATS CHILOMETRI E TEMPO */}
          <div className="grid grid-cols-2 gap-3 mb-2">
            <div className="bg-white p-3 rounded-xl shadow-sm border border-gray-200 flex flex-col items-center justify-center">
              <span className="text-[10px] text-gray-500 font-bold uppercase mb-1">Distanza</span>
              <span className="text-xl font-black text-[#dc2626]">{trip.estimatedDistanceKm || '--'} <span className="text-sm font-medium text-gray-900">km</span></span>
            </div>
            <div className="bg-white p-3 rounded-xl shadow-sm border border-gray-200 flex flex-col items-center justify-center">
              <span className="text-[10px] text-gray-500 font-bold uppercase mb-1">Tempo Previsto</span>
              <span className="text-xl font-black text-[#dc2626]">{trip.estimatedDurationMins || '--'} <span className="text-sm font-medium text-gray-900">min</span></span>
            </div>
          </div>

          {/* ORARIO E STATO */}"""

content = content.replace(old_header, new_header)

# Ensure fixed bottom bar looks good in light mode
old_bottom_bar = """<div className="fixed bottom-[65px] w-full p-4 bg-gray-50 border-t border-gray-200 shadow-[0_-15px_40px_rgba(0,0,0,0.9)] z-20">"""
new_bottom_bar = """<div className="fixed bottom-[65px] w-full p-4 bg-white border-t border-gray-200 shadow-[0_-10px_20px_rgba(0,0,0,0.05)] z-20">"""
content = content.replace(old_bottom_bar, new_bottom_bar)

with open(path, 'w') as f:
    f.write(content)

