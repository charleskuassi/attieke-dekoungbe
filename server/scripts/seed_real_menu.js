const { Product, sequelize, User } = require('../models');  // Import User model
const bcrypt = require('bcryptjs'); // Import bcrypt

const menuData = [
    // --- PLATS ---
    { name: "Attiéké + Poisson Silvie", prices: [2000, 2500], category: "plats" },
    { name: "Attiéké + Ailleron", prices: [2500], category: "plats" },
    { name: "Attiéké + Poulet (moitié)", prices: [3000], category: "plats" },
    { name: "Attiéké + Poulet (complet)", prices: [5000], category: "plats" },
    { name: "Attiéké + Tilapia", prices: [4000, 5000, 6000, 7000], category: "plats" },
    { name: "Portion Attiéké", prices: [500], category: "plats" },
    { name: "Portion Alloco", prices: [500], category: "plats" },
    { name: "Portion Frites", prices: [1000], category: "plats" },
    { name: "Frites Ailerons", prices: [2500], category: "plats" },
    { name: "Akassa + Aileron", prices: [2000], category: "plats" },
    { name: "Akassa + Poisson silvie", prices: [2000], category: "plats" },
    { name: "Akassa + Tilapia", prices: [5000], category: "plats" },
    { name: "Piron + aileron", prices: [2000], category: "plats" },
    { name: "Riz au Aileron", prices: [2500], category: "plats" },
    { name: "Frites au Tilapia", prices: [5000, 6000], category: "plats" },
    { name: "Riz au Tilapia", prices: [5000, 6000], category: "plats" },
    { name: "Pâte rouge + Poisson", prices: [2000], category: "plats" },
    { name: "Pâte rouge + Aileron", prices: [2000], category: "plats" },
    { name: "Pâte rouge + Poulet (moitié)", prices: [3000], category: "plats" },
    { name: "Pâte rouge + Poulet (complet)", prices: [5000], category: "plats" },

    // --- BOISSONS ---
    { name: "LB 0.66", prices: [600], category: "boissons" },
    { name: "LB 0.33", prices: [500], category: "boissons" },
    { name: "Beaufort 0.50", prices: [600], category: "boissons" },
    { name: "Beaufort 0.33", prices: [500], category: "boissons" },
    { name: "Doppel 0.50", prices: [600], category: "boissons" },
    { name: "Chap chap", prices: [600], category: "boissons" },
    { name: "Doppel Lager 0.5", prices: [700], category: "boissons" },
    { name: "Eku 0.33", prices: [600], category: "boissons" },
    { name: "Guinness 0.33", prices: [700], category: "boissons" },
    { name: "Pils 0.66", prices: [700], category: "boissons" },
    { name: "Pils 0.33", prices: [500], category: "boissons" },
    { name: "Sucrerie 0.66", prices: [500], category: "boissons" },
    { name: "Tequila 0.33", prices: [500], category: "boissons" },
    { name: "Chill 0.33", prices: [500], category: "boissons" },
    { name: "Awoyo", prices: [900], category: "boissons" },
    { name: "Castel", prices: [500], category: "boissons" },
    { name: "Flag 0.66", prices: [600], category: "boissons" },
    { name: "Xxl", prices: [500], category: "boissons" },
    { name: "Racines 0.33", prices: [500], category: "boissons" },
    { name: "Malta Tonic Café 0.33", prices: [500], category: "boissons" },
    { name: "Doppler Energy Malt", prices: [600], category: "boissons" },
    { name: "Lager Togo 0.66", prices: [900], category: "boissons" },
    { name: "Lager Togo 0.33", prices: [600], category: "boissons" },
    { name: "Savana", prices: [2000], category: "boissons" },
    { name: "Despérado bouteille", prices: [1500], category: "boissons" },
    { name: "Heineken", prices: [1000], category: "boissons" },
    { name: "Fearless", prices: [500], category: "boissons" },
    { name: "Fifa/kwabor", prices: [500], category: "boissons" },
    { name: "EMG", prices: [600], category: "boissons" },
    { name: "Aquabel", prices: [500], category: "boissons" },
    { name: "Posso Citron", prices: [600], category: "boissons" },
    { name: "Eau minérale petit", prices: [200], category: "boissons" },
    { name: "Comtesse citron", prices: [700], category: "boissons" },
    { name: "Full Energy", prices: [500], category: "boissons" },
    { name: "Sucrerie plastique Grd", prices: [1000], category: "boissons" },
    { name: "Sucrerie plastique petit", prices: [500], category: "boissons" },
    { name: "Van pur sans alcool", prices: [600], category: "boissons" },
    { name: "Van Pur Malt", prices: [800], category: "boissons" },
    { name: "Energy k.o", prices: [1000], category: "boissons" },
    { name: "Vody", prices: [800], category: "boissons" },
    { name: "Rox", prices: [600], category: "boissons" },
    { name: "Despérado cannette", prices: [600], category: "boissons" },
    { name: "Xxl en plastique", prices: [600], category: "boissons" },
    { name: "Jus X-Tra", prices: [2000], category: "boissons" },
    { name: "Vodka MXO", prices: [500], category: "boissons" },
    { name: "Ira", prices: [500], category: "boissons" },
    { name: "Malta Guinness(can)", prices: [500], category: "boissons" },
    { name: "Beta Malta", prices: [300], category: "boissons" },
    { name: "Estrela Bière", prices: [1000], category: "boissons" },
    { name: "Yaourt", prices: [1500], category: "boissons" },
    { name: "Vin de palme", prices: [500], category: "boissons" },
    { name: "LEGEND", prices: [600], category: "boissons" },
    { name: "Orca + Sprit Grand", prices: [500], category: "boissons" },
    { name: "Orca + Sprit petit", prices: [500], category: "boissons" },

    // --- VINS ---
    { name: "Journée spécial", prices: [4000], category: "vins" },
    { name: "Grand versant", prices: [3000], category: "vins" },
    { name: "Vin Louis DAZENAC", prices: [5000], category: "vins" },
    { name: "BARON D'OREL", prices: [4000], category: "vins" },
    { name: "CAPITOR", prices: [5000], category: "vins" },
    { name: "Fleur haut Gaussens", prices: [6500], category: "vins" },
    { name: "Château ht Gaussens", prices: [7500], category: "vins" },
    { name: "Terre d'Amour", prices: [4000], category: "vins" },
    { name: "Baron Romero", prices: [3000], category: "vins" },
    { name: "Sangria Pt", prices: [1000], category: "vins" },
    { name: "Baron de Lirondeau", prices: [4000], category: "vins" },
    { name: "La Foi de Pâpe", prices: [5000], category: "vins" },
    { name: "AGOR", prices: [5000], category: "vins" },
    { name: "Chateau Marleine", prices: [3500], category: "vins" },
    { name: "Trésor des arcardes", prices: [5000], category: "vins" },
    { name: "Maison Galicheit", prices: [6000], category: "vins" },
    { name: "Puglia Rosso", prices: [7000], category: "vins" },
    { name: "Nero Di Troia", prices: [7000], category: "vins" },
    { name: "Salento Rosso", prices: [10000], category: "vins" },

    // --- WHISKYS ---
    { name: "Royal Circle Pt", prices: [1000], category: "whiskys" },
    { name: "LEGEND", prices: [1500], category: "whiskys" },
    { name: "Legend Whisky", prices: [3500], category: "whiskys" },
    { name: "Royal Circle Grd", prices: [7000], category: "whiskys" },
    { name: "MATINI", prices: [7000], category: "whiskys" },
    { name: "Label 5", prices: [8000], category: "whiskys" },
    { name: "WILLIAMS LAWSON", prices: [8000], category: "whiskys" },
    { name: "Suze", prices: [9000], category: "whiskys" },

    // --- CHAMPAGNES ---
    { name: "Valentino", prices: [3000], category: "champagnes" },
    { name: "JP Chenet", prices: [4000], category: "champagnes" },
    { name: "Mama Mia", prices: [5000], category: "champagnes" },
    { name: "Muscador", prices: [10000], category: "champagnes" },
    { name: "Freixenet", prices: [10000], category: "champagnes" },
    { name: "BELAIRE", prices: [50000], category: "champagnes" }
];

const sizeLabels = {
    2: ["Moyen", "Grand"],
    4: ["Petit", "Moyen", "Grand", "XL"]
};

// Generates correct name based on variant index
const getVariantName = (baseName, index, totalVariants) => {
    if (totalVariants === 1) return baseName;

    if (sizeLabels[totalVariants]) {
        return `${baseName} (${sizeLabels[totalVariants][index] || index + 1})`;
    }

    return `${baseName} (Option ${index + 1})`;
};

// Returns a relevant image based on name/category
const getImageUrl = (name, category) => {
    const lowerName = name.toLowerCase();
    const lowerCategory = category.toLowerCase();

    if (lowerName.includes('attiéké') && lowerName.includes('poisson')) return "https://img.freepik.com/photos-gratuite/vue-dessus-delicieux-repas-au-poulet-riz_23-2148757041.jpg";
    if (lowerName.includes('attiéké') && lowerName.includes('poulet')) return "https://img.freepik.com/photos-gratuite/poulet-riz-vue-dessus-assiette_23-2148757041.jpg";
    if (lowerName.includes('alloco')) return "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1f/Alloco_et_poisson.jpg/800px-Alloco_et_poisson.jpg";
    if (lowerName.includes('akassa')) return "https://upload.wikimedia.org/wikipedia/commons/thumb/9/9b/Akassa_au_B%C3%A9nin.jpg/640px-Akassa_au_B%C3%A9nin.jpg";
    if (lowerName.includes('pâte rouge') || lowerName.includes('amiwo')) return "https://upload.wikimedia.org/wikipedia/commons/thumb/6/69/Amiwo_au_poulet.jpg/640px-Amiwo_au_poulet.jpg";

    if (lowerCategory === 'boissons') return "https://upload.wikimedia.org/wikipedia/commons/thumb/0/05/La_B%C3%A9ninoise.jpg/388px-La_B%C3%A9ninoise.jpg";
    if (lowerCategory === 'vins') return "https://www.publicdomainpictures.net/pictures/320000/velka/red-wine-bottle-157460747441Z.jpg";
    if (lowerCategory === 'champagnes') return "https://upload.wikimedia.org/wikipedia/commons/e/e0/Glass_of_Champagne.jpg";
    if (lowerCategory === 'whiskys') return "https://upload.wikimedia.org/wikipedia/commons/thumb/0/05/La_B%C3%A9ninoise.jpg/388px-La_B%C3%A9ninoise.jpg"; // Fallback for whiskys

    return "https://via.placeholder.com/300";
};

const seedMenu = async () => {
    try {
        await sequelize.authenticate();
        console.log('Database connected.');

        // Force Sync to ensure tables exist
        await sequelize.sync();
        console.log('Database synced.');

        // Clear existing products (using DELETE instead of TRUNCATE to avoid FK constraint errors)
        await Product.destroy({ where: {} });
        console.log('Existing products cleared.');

        const productsToCreate = [];

        for (const item of menuData) {
            item.prices.forEach((price, index) => {
                const name = getVariantName(item.name, index, item.prices.length);
                const imageUrl = getImageUrl(item.name, item.category);

                productsToCreate.push({
                    name: name,
                    description: `${item.category} - ${name}`,
                    price: price,
                    category: item.category,
                    image_url: imageUrl,
                    is_popular: false
                });
            });
        }

        await Product.bulkCreate(productsToCreate);
        console.log(`Successfully created ${productsToCreate.length} products.`);

        // --- Seed Admin User (CRITICAL FOR BACKEND ACCESS) ---
        const adminEmail = 'admin@attieke.com';
        const existingAdmin = await User.findOne({ where: { email: adminEmail } });

        if (!existingAdmin) {
            const hashedPassword = await bcrypt.hash('admin123', 10);
            await User.create({
                name: 'Admin User',
                email: adminEmail,
                password: hashedPassword,
                phone: '0000000000',
                address: 'Admin HQ',
                role: 'admin'
            });
            console.log('Admin user seeded successfully!');
        } else {
            console.log('Admin user already exists.');
        }

    } catch (error) {
        console.error('Error seeding menu:', error);
        throw error; // Re-throw to handle it in controller
    }
    // Do NOT close connection when running as module
    // finally {
    //     await sequelize.close();
    // }
};

// seedMenu();
module.exports = seedMenu;
