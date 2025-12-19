// app/trader/[id]/ReferralStats.tsx
import { Users } from 'lucide-react'

interface ReferralStatsProps {
  stats: {
    totalVolume: number;
    volume30d: number;
    totalCommission: number;
    totalInvitees: number;
  }
}

export function ReferralStats({ stats }: ReferralStatsProps) {
  // Determine if active based on having any volume or invitees
  const hasActivity = stats.totalVolume > 0 || stats.totalInvitees > 0;

  return (
    <div className={`bg-[#1c1917] border border-[#292524] p-4 relative overflow-hidden transition-all ${!hasActivity ? 'opacity-40 grayscale' : ''}`}>
      
      {/* "No Data" Overlay for Greyed Out State */}
      {!hasActivity && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/10">
            <span className="bg-black/60 text-[#a8a29e] px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest border border-[#44403c] backdrop-blur-sm">
                No Referral Volume
            </span>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center gap-2 mb-4 border-b border-[#292524] pb-2">
         <Users className="text-amber-600" size={14} />
         <h3 className="text-xs font-bold text-[#e7e5e4] uppercase tracking-widest">Referral Analysis</h3>
      </div>

      {/* Grid of 4 Stats */}
      <div className="grid grid-cols-2 gap-y-4 gap-x-2">
          
          {/* Total Volume */}
          <div>
            <p className="text-[10px] text-[#57534e] uppercase font-bold tracking-widest mb-1">Total Ref Vol</p>
            <p className="text-sm font-mono text-[#e7e5e4]">${stats.totalVolume.toLocaleString()}</p>
          </div>

          {/* 30D Volume */}
          <div>
            <p className="text-[10px] text-[#57534e] uppercase font-bold tracking-widest mb-1">30D Ref Vol</p>
            <p className="text-sm font-mono text-[#e7e5e4]">${stats.volume30d.toLocaleString()}</p>
          </div>

          {/* Commission */}
          <div>
            <p className="text-[10px] text-[#57534e] uppercase font-bold tracking-widest mb-1">Commission</p>
            <p className="text-sm font-mono text-amber-600">${stats.totalCommission.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
          </div>

           {/* Invitees */}
           <div>
            <p className="text-[10px] text-[#57534e] uppercase font-bold tracking-widest mb-1">Total Invitees</p>
            <p className="text-sm font-mono text-[#e7e5e4]">{stats.totalInvitees}</p>
          </div>
      </div>
    </div>
  )
}