"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { addTrader } from "@/app/actions"
import { useRouter } from "next/navigation"

export default function NewTraderForm() {
  const router = useRouter()
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  
  // Form State
  const [name, setName] = useState("")
  const [address, setAddress] = useState("")
  const [xLink, setXLink] = useState("")
  const [tier, setTier] = useState("Tier 3") // Default to Tier 3
  
  // Optional fields state
  const [referralCode, setReferralCode] = useState("")
  const [region, setRegion] = useState("")
  const [tags, setTags] = useState("")
  const [notes, setNotes] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    const formDataObj = new FormData()
    formDataObj.append("name", name)
    formDataObj.append("uxAddress", address)
    formDataObj.append("xAccountLink", xLink)
    formDataObj.append("tier", tier)
    
    // Append optional fields
    formDataObj.append("referralCode", referralCode)
    formDataObj.append("region", region)
    formDataObj.append("tags", tags)
    formDataObj.append("notes", notes)

    try {
      // Since addTrader is a Server Action that redirects, 
      // successful execution will likely redirect before this block finishes.
      await addTrader(formDataObj)
      
      // If we are here, we can reset (though redirect usually happens first)
      setName("")
      setAddress("")
      setXLink("")
      router.refresh()
    } catch (err: any) {
      console.error(err)
      setError(err.message || "An error occurred adding the trader.")
    } finally {
      setLoading(false)
    }
  }

  const tiers = [
    {
      id: "Tier 1",
      label: "Tier 1",
      description: "Strong, high-volume",
      color: "border-emerald-500 bg-emerald-50 text-emerald-900"
    },
    {
      id: "Tier 2",
      label: "Tier 2",
      description: "Potentially high volume",
      color: "border-blue-500 bg-blue-50 text-blue-900"
    },
    {
      id: "Tier 3",
      label: "Tier 3",
      description: "Low volume expectations",
      color: "border-slate-500 bg-slate-50 text-slate-900"
    }
  ]

  return (
    <div className="w-full max-w-2xl mx-auto p-6 border rounded-xl bg-white shadow-sm">
      <h2 className="text-2xl font-bold mb-6 text-slate-800">Add New Trader</h2>
      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* Basic Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              placeholder="Trader Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="xLink">X / Twitter Link</Label>
            <Input
              id="xLink"
              placeholder="@username or https://x.com/..."
              value={xLink}
              onChange={(e) => setXLink(e.target.value)}
              required
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="address">Wallet Address</Label>
          <Input
            id="address"
            placeholder="0x... or Solana address"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            required
            className="font-mono"
          />
          <p className="text-xs text-slate-500">
            Solana addresses will be automatically resolved to their associated EVM address.
          </p>
        </div>

        {/* Tier Selection */}
        <div className="space-y-3">
          <Label>Trader Tier</Label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {tiers.map((t) => (
              <div
                key={t.id}
                onClick={() => setTier(t.id)}
                className={`
                  cursor-pointer p-4 rounded-lg border-2 transition-all duration-200
                  flex flex-col items-center justify-center text-center gap-1
                  ${tier === t.id ? t.color : "border-slate-200 hover:border-slate-300 bg-white"}
                `}
              >
                <div className="font-bold text-lg">{t.label}</div>
                <div className="text-[10px] uppercase tracking-wide opacity-80">{t.description}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Optional Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
          <div className="space-y-2">
            <Label htmlFor="referral">Referral Code (Optional)</Label>
            <Input
              id="referral"
              placeholder="REF123"
              value={referralCode}
              onChange={(e) => setReferralCode(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="region">Region (Optional)</Label>
            <Input
              id="region"
              placeholder="e.g. SEA, EU, NA"
              value={region}
              onChange={(e) => setRegion(e.target.value)}
            />
          </div>
        </div>

        <div className="space-y-2">
            <Label htmlFor="tags">Tags (Comma separated)</Label>
            <Input
              id="tags"
              placeholder="whale, kol, friend"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
            />
        </div>

        <div className="space-y-2">
            <Label htmlFor="notes">Initial Notes</Label>
            <Input
              id="notes"
              placeholder="Any context..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
        </div>

        {error && (
          <div className="text-sm text-red-600 bg-red-50 p-3 rounded-md border border-red-200">
            {error}
          </div>
        )}

        <Button type="submit" className="w-full h-11 text-base" disabled={loading}>
          {loading ? "Adding Trader..." : "Add Trader"}
        </Button>
      </form>
    </div>
  )
}