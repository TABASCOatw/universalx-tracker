import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
  const team = [
    { name: "Ethan", img: "https://pbs.twimg.com/profile_images/1998464049839845376/sYkYmvEx_400x400.png" },
    { name: "Jethro", img: "https://pbs.twimg.com/profile_images/1969720943770845184/cAShaN-R_400x400.jpg" },
    { name: "Bryan", img: "https://pbs.twimg.com/profile_images/1725775641038192640/plttXlWt_400x400.jpg" },
    { name: "Alain", img: "https://pbs.twimg.com/profile_images/1906297173920067584/Fdmb48UJ_400x400.jpg" }
  ]
  
  // Clear existing to avoid conflicts during dev
  await prisma.trader.deleteMany({})
  await prisma.user.deleteMany({})

  for (const member of team) {
    await prisma.user.create({
      data: {
        username: member.name,
        profilePic: member.img
      },
    })
  }
  console.log("Team seeded with Dune assets.")
}

main()
  .then(async () => { await prisma.$disconnect() })
  .catch(async (e) => { console.error(e); await prisma.$disconnect(); process.exit(1) })