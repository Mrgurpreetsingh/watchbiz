import { PrismaClient, UserRole } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting database seed...')

  // 🧹 Clean database
  console.log('🧹 Cleaning existing data...')
  await prisma.review.deleteMany()
  await prisma.orderItem.deleteMany()
  await prisma.order.deleteMany()
  await prisma.address.deleteMany()
  await prisma.product.deleteMany()
  await prisma.brand.deleteMany()
  await prisma.category.deleteMany()
  await prisma.user.deleteMany()

  // 👥 Create users
  console.log('👥 Creating users...')
  const hashedPassword = await bcrypt.hash('password123', 10)

  const adminUser = await prisma.user.create({
    data: {
      email: 'admin@watchbiz.com',
      name: 'Admin WatchBiz',
      password: hashedPassword,
      role: UserRole.ADMIN,
      emailVerified: new Date(),
    },
  })

  const customerUser = await prisma.user.create({
    data: {
      email: 'client@example.com',
      name: 'John Doe',
      password: hashedPassword,
      role: UserRole.USER,
      emailVerified: new Date(),
    },
  })

  console.log(`✅ Users created: ${adminUser.email}, ${customerUser.email}`)

  // 🏷️ Create categories
  console.log('🏷️ Creating categories...')
  const categories = await Promise.all([
    prisma.category.create({
      data: {
        name: 'Montres Classiques',
        slug: 'classiques',
        description: 'Montres élégantes et intemporelles pour toutes occasions',
      },
    }),
    prisma.category.create({
      data: {
        name: 'Montres Sport',
        slug: 'sport',
        description: 'Montres robustes pour les activités sportives et outdoor',
      },
    }),
    prisma.category.create({
      data: {
        name: 'Montres de Luxe',
        slug: 'luxe',
        description: 'Montres haut de gamme et pièces de prestige',
      },
    }),
    prisma.category.create({
      data: {
        name: 'Montres de Plongée',
        slug: 'plongee',
        description: 'Montres étanches pour la plongée sous-marine',
      },
    }),
    prisma.category.create({
      data: {
        name: 'Montres Aviateur',
        slug: 'aviateur',
        description: 'Montres inspirées de l\'aviation et du pilotage',
      },
    }),
    prisma.category.create({
      data: {
        name: 'Montres Vintage',
        slug: 'vintage',
        description: 'Montres au style rétro et vintage',
      },
    }),
  ])

  console.log(`✅ Categories created: ${categories.length}`)

  // 🏢 Create brands
  console.log('🏢 Creating brands...')
  const brands = await Promise.all([
    // Marques de luxe
    prisma.brand.create({
      data: {
        name: 'Rolex',
        slug: 'rolex',
        logo: 'https://placehold.co/200x80/1a1a1a/white?text=ROLEX',
      },
    }),
    prisma.brand.create({
      data: {
        name: 'Omega',
        slug: 'omega',
        logo: 'https://placehold.co/200x80/8B0000/white?text=OMEGA',
      },
    }),
    prisma.brand.create({
      data: {
        name: 'TAG Heuer',
        slug: 'tag-heuer',
        logo: 'https://placehold.co/200x80/000000/white?text=TAG+HEUER',
      },
    }),
    // Marques milieu de gamme
    prisma.brand.create({
      data: {
        name: 'Seiko',
        slug: 'seiko',
        logo: 'https://placehold.co/200x80/003DA5/white?text=SEIKO',
      },
    }),
    prisma.brand.create({
      data: {
        name: 'Tissot',
        slug: 'tissot',
        logo: 'https://placehold.co/200x80/C8102E/white?text=TISSOT',
      },
    }),
    prisma.brand.create({
      data: {
        name: 'Hamilton',
        slug: 'hamilton',
        logo: 'https://placehold.co/200x80/1C1C1C/white?text=HAMILTON',
      },
    }),
    // Marques entrée de gamme
    prisma.brand.create({
      data: {
        name: 'Casio',
        slug: 'casio',
        logo: 'https://placehold.co/200x80/0066CC/white?text=CASIO',
      },
    }),
    prisma.brand.create({
      data: {
        name: 'Citizen',
        slug: 'citizen',
        logo: 'https://placehold.co/200x80/004B87/white?text=CITIZEN',
      },
    }),
  ])

  console.log(`✅ Brands created: ${brands.length}`)

  // 🎯 Helper functions
  const findCategory = (slug: string) => categories.find((c) => c.slug === slug)!
  const findBrand = (slug: string) => brands.find((b) => b.slug === slug)!

  // 📦 Create products
  console.log('📦 Creating products...')

  const products = [
    // 💎 GAMME LUXE (> 10000€)
    {
      name: 'Rolex Submariner Date',
      slug: 'rolex-submariner-date',
      description: 'Montre de plongée iconique avec lunette céramique Cerachrom et mouvement automatique. Étanche jusqu\'à 300m.',
      price: 12500.0,
      compareAtPrice: 13000.0,
      quantity: 3,
      images: [
        'https://images.unsplash.com/photo-1587836374615-dfe50e5c0cda?w=800&q=80',
        'https://images.unsplash.com/photo-1594534475308-8dc6a0b5a103?w=800&q=80',
      ],
      categoryId: findCategory('plongee').id,
      brandId: findBrand('rolex').id,
      isFeatured: true,
      specifications: {
        mouvement: 'Automatique',
        calibre: 'Rolex 3235',
        reserve: '70 heures',
        etancheite: '300m',
        materiau: 'Acier Oystersteel',
        diametre: '41mm',
        verre: 'Saphir',
      },
    },
    {
      name: 'Omega Seamaster Diver 300M',
      slug: 'omega-seamaster-diver-300m',
      description: 'Montre de plongée professionnelle avec cadran céramique et mouvement Co-Axial Master Chronometer.',
      price: 5800.0,
      quantity: 5,
      images: [
        'https://images.unsplash.com/photo-1614164185128-e4ec99c436d7?w=800&q=80',
        'https://images.unsplash.com/photo-1622434641406-a158123450f9?w=800&q=80',
      ],
      categoryId: findCategory('plongee').id,
      brandId: findBrand('omega').id,
      isFeatured: true,
      specifications: {
        mouvement: 'Automatique',
        calibre: 'Omega 8800',
        reserve: '55 heures',
        etancheite: '300m',
        materiau: 'Acier inoxydable',
        diametre: '42mm',
        verre: 'Saphir',
      },
    },

    // 💰 GAMME HAUT DE GAMME (2000€ - 10000€)
    {
      name: 'TAG Heuer Carrera Chronograph',
      slug: 'tag-heuer-carrera-chronograph',
      description: 'Chronographe automatique inspiré des courses automobiles avec mouvement manufacture.',
      price: 4200.0,
      compareAtPrice: 4500.0,
      quantity: 8,
      images: [
        'https://images.unsplash.com/photo-1611117775350-ac3950990985?w=800&q=80',
        'https://images.unsplash.com/photo-1606390488315-f3b7c5b1f785?w=800&q=80',
      ],
      categoryId: findCategory('sport').id,
      brandId: findBrand('tag-heuer').id,
      isFeatured: true,
      specifications: {
        mouvement: 'Automatique',
        calibre: 'Heuer 02',
        reserve: '80 heures',
        etancheite: '100m',
        materiau: 'Acier poli',
        diametre: '44mm',
        verre: 'Saphir',
      },
    },
    {
      name: 'Omega Speedmaster Professional',
      slug: 'omega-speedmaster-professional',
      description: 'La légendaire "Moonwatch", première montre portée sur la Lune. Chronographe manuel mythique.',
      price: 6500.0,
      quantity: 4,
      images: [
        'https://images.unsplash.com/photo-1547996160-81dfa63595aa?w=800&q=80',
        'https://images.unsplash.com/photo-1509941943102-10c232535736?w=800&q=80',
      ],
      categoryId: findCategory('luxe').id,
      brandId: findBrand('omega').id,
      isFeatured: true,
      specifications: {
        mouvement: 'Manuel',
        calibre: 'Omega 1861',
        reserve: '48 heures',
        etancheite: '50m',
        materiau: 'Acier',
        diametre: '42mm',
        verre: 'Hésalite',
      },
    },

    // 🎯 GAMME MILIEU DE GAMME (500€ - 2000€)
    {
      name: 'Seiko Prospex Diver',
      slug: 'seiko-prospex-diver',
      description: 'Montre de plongée automatique avec calibre 6R15 et lunette unidirectionnelle.',
      price: 850.0,
      quantity: 15,
      images: [
        'https://images.unsplash.com/photo-1542496658-e33a6d0d50f6?w=800&q=80',
        'https://images.unsplash.com/photo-1533139502658-0198f920d8e8?w=800&q=80',
      ],
      categoryId: findCategory('plongee').id,
      brandId: findBrand('seiko').id,
      isFeatured: false,
      specifications: {
        mouvement: 'Automatique',
        calibre: 'Seiko 6R15',
        reserve: '50 heures',
        etancheite: '200m',
        materiau: 'Acier inoxydable',
        diametre: '43.8mm',
        verre: 'Hardlex',
      },
    },
    {
      name: 'Tissot PRX Powermatic 80',
      slug: 'tissot-prx-powermatic-80',
      description: 'Montre classique automatique au design rétro des années 70 avec mouvement 80 heures.',
      price: 720.0,
      quantity: 20,
      images: [
        'https://images.unsplash.com/photo-1523170335258-f5ed11844a49?w=800&q=80',
        'https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=800&q=80',
      ],
      categoryId: findCategory('classiques').id,
      brandId: findBrand('tissot').id,
      isFeatured: false,
      specifications: {
        mouvement: 'Automatique',
        calibre: 'Powermatic 80',
        reserve: '80 heures',
        etancheite: '100m',
        materiau: 'Acier',
        diametre: '40mm',
        verre: 'Saphir',
      },
    },
    {
      name: 'Hamilton Khaki Field Automatic',
      slug: 'hamilton-khaki-field-automatic',
      description: 'Montre militaire automatique robuste avec mouvement H-10 et style aviateur.',
      price: 595.0,
      quantity: 12,
      images: [
        'https://images.unsplash.com/photo-1509048191080-d2984bad6ae5?w=800&q=80',
        'https://images.unsplash.com/photo-1495704907664-81f74a7efd9b?w=800&q=80',
      ],
      categoryId: findCategory('aviateur').id,
      brandId: findBrand('hamilton').id,
      isFeatured: false,
      specifications: {
        mouvement: 'Automatique',
        calibre: 'H-10',
        reserve: '80 heures',
        etancheite: '100m',
        materiau: 'Acier brossé',
        diametre: '42mm',
        verre: 'Saphir',
      },
    },
    {
      name: 'Seiko 5 Sports',
      slug: 'seiko-5-sports',
      description: 'Montre sport automatique accessible avec jour-date et boîtier robuste.',
      price: 320.0,
      quantity: 25,
      images: [
        'https://images.unsplash.com/photo-1533139359211-14b3a4ba7bb1?w=800&q=80',
        'https://images.unsplash.com/photo-1524805444758-089113d48a6d?w=800&q=80',
      ],
      categoryId: findCategory('sport').id,
      brandId: findBrand('seiko').id,
      isFeatured: false,
      specifications: {
        mouvement: 'Automatique',
        calibre: '4R36',
        reserve: '41 heures',
        etancheite: '100m',
        materiau: 'Acier',
        diametre: '42.5mm',
        verre: 'Hardlex',
      },
    },
    {
      name: 'Tissot Gentleman Powermatic 80 Silicium',
      slug: 'tissot-gentleman-powermatic-80',
      description: 'Montre élégante automatique avec spiral en silicium et finitions impeccables.',
      price: 795.0,
      quantity: 10,
      images: [
        'https://images.unsplash.com/photo-1587836374615-dfe50e5c0cda?w=800&q=80',
        'https://images.unsplash.com/photo-1594534475308-8dc6a0b5a103?w=800&q=80',
      ],
      categoryId: findCategory('classiques').id,
      brandId: findBrand('tissot').id,
      isFeatured: false,
      specifications: {
        mouvement: 'Automatique',
        calibre: 'Powermatic 80 Silicium',
        reserve: '80 heures',
        etancheite: '50m',
        materiau: 'Acier poli',
        diametre: '40mm',
        verre: 'Saphir',
      },
    },

    // 💸 GAMME ENTRÉE DE GAMME (< 500€)
    {
      name: 'Casio G-Shock GA-2100',
      slug: 'casio-g-shock-ga-2100',
      description: 'La célèbre "CasiOak" ultra-robuste avec design octogonal et protection anti-chocs.',
      price: 129.0,
      quantity: 50,
      images: [
        'https://images.unsplash.com/photo-1542496658-e33a6d0d50f6?w=800&q=80',
        'https://images.unsplash.com/photo-1533139502658-0198f920d8e8?w=800&q=80',
      ],
      categoryId: findCategory('sport').id,
      brandId: findBrand('casio').id,
      isFeatured: false,
      specifications: {
        mouvement: 'Quartz',
        type: 'Analogique-Digital',
        etancheite: '200m',
        materiau: 'Résine',
        diametre: '45.4mm',
        fonctions: 'Chronomètre, alarme, éclairage LED',
      },
    },
    {
      name: 'Citizen Eco-Drive Diver',
      slug: 'citizen-eco-drive-diver',
      description: 'Montre solaire Eco-Drive ne nécessitant jamais de changement de pile.',
      price: 299.0,
      quantity: 30,
      images: [
        'https://images.unsplash.com/photo-1523170335258-f5ed11844a49?w=800&q=80',
        'https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=800&q=80',
      ],
      categoryId: findCategory('plongee').id,
      brandId: findBrand('citizen').id,
      isFeatured: false,
      specifications: {
        mouvement: 'Eco-Drive (solaire)',
        reserve: '6 mois',
        etancheite: '200m',
        materiau: 'Acier inoxydable',
        diametre: '44mm',
        verre: 'Minéral',
      },
    },
    {
      name: 'Casio Edifice Chronograph',
      slug: 'casio-edifice-chronograph',
      description: 'Chronographe sport élégant avec design inspiré de la course automobile.',
      price: 179.0,
      quantity: 40,
      images: [
        'https://images.unsplash.com/photo-1509048191080-d2984bad6ae5?w=800&q=80',
        'https://images.unsplash.com/photo-1495704907664-81f74a7efd9b?w=800&q=80',
      ],
      categoryId: findCategory('sport').id,
      brandId: findBrand('casio').id,
      isFeatured: false,
      specifications: {
        mouvement: 'Quartz',
        type: 'Chronographe',
        etancheite: '100m',
        materiau: 'Acier inoxydable',
        diametre: '43.4mm',
        fonctions: 'Chronomètre 1/10s, tachymètre',
      },
    },
    {
      name: 'Seiko Solar Chronograph',
      slug: 'seiko-solar-chronograph',
      description: 'Chronographe solaire abordable avec réserve de marche de 6 mois.',
      price: 265.0,
      quantity: 18,
      images: [
        'https://images.unsplash.com/photo-1547996160-81dfa63595aa?w=800&q=80',
        'https://images.unsplash.com/photo-1509941943102-10c232535736?w=800&q=80',
      ],
      categoryId: findCategory('sport').id,
      brandId: findBrand('seiko').id,
      isFeatured: false,
      specifications: {
        mouvement: 'Solar (quartz)',
        reserve: '6 mois',
        etancheite: '100m',
        materiau: 'Acier',
        diametre: '43mm',
        verre: 'Hardlex',
      },
    },
    {
      name: 'Citizen Promaster Diver',
      slug: 'citizen-promaster-diver',
      description: 'Montre de plongée ISO certifiée avec Eco-Drive et lunette unidirectionnelle.',
      price: 385.0,
      quantity: 22,
      images: [
        'https://images.unsplash.com/photo-1614164185128-e4ec99c436d7?w=800&q=80',
        'https://images.unsplash.com/photo-1622434641406-a158123450f9?w=800&q=80',
      ],
      categoryId: findCategory('plongee').id,
      brandId: findBrand('citizen').id,
      isFeatured: false,
      specifications: {
        mouvement: 'Eco-Drive',
        reserve: '6 mois',
        etancheite: '200m',
        materiau: 'Acier',
        diametre: '44mm',
        verre: 'Minéral',
      },
    },
    {
      name: 'Hamilton Khaki Field Quartz',
      slug: 'hamilton-khaki-field-quartz',
      description: 'Version quartz abordable de la célèbre Khaki Field avec style militaire.',
      price: 395.0,
      quantity: 16,
      images: [
        'https://images.unsplash.com/photo-1611117775350-ac3950990985?w=800&q=80',
        'https://images.unsplash.com/photo-1606390488315-f3b7c5b1f785?w=800&q=80',
      ],
      categoryId: findCategory('aviateur').id,
      brandId: findBrand('hamilton').id,
      isFeatured: false,
      specifications: {
        mouvement: 'Quartz',
        etancheite: '100m',
        materiau: 'Acier',
        diametre: '38mm',
        verre: 'Saphir',
      },
    },

    // 🕰️ GAMME VINTAGE
    {
      name: 'Seiko 5 Sports Vintage',
      slug: 'seiko-5-sports-vintage',
      description: 'Réédition moderne d\'un classique Seiko 5 avec design rétro des années 60.',
      price: 340.0,
      quantity: 14,
      images: [
        'https://images.unsplash.com/photo-1533139359211-14b3a4ba7bb1?w=800&q=80',
        'https://images.unsplash.com/photo-1524805444758-089113d48a6d?w=800&q=80',
      ],
      categoryId: findCategory('vintage').id,
      brandId: findBrand('seiko').id,
      isFeatured: false,
      specifications: {
        mouvement: 'Automatique',
        calibre: '4R36',
        reserve: '41 heures',
        etancheite: '100m',
        materiau: 'Acier',
        diametre: '39.5mm',
        verre: 'Hardlex',
      },
    },
    {
      name: 'Hamilton Intra-Matic Auto Chrono',
      slug: 'hamilton-intra-matic-auto-chrono',
      description: 'Chronographe automatique au design vintage inspiré des années 60.',
      price: 2195.0,
      quantity: 6,
      images: [
        'https://images.unsplash.com/photo-1542496658-e33a6d0d50f6?w=800&q=80',
        'https://images.unsplash.com/photo-1533139502658-0198f920d8e8?w=800&q=80',
      ],
      categoryId: findCategory('vintage').id,
      brandId: findBrand('hamilton').id,
      isFeatured: false,
      specifications: {
        mouvement: 'Automatique',
        calibre: 'H-31',
        reserve: '60 heures',
        etancheite: '50m',
        materiau: 'Acier',
        diametre: '40mm',
        verre: 'Saphir',
      },
    },
    {
      name: 'TAG Heuer Autavia Heritage',
      slug: 'tag-heuer-autavia-heritage',
      description: 'Réédition moderne de l\'iconique Autavia avec mouvement manufacture.',
      price: 4950.0,
      quantity: 4,
      images: [
        'https://images.unsplash.com/photo-1523170335258-f5ed11844a49?w=800&q=80',
        'https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=800&q=80',
      ],
      categoryId: findCategory('vintage').id,
      brandId: findBrand('tag-heuer').id,
      isFeatured: true,
      specifications: {
        mouvement: 'Automatique',
        calibre: 'Heuer 02',
        reserve: '80 heures',
        etancheite: '100m',
        materiau: 'Acier brossé',
        diametre: '42mm',
        verre: 'Saphir',
      },
    },
  ]

  const createdProducts = []
  for (const product of products) {
    const created = await prisma.product.create({
      data: product,
    })
    createdProducts.push(created)
  }

  console.log(`✅ Products created: ${createdProducts.length}`)

  // ⭐ Create reviews
  console.log('⭐ Creating reviews...')
  const reviews = [
    {
      productId: createdProducts[0].id, // Rolex Submariner
      userId: customerUser.id,
      rating: 5,
      title: 'Une montre exceptionnelle',
      comment:
        'La qualité Rolex est au rendez-vous. Le mouvement est d\'une précision remarquable et le bracelet très confortable.',
    },
    {
      productId: createdProducts[1].id, // Omega Seamaster
      userId: customerUser.id,
      rating: 5,
      title: 'Magnifique plongeuse',
      comment:
        'Design superbe, finitions impeccables. Le mouvement Co-Axial est un vrai plus.',
    },
    {
      productId: createdProducts[4].id, // Seiko Prospex
      userId: customerUser.id,
      rating: 4,
      title: 'Excellent rapport qualité-prix',
      comment:
        'Pour le prix, c\'est vraiment une très bonne montre automatique. Le calibre 6R15 fonctionne parfaitement.',
    },
  ]

  for (const review of reviews) {
    await prisma.review.create({
      data: review,
    })
  }

  console.log(`✅ Reviews created: ${reviews.length}`)

  console.log('\n✨ Seed completed successfully!')
  console.log(`\n📊 Summary:`)
  console.log(`   - Users: 2 (1 admin, 1 customer)`)
  console.log(`   - Categories: ${categories.length}`)
  console.log(`   - Brands: ${brands.length}`)
  console.log(`   - Products: ${createdProducts.length}`)
  console.log(`   - Reviews: ${reviews.length}`)
  console.log(`\n🔐 Test credentials:`)
  console.log(`   Admin: admin@watchbiz.com / password123`)
  console.log(`   Customer: client@example.com / password123`)
}

main()
  .catch((e) => {
    console.error('❌ Error during seed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
