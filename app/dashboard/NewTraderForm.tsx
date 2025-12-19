'use client'

import { useState } from 'react'
import { addTrader } from '../actions'

export function NewTraderForm() {
  const [volume, setVolume] = useState(0)
  
  // Helper to determine Tier based on volume
  const getTier = (vol: number) => {
    if (vol < 100000) return { label: 'Tier 3', color: 'text-gray-400' }
    if (vol < 1000000) return { label: 'Tier 2', color: 'text-blue-400' }
    return { label: 'Tier 1', color: 'text-yellow-400 font-bold' }
  }

  const tier = getTier(volume)

  return (
    <form action={async (formData) => {
        await addTrader(formData);
        setVolume(0); // Reset UI
        // In a real app, you'd reset the other fields via a ref or state
    }} className="space-y-4">
      
      <input name="name" required placeholder="Trader Name" className="w-full bg-gray-800 border border-gray-700 rounded p-2 text-sm text-white focus:border-blue-500 outline-none" />
      
      <div className="grid grid-cols-2 gap-2">
        <input name="uxAddress" required placeholder="UniversalX Address" className="w-full bg-gray-800 border border-gray-700 rounded p-2 text-sm text-white outline-none" />
        <input name="referralCode" required placeholder="Referral Code" className="w-full bg-gray-800 border border-gray-700 rounded p-2 text-sm text-white outline-none" />
      </div>

      <div className="grid grid-cols-2 gap-2">
        <select name="region" className="w-full bg-gray-800 border border-gray-700 rounded p-2 text-sm text-gray-300 outline-none">
          <option value="US">United States</option>
          <option value="Europe">Europe</option>
          <option value="China">China</option>
          <option value="Vietnam">Vietnam</option>
          <option value="Korea">Korea</option>
          <option value="N/A">N/A</option>
        </select>
        <input name="xAccountLink" placeholder="X Link (twitter.com/...)" className="w-full bg-gray-800 border border-gray-700 rounded p-2 text-sm text-white outline-none" />
      </div>

      <input name="xProfilePic" placeholder="Profile Pic URL (Optional)" className="w-full bg-gray-800 border border-gray-700 rounded p-2 text-sm text-white outline-none" />

      {/* THE SLIDER */}
      <div className="pt-4 border-t border-gray-800">
        <div className="flex justify-between items-center mb-2">
          <label className="text-xs uppercase text-gray-500 font-bold tracking-wider">Est. Monthly Volume</label>
          <span className={`text-sm ${tier.color}`}>{tier.label}</span>
        </div>
        
        <input 
          type="range" 
          name="volume"
          min="0" 
          max="1500000" 
          step="10000" 
          value={volume}
          onChange={(e) => setVolume(Number(e.target.value))}
          className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
        />
        
        <div className="text-right text-white font-mono mt-1">
          ${volume.toLocaleString()}{volume >= 1500000 ? '+' : ''}
        </div>
      </div>

      <button type="submit" className="w-full bg-blue-600 hover:bg-blue-500 text-white font-medium py-2 rounded transition mt-2">
        + Add Trader
      </button>
    </form>
  )
}