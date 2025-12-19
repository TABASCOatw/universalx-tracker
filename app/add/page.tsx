'use client'

import { useState } from 'react'
import { addTrader } from '../actions'
import Link from 'next/link'
import { ArrowLeft, X, Loader2 } from 'lucide-react'
import { useFormStatus } from 'react-dom'

// 1. EXTRACT BUTTON COMPONENT
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
        'Initialize Trader'
      )}
    </button>
  )
}

export default function AddTraderPage() {
  const [tier, setTier] = useState('Tier 3')
  const [tags, setTags] = useState<string[]>([])
  const [customTagInput, setCustomTagInput] = useState('')

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

  const tiers = [
    {
      id: "Tier 1",
      label: "Tier 1",
      description: "Strong, high-volume",
      activeClass: "text-amber-500 border-amber-600 bg-amber-900/10"
    },
    {
      id: "Tier 2",
      label: "Tier 2",
      description: "Potentially high volume",
      activeClass: "text-blue-400 border-blue-800 bg-blue-900/10"
    },
    {
      id: "Tier 3",
      label: "Tier 3",
      description: "Low volume expectations",
      activeClass: "text-[#a8a29e] border-[#44403c] bg-[#292524]/50"
    }
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
            <h1 className="text-2xl font-bold text-[#e7e5e4] mb-1 uppercase tracking-[0.1em]">Onboard Operative</h1>
            <p className="text-[#57534e] text-xs uppercase tracking-widest">Enter trader credentials</p>
          </div>

          <form action={addTrader} className="space-y-6">
            
            <input type="hidden" name="tags" value={tags.join(',')} />
            <input type="hidden" name="tier" value={tier} />

            {/* IDENTITY */}
            <div className="space-y-4">
              <label className="text-[10px] uppercase font-bold text-[#57534e] tracking-widest">Identity</label>
              <input name="name" required placeholder="Trader Name" className="w-full bg-[#0c0a09] border border-[#292524] p-4 text-[#e7e5e4] focus:border-amber-700 outline-none transition placeholder:text-[#292524] text-sm" />
              
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

            {/* CONFIG */}
            <div className="space-y-4 pt-4 border-t border-[#292524]">
               <label className="text-[10px] uppercase font-bold text-[#57534e] tracking-widest">UniversalX Config</label>
               <input name="uxAddress" required placeholder="EVM or Solana Address" className="w-full bg-[#0c0a09] border border-[#292524] p-4 text-[#e7e5e4] focus:border-amber-700 outline-none transition placeholder:text-[#292524] text-sm" />
               <p className="text-[10px] text-[#57534e] -mt-2">Solana addresses will auto-resolve to EVM.</p>
               <input name="referralCode" placeholder="Referral Code (Optional)" className="w-full bg-[#0c0a09] border border-[#292524] p-4 text-[#e7e5e4] focus:border-amber-700 outline-none transition placeholder:text-[#292524] text-sm" />
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

            {/* TIER SELECTION */}
            <div className="space-y-3 pt-4 border-t border-[#292524]">
                <label className="text-[10px] uppercase font-bold text-[#57534e] tracking-widest">Trader Tier</label>
                <div className="grid grid-cols-3 gap-3">
                  {tiers.map((t) => (
                    <div 
                      key={t.id}
                      onClick={() => setTier(t.id)}
                      className={`
                        cursor-pointer p-3 sm:p-4 rounded border transition-all duration-200 
                        flex flex-col items-center justify-center text-center gap-1
                        ${tier === t.id ? t.activeClass : 'border-[#292524] bg-[#0c0a09] text-[#57534e] hover:border-[#44403c]'}
                      `}
                    >
                      <div className="font-bold text-sm sm:text-base">{t.label}</div>
                      <div className="text-[8px] sm:text-[10px] uppercase tracking-wide opacity-80">{t.description}</div>
                    </div>
                  ))}
                </div>
            </div>

            <SubmitButton />
          </form>
        </div>
      </div>
    </main>
  )
}
