'use client'

import { useState } from 'react'
import { Plus, X } from 'lucide-react'
import { addTraderTag, removeTraderTag } from '../../actions'

export function TagManager({ traderId, initialTags }: { traderId: string, initialTags: string[] }) {
    const [isAdding, setIsAdding] = useState(false)
    const [inputVal, setInputVal] = useState('')

    const PREMADE_TAGS = ['Not trading', 'KOL', 'Active trader', 'Whale', 'Tester']

    const getTagStyle = (tag: string) => {
        const lowerTag = tag.toLowerCase()
        if (lowerTag === 'whale') return "bg-blue-900/20 text-blue-400 border-blue-900"
        if (lowerTag === 'kol') return "bg-purple-900/20 text-purple-400 border-purple-900"
        if (lowerTag === 'active trader') return "bg-emerald-900/20 text-emerald-400 border-emerald-900"
        if (lowerTag === 'not trading') return "bg-red-900/20 text-red-400 border-red-900"
        if (lowerTag === 'tester') return "bg-cyan-900/20 text-cyan-400 border-cyan-900"
        return "bg-[#292524] text-[#a8a29e] border-[#44403c]"
    }

    const handleAdd = async (tagToAdd?: string) => {
        const tag = tagToAdd || inputVal.trim()
        
        if (!tag) {
            setIsAdding(false)
            return
        }
        
        const formData = new FormData()
        formData.append('traderId', traderId)
        formData.append('tag', tag)
        
        await addTraderTag(formData)
        setInputVal('')
        setIsAdding(false)
    }

    const handleRemove = async (tag: string) => {
        const formData = new FormData()
        formData.append('traderId', traderId)
        formData.append('tag', tag)
        await removeTraderTag(formData)
    }

    return (
        <div className="flex flex-col gap-3 mb-6">
            
            {/* CURRENT TAGS */}
            <div className="flex flex-wrap gap-2 items-center justify-center lg:justify-start">
                {initialTags.map(tag => (
                    <div key={tag} className={`group relative px-2 py-1 text-[10px] uppercase font-bold border flex items-center gap-1 ${getTagStyle(tag)}`}>
                        {tag}
                        <button 
                            onClick={() => handleRemove(tag)}
                            className="opacity-0 group-hover:opacity-100 hover:text-white transition-opacity ml-1"
                        >
                            <X size={10} />
                        </button>
                    </div>
                ))}

                {/* PLUS BUTTON (If not adding) */}
                {!isAdding && (
                    <button 
                        onClick={() => setIsAdding(true)}
                        className="px-2 py-1 text-[10px] bg-[#1c1917] border border-[#292524] text-[#57534e] hover:border-amber-700 hover:text-amber-500 transition-colors"
                    >
                        <Plus size={10} />
                    </button>
                )}

                {initialTags.length === 0 && !isAdding && (
                    <span className="text-[10px] text-[#57534e] italic">No tags assigned</span>
                )}
            </div>

            {/* SELECTION MENU (Visible when adding) */}
            {isAdding && (
                <div className="bg-[#1c1917] border border-[#292524] p-3 flex flex-col gap-2 animate-in fade-in zoom-in duration-200">
                    <div className="flex justify-between items-center text-[10px] text-[#57534e] uppercase font-bold tracking-widest mb-1">
                        <span>Select Tag</span>
                        <button onClick={() => setIsAdding(false)}><X size={12} className="hover:text-[#e7e5e4]"/></button>
                    </div>
                    
                    {/* PREMADE OPTIONS */}
                    <div className="flex flex-wrap gap-2">
                        {PREMADE_TAGS.map(tag => {
                            const isSelected = initialTags.includes(tag)
                            if (isSelected) return null // Don't show if already added

                            return (
                                <button
                                    key={tag}
                                    onClick={() => handleAdd(tag)}
                                    className={`px-2 py-1 text-[10px] uppercase font-bold border hover:opacity-80 transition-opacity ${getTagStyle(tag)}`}
                                >
                                    {tag}
                                </button>
                            )
                        })}
                    </div>

                    {/* CUSTOM INPUT */}
                    <div className="flex items-center gap-2 mt-1 pt-2 border-t border-[#292524]">
                        <input 
                            autoFocus
                            type="text"
                            className="flex-1 bg-[#0c0a09] border border-[#292524] text-[#e7e5e4] text-[10px] uppercase font-bold px-2 py-1 outline-none focus:border-amber-700 placeholder:text-[#292524]"
                            placeholder="OR TYPE CUSTOM TAG..."
                            value={inputVal}
                            onChange={(e) => setInputVal(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
                        />
                        <button 
                            onClick={() => handleAdd()} 
                            className="bg-amber-900/20 border border-amber-900 text-amber-500 text-[10px] px-2 py-1 uppercase font-bold hover:bg-amber-900/40"
                        >
                            Add
                        </button>
                    </div>
                </div>
            )}
        </div>
    )
}