'use client'

import { useState } from 'react'
import { Clock, RefreshCw } from 'lucide-react'
import { refreshTraderData } from '../../actions'
import { formatDistanceToNow } from 'date-fns'

export function RecentTrades({ 
    traderId, 
    uxAddress, 
    initialTrades 
}: { 
    traderId: string, 
    uxAddress: string, 
    initialTrades: any[] 
}) {
    const [trades, setTrades] = useState(initialTrades)
    const [isRefreshing, setIsRefreshing] = useState(false)

    const handleRefresh = async () => {
        setIsRefreshing(true)
        const newData = await refreshTraderData(traderId, uxAddress)
        
        if (newData && newData.recentTrades) {
            setTrades(newData.recentTrades)
        }
        setIsRefreshing(false)
    }

    return (
        // REMOVED "mt-8" from here
        <div className="w-full">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                    <Clock className="text-[#78716c]" size={16} />
                    <h3 className="text-sm font-bold text-[#e7e5e4] uppercase tracking-widest">Live Activity Feed</h3>
                </div>
                
                <button 
                    onClick={handleRefresh} 
                    disabled={isRefreshing}
                    className="text-[#57534e] hover:text-amber-500 transition-colors disabled:opacity-50"
                    title="Refresh Feed"
                >
                    <RefreshCw size={14} className={isRefreshing ? "animate-spin text-amber-600" : ""} />
                </button>
            </div>

            <div className="bg-[#1c1917] border border-[#292524] rounded-sm overflow-hidden relative min-h-[100px]">
                
                {isRefreshing && (
                    <div className="absolute inset-0 bg-black/50 backdrop-blur-[1px] z-10 flex items-center justify-center">
                        <span className="text-[10px] uppercase font-bold text-amber-500 tracking-widest animate-pulse">Syncing...</span>
                    </div>
                )}

                {trades.length === 0 ? (
                    <div className="p-4 text-center text-[#57534e] text-xs uppercase tracking-widest">
                        No recent transactions found on UniversalX.
                    </div>
                ) : (
                    trades.map((t: any, i: number) => (
                        <div key={i} className="grid grid-cols-4 p-4 border-b border-[#292524] last:border-0 text-xs hover:bg-[#292524] transition-colors items-center group">
                            <div className="flex items-center gap-3">
                                {t.image ? (
                                    <img src={t.image} className="w-5 h-5 rounded-full border border-[#44403c]" alt="Token" />
                                ) : (
                                    <div className="w-5 h-5 rounded-full bg-[#292524] border border-[#44403c]"></div>
                                )}
                                <span className="font-bold text-[#e7e5e4] truncate group-hover:text-amber-500 transition-colors">{t.token}</span>
                            </div>
                            <span className={`uppercase font-bold tracking-wider ${t.type === 'Buy' ? 'text-emerald-500' : 'text-red-500'}`}>{t.type}</span>
                            <span className="text-[#a8a29e] font-mono">{t.size}</span>
                            <span className="text-[#57534e] text-right whitespace-nowrap">
                                {formatDistanceToNow(new Date(t.time), { addSuffix: true })}
                            </span>
                        </div>
                    ))
                )}
            </div>
        </div>
    )
}