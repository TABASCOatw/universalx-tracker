'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { Plus, BarChart, Users, X, UserPlus, Loader2, Share2 } from 'lucide-react'

// ... HELPER COMPONENTS (Flag, MiniTag, RealLineChart, RealBarChart) ...
// (Retaining existing helpers verbatim)
function Flag({ region }: { region: string }) {
  const codeMap: Record<string, string> = {
    'US': 'us', 'Europe': 'eu', 'China': 'cn', 
    'Vietnam': 'vn', 'Korea': 'kr', 
    'Singapore': 'sg', 'Thailand': 'th', 'Turkey': 'tr',
    'N/A': 'un'
  }
  const code = codeMap[region] || 'un'
  return <img src={`https://flagcdn.com/w40/${code}.png`} alt={region} className="w-5 h-auto opacity-80" />
}

function MiniTag({ tag }: { tag: string }) {
    let colorClass = "text-[#a8a29e] bg-[#292524] border-[#44403c]" 
    const lowerTag = tag.toLowerCase()

    if (lowerTag === 'whale') colorClass = "text-blue-400 bg-blue-900/20 border-blue-900"
    if (lowerTag === 'kol') colorClass = "text-purple-400 bg-purple-900/20 border-purple-900"
    if (lowerTag === 'active trader') colorClass = "text-emerald-400 bg-emerald-900/20 border-emerald-900"
    if (lowerTag === 'not trading') colorClass = "text-red-400 bg-red-900/20 border-red-900"
    if (lowerTag === 'tester') colorClass = "text-cyan-400 bg-cyan-900/20 border-cyan-900"

    return <span className={`text-[9px] uppercase font-bold px-1.5 py-0.5 rounded border ${colorClass}`}>{tag}</span>
}

function RealLineChart({ data }: { data: { date: string, val: number }[] }) {
    const max = Math.max(...data.map(d => d.val), 100);
    const points = data.map((d, i) => {
        const x = (i / (data.length - 1)) * 100;
        const y = 100 - ((d.val / max) * 100);
        return `${x},${y}`;
    }).join(' ');

    return (
        <div className="w-full h-full relative">
            <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="w-full h-full overflow-visible">
                <defs>
                    <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#d97706" stopOpacity="0.3" />
                        <stop offset="100%" stopColor="#d97706" stopOpacity="0" />
                    </linearGradient>
                </defs>
                <path d={`M 0,100 ${points} 100,100`} fill="url(#chartGradient)" />
                <polyline points={points} fill="none" stroke="#d97706" strokeWidth="2" vectorEffect="non-scaling-stroke" />
            </svg>
            <div className="absolute inset-0 flex items-end justify-between opacity-0 hover:opacity-100 transition-opacity">
                 {data.map((d, i) => (
                     <div key={i} className="flex-1 h-full hover:bg-white/5 relative group">
                        <div className="absolute bottom-1/2 left-1/2 -translate-x-1/2 bg-black border border-[#292524] p-2 rounded hidden group-hover:block z-10 whitespace-nowrap shadow-xl">
                            <div className="text-[10px] text-[#78716c] font-bold">{d.date}</div>
                            <div className="text-white font-mono">${d.val.toLocaleString()}</div>
                        </div>
                     </div>
                 ))}
            </div>
        </div>
    )
}

function RealBarChart({ data }: { data: { date: string, val: number }[] }) {
    const max = Math.max(...data.map(d => d.val), 5);

    return (
        <div className="flex items-end gap-1 w-full h-full">
            {data.map((d, i) => (
                <div key={i} className="flex-1 relative group bg-amber-900/20 hover:bg-amber-600 transition-colors rounded-t-sm" style={{ height: `${(d.val / max) * 100}%` }}>
                    <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-black border border-[#292524] p-2 rounded hidden group-hover:block z-10 whitespace-nowrap shadow-xl">
                        <div className="text-[10px] text-[#78716c] font-bold">{d.date}</div>
                        <div className="text-white font-mono">{d.val} Active</div>
                    </div>
                </div>
            ))}
        </div>
    )
}


export function RosterView({ currentUser, teamMembers, allTraders }: any) {
  const [regionFilter, setRegionFilter] = useState('All')
  const [tierFilter, setTierFilter] = useState('All')
  const [tagFilter, setTagFilter] = useState('All') 
  const [sortOrder, setSortOrder] = useState('desc') 
  const [showActiveOnly, setShowActiveOnly] = useState(false)
  const [metricModal, setMetricModal] = useState<'volume' | 'active' | 'referral' | null>(null) // Added 'referral'
  const [isLoadingTrader, setIsLoadingTrader] = useState(false)

  const allUniqueTags = Array.from(new Set(allTraders.flatMap((t: any) => t.tags ? t.tags.split(',') : []))).filter(Boolean) as string[]

  const startOfWeek = new Date();
  const day = startOfWeek.getDay() || 7; 
  if (day !== 1) startOfWeek.setHours(-24 * (day - 1)); 
  else startOfWeek.setHours(0,0,0,0);

  const newTradersThisWeek = allTraders.filter((t: any) => new Date(t.createdAt) >= startOfWeek).length;

  const filteredTraders = allTraders.filter((t: any) => {
    if (regionFilter !== 'All' && t.region !== regionFilter) return false
    if (tierFilter !== 'All' && t.tier !== tierFilter) return false
    if (tagFilter !== 'All') {
        const traderTags = t.tags ? t.tags.split(',') : []
        if (!traderTags.includes(tagFilter)) return false
    }
    if (showActiveOnly) {
       const hoursSinceActive = (new Date().getTime() - new Date(t.lastActive).getTime()) / (1000 * 60 * 60)
       if (hoursSinceActive > 24) return false
    }
    return true
  })

  // CALCULATE METRICS
  const { chartDataVolume, chartDataReferral, chartDataActive, totalRealVolume, totalReferralVolume, totalActiveNow } = useMemo(() => {
    const volMap: Record<string, number> = {};
    const refMap: Record<string, number> = {}; // NEW: Map for referral history
    const activeMap: Record<string, number> = {};
    let grandTotalVol = 0;
    let grandTotalRef = 0; // NEW: Total Referral
    let activeNowCount = 0;

    const today = new Date();
    // Initialize last 30 days keys
    for(let i=29; i>=0; i--) {
        const d = new Date();
        d.setDate(today.getDate() - i);
        const key = d.toISOString().split('T')[0];
        volMap[key] = 0;
        refMap[key] = 0;
        activeMap[key] = 0;
    }

    filteredTraders.forEach((t: any) => {
        grandTotalVol += t.realVolume;
        grandTotalRef += (t.referralVolume30d || 0); // Accumulate referral volume

        const hoursSinceActive = (new Date().getTime() - new Date(t.lastActive).getTime()) / (1000 * 60 * 60);
        if (hoursSinceActive < 24) activeNowCount++;

        // 1. Process Personal Volume History
        if (t.historyData) {
            try {
                const history = JSON.parse(t.historyData);
                history.forEach((day: any) => {
                    if (volMap[day.date] !== undefined) {
                        volMap[day.date] += day.volume;
                        if (day.volume > 0) activeMap[day.date] += 1;
                    }
                });
            } catch (e) { console.error("History parse fail", t.name); }
        }

        // 2. Process Referral Volume History
        if (t.referralHistory) {
            try {
                const history = JSON.parse(t.referralHistory);
                history.forEach((day: any) => {
                    if (refMap[day.date] !== undefined) {
                        refMap[day.date] += (day.val || 0);
                    }
                });
            } catch (e) { console.error("Ref History parse fail", t.name); }
        }
    });

    const dates = Object.keys(volMap).sort();
    return {
        chartDataVolume: dates.map(d => ({ date: d, val: volMap[d] })),
        chartDataReferral: dates.map(d => ({ date: d, val: refMap[d] })), // New chart data
        chartDataActive: dates.map(d => ({ date: d, val: activeMap[d] })),
        totalRealVolume: grandTotalVol,
        totalReferralVolume: grandTotalRef,
        totalActiveNow: activeNowCount
    };
  }, [filteredTraders]);


  const rosterByTeam = teamMembers.map((member: any) => ({
    ...member,
    filteredRoster: filteredTraders
        .filter((t: any) => t.addedById === member.id)
        .sort((a: any, b: any) => sortOrder === 'desc' ? b.realVolume - a.realVolume : a.realVolume - b.realVolume)
  }))

  const getTierStyles = (tier: string) => {
    if (tier === 'Tier 1') return { bg: 'bg-amber-900/40', border: 'border-amber-700', text: 'text-amber-500' }
    if (tier === 'Tier 2') return { bg: 'bg-blue-900/40', border: 'border-blue-700', text: 'text-blue-400' }
    return { bg: 'bg-[#292524]', border: 'border-[#44403c]', text: 'text-[#a8a29e]' }
  }

  return (
    <div className="max-w-7xl mx-auto w-full">
      
      {isLoadingTrader && (
        <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center">
            <div className="bg-[#1c1917] border border-[#292524] p-8 max-w-sm w-full shadow-2xl flex flex-col items-center animate-in fade-in zoom-in duration-300">
                <Loader2 className="animate-spin text-amber-600 mb-4" size={48} />
                <h3 className="text-[#e7e5e4] uppercase font-bold tracking-widest text-sm mb-2">Loading Page</h3>
                <p className="text-[#78716c] text-[10px] uppercase font-bold tracking-widest text-center">
                    Refreshing transaction history...
                </p>
            </div>
        </div>
      )}

      {/* METRICS ROW */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        
        {/* 1. PERSONAL VOLUME */}
        <button 
          onClick={() => setMetricModal('volume')}
          className="group relative bg-[#1c1917] border border-[#292524] p-6 text-left hover:border-amber-700/50 transition-all overflow-hidden"
        >
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <BarChart size={40} className="text-amber-600" />
          </div>
          <div className="text-[#78716c] text-[10px] font-bold uppercase tracking-widest mb-1">Total 30d Volume</div>
          <div className="text-2xl lg:text-3xl font-bold text-[#e7e5e4] font-mono group-hover:text-amber-500 transition-colors">
            ${totalRealVolume.toLocaleString()}
          </div>
        </button>

        {/* 2. NEW: REFERRAL VOLUME */}
        <button 
          onClick={() => setMetricModal('referral')}
          className="group relative bg-[#1c1917] border border-[#292524] p-6 text-left hover:border-amber-700/50 transition-all overflow-hidden"
        >
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <Share2 size={40} className="text-amber-600" />
          </div>
          <div className="text-[#78716c] text-[10px] font-bold uppercase tracking-widest mb-1">30d Referral Vol</div>
          <div className="text-2xl lg:text-3xl font-bold text-[#e7e5e4] font-mono group-hover:text-amber-500 transition-colors">
            ${totalReferralVolume.toLocaleString()}
          </div>
        </button>

        {/* 3. ACTIVE TRADERS */}
        <button 
          onClick={() => setMetricModal('active')}
          className="group relative bg-[#1c1917] border border-[#292524] p-6 text-left hover:border-amber-700/50 transition-all overflow-hidden"
        >
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <Users size={40} className="text-amber-600" />
          </div>
          <div className="text-[#78716c] text-[10px] font-bold uppercase tracking-widest mb-1">Active Traders (24h)</div>
          <div className="text-2xl lg:text-3xl font-bold text-[#e7e5e4] font-mono group-hover:text-amber-500 transition-colors">
            {totalActiveNow} <span className="text-sm text-[#57534e]">/ {filteredTraders.length}</span>
          </div>
        </button>

        {/* 4. NEW TRADERS */}
        <div className="group relative bg-[#1c1917] border border-[#292524] p-6 text-left hover:border-amber-700/50 transition-all overflow-hidden cursor-default">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <UserPlus size={40} className="text-amber-600" />
          </div>
          <div className="text-[#78716c] text-[10px] font-bold uppercase tracking-widest mb-1">New Traders (Week)</div>
          <div className="text-2xl lg:text-3xl font-bold text-[#e7e5e4] font-mono group-hover:text-amber-500 transition-colors">
            +{newTradersThisWeek}
          </div>
        </div>
      </div>

      {/* CONTROLS */}
      <div className="flex flex-col md:flex-row justify-between items-end md:items-center mb-8 gap-4 border-b border-[#292524] pb-6">
        <div className="flex flex-wrap gap-2">
           <select className="bg-[#0c0a09] border border-[#292524] text-[#a8a29e] text-xs uppercase font-bold py-2 px-4 outline-none focus:border-amber-700" onChange={(e) => setRegionFilter(e.target.value)}>
             <option value="All">All Regions</option>
             <option value="US">US</option>
             <option value="Europe">Europe</option>
             <option value="China">China</option>
             <option value="Korea">Korea</option>
             <option value="Vietnam">Vietnam</option>
             <option value="Singapore">Singapore</option>
             <option value="Thailand">Thailand</option>
             <option value="Turkey">Turkey</option>
           </select>
           <select className="bg-[#0c0a09] border border-[#292524] text-[#a8a29e] text-xs uppercase font-bold py-2 px-4 outline-none focus:border-amber-700" onChange={(e) => setTierFilter(e.target.value)}>
             <option value="All">All Tiers</option>
             <option value="Tier 1">Tier 1</option>
             <option value="Tier 2">Tier 2</option>
             <option value="Tier 3">Tier 3</option>
           </select>
           <select className="bg-[#0c0a09] border border-[#292524] text-[#a8a29e] text-xs uppercase font-bold py-2 px-4 outline-none focus:border-amber-700" onChange={(e) => setTagFilter(e.target.value)}>
             <option value="All">All Tags</option>
             {allUniqueTags.map(tag => <option key={tag} value={tag}>{tag}</option>)}
           </select>
           <select className="bg-[#0c0a09] border border-[#292524] text-[#a8a29e] text-xs uppercase font-bold py-2 px-4 outline-none focus:border-amber-700" onChange={(e) => setSortOrder(e.target.value)} value={sortOrder}>
             <option value="desc">Highest Volume</option>
             <option value="asc">Lowest Volume</option>
           </select>
           <button onClick={() => setShowActiveOnly(!showActiveOnly)} className={`border text-xs uppercase font-bold py-2 px-4 transition-colors ${showActiveOnly ? 'bg-amber-900/20 border-amber-600 text-amber-500' : 'bg-[#0c0a09] border-[#292524] text-[#a8a29e]'}`}>
             Active Only
           </button>
        </div>
        <Link href="/add" className="bg-amber-700 hover:bg-amber-600 text-[#e7e5e4] px-6 py-2 text-xs font-bold uppercase tracking-widest transition-all flex items-center gap-2">
          <Plus size={14} /> Add Trader
        </Link>
      </div>

      {/* ROSTERS */}
      <div className="space-y-12">
        {rosterByTeam.map((member: any) => {
          const weeklyAdds = member.traders.filter((t: any) => new Date(t.createdAt) >= startOfWeek).length
          const kpiTarget = 5
          const kpiProgress = Math.min((weeklyAdds / kpiTarget) * 100, 100)
          const isCurrentUser = currentUser?.id === member.id

          return (
            <div key={member.id} className="relative">
               <div className="flex items-center gap-4 mb-6">
                  <img src={member.profilePic} className={`w-10 h-10 rounded-full border border-[#44403c] transition-all duration-500 ${isCurrentUser ? '' : 'grayscale opacity-60'}`} />
                  <div>
                    <h2 className={`font-bold uppercase tracking-widest text-lg flex items-center gap-3 ${isCurrentUser ? 'text-[#e7e5e4]' : 'text-[#78716c]'}`}>
                        {member.username}
                        <span className="text-xs bg-[#292524] text-[#a8a29e] px-2 py-0.5 rounded border border-[#44403c]">{member.filteredRoster.length} Traders</span>
                    </h2>
                    <div className="flex items-center gap-2 text-[10px] text-[#78716c] uppercase mt-1">
                       <span>Weekly KPI: {weeklyAdds} / {kpiTarget}</span>
                       <div className="w-24 h-1 bg-[#292524] rounded-full overflow-hidden">
                          <div className={`h-full ${weeklyAdds >= 5 ? 'bg-amber-500' : 'bg-[#57534e]'}`} style={{ width: `${kpiProgress}%` }}></div>
                       </div>
                    </div>
                  </div>
               </div>
               <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {member.filteredRoster.map((trader: any) => {
                     const hoursSinceActive = (new Date().getTime() - new Date(trader.lastActive).getTime()) / (1000 * 60 * 60)
                     const isActive = hoursSinceActive < 24
                     const tierStyle = getTierStyles(trader.tier)
                     const tags = trader.tags ? trader.tags.split(',').filter(Boolean) : []
                     const hasReferralVol = trader.referralVolume30d > 0
                     
                     return (
                      <Link 
                         href={`/trader/${trader.id}`} 
                         key={trader.id} 
                         onClick={() => setIsLoadingTrader(true)} 
                         className={`group block bg-[#1c1917] border transition-all hover:-translate-y-1 hover:bg-[#292524] ${isActive ? 'border-emerald-900/50' : 'border-[#292524] hover:border-[#44403c]'} overflow-hidden shadow-lg`}
                      >
                        <div className="p-3">
                            <div className="flex items-center gap-3 mb-2">
                                <div className="relative">
                                   <img src={trader.xProfilePic} className="w-12 h-12 rounded-full border border-[#44403c] object-cover" />
                                   {isActive && <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-emerald-500 border-2 border-[#1c1917] rounded-full shadow-[0_0_8px_rgba(16,185,129,0.5)]"></div>}
                                </div>
                                <div className="overflow-hidden flex-1">
                                    <div className="flex justify-between items-center mb-0.5">
                                       <div className="text-[#e7e5e4] text-base font-bold truncate group-hover:text-amber-500 transition-colors mr-2">{trader.name}</div>
                                       <Flag region={trader.region} />
                                    </div>
                                    <div className="text-[#78716c] text-[10px] truncate font-mono">{trader.xHandle}</div>
                                </div>
                            </div>
                            <div className="flex flex-wrap gap-1 mb-1">
                                {tags.length > 0 ? tags.slice(0, 3).map((tag: string) => <MiniTag key={tag} tag={tag} />) : <span className="h-4 block"></span>}
                                {tags.length > 3 && <span className="text-[9px] text-[#57534e] self-center">+{tags.length - 3}</span>}
                            </div>
                        </div>
                        <div className={`px-3 py-2 border-t flex justify-between items-center ${tierStyle.bg} ${tierStyle.border}`}>
                           <span className={`text-[10px] uppercase font-bold ${tierStyle.text}`}>{trader.tier}</span>
                           <div className="flex items-center gap-3">
                               {/* NEW: Referral Volume Pill (Only if > 0) */}
                               {hasReferralVol && (
                                   <div className="flex items-center gap-1 opacity-70">
                                       <span className="text-[9px] text-[#57534e] uppercase font-bold tracking-wider">Ref</span>
                                       <span className="text-[#a8a29e] text-[10px] font-mono">${(trader.referralVolume30d).toLocaleString()}</span>
                                   </div>
                               )}

                               <div className="flex items-center gap-1.5">
                                   <span className="text-[9px] text-[#57534e] uppercase font-bold tracking-wider">30d Vol</span>
                                   <span className="text-[#e7e5e4] text-xs font-mono">${(trader.realVolume).toLocaleString()}</span>
                               </div>
                           </div>
                        </div>
                      </Link>
                     )
                  })}
                  {member.filteredRoster.length === 0 && <div className="col-span-full py-6 text-center text-[#44403c] text-xs uppercase tracking-widest border border-dashed border-[#292524]">No traders found.</div>}
               </div>
            </div>
          )
        })}
      </div>

      {/* MODAL */}
      {metricModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm" onClick={() => setMetricModal(null)}>
          <div className="bg-[#1c1917] border border-[#44403c] p-8 max-w-2xl w-full mx-4 shadow-2xl relative" onClick={(e) => e.stopPropagation()}>
             <h3 className="text-xl text-[#e7e5e4] uppercase tracking-widest font-bold mb-6">
               {metricModal === 'volume' && 'Volume Trend (30 Days)'}
               {metricModal === 'referral' && 'Referral Volume Trend (30 Days)'}
               {metricModal === 'active' && 'Daily Active Traders (30 Days)'}
             </h3>
             <div className="h-64 border-b border-[#44403c] pb-2">
                {metricModal === 'volume' && <RealLineChart data={chartDataVolume} />}
                {metricModal === 'referral' && <RealLineChart data={chartDataReferral} />}
                {metricModal === 'active' && <RealBarChart data={chartDataActive} />}
             </div>
             <div className="flex justify-between text-[#57534e] text-xs uppercase mt-2">
               <span>30 Days Ago</span>
               <span>Today</span>
             </div>
             <button onClick={() => setMetricModal(null)} className="absolute top-4 right-4 text-[#57534e] hover:text-[#e7e5e4]"><X size={20}/></button>
          </div>
        </div>
      )}
    </div>
  )
}