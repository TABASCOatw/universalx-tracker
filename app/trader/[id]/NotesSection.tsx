'use client'

import { useState } from 'react'
import { updateTraderNotes } from '../../actions'

export function NotesSection({ traderId, initialNotes }: { traderId: string, initialNotes: string | null }) {
    const [isEditing, setIsEditing] = useState(false)
    const [notes, setNotes] = useState(initialNotes || "")

    return (
        <div className="bg-[#1c1917] border border-[#292524] p-6 h-full flex flex-col">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-sm font-bold text-[#e7e5e4] uppercase tracking-widest">Notes</h3>
                <button 
                    onClick={() => setIsEditing(!isEditing)} 
                    className="text-[10px] text-amber-600 hover:text-amber-500 uppercase font-bold tracking-widest"
                >
                    {isEditing ? 'Cancel' : 'Edit Notes'}
                </button>
            </div>

            {isEditing ? (
                <form action={async (formData) => {
                    await updateTraderNotes(formData)
                    setIsEditing(false)
                }} className="flex-1 flex flex-col gap-2">
                    <input type="hidden" name="traderId" value={traderId} />
                    <textarea 
                        name="notes" 
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        className="w-full flex-1 bg-[#0c0a09] border border-[#292524] p-4 text-[#a8a29e] text-sm focus:border-amber-700 outline-none resize-none"
                    />
                    <button type="submit" className="bg-[#292524] hover:bg-amber-900 text-[#e7e5e4] py-2 text-xs uppercase font-bold tracking-widest">
                        Save Updates
                    </button>
                </form>
            ) : (
                <div className="flex-1 bg-[#0c0a09] border border-[#292524] p-4 text-[#a8a29e] text-sm whitespace-pre-wrap">
                    {notes || <span className="italic text-[#292524]">No notes recorded.</span>}
                </div>
            )}
        </div>
    )
}