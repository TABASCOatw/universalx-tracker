'use client'

import { useState, useTransition } from 'react'
import { Plus, Trash2, Check, X, Wallet, Loader2 } from 'lucide-react'
import { addTraderAddress, removeTraderAddress } from '../../actions'

export function WalletManager({ traderId, addresses, isOwner }: { traderId: string, addresses: string[], isOwner: boolean }) {
    const [isAdding, setIsAdding] = useState(false)
    const [newAddress, setNewAddress] = useState('')
    
    // useTransition handles the loading state automatically for Server Actions
    const [isPending, startTransition] = useTransition()

    const handleSubmit = (formData: FormData) => {
        // Wrap the server action in startTransition to track the pending state
        startTransition(async () => {
            await addTraderAddress(formData)
            setIsAdding(false)
            setNewAddress('')
        })
    }

    return (
        <div className="mb-6 bg-[#1c1917] p-4 border border-[#292524] text-left shadow-lg">
             <div className="flex justify-between items-center mb-2">
                <div className="text-[10px] text-[#57534e] uppercase font-bold tracking-widest flex items-center gap-2">
                    <Wallet size={12} /> Connected Wallets
                </div>
                {isOwner && !isAdding && (
                    <button onClick={() => setIsAdding(true)} className="text-[9px] text-amber-600 hover:text-amber-500 uppercase font-bold flex items-center gap-1 transition-colors">
                        <Plus size={10} /> Add
                    </button>
                )}
             </div>

             <div className="space-y-1">
                 {addresses.map((addr) => (
                     <div key={addr} className="group flex justify-between items-center text-[10px] font-mono text-[#a8a29e] border-b border-[#292524] last:border-0 py-2 min-h-[32px]">
                         <span className="break-all">{addr}</span>
                         {isOwner && (
                             <form action={removeTraderAddress}>
                                 <input type="hidden" name="traderId" value={traderId} />
                                 <input type="hidden" name="address" value={addr} />
                                 <button className="opacity-0 group-hover:opacity-100 text-red-900 hover:text-red-500 transition-all p-1">
                                     <Trash2 size={12} />
                                 </button>
                             </form>
                         )}
                     </div>
                 ))}
                 {addresses.length === 0 && <div className="text-[10px] text-[#292524] italic py-1">No wallets connected.</div>}
             </div>

             {/* LOADING STATE (Shows when isPending is true) */}
             {isPending && (
                <div className="mt-3 pt-2 border-t border-[#292524] animate-in fade-in slide-in-from-top-1">
                    <div className="flex items-center justify-center gap-3 py-2 text-amber-500">
                         <Loader2 className="animate-spin" size={14} />
                         <span className="text-[10px] font-bold uppercase tracking-widest animate-pulse">
                             Fetching Additional Data...
                         </span>
                    </div>
                </div>
             )}

             {/* ADD FORM (Hides when loading) */}
             {isAdding && !isPending && (
                 <form action={handleSubmit} className="mt-3 pt-2 border-t border-[#292524] flex gap-2 animate-in fade-in slide-in-from-top-1">
                     <input type="hidden" name="traderId" value={traderId} />
                     <input 
                        name="address"
                        value={newAddress}
                        onChange={(e) => setNewAddress(e.target.value)}
                        placeholder="0x... or Sol Address"
                        className="flex-1 bg-[#0c0a09] border border-[#292524] px-2 py-1.5 text-[10px] text-[#e7e5e4] focus:border-amber-700 outline-none font-mono"
                        autoFocus
                     />
                     <button type="submit" disabled={!newAddress} className="bg-amber-900/20 border border-amber-900/50 text-amber-500 hover:bg-amber-900/40 p-1.5 transition-colors disabled:opacity-50">
                         <Check size={12} />
                     </button>
                     <button type="button" onClick={() => { setIsAdding(false); setNewAddress('') }} className="bg-[#292524] border border-[#44403c] text-[#78716c] hover:text-[#e7e5e4] p-1.5 transition-colors">
                         <X size={12} />
                     </button>
                 </form>
             )}
        </div>
    )
}