const fs   = require('fs');
const path = require('path');

const DB_PATH = path.join(__dirname, 'data.json');

// ─── PRODUCT IMAGE MAP ───────────────────────────────────────────────────────
// Each photo chosen to match the specific product visually.
const IMG = {
  // 1 - bowl of dry dog kibble
  dogFood:      'https://images.unsplash.com/photo-1568640347023-a616a30bc3bd?w=500&h=300&fit=crop&auto=format',
  // 2 - wet/dry cat food served in a dish
  catFood:      'https://images.unsplash.com/photo-1601758125946-6ec2ef64daf8?w=500&h=300&fit=crop&auto=format',
  // 3 - colourful rope chew toy for dogs
  ropeToy:      'https://images.unsplash.com/photo-1535294435445-d7249524ef2e?w=500&h=300&fit=crop&auto=format',
  // 4 - feather wand cat toy in use
  featherToy:   'https://images.unsplash.com/photo-1545249390-6bdfa286032f?w=500&h=300&fit=crop&auto=format',
  // 5 - cozy plush pet bed with dog sleeping
  petBed:       'https://images.unsplash.com/photo-1591946614720-90a587da4a36?w=500&h=300&fit=crop&auto=format',
  // 6 - close-up of dog collar & leash on a dog
  collar:       'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=500&h=300&fit=crop&auto=format',
  // 7 - dog being bathed / grooming shampoo
  shampoo:      'https://images.unsplash.com/photo-1581888227599-779811939961?w=500&h=300&fit=crop&auto=format',
  // 8 - vitamin/supplement chew treats in a bowl
  vitamins:     'https://images.unsplash.com/photo-1562451965-1dddb63a6d02?w=500&h=300&fit=crop&auto=format',
  // 9 - sisal cat scratching post with cat
  scratchPost:  'https://images.unsplash.com/photo-1574158622682-e40e69881006?w=500&h=300&fit=crop&auto=format',
  // 10 - tropical aquarium fish close-up
  fishFood:     'https://images.unsplash.com/photo-1522069169874-c58ec4b76be5?w=500&h=300&fit=crop&auto=format',
  // 11 - dog wearing a waterproof rain jacket outdoors
  dogJacket:    'https://images.unsplash.com/photo-1537151608828-ea2b11777ee8?w=500&h=300&fit=crop&auto=format',
  // 12 - cat drinking from a circulating water fountain
  fountain:     'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?w=500&h=300&fit=crop&auto=format',
};

const INITIAL_DATA = {
  products: [
    {
      id: 1, name: 'Premium Dog Food 5kg',
      description: 'High-quality dry kibble with chicken and vegetables, ideal for adult dogs of all breeds.',
      price: 29.99, category: 'dogs', stock: 45, image: IMG.dogFood
    },
    {
      id: 2, name: 'Gourmet Cat Food 3kg',
      description: 'Salmon and tuna flavoured dry cat food, rich in Omega-3 for a healthy coat and joints.',
      price: 19.99, category: 'cats', stock: 60, image: IMG.catFood
    },
    {
      id: 3, name: 'Rope Chew Toy – Dog',
      description: 'Durable braided cotton rope toy, perfect for teething puppies and interactive play.',
      price: 9.99, category: 'toys', stock: 80, image: IMG.ropeToy
    },
    {
      id: 4, name: 'Interactive Feather Cat Toy',
      description: 'Retractable wand with feathers and bells to keep your cat entertained for hours.',
      price: 12.99, category: 'toys', stock: 75, image: IMG.featherToy
    },
    {
      id: 5, name: 'Cozy Orthopedic Pet Bed',
      description: 'Memory foam pet bed with removable washable cover. Suitable for dogs and cats.',
      price: 49.99, category: 'accessories', stock: 30, image: IMG.petBed
    },
    {
      id: 6, name: 'Adjustable Dog Collar & Leash Set',
      description: 'Nylon collar and 1.5m leash set with stainless steel hardware. Multiple sizes available.',
      price: 22.99, category: 'accessories', stock: 55, image: IMG.collar
    },
    {
      id: 7, name: 'Pet Shampoo & Conditioner',
      description: '2-in-1 natural formula with aloe vera for sensitive skin. Safe for dogs and cats.',
      price: 14.99, category: 'grooming', stock: 70, image: IMG.shampoo
    },
    {
      id: 8, name: 'Vitamin Supplements for Dogs',
      description: 'Daily multivitamin chews supporting immune system, joints and digestion. 60 chews per pack.',
      price: 24.99, category: 'health', stock: 40, image: IMG.vitamins
    },
    {
      id: 9, name: 'Cat Scratching Post 60cm',
      description: 'Sisal-wrapped scratching post with hanging toy. Keeps cats away from furniture.',
      price: 34.99, category: 'cats', stock: 35, image: IMG.scratchPost
    },
    {
      id: 10, name: 'Aquarium Fish Food 200g',
      description: 'Premium flakes for tropical freshwater fish. Enhances colour and vitality.',
      price: 7.99, category: 'fish', stock: 90, image: IMG.fishFood
    },
    {
      id: 11, name: 'Dog Waterproof Rain Jacket',
      description: 'Lightweight waterproof jacket for walks in Irish weather. Reflective strips for night safety.',
      price: 32.99, category: 'dogs', stock: 25, image: IMG.dogJacket
    },
    {
      id: 12, name: 'Automatic Water Fountain for Pets',
      description: '1.8L circulating fountain with carbon filter. Keeps water fresh and encourages hydration.',
      price: 39.99, category: 'accessories', stock: 28, image: IMG.fountain
    }
  ],
  cart: [],
  nextCartId: 1
};

function load() {
  if (!fs.existsSync(DB_PATH)) {
    fs.writeFileSync(DB_PATH, JSON.stringify(INITIAL_DATA, null, 2));
    console.log('✅ Database created with 12 products.');
  }
  return JSON.parse(fs.readFileSync(DB_PATH, 'utf8'));
}

function save(data) {
  fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));
}

module.exports = { load, save };
