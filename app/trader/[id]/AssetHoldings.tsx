'use client' // <--- Added this directive

import { Wallet } from 'lucide-react'
import { Asset } from '@/lib/universalx'

export function AssetHoldings({ assets }: { assets: Asset[] }) {
  if (!assets || assets.length === 0) return null;

  return (
    <div className="bg-[#1c1917] border border-[#292524] p-4">
      <div className="flex items-center gap-2 mb-4 border-b border-[#292524] pb-2">
         <Wallet className="text-amber-600" size={14} />
         <h3 className="text-xs font-bold text-[#e7e5e4] uppercase tracking-widest">Top Holdings (&gt;$20)</h3>
      </div>
      
      <div className="space-y-2">
         {assets.map((asset, i) => (
             <div key={i} className="flex items-center justify-between bg-[#0c0a09] border border-[#292524] p-2 hover:border-[#44403c] transition group">
                <div className="flex items-center gap-3">
                    <div className="relative">
                        <img 
                            src={asset.logo || "https://upload.wikimedia.org/wikipedia/commons/a/ac/No_image_available.svg"} 
                            alt={asset.symbol}
                            className="w-8 h-8 rounded-full bg-[#292524] object-cover"
                            onError={(e) => { e.currentTarget.src = "https://upload.wikimedia.org/wikipedia/commons/a/ac/No_image_available.svg" }} 
                        />
                        <div className={`absolute -bottom-1 -right-1 text-[8px] font-bold px-1 rounded border border-[#0c0a09] 
                            ${asset.chain === 'ETH' ? 'bg-indigo-900 text-indigo-200' : ''}
                            ${asset.chain === 'SOL' ? 'bg-purple-900 text-purple-200' : ''}
                            ${asset.chain === 'BASE' ? 'bg-blue-900 text-blue-200' : ''}
                            ${asset.chain === 'BNB' ? 'bg-yellow-900 text-yellow-200' : ''}
                        `}>
                            {asset.chain}
                        </div>
                    </div>
                    <div>
                        <div className="text-xs font-bold text-[#e7e5e4]">{asset.symbol}</div>
                        <div className="text-[10px] text-[#78716c] font-mono">{asset.balance}</div>
                    </div>
                </div>
                <div className="text-right">
                    <div className="text-xs font-mono text-[#e7e5e4] group-hover:text-amber-500 transition-colors">
                        ${asset.value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </div>
                </div>
             </div>
         ))}
      </div>
    </div>
  )
}