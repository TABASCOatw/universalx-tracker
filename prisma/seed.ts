import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
  const team = [
    { name: "Ethan", img: "https://pbs.twimg.com/profile_images/1998464049839845376/sYkYmvEx_400x400.png" },
    { name: "Jethro", img: "https://pbs.twimg.com/profile_images/1969720943770845184/cAShaN-R_400x400.jpg" },
    { name: "Bryan", img: "https://pbs.twimg.com/profile_images/1725775641038192640/plttXlWt_400x400.jpg" },
    { name: "Alain", img: "https://pbs.twimg.com/profile_images/1906297173920067584/Fdmb48UJ_400x400.jpg" },
    { name: "Warren & Peter", img: "https://pbs.twimg.com/profile_images/1924064393119113216/DbIg-lIi_400x400.jpg,https://pbs.twimg.com/profile_images/1882325753381134336/Uaoze3-U_400x400.jpg" }
  ]
  
  // REMOVED: Data wiping lines
  // await prisma.trader.deleteMany({})
  // await prisma.user.deleteMany({})

  console.log("Syncing team members...")

  for (const member of team) {
    // CHANGED: Use upsert to safe-guard existing data
    await prisma.user.upsert({
      where: { username: member.name },
      update: {
        profilePic: member.img // Updates image if it changed
      },
      create: {
        username: member.name,
        profilePic: member.img
      },
    })
  }
  console.log("Team synced. Existing data preserved.")
}

main()
  .then(async () => { await prisma.$disconnect() })
  .catch(async (e) => { console.error(e); await prisma.$disconnect(); process.exit(1) })