'use client'

export function ActivityCalendar({ data }: { data: any[] }) {
    // Calculate stats on the fly for the side panel
    const activeDays = data.filter(d => d.volume > 0).length;
    const maxVol = Math.max(...data.map(d => d.volume));
    const totalVol = data.reduce((acc, curr) => acc + curr.volume, 0);
    const avgVol = totalVol / 30;

    return (
        <div className="flex flex-col md:flex-row gap-8 h-full">
            {/* LEFT: Compact Calendar Grid */}
            <div className="w-full max-w-xs shrink-0">
                <div className="grid grid-cols-7 gap-1 mb-1">
                    {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                        <div key={day} className="text-[9px] text-[#57534e] uppercase text-center font-bold tracking-wider">
                            {day}
                        </div>
                    ))}
                </div>
                
                <div className="grid grid-cols-7 gap-1">
                    {data.map((day) => {
                        const hasVol = day.volume > 0;
                        let bg = "bg-[#292524]";
                        let border = "border-[#44403c]";
                        let text = "text-[#57534e]";
                        
                        if (hasVol) {
                            bg = "bg-amber-900/20";
                            border = "border-amber-900";
                            text = "text-amber-500";
                            if (day.volume > 1000) { bg = "bg-amber-700/40"; border = "border-amber-600"; text = "text-[#e7e5e4]"; }
                            if (day.volume > 10000) { bg = "bg-amber-600"; border = "border-amber-500"; text = "text-black font-bold"; }
                        }

                        return (
                            <div key={day.date} className={`aspect-square border rounded-sm flex flex-col items-center justify-center p-0.5 transition-all hover:scale-105 group relative cursor-default ${bg} ${border}`}>
                                <span className={`text-[10px] ${text}`}>{day.dayNum}</span>
                                
                                <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-black border border-[#292524] p-2 rounded hidden group-hover:block z-20 whitespace-nowrap shadow-xl">
                                    <div className="text-[10px] text-[#78716c] uppercase font-bold">{day.date}</div>
                                    <div className="text-sm font-mono text-white">${day.volume.toLocaleString(undefined, { minimumFractionDigits: 2 })}</div>
                                </div>
                            </div>
                        )
                    })}
                </div>
            </div>

            {/* RIGHT: Stats Panel (Fills the empty space) */}
            <div className="flex-1 grid grid-cols-2 gap-6 content-center border-t md:border-t-0 md:border-l border-[#292524] pt-6 md:pt-0 md:pl-8">
                <div>
                    <div className="text-[9px] text-[#57534e] uppercase font-bold tracking-widest mb-1">Active Days</div>
                    <div className="text-2xl text-[#e7e5e4] font-mono">{activeDays} <span className="text-[#44403c] text-sm">/ 30</span></div>
                </div>
                
                <div>
                    <div className="text-[9px] text-[#57534e] uppercase font-bold tracking-widest mb-1">Highest Daily</div>
                    <div className="text-2xl text-[#e7e5e4] font-mono">${(maxVol / 1000).toFixed(1)}k</div>
                </div>

                <div>
                    <div className="text-[9px] text-[#57534e] uppercase font-bold tracking-widest mb-1">Daily Avg</div>
                    <div className="text-2xl text-[#e7e5e4] font-mono">${(avgVol / 1000).toFixed(1)}k</div>
                </div>

                <div className="flex items-end">
                    <div className="w-full h-1 bg-[#292524] rounded-full overflow-hidden">
                        <div className="h-full bg-amber-600/50" style={{ width: `${(activeDays / 30) * 100}%` }}></div>
                    </div>
                </div>
            </div>
        </div>
    )
}