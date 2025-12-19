import { db } from '@/lib/db'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { logout } from '../actions'
import { RosterView } from './RosterView'

export default async function Dashboard() {
  const cookieStore = await cookies()
  const userId = cookieStore.get('userId')?.value
  if (!userId) redirect('/')

  const currentUser = await db.user.findUnique({ where: { id: userId } })
  
  const teamMembers = await db.user.findMany({
    include: {
      traders: { orderBy: { expectedVolume: 'desc' } }
    }
  })

  const allTraders = teamMembers.flatMap(m => m.traders)

  return (
    <main className="min-h-screen bg-[#0c0a09] text-[#e7e5e4] p-6 md:p-12 font-sans selection:bg-amber-900 selection:text-white">
      
      {/* HEADER */}
      <header className="max-w-7xl mx-auto flex justify-between items-center mb-16 border-b border-[#292524] pb-6">
        <div className="flex items-center gap-6">
           {/* Current User Badge */}
           <div className="w-12 h-12 rounded-full overflow-hidden border border-[#44403c]">
             <img src={currentUser?.profilePic} className="w-full h-full object-cover" />
           </div>
           
           <div className="flex flex-col justify-center">
             {/* LOGO SIZED UP SIGNIFICANTLY (h-20) */}
             <img 
               src="https://i.imgur.com/lSTac0Y.png" 
               alt="UniversalX" 
               className="h-12 mb-1 opacity-90 object-contain w-auto origin-left" 
             />
             <p className="text-[10px] text-[#78716c] uppercase tracking-widest pl-1">Logged in as {currentUser?.username}</p>
           </div>
        </div>
        
        <form action={logout}>
          <button className="text-[10px] uppercase font-bold text-[#57534e] hover:text-amber-600 transition-colors">Disconnect</button>
        </form>
      </header>

      {/* CLIENT COMPONENT FOR INTERACTIVITY */}
      <RosterView 
         currentUser={currentUser} 
         teamMembers={teamMembers} 
         allTraders={allTraders} 
      />
    </main>
  )
}