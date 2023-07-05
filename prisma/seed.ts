import { db } from "../src/Utils/db"

async function main() {
  await db.file.create({
    data: { 
      id: '21dee9ec-0e79-4dc0-9577-5052343f63fe',
      path: 'images/avatar.jpg'
    }
  })
}

main()
  .then( async () => {
    await db.$disconnect
  })
  .catch(async (e) => {
    console.error(e)
    await db.$disconnect()
    process.exit(1)
  })