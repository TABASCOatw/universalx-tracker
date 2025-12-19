import { db } from '@/lib/db'
import { login } from './actions'

export default async function LoginPage() {
  const users = await db.user.findMany()

  return (
    <main className="min-h-screen bg-[#0c0a09] flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Dune Background Effects */}
      <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-amber-900/10 via-[#0c0a09] to-[#0c0a09] z-0 pointer-events-none"></div>
      
      <div className="z-10 text-center space-y-12">
        <div className="space-y-4 flex flex-col items-center">
          {/* LOGO REPLACEMENT */}
          <img 
            src="https://i.imgur.com/lSTac0Y.png" 
            alt="UniversalX" 
            className="h-12 md:h-16 opacity-90"
          />
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {users.map((user) => (
            <form key={user.id} action={login.bind(null, user.id)}>
              <button className="group flex flex-col items-center gap-4 transition-all hover:-translate-y-2">
                <div className="relative">
                  <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-[#292524] group-hover:border-amber-600 transition-colors shadow-2xl">
                    <img src={user.profilePic} alt={user.username} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
                  </div>
                  {/* Glowing Ring Effect */}
                  <div className="absolute -inset-2 rounded-full border border-amber-600/0 group-hover:border-amber-600/30 transition-all scale-90 group-hover:scale-100 duration-500"></div>
                </div>
                <span className="text-[#a8a29e] group-hover:text-amber-500 font-medium tracking-wide uppercase text-sm transition-colors">
                  {user.username}
                </span>
              </button>
            </form>
          ))}
        </div>
      </div>
    </main>
  )
}