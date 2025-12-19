'use client'

import { useState } from 'react'
import { Handshake, Edit2, X, Check, Plus } from 'lucide-react'
import { updateTraderDeal } from '../../actions'

interface Deal {
  retainerAmount: number | null
  cashbackPercent: number | null
  commTier1: number | null
  commTier2: number | null
  commTier3: number | null
  commTier4: number | null
  commTier5: number | null
}

export function DealSection({ traderId, initialDeal }: { traderId: string, initialDeal: Deal | null }) {
  const [isEditing, setIsEditing] = useState(false)
  const [showExtraTiers, setShowExtraTiers] = useState((initialDeal?.commTier4 || initialDeal?.commTier5) ? true : false)

  // Determine if a deal actually exists (has any non-null fields)
  const hasDeal = initialDeal && Object.values(initialDeal).some(v => v !== null)

  if (!hasDeal && !isEditing) {
      return (
          <button 
             onClick={() => setIsEditing(true)}
             className="w-full py-4 border border-dashed border-[#292524] text-[#57534e] hover:text-[#e7e5e4] hover:border-[#44403c] transition flex items-center justify-center gap-2 uppercase text-[10px] font-bold tracking-widest"
          >
              <Handshake size={14} /> Add Deal Structure
          </button>
      )
  }

  if (isEditing) {
      return (
        <form action={async (formData) => {
            await updateTraderDeal(formData)
            setIsEditing(false)
        }} className="bg-[#1c1917] border border-[#292524] p-4 relative animate-in fade-in">
             <input type="hidden" name="traderId" value={traderId} />
             
             <div className="flex items-center justify-between mb-4 border-b border-[#292524] pb-2">
                 <h3 className="text-xs font-bold text-[#e7e5e4] uppercase tracking-widest flex items-center gap-2">
                     <Handshake size={14} className="text-amber-600"/> Edit Deal
                 </h3>
                 <button type="button" onClick={() => setIsEditing(false)} className="text-[#57534e] hover:text-red-500"><X size={14} /></button>
             </div>

             <div className="grid grid-cols-2 gap-4 mb-4">
                 <div>
                    <label className="text-[9px] uppercase font-bold text-[#57534e] tracking-widest block mb-1">Retainer ($)</label>
                    <input type="number" name="retainer" defaultValue={initialDeal?.retainerAmount || ''} placeholder="0" className="w-full bg-[#0c0a09] border border-[#292524] p-2 text-[#e7e5e4] focus:border-amber-700 outline-none transition text-xs font-mono" />
                 </div>
                 <div>
                    <label className="text-[9px] uppercase font-bold text-[#57534e] tracking-widest block mb-1">Cashback (%)</label>
                    <input type="number" name="cashback" defaultValue={initialDeal?.cashbackPercent || ''} placeholder="0" className="w-full bg-[#0c0a09] border border-[#292524] p-2 text-[#e7e5e4] focus:border-amber-700 outline-none transition text-xs font-mono" />
                 </div>
             </div>

             <div className="mb-4">
                <label className="text-[9px] uppercase font-bold text-[#57534e] tracking-widest block mb-2">Commission Structure (%)</label>
                <div className="grid grid-cols-3 gap-2">
                    <input type="number" name="commTier1" defaultValue={initialDeal?.commTier1 || ''} placeholder="T1" className="bg-[#0c0a09] border border-[#292524] p-2 text-[#e7e5e4] focus:border-amber-700 outline-none text-xs font-mono" />
                    <input type="number" name="commTier2" defaultValue={initialDeal?.commTier2 || ''} placeholder="T2" className="bg-[#0c0a09] border border-[#292524] p-2 text-[#e7e5e4] focus:border-amber-700 outline-none text-xs font-mono" />
                    <input type="number" name="commTier3" defaultValue={initialDeal?.commTier3 || ''} placeholder="T3" className="bg-[#0c0a09] border border-[#292524] p-2 text-[#e7e5e4] focus:border-amber-700 outline-none text-xs font-mono" />
                </div>
                
                {!showExtraTiers ? (
                    <button type="button" onClick={() => setShowExtraTiers(true)} className="mt-2 text-[9px] text-[#57534e] hover:text-amber-600 uppercase font-bold tracking-widest flex items-center gap-1">
                        <Plus size={10} /> Add Tier 4 & 5
                    </button>
                ) : (
                    <div className="grid grid-cols-2 gap-2 mt-2 animate-in fade-in">
                        <input type="number" name="commTier4" defaultValue={initialDeal?.commTier4 || ''} placeholder="T4" className="bg-[#0c0a09] border border-[#292524] p-2 text-[#e7e5e4] focus:border-amber-700 outline-none text-xs font-mono" />
                        <input type="number" name="commTier5" defaultValue={initialDeal?.commTier5 || ''} placeholder="T5" className="bg-[#0c0a09] border border-[#292524] p-2 text-[#e7e5e4] focus:border-amber-700 outline-none text-xs font-mono" />
                    </div>
                )}
             </div>

             <button type="submit" className="w-full bg-amber-700 hover:bg-amber-600 text-[#e7e5e4] py-2 text-[10px] uppercase font-bold tracking-widest transition flex items-center justify-center gap-2">
                 <Check size={12} /> Save Deal
             </button>
        </form>
      )
  }

  // VIEW MODE
  return (
    <div className="bg-[#1c1917] border border-[#292524] p-4 relative group">
        <div className="flex items-center justify-between mb-4 border-b border-[#292524] pb-2">
             <h3 className="text-xs font-bold text-[#e7e5e4] uppercase tracking-widest flex items-center gap-2">
                 <Handshake size={14} className="text-amber-600"/> Active Deal
             </h3>
             <button onClick={() => setIsEditing(true)} className="text-[#57534e] hover:text-amber-500 opacity-0 group-hover:opacity-100 transition"><Edit2 size={12} /></button>
         </div>

         <div className="space-y-3">
             {initialDeal?.retainerAmount && (
                 <div className="flex justify-between items-center">
                     <span className="text-[10px] text-[#78716c] uppercase font-bold tracking-widest">Retainer</span>
                     <span className="text-sm font-mono text-[#e7e5e4]">${initialDeal.retainerAmount.toLocaleString()}</span>
                 </div>
             )}
             
             {initialDeal?.cashbackPercent && (
                 <div className="flex justify-between items-center">
                     <span className="text-[10px] text-[#78716c] uppercase font-bold tracking-widest">Cashback</span>
                     <span className="text-sm font-mono text-[#e7e5e4]">{initialDeal.cashbackPercent}%</span>
                 </div>
             )}

             {(initialDeal?.commTier1 || initialDeal?.commTier2 || initialDeal?.commTier3) && (
                 <div>
                     <span className="text-[10px] text-[#78716c] uppercase font-bold tracking-widest block mb-1">Commission</span>
                     <div className="grid grid-cols-5 gap-1 text-center">
                         {['1','2','3','4','5'].map(t => {
                             const key = `commTier${t}` as keyof Deal;
                             const val = initialDeal[key];
                             if (val === null) return null;
                             return (
                                 <div key={t} className="bg-[#0c0a09] border border-[#292524] py-1">
                                     <div className="text-[8px] text-[#57534e] font-bold">T{t}</div>
                                     <div className="text-xs text-amber-600 font-mono">{val}%</div>
                                 </div>
                             )
                         })}
                     </div>
                 </div>
             )}
         </div>
    </div>
  )
}