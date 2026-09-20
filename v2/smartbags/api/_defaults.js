/* SmartBags — default store content.
   Used to seed Vercel KV the first time the store is read (before any
   admin save has happened yet). */

const DEFAULT_DATA = {
  site: {
    shopName: 'SmartBags',
    tagline: 'Modern. Quality. DZ.',
    phone: '+213 555 12 34 56',
    greeting: 'Thank you for shopping with us',
    logo: 'images/logo.jpg',
    banner: 'images/header-banner.png',
    heroHeadline: 'Elevate your everyday.',
    heroSubline: 'Experience luxury smart gear, designed for the way you move.'
  },

  features: [
    { icon: '✓', label: 'Premium quality, built to last' },
    { icon: '🚚', label: 'Fast delivery across the country' },
    { icon: '💵', label: 'Cash on delivery' },
    { icon: '🛡', label: 'Check your item before paying' }
  ],

  products: [
    {
      id: 'aria',
      name: 'Aria Backpack',
      price: 12990,
      oldPrice: 15990,
      images: ['images/products/aria-1.svg', 'images/products/aria-2.svg'],
      short: 'Full-grain leather-touch backpack with a padded 15" laptop sleeve.',
      description: 'The Aria Backpack pairs a quiet, tailored silhouette with everyday durability. A padded 15" laptop sleeve, a magnetic-lock front pocket and reinforced straps make it equally at home in a morning commute or a weekend trip. Water-resistant exterior, brushed gold hardware, lifetime stitching.',
      colors: [
        { name: 'Midnight Navy', hex: '#16304f' },
        { name: 'Onyx Black', hex: '#15171c' },
        { name: 'Sable Tan', hex: '#a9855f' }
      ]
    },
    {
      id: 'nova',
      name: 'Nova Crossbody Pouch',
      price: 6990,
      oldPrice: null,
      images: ['images/products/nova-1.svg', 'images/products/nova-2.svg'],
      short: 'Compact crossbody pouch for cards, keys and a phone.',
      description: 'Nova is the pouch you reach for when you want to move light. Soft-structured, with a smooth adjustable strap and a quilted interior that keeps your cards, keys and phone from rattling around. Available in our signature navy.',
      colors: [
        { name: 'Midnight Navy', hex: '#16304f' },
        { name: 'Gold Sand', hex: '#cf9d4f' }
      ]
    },
    {
      id: 'elite',
      name: 'Elite Tech Backpack',
      price: 14990,
      oldPrice: 17990,
      images: ['images/products/elite-1.svg', 'images/products/elite-2.svg'],
      short: 'Our most structured backpack, built for tech-heavy days.',
      description: 'The Elite Tech Backpack is built for people who carry a lot and still want it organised: a dedicated cable pocket, a padded compartment for a laptop and a tablet, and a hidden back pocket for travel documents. Structured base so it stands on its own.',
      colors: [
        { name: 'Onyx Black', hex: '#15171c' },
        { name: 'Midnight Navy', hex: '#16304f' }
      ]
    },
    {
      id: 'halo',
      name: 'Halo Earbuds Case',
      price: 4990,
      oldPrice: 5990,
      images: ['images/products/halo-1.svg', 'images/products/halo-2.svg'],
      short: 'Protective case for your earbuds, finished in brushed gold.',
      description: 'Halo wraps your earbuds case in a soft-touch shell with a brushed gold clip, so it stays scratch-free on the outside of any bag. Trimmed with the same hardware as the rest of the SmartBags collection.',
      colors: [
        { name: 'Midnight Navy', hex: '#16304f' },
        { name: 'Sable Tan', hex: '#a9855f' }
      ]
    }
  ],

  provinces: [
    { name: 'Adrar', deskFee: 900, domicileFee: 1100 },
    { name: 'Chlef', deskFee: 450, domicileFee: 650 },
    { name: 'Laghouat', deskFee: 650, domicileFee: 850 },
    { name: 'Oum El Bouaghi', deskFee: 500, domicileFee: 700 },
    { name: 'Batna', deskFee: 500, domicileFee: 700 },
    { name: 'Béjaïa', deskFee: 450, domicileFee: 650 },
    { name: 'Biskra', deskFee: 600, domicileFee: 800 },
    { name: 'Béchar', deskFee: 850, domicileFee: 1050 },
    { name: 'Blida', deskFee: 300, domicileFee: 500 },
    { name: 'Bouira', deskFee: 350, domicileFee: 550 },
    { name: 'Tamanrasset', deskFee: 1100, domicileFee: 1300 },
    { name: 'Tébessa', deskFee: 550, domicileFee: 750 },
    { name: 'Tlemcen', deskFee: 500, domicileFee: 700 },
    { name: 'Tiaret', deskFee: 450, domicileFee: 650 },
    { name: 'Tizi Ouzou', deskFee: 400, domicileFee: 600 },
    { name: 'Alger', deskFee: 250, domicileFee: 450 },
    { name: 'Djelfa', deskFee: 550, domicileFee: 750 },
    { name: 'Jijel', deskFee: 450, domicileFee: 650 },
    { name: 'Sétif', deskFee: 450, domicileFee: 650 },
    { name: 'Saïda', deskFee: 500, domicileFee: 700 },
    { name: 'Skikda', deskFee: 480, domicileFee: 680 },
    { name: 'Sidi Bel Abbès', deskFee: 480, domicileFee: 680 },
    { name: 'Annaba', deskFee: 500, domicileFee: 700 },
    { name: 'Guelma', deskFee: 480, domicileFee: 680 },
    { name: 'Constantine', deskFee: 450, domicileFee: 650 },
    { name: 'Médéa', deskFee: 350, domicileFee: 550 },
    { name: 'Mostaganem', deskFee: 450, domicileFee: 650 },
    { name: "M'Sila", deskFee: 450, domicileFee: 650 },
    { name: 'Mascara', deskFee: 470, domicileFee: 670 },
    { name: 'Ouargla', deskFee: 700, domicileFee: 900 },
    { name: 'Oran', deskFee: 450, domicileFee: 650 },
    { name: 'El Bayadh', deskFee: 650, domicileFee: 850 },
    { name: 'Illizi', deskFee: 1100, domicileFee: 1300 },
    { name: 'Bordj Bou Arréridj', deskFee: 420, domicileFee: 620 },
    { name: 'Boumerdès', deskFee: 320, domicileFee: 520 },
    { name: 'El Tarf', deskFee: 520, domicileFee: 720 },
    { name: 'Tindouf', deskFee: 1200, domicileFee: 1400 },
    { name: 'Tissemsilt', deskFee: 430, domicileFee: 630 },
    { name: 'El Oued', deskFee: 650, domicileFee: 850 },
    { name: 'Khenchela', deskFee: 520, domicileFee: 720 },
    { name: 'Souk Ahras', deskFee: 500, domicileFee: 700 },
    { name: 'Tipaza', deskFee: 320, domicileFee: 520 },
    { name: 'Mila', deskFee: 460, domicileFee: 660 },
    { name: 'Aïn Defla', deskFee: 380, domicileFee: 580 },
    { name: 'Naâma', deskFee: 700, domicileFee: 900 },
    { name: 'Aïn Témouchent', deskFee: 480, domicileFee: 680 },
    { name: 'Ghardaïa', deskFee: 620, domicileFee: 820 },
    { name: 'Relizane', deskFee: 460, domicileFee: 660 },
    { name: 'Timimoun', deskFee: 950, domicileFee: 1150 },
    { name: 'Bordj Badji Mokhtar', deskFee: 1150, domicileFee: 1350 },
    { name: 'Ouled Djellal', deskFee: 620, domicileFee: 820 },
    { name: 'Béni Abbès', deskFee: 900, domicileFee: 1100 },
    { name: 'In Salah', deskFee: 1050, domicileFee: 1250 },
    { name: 'In Guezzam', deskFee: 1200, domicileFee: 1400 },
    { name: 'Touggourt', deskFee: 680, domicileFee: 880 },
    { name: 'Djanet', deskFee: 1150, domicileFee: 1350 },
    { name: "El M'Ghair", deskFee: 630, domicileFee: 830 },
    { name: 'El Meniaa', deskFee: 700, domicileFee: 900 }
  ]
};

module.exports = DEFAULT_DATA;
