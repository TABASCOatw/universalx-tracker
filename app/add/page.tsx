'use client'

import { useState } from 'react'
import { addTrader } from '../actions'
import Link from 'next/link'
import { ArrowLeft, X, Loader2, Handshake, Plus, Check, Trash2 } from 'lucide-react'
import { useFormStatus } from 'react-dom'

function SubmitButton() {
  const { pending } = useFormStatus()

  return (
    <button 
      type="submit" 
      disabled={pending}
      className={`w-full font-bold py-4 transition uppercase tracking-widest text-xs flex items-center justify-center gap-2 ${pending ? 'bg-[#292524] text-[#78716c] cursor-not-allowed' : 'bg-amber-700 hover:bg-amber-600 text-[#e7e5e4]'}`}
    >
      {pending ? (
        <>
          <Loader2 className="animate-spin" size={14} />
          LOADING ACCOUNT...
        </>
      ) : (
        'Add Trader'
      )}
    </button>
  )
}

export default function AddTraderPage() {
  const [tags, setTags] = useState<string[]>([])
  const [customTagInput, setCustomTagInput] = useState('')
  
  // NEW STATES
  const [selectedTier, setSelectedTier] = useState('Tier 3')
  const [addDeal, setAddDeal] = useState(false)
  const [showExtraTiers, setShowExtraTiers] = useState(false)
  
  // MULTI-ADDRESS STATE
  const [addresses, setAddresses] = useState<string[]>([''])

  const PREMADE_TAGS = ['Not trading', 'KOL', 'Active trader', 'Whale', 'Tester']

  const toggleTag = (tag: string) => {
    if (tags.includes(tag)) {
      setTags(tags.filter(t => t !== tag))
    } else {
      setTags([...tags, tag])
    }
  }

  const addCustomTag = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      if (customTagInput.trim() && !tags.includes(customTagInput)) {
        setTags([...tags, customTagInput])
        setCustomTagInput('')
      }
    }
  }

  // ADDRESS HANDLERS
  const updateAddress = (idx: number, val: string) => {
      const newArr = [...addresses]
      newArr[idx] = val
      setAddresses(newArr)
  }

  const addAddressField = () => setAddresses([...addresses, ''])
  
  const removeAddressField = (idx: number) => {
      if (addresses.length > 1) {
          setAddresses(addresses.filter((_, i) => i !== idx))
      }
  }

  const tierOptions = [
    { id: 'Tier 1', label: 'Tier 1', desc: 'High volume expectations', color: 'border-amber-600 bg-amber-900/10 text-amber-500' },
    { id: 'Tier 2', label: 'Tier 2', desc: 'Potentially high volume', color: 'border-blue-800 bg-blue-900/10 text-blue-400' },
    { id: 'Tier 3', label: 'Tier 3', desc: 'Low volume expectations', color: 'border-[#44403c] bg-[#292524] text-[#a8a29e]' },
  ]

  return (
    <main className="min-h-screen bg-[#0c0a09] flex items-center justify-center p-6 font-sans">
      <div className="max-w-xl w-full">
        
        <Link href="/dashboard" className="text-[#78716c] hover:text-[#e7e5e4] flex items-center gap-2 mb-6 transition uppercase text-xs font-bold tracking-widest">
          <ArrowLeft size={14} /> Return to Roster
        </Link>

        <div className="bg-[#1c1917] border border-[#292524] p-8 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-bl from-[#292524] to-transparent opacity-50"></div>

          <div className="mb-8 border-b border-[#292524] pb-4">
            <h1 className="text-2xl font-bold text-[#e7e5e4] mb-1 uppercase tracking-[0.1em]">Onboard Trader</h1>
            <p className="text-[#57534e] text-xs uppercase tracking-widest">Enter trader info</p>
          </div>

          <form action={addTrader} className="space-y-6">
            
            <input type="hidden" name="tags" value={tags.join(',')} />
            <input type="hidden" name="tier" value={selectedTier} />
            {/* HIDDEN INPUT FOR ADDRESSES */}
            <input type="hidden" name="uxAddress" value={addresses.filter(a => a.trim()).join(',')} />

            {/* IDENTITY */}
            <div className="space-y-4">
              <label className="text-[10px] uppercase font-bold text-[#57534e] tracking-widest">Identity</label>
              <input name="name" required placeholder="Name" className="w-full bg-[#0c0a09] border border-[#292524] p-4 text-[#e7e5e4] focus:border-amber-700 outline-none transition placeholder:text-[#292524] text-sm" />
              
              <div className="grid grid-cols-2 gap-4">
                <input name="xAccountLink" required placeholder="X Profile (x.com/...)" className="w-full bg-[#0c0a09] border border-[#292524] p-4 text-[#e7e5e4] focus:border-amber-700 outline-none transition placeholder:text-[#292524] text-sm" />
                <select name="region" className="w-full bg-[#0c0a09] border border-[#292524] p-4 text-[#a8a29e] outline-none text-sm uppercase">
                  <option value="US">US</option>
                  <option value="Europe">Europe</option>
                  <option value="China">China</option>
                  <option value="Korea">Korea</option>
                  <option value="Vietnam">Vietnam</option>
                  <option value="Singapore">Singapore</option>
                  <option value="Thailand">Thailand</option>
                  <option value="Turkey">Turkey</option>
                  <option value="N/A">N/A</option>
                </select>
              </div>
            </div>

            {/* TAGS */}
            <div className="space-y-3">
              <label className="text-[10px] uppercase font-bold text-[#57534e] tracking-widest">Tags</label>
              <div className="flex flex-wrap gap-2 mb-2">
                 {tags.map(tag => (
                   <span key={tag} className="bg-amber-900/40 text-amber-500 border border-amber-800 px-2 py-1 text-xs flex items-center gap-1 cursor-pointer hover:bg-red-900/40 hover:text-red-400 hover:border-red-800 transition" onClick={() => toggleTag(tag)}>
                     {tag} <X size={10} />
                   </span>
                 ))}
                 {tags.length === 0 && <span className="text-[#292524] text-xs italic">No tags selected</span>}
              </div>
              <div className="flex flex-wrap gap-2">
                 {PREMADE_TAGS.map(tag => (
                   <button 
                     key={tag} 
                     type="button"
                     onClick={() => toggleTag(tag)}
                     className={`text-xs px-3 py-1 border transition uppercase font-bold tracking-wider ${tags.includes(tag) ? 'bg-[#292524] text-white border-white' : 'bg-[#0c0a09] text-[#57534e] border-[#292524] hover:border-[#57534e]'}`}
                   >
                     {tag}
                   </button>
                 ))}
                 <input 
                   placeholder="+ Custom Tag (Enter)" 
                   value={customTagInput}
                   onChange={(e) => setCustomTagInput(e.target.value)}
                   onKeyDown={addCustomTag}
                   className="bg-[#0c0a09] border border-[#292524] text-[#e7e5e4] text-xs px-3 py-1 outline-none focus:border-amber-700 w-40"
                 />
              </div>
            </div>

            {/* CONFIG (UPDATED FOR MULTIPLE ADDRESSES) */}
            <div className="space-y-4 pt-4 border-t border-[#292524]">
               <div className="flex justify-between items-center">
                   <label className="text-[10px] uppercase font-bold text-[#57534e] tracking-widest">UniversalX Config</label>
                   <button type="button" onClick={addAddressField} className="text-[9px] text-amber-600 hover:text-amber-500 uppercase font-bold flex items-center gap-1">
                      <Plus size={10} /> Add Wallet
                   </button>
               </div>
               
               <div className="space-y-2">
                   {addresses.map((addr, idx) => (
                       <div key={idx} className="flex items-center gap-2">
                           <input 
                             value={addr} 
                             onChange={(e) => updateAddress(idx, e.target.value)}
                             required={idx === 0} // Only first is required
                             placeholder={`EVM or Solana Address ${idx + 1}`} 
                             className="w-full bg-[#0c0a09] border border-[#292524] p-4 text-[#e7e5e4] focus:border-amber-700 outline-none transition placeholder:text-[#292524] text-sm" 
                           />
                           {addresses.length > 1 && (
                               <button type="button" onClick={() => removeAddressField(idx)} className="p-4 bg-[#1c1917] border border-[#292524] hover:border-red-800 hover:text-red-500 text-[#57534e] transition">
                                   <Trash2 size={16} />
                               </button>
                           )}
                       </div>
                   ))}
               </div>

               <input name="referralCode" placeholder="Referral Code (Optional)" className="w-full bg-[#0c0a09] border border-[#292524] p-4 text-[#e7e5e4] focus:border-amber-700 outline-none transition placeholder:text-[#292524] text-sm" />
            </div>

            {/* DEALS SECTION */}
            <div className="space-y-4 pt-4 border-t border-[#292524]">
                <div 
                    className="flex items-center gap-2 cursor-pointer group"
                    onClick={() => setAddDeal(!addDeal)}
                >
                    <div className={`w-4 h-4 border border-[#57534e] flex items-center justify-center transition-colors ${addDeal ? 'bg-amber-700 border-amber-700' : 'bg-[#0c0a09]'}`}>
                        {addDeal && <X size={10} className="text-white" />}
                    </div>
                    <label className="text-[10px] uppercase font-bold text-[#57534e] group-hover:text-[#e7e5e4] transition-colors tracking-widest cursor-pointer flex items-center gap-2">
                       <Handshake size={12} /> Deals - Add Deal
                    </label>
                </div>
                
                {addDeal && (
                    <div className="bg-[#292524]/20 border border-[#292524] p-4 space-y-4 animate-in fade-in slide-in-from-top-2">
                        <input type="hidden" name="hasDeal" value="on" />
                        
                        <div className="grid grid-cols-2 gap-4">
                             <div>
                                <label className="text-[9px] uppercase font-bold text-[#57534e] tracking-widest block mb-1">Retainer ($)</label>
                                <input type="number" name="retainer" placeholder="0" className="w-full bg-[#0c0a09] border border-[#292524] p-3 text-[#e7e5e4] focus:border-amber-700 outline-none transition text-xs font-mono" />
                             </div>
                             <div>
                                <label className="text-[9px] uppercase font-bold text-[#57534e] tracking-widest block mb-1">Cashback (%)</label>
                                <input type="number" name="cashback" placeholder="0%" className="w-full bg-[#0c0a09] border border-[#292524] p-3 text-[#e7e5e4] focus:border-amber-700 outline-none transition text-xs font-mono" />
                             </div>
                        </div>

                        <div>
                            <label className="text-[9px] uppercase font-bold text-[#57534e] tracking-widest block mb-2">Commission Structure (%)</label>
                            <div className="grid grid-cols-3 gap-2">
                                <input type="number" name="commTier1" placeholder="Tier 1" className="bg-[#0c0a09] border border-[#292524] p-2 text-[#e7e5e4] focus:border-amber-700 outline-none text-xs font-mono" />
                                <input type="number" name="commTier2" placeholder="Tier 2" className="bg-[#0c0a09] border border-[#292524] p-2 text-[#e7e5e4] focus:border-amber-700 outline-none text-xs font-mono" />
                                <input type="number" name="commTier3" placeholder="Tier 3" className="bg-[#0c0a09] border border-[#292524] p-2 text-[#e7e5e4] focus:border-amber-700 outline-none text-xs font-mono" />
                            </div>
                            
                            {!showExtraTiers ? (
                                <button type="button" onClick={() => setShowExtraTiers(true)} className="mt-2 text-[9px] text-[#57534e] hover:text-amber-600 uppercase font-bold tracking-widest flex items-center gap-1">
                                    <Plus size={10} /> Add Tier 4 & 5
                                </button>
                            ) : (
                                <div className="grid grid-cols-2 gap-2 mt-2 animate-in fade-in">
                                    <input type="number" name="commTier4" placeholder="Tier 4" className="bg-[#0c0a09] border border-[#292524] p-2 text-[#e7e5e4] focus:border-amber-700 outline-none text-xs font-mono" />
                                    <input type="number" name="commTier5" placeholder="Tier 5" className="bg-[#0c0a09] border border-[#292524] p-2 text-[#e7e5e4] focus:border-amber-700 outline-none text-xs font-mono" />
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>

            {/* NOTES */}
            <div className="space-y-2">
                <label className="text-[10px] uppercase font-bold text-[#57534e] tracking-widest">Notes (Optional)</label>
                <textarea 
                  name="notes" 
                  rows={3}
                  placeholder="Enter any specific notes..."
                  className="w-full bg-[#0c0a09] border border-[#292524] p-4 text-[#e7e5e4] focus:border-amber-700 outline-none transition placeholder:text-[#292524] text-sm resize-none" 
                />
            </div>

            {/* MANUAL TIER SELECTION */}
            <div className={`pt-6 pb-2 border-t border-[#292524]`}>
               <label className="text-[10px] uppercase text-[#57534e] font-bold tracking-widest mb-4 block">Assign Tier</label>
               <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {tierOptions.map((opt) => {
                    const isSelected = selectedTier === opt.id
                    return (
                        <div 
                          key={opt.id}
                          onClick={() => setSelectedTier(opt.id)}
                          className={`cursor-pointer border p-3 flex flex-col gap-1 transition-all ${isSelected ? opt.color : 'border-[#292524] bg-[#1c1917] opacity-60 hover:opacity-100 hover:border-[#44403c]'}`}
                        >
                            <div className="flex justify-between items-center">
                                <span className={`text-sm font-bold uppercase ${isSelected ? '' : 'text-[#e7e5e4]'}`}>{opt.label}</span>
                                {isSelected && <Check size={14} />}
                            </div>
                            <span className="text-[9px] uppercase tracking-wide font-medium opacity-80">{opt.desc}</span>
                        </div>
                    )
                  })}
               </div>
            </div>

            <SubmitButton />
          </form>
        </div>
      </div>
    </main>
  )
}