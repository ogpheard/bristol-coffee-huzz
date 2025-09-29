import { PrismaClient } from '@prisma/client'
import * as fs from 'fs'
import * as path from 'path'

const prisma = new PrismaClient()

async function main() {
  // Path to your cafe data JSON file
  const dataPath = path.join(
    __dirname,
    '../../bristol_coffee_tea_filtered.json'
  )

  console.log('Reading café data from:', dataPath)

  if (!fs.existsSync(dataPath)) {
    console.error('Error: Café data file not found at', dataPath)
    console.log('Please ensure bristol_coffee_tea_filtered.json exists in the Bristol Brew folder')
    process.exit(1)
  }

  const rawData = fs.readFileSync(dataPath, 'utf-8')
  const cafes = JSON.parse(rawData)

  console.log(`Found ${cafes.length} cafés to import`)

  let imported = 0
  let skipped = 0

  for (const cafe of cafes) {
    try {
      // The JSON structure uses 'title' for name and 'location.lat/lng' for coordinates
      const cafeName = cafe.title || cafe.name || 'Unknown'

      // Check if cafe already exists by name
      const existing = await prisma.cafe.findFirst({
        where: { name: cafeName },
      })

      if (existing) {
        skipped++
        continue
      }

      await prisma.cafe.create({
        data: {
          name: cafeName,
          area: cafe.neighborhood || cafe.area || null,
          neighbourhood: cafe.neighborhood || cafe.neighbourhood || null,
          postcode: cafe.postalCode || cafe.postcode || null,
          latitude: cafe.location?.lat || cafe.latitude || null,
          longitude: cafe.location?.lng || cafe.longitude || null,
          website: cafe.website || null,
          source: 'master',
        },
      })

      imported++

      if (imported % 50 === 0) {
        console.log(`Imported ${imported} cafés...`)
      }
    } catch (error) {
      console.error(`Error importing cafe "${cafe.title || cafe.name}":`, error)
    }
  }

  console.log(`\n✅ Import complete!`)
  console.log(`   Imported: ${imported}`)
  console.log(`   Skipped: ${skipped}`)
  console.log(`   Total: ${cafes.length}`)
}

main()
  .catch((error) => {
    console.error('Fatal error:', error)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })