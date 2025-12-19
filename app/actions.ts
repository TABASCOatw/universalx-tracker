'use server'

import { db } from '@/lib/db'
import { UniversalXService } from '@/lib/universalx'
import { revalidatePath } from 'next/cache'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

// --- AUTHENTICATION ---
export async function login(userId: string) {
  const user = await db.user.findUnique({ where: { id: userId } })
  if (user) {
    const cookieStore = await cookies()
    cookieStore.set('userId', user.id)
    redirect('/dashboard')
  }
}

export async function logout() {
  const cookieStore = await cookies()
  cookieStore.delete('userId')
  redirect('/')
}

// --- ADD TRADER (INITIAL SYNC) ---
export async function addTrader(formData: FormData) {
  const cookieStore = await cookies()
  const userId = cookieStore.get('userId')?.value
  if (!userId) return

  const name = formData.get('name') as string
  const uxAddress = formData.get('uxAddress') as string
  let xLink = formData.get('xAccountLink') as string
  
  // 1. Handle X Handle Parsing
  let handle = ""
  try {
    if (xLink.includes('x.com') || xLink.includes('twitter.com')) {
      const urlObj = new URL(xLink.startsWith('http') ? xLink : `https://${xLink}`)
      handle = urlObj.pathname.replace(/^\//, '')
    } else {
      handle = xLink.replace('@', '')
    }
  } catch (e) {
    handle = name.replace(/\s+/g, '')
  }
  handle = handle.split('/')[0]
  const profilePicUrl = `https://unavatar.io/twitter/${handle}`

  // 2. FETCH REAL DATA FROM API
  const data = await UniversalXService.getTraderData(uxAddress)

  // 3. GET MANUAL ESTIMATE (Slider Input)
  const estimatedVolume = parseFloat(formData.get('volume') as string)
  
  // 4. CALCULATE TIER BASED ON ESTIMATE (Not Real Data)
  let tier = 'Tier 3'
  if (estimatedVolume >= 100000 && estimatedVolume < 1000000) tier = 'Tier 2'
  if (estimatedVolume >= 1000000) tier = 'Tier 1'

  await db.trader.create({
    data: {
      name: name,
      uxAddress: uxAddress,
      referralCode: (formData.get('referralCode') as string) || null,
      region: formData.get('region') as string,
      xAccountLink: xLink,
      xHandle: `@${handle}`,
      xProfilePic: profilePicUrl,
      
      // VOLUME SPLIT
      expectedVolume: estimatedVolume, // Manual (for Tier)
      realVolume: data.volume30d,      // Real (for Dashboard Stats)
      
      // HISTORY DATA (For Dashboard Aggregation)
      historyData: JSON.stringify(data.calendarData),

      lastActive: data.lastActive || new Date(),
      tier: tier, 
      addedById: userId,
      tags: formData.get('tags') as string,
      notes: (formData.get('notes') as string) || null
    }
  })

  revalidatePath('/dashboard')
  redirect('/dashboard')
}

// --- UPDATE NOTES ---
export async function updateTraderNotes(formData: FormData) {
  const traderId = formData.get('traderId') as string
  const notes = formData.get('notes') as string
  
  await db.trader.update({
    where: { id: traderId },
    data: { notes: notes }
  })
  
  revalidatePath(`/trader/${traderId}`)
}

// --- REFRESH DATA (SYNC ONLY) ---
export async function refreshTraderData(traderId: string, address: string) {
    const data = await UniversalXService.getTraderData(address);
    
    // ONLY UPDATE REAL STATS & HISTORY - DO NOT TOUCH TIER OR ESTIMATE
    await db.trader.update({
        where: { id: traderId },
        data: {
            realVolume: data.volume30d,
            lastActive: data.lastActive,
            historyData: JSON.stringify(data.calendarData)
        }
    });

    return data;
}

// --- DELETE TRADER ---
export async function deleteTrader(traderId: String) {
    const cookieStore = await cookies()
    const userId = cookieStore.get('userId')?.value
    if (!userId) return 
    
    const trader = await db.trader.findUnique({ where: { id: traderId as string }})
    if (trader && trader.addedById === userId) {
        await db.trader.delete({ where: { id: traderId as string }})
        revalidatePath('/dashboard')
    }
}

export async function addTraderTag(formData: FormData) {
    const traderId = formData.get('traderId') as string
    const newTag = formData.get('tag') as string
  
    const trader = await db.trader.findUnique({ where: { id: traderId } })
    if (!trader || !newTag) return
  
    const currentTags = trader.tags ? trader.tags.split(',') : []
    
    // Prevent duplicates
    if (!currentTags.includes(newTag)) {
        const updatedTags = [...currentTags, newTag].join(',')
        await db.trader.update({
            where: { id: traderId },
            data: { tags: updatedTags }
        })
        revalidatePath(`/trader/${traderId}`)
        revalidatePath('/dashboard')
    }
  }
  
  export async function removeTraderTag(formData: FormData) {
    const traderId = formData.get('traderId') as string
    const tagToRemove = formData.get('tag') as string
  
    const trader = await db.trader.findUnique({ where: { id: traderId } })
    if (!trader) return
  
    const currentTags = trader.tags ? trader.tags.split(',') : []
    const updatedTags = currentTags.filter(t => t !== tagToRemove).join(',')
  
    await db.trader.update({
        where: { id: traderId },
        data: { tags: updatedTags }
    })
    
    revalidatePath(`/trader/${traderId}`)
    revalidatePath('/dashboard')
  }