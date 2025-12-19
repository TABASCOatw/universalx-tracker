import { db } from '@/lib/db'
import { refreshTraderData, deleteTrader } from '../../actions'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, ExternalLink, Activity } from 'lucide-react'
import { cookies } from 'next/headers'
import { formatDistanceToNow } from 'date-fns'

// --- CUSTOM COMPONENTS ---
import { NotesSection } from './NotesSection'
import { ActivityCalendar } from './ActivityCalendar'
import { TagManager } from './TagManager'
import { RecentTrades } from './RecentTrades'
import { ReferralStats } from './ReferralStats'
import { DealSection } from './DealSection'
import { AssetHoldings } from './AssetHoldings' // NEW IMPORT

export default async function TraderPage({ params }: { params: Promise<{ id: string }> }) {
  const cookieStore = await cookies()
  const userId = cookieStore.get('userId')?.value
  
  const resolvedParams = await params
  const { id } = resolvedParams
  
  // 1. Fetch Basic DB Data WITH DEAL
  const trader = await db.trader.findUnique({
    where: { id: id },
    include: { 
        addedBy: true,
        deal: true 
    } 
  })

  if (!trader) redirect('/dashboard')

  // 2. Fetch & Sync LIVE Data
  const liveData = await refreshTraderData(trader.id, trader.uxAddress);

  const isOwner = userId === trader.addedById
  
  const codeMap: Record<string, string> = { 
    'US': 'us', 'Europe': 'eu', 'China': 'cn', 
    'Vietnam': 'vn', 'Korea': 'kr', 
    'Singapore': 'sg', 'Thailand': 'th', 'Turkey': 'tr',
    'N/A': 'un' 
  }
  const flagCode = codeMap[trader.region] || 'un'
  
  const tags = trader.tags ? trader.tags.split(',').filter(Boolean) : []

  return (
    <main className="min-h-screen bg-[#0c0a09] text-[#e7e5e4] p-8 font-sans flex justify-center">
      <div className="w-full max-w-6xl">
        
        {/* NAV HEADER */}
        <div className="flex justify-between items-center mb-8 border-b border-[#292524] pb-6">
           <Link href="/dashboard" className="text-[#78716c] hover:text-[#e7e5e4] flex items-center gap-2 transition uppercase text-xs font-bold tracking-widest">
            <ArrowLeft size={14} /> Roster Index
           </Link>
           
           {isOwner && (
             <form action={deleteTrader.bind(null, trader.id)}>
                <button className="text-red-900/50 hover:text-red-500 text-[10px] uppercase font-bold tracking-widest transition-colors">Remove Trader</button>
             </form>
           )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* LEFT COLUMN: Profile, Tags, Stats, Notes */}
            <div className="lg:col-span-4 space-y-8 flex flex-col">
               <div className="text-center lg:text-left">
                 
                 {/* Profile Picture & Flag */}
                 <div className="relative inline-block mb-6">
                   <img src={trader.xProfilePic || ""} className="w-40 h-40 border border-[#44403c] shadow-2xl grayscale hover:grayscale-0 transition-all duration-500 object-cover" alt="Profile" />
                   <div className="absolute -bottom-3 -right-3 bg-[#0c0a09] border border-[#292524] p-2">
                      <img src={`https://flagcdn.com/w40/${flagCode}.png`} className="w-8" alt={trader.region} />
                   </div>
                 </div>
                 
                 {/* Name & Handle */}
                 <h1 className="text-3xl font-bold text-[#e7e5e4] uppercase tracking-wide mb-2">{trader.name}</h1>
                 
                 <a href={trader.xAccountLink} target="_blank" className="text-amber-600 hover:text-amber-500 flex items-center justify-center lg:justify-start gap-2 text-sm font-mono mb-6 transition-colors">
                    {trader.xHandle} <ExternalLink size={12} />
                 </a>

                 {/* Interactive Tag Manager */}
                 <TagManager traderId={trader.id} initialTags={tags} />

                 {/* Key Stats Grid */}
                 <div className="grid grid-cols-1 gap-2 mb-4">
                    {/* Real 30D Volume */}
                    <div className="bg-[#1c1917] p-4 border border-[#292524] flex justify-between items-center">
                        <span className="text-[10px] text-[#57534e] uppercase font-bold tracking-widest">30D Volume</span>
                        <span className="text-sm font-mono text-[#e7e5e4]">${liveData.volume30d.toLocaleString()}</span>
                    </div>

                    {/* Total Volume */}
                    <div className="bg-[#1c1917] p-4 border border-[#292524] flex justify-between items-center">
                        <span className="text-[10px] text-[#57534e] uppercase font-bold tracking-widest">Total Volume</span>
                        <span className="text-sm font-mono text-[#e7e5e4]">${liveData.totalVolume.toLocaleString()}</span>
                    </div>

                    {/* Manual Tier */}
                    <div className="bg-[#1c1917] p-4 border border-[#292524] flex justify-between items-center">
                        <span className="text-[10px] text-[#57534e] uppercase font-bold tracking-widest">Assigned Tier</span>
                        <span className={`text-xs font-bold uppercase px-2 py-1 ${trader.tier === 'Tier 1' ? 'bg-amber-900/20 text-amber-500' : 'text-[#a8a29e]'}`}>{trader.tier}</span>
                    </div>

                    {/* Last Active */}
                    <div className="bg-[#1c1917] p-4 border border-[#292524] flex justify-between items-center">
                        <span className="text-[10px] text-[#57534e] uppercase font-bold tracking-widest">Last Active</span>
                        <span className="text-xs text-[#e7e5e4]">{liveData.lastActive ? formatDistanceToNow(new Date(liveData.lastActive), { addSuffix: true }) : 'Never'}</span>
                    </div>
                 </div>

                 {/* DEAL SECTION */}
                 <DealSection traderId={trader.id} initialDeal={trader.deal} />

                 {/* NEW: Asset Holdings */}
                 <div className="mt-6">
                    <AssetHoldings assets={liveData.assets} />
                 </div>

                 {/* Referral Analysis */}
                 <div className="mt-6">
                    <ReferralStats stats={liveData.referralStats} />
                 </div>

               </div>

               {/* Notes Section */}
               <div className="w-full">
                   <NotesSection traderId={trader.id} initialNotes={trader.notes} />
               </div>
            </div>

            {/* RIGHT COLUMN: Calendar & Feed */}
            <div className="lg:col-span-8 space-y-8">
                
                {/* Activity Calendar */}
                <div className="bg-[#1c1917] border border-[#292524] p-6">
                    <div className="flex items-center gap-2 mb-6">
                        <Activity className="text-amber-600" size={16} />
                        <h3 className="text-sm font-bold text-[#e7e5e4] uppercase tracking-widest">30 Day Activity Calendar</h3>
                    </div>
                    <ActivityCalendar data={liveData.calendarData} />
                </div>

                {/* Recent Trades List */}
                <div className="bg-[#1c1917] border border-[#292524] p-6">
                     <RecentTrades 
                        traderId={trader.id} 
                        uxAddress={trader.uxAddress} 
                        initialTrades={liveData.recentTrades} 
                     />
                </div>
            </div>
        </div>
      </div>
    </main>
  )
}