const { Order, OrderItem, Product, User, sequelize, Reservation, ContactMessage, Review } = require('../models');
const { Op } = require('sequelize');

exports.getStats = async (req, res) => {
    try {
        console.log("📊 Récupération des statistiques Admin...");
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // Daily Sales
        const dailySales = await Order.sum('total_price', {
            where: {
                createdAt: {
                    [Op.gte]: today
                },
                status: { [Op.ne]: 'cancelled' }
            }
        });

        // Monthly Report (Last 30 days)
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const monthlyData = await Order.findAll({
            attributes: [
                [sequelize.fn('date', sequelize.col('createdAt')), 'date'],
                [sequelize.fn('sum', sequelize.col('total_price')), 'total']
            ],
            where: {
                createdAt: { [Op.gte]: thirtyDaysAgo },
                status: { [Op.ne]: 'cancelled' }
            },
            group: [sequelize.fn('date', sequelize.col('createdAt'))],
            order: [[sequelize.fn('date', sequelize.col('createdAt')), 'ASC']]
        });

        // Top Products
        let topProductsData = [];
        try {
            console.log("👉 Calcul Top Products...");

            // Inspectons les colonnes pour être sûrs (Debug)
            // const attributes = Object.keys(OrderItem.rawAttributes);
            // console.log("Colonnes OrderItem:", attributes);

            // TENTATIVE 2 : Retour à "ProductId" (PascalCase) qui semblait être la colonne détectée initialement
            // On groupe par le champ FK de ce modèle uniquement.
            const topStats = await OrderItem.findAll({
                attributes: [
                    ['ProductId', 'pid'], // Modification ici : productId -> ProductId
                    [sequelize.fn('sum', sequelize.col('quantity')), 'total_sold'],
                    [sequelize.literal('SUM(quantity * price_at_order)'), 'total_revenue']
                ],
                // important : on groupe par le même nom que l'attribut sélectionné
                group: ['ProductId'],
                order: [[sequelize.literal('total_sold'), 'DESC']],
                limit: 5,
                raw: true // On veut des objets JS simples
            });

            console.log("✅ TopStats Raw:", topStats);

            // Récupération des noms
            topProductsData = await Promise.all(topStats.map(async (item) => {
                // item.pid est le ProductId
                if (!item.pid) return { name: 'Inconnu', count: 0, revenue: 0 };

                const product = await Product.findByPk(item.pid);
                return {
                    name: product ? product.name : 'Produit Supprimé',
                    count: parseInt(item.total_sold),
                    revenue: parseInt(item.total_revenue || 0)
                };
            }));

        } catch (topErr) {
            console.error("⚠️ Erreur calcul Top Produits (Non-bloquant):", topErr.message);
            // On renvoie un tableau vide pour ne pas crasher tout le dashboard
            topProductsData = [];
        }

        // Format Monthly Data for Chart
        const formattedMonthlyData = monthlyData.map(item => ({
            name: new Date(item.get('date')).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' }),
            sales: parseInt(item.get('total'))
        }));

        res.json({
            dailySales: dailySales || 0,
            monthlyData: formattedMonthlyData,
            topProducts: topProductsData
        });
    } catch (err) {
        console.error("❌ Erreur Critique getStats:", err);
        // Log more details if available
        if (err.parent) console.error("Détails SQL:", err.parent);
        if (err.original) console.error("Erreur Originale:", err.original);

        res.status(500).json({ message: 'Server Error', error: err.message });
    }
};

exports.getClients = async (req, res) => {
    try {
        const clients = await User.findAll({
            // where: { role: 'customer' }, // On prend tous les users pour l'instant (décommentez pour filtrer)
            attributes: { exclude: ['password'] },
            order: [['createdAt', 'DESC']]
        });

        if (!clients || clients.length === 0) {
            console.log("⚠️ Aucuns clients trouvés dans la base de données.");
        }

        res.json(clients);
    } catch (err) {
        console.error("Erreur récupération clients:", err);
        res.status(500).json({ message: 'Server Error' });
    }
};

exports.getNotificationCounts = async (req, res) => {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const [pendingOrders, pendingReservations, unreadMessages, unreadReviews, newClients, totalClients] = await Promise.all([
            Order.count({ where: { status: 'paid' } }),
            Reservation.count({ where: { status: 'pending' } }),
            ContactMessage.count({ where: { isRead: false } }),
            Review.count({ where: { status: 'new' } }),
            User.count({ where: { role: 'customer', createdAt: { [Op.gte]: today }, isVerified: true } }),
            User.count({ where: { role: 'customer', isVerified: true } })
        ]);

        res.json({
            orders: pendingOrders,
            reservations: pendingReservations,
            messages: unreadMessages,
            reviews: unreadReviews,
            clients: newClients,
            totalClients // Return total for dashboard card
        });
    } catch (err) {
        console.error("Notification Counts Error:", err);
        res.status(500).json({ message: 'Server Error' });
    }
};

exports.deleteUser = async (req, res) => {
    try {
        const userId = req.params.id;

        // 1. Sécurité : Empêcher l'admin de se suicider (numériquement)
        if (req.user.id == userId) {
            return res.status(403).json({ message: "Vous ne pouvez pas supprimer votre propre compte admin." });
        }

        const user = await User.findByPk(userId);
        if (!user) {
            return res.status(404).json({ message: "Utilisateur introuvable." });
        }

        // 2. Suppression (Cascade gérée par Sequelize si configurée, sinon on le fait manuellement pour être sûr)
        // Optionnel : Suppression des commandes liées manuellement si cascade n'est pas activée en BDD
        // await Order.destroy({ where: { UserId: userId } }); 

        await user.destroy();

        console.log(`🗑️ [ADMIN] Utilisateur ${userId} supprimé par ${req.user.id}`);
        res.json({ message: "Utilisateur et ses données supprimés avec succès." });

    } catch (err) {
        console.error("Erreur suppression user:", err);
        res.status(500).json({ message: "Erreur serveur lors de la suppression." });
    }
};
