'use client'

import { useState } from 'react'
import { addTrader } from '../actions'
import Link from 'next/link'
import { ArrowLeft, X, Plus, Loader2 } from 'lucide-react'
import { useFormStatus } from 'react-dom' // Import this

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
  const [volume, setVolume] = useState(0)
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

  const getTier = (vol: number) => {
    if (vol < 100000) return { label: 'Tier 3', color: 'text-[#78716c]', border: 'border-[#44403c]' }
    if (vol < 1000000) return { label: 'Tier 2', color: 'text-blue-400', border: 'border-blue-900' }
    return { label: 'Tier 1', color: 'text-amber-500 font-bold', border: 'border-amber-600' }
  }
  
  const tier = getTier(volume)

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
               <input name="uxAddress" required placeholder="EVM Address" className="w-full bg-[#0c0a09] border border-[#292524] p-4 text-[#e7e5e4] focus:border-amber-700 outline-none transition placeholder:text-[#292524] text-sm" />
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

            {/* VOLUME */}
            <div className={`pt-6 pb-2 border-t border-[#292524]`}>
              <div className="flex justify-between items-center mb-4">
                <label className="text-[10px] uppercase text-[#57534e] font-bold tracking-widest">Est. Monthly Volume</label>
                <span className={`px-3 py-1 text-xs border ${tier.color} ${tier.border} bg-[#0c0a09] uppercase font-bold`}>{tier.label}</span>
              </div>
              <input 
                type="range" 
                name="volume"
                min="0" 
                max="1500000" 
                step="10000" 
                value={volume}
                onChange={(e) => setVolume(Number(e.target.value))}
                className="w-full h-1 bg-[#292524] appearance-none cursor-pointer accent-amber-600 hover:accent-amber-500"
              />
              <div className="text-right text-xl font-bold text-[#e7e5e4] mt-2 font-mono">
                ${volume.toLocaleString()}{volume >= 1500000 ? '+' : ''}
              </div>
            </div>

            {/* 2. REPLACE STANDARD BUTTON WITH CUSTOM ONE */}
            <SubmitButton />
          </form>
        </div>
      </div>
    </main>
  )
}