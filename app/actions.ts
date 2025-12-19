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

  // 3. GET TIER (Manual Input)
  const tier = formData.get('tier') as string || 'Tier 3'

  // 4. EXTRACT DEAL DATA
  const hasDeal = formData.get('hasDeal') === 'on';
  let dealData = {};
  if (hasDeal) {
      dealData = {
          create: {
              retainerAmount: formData.get('retainer') ? parseFloat(formData.get('retainer') as string) : null,
              cashbackPercent: formData.get('cashback') ? parseFloat(formData.get('cashback') as string) : null,
              commTier1: formData.get('commTier1') ? parseFloat(formData.get('commTier1') as string) : null,
              commTier2: formData.get('commTier2') ? parseFloat(formData.get('commTier2') as string) : null,
              commTier3: formData.get('commTier3') ? parseFloat(formData.get('commTier3') as string) : null,
              commTier4: formData.get('commTier4') ? parseFloat(formData.get('commTier4') as string) : null,
              commTier5: formData.get('commTier5') ? parseFloat(formData.get('commTier5') as string) : null,
          }
      }
  }

  await db.trader.create({
    data: {
      name: name,
      uxAddress: uxAddress,
      referralCode: (formData.get('referralCode') as string) || null,
      region: formData.get('region') as string,
      xAccountLink: xLink,
      xHandle: `@${handle}`,
      xProfilePic: profilePicUrl,
      
      expectedVolume: 0, // No longer used, set to 0 to satisfy schema
      realVolume: data.volume30d,      
      
      historyData: JSON.stringify(data.calendarData),
      referralVolume30d: data.referralStats.volume30d,
      referralHistory: JSON.stringify(data.referralStats.history),

      lastActive: data.lastActive || new Date(),
      tier: tier, 
      addedById: userId,
      tags: formData.get('tags') as string,
      notes: (formData.get('notes') as string) || null,
      
      // CONNECT DEAL
      deal: hasDeal ? dealData : undefined
    }
  })

  revalidatePath('/dashboard')
  redirect('/dashboard')
}

// --- UPDATE DEAL ---
export async function updateTraderDeal(formData: FormData) {
    const traderId = formData.get('traderId') as string;
    
    const retainer = formData.get('retainer') ? parseFloat(formData.get('retainer') as string) : null;
    const cashback = formData.get('cashback') ? parseFloat(formData.get('cashback') as string) : null;
    
    // Commission
    const commTier1 = formData.get('commTier1') ? parseFloat(formData.get('commTier1') as string) : null;
    const commTier2 = formData.get('commTier2') ? parseFloat(formData.get('commTier2') as string) : null;
    const commTier3 = formData.get('commTier3') ? parseFloat(formData.get('commTier3') as string) : null;
    const commTier4 = formData.get('commTier4') ? parseFloat(formData.get('commTier4') as string) : null;
    const commTier5 = formData.get('commTier5') ? parseFloat(formData.get('commTier5') as string) : null;

    const dataPayload = {
        retainerAmount: retainer,
        cashbackPercent: cashback,
        commTier1, commTier2, commTier3, commTier4, commTier5
    };

    await db.deal.upsert({
        where: { traderId: traderId },
        update: dataPayload,
        create: {
            traderId: traderId,
            ...dataPayload
        }
    });

    revalidatePath(`/trader/${traderId}`);
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
    
    await db.trader.update({
        where: { id: traderId },
        data: {
            realVolume: data.volume30d,
            lastActive: data.lastActive,
            historyData: JSON.stringify(data.calendarData),
            referralVolume30d: data.referralStats.volume30d,
            referralHistory: JSON.stringify(data.referralStats.history),
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