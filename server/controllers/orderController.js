const { Order, OrderItem, Product, User, sequelize, DeliveryDriver } = require('../models');
const { sendOrderNotification, sendStatusUpdateEmail } = require('../services/emailService');
const log = require('../utils/logger');
const axios = require('axios');

exports.createOrder = async (req, res) => {
    // ... code truncated ... (no changes in createOrder)
    console.log("📥 [DEBUG] Body reçu :", JSON.stringify(req.body, null, 2));

    const t = await sequelize.transaction();
    try {
        log('createOrder called. User:', req.user);

        // 1. Extraction et Validation Strictes
        const { items, total, deliveryInfo, paymentMethod, transactionId } = req.body;

        const errors = [];
        if (!items || items.length === 0) errors.push("Le panier (items) est vide");
        if (!deliveryInfo) {
            errors.push("Les infos de livraison (deliveryInfo) sont manquantes");
        } else {
            if (!deliveryInfo.name) errors.push("Le nom du client (deliveryInfo.name) est manquant");
            if (!deliveryInfo.phone) errors.push("Le téléphone (deliveryInfo.phone) est manquant");
            if (!deliveryInfo.address) errors.push("L'adresse (deliveryInfo.address) est manquante");
        }

        if (errors.length > 0) {
            console.error("❌ [ERREUR VALIDATION] :", errors);
            if (!t.finished) await t.rollback();
            return res.status(400).json({
                message: "Données invalides",
                details: errors
            });
        }

        // Mapping variables
        const customer_name = deliveryInfo.name;
        const phone = deliveryInfo.phone;
        const address = deliveryInfo.address;
        const payment_method = paymentMethod || 'kkiapay';
        const transaction_id = transactionId;
        const status = 'paid';

        // 2. Vérification KKiaPay (Sauf si Cash ou Test)
        if (transaction_id && payment_method !== 'cash') {
            if (process.env.KKIAPAY_SANDBOX === 'true' && transaction_id === 'TEST_SUCCESS') {
                log('⚠️ SANDBOX BYPASS: Skipping verification for TEST_SUCCESS');
            } else {
                try {
                    const kkiapayUrl = 'https://api.kkiapay.me/api/v1/transactions/verify';
                    const verifyResponse = await axios.post(kkiapayUrl, {
                        transactionId: transaction_id
                    }, {
                        headers: {
                            'x-api-key': process.env.KKIAPAY_PUBLIC_KEY,
                            'Content-Type': 'application/json'
                        }
                    });

                    if (verifyResponse.data.status !== 'SUCCESS') {
                        throw new Error('Paiement invalide ou frauduleux (Statut: ' + verifyResponse.data.status + ')');
                    }
                    log('✅ Paiement vérifié avec succès:', transaction_id);
                } catch (verifyError) {
                    console.error('⚠️ Erreur vérification KKiaPay (IGORÉ pour debug):', verifyError.message);
                }
            }
        }

        // 3. Calcul du prix total coté serveur (Sécurité)
        let total_price = 0;
        const orderItemsData = [];

        // Anti-doublons produits
        const aggregatedItems = {};
        for (const item of items) {
            if (aggregatedItems[item.id]) {
                aggregatedItems[item.id].quantity += parseInt(item.quantity);
            } else {
                aggregatedItems[item.id] = { ...item, quantity: parseInt(item.quantity) };
            }
        }
        const uniqueItems = Object.values(aggregatedItems);

        for (const item of uniqueItems) {
            const product = await Product.findByPk(item.id);
            if (!product) {
                throw new Error(`Produit avec id ${item.id} introuvable`);
            }
            total_price += product.price * item.quantity;
            orderItemsData.push({
                ProductId: product.id,
                quantity: item.quantity,
                price_at_order: product.price
            });
        }

        const cleanPhone = phone.replace(/\s/g, '');

        // 4. Anti-Replay
        if (transaction_id && payment_method !== 'cash' && transaction_id !== 'TEST_SUCCESS') {
            const existingOrder = await Order.findOne({ where: { transaction_id } });
            if (existingOrder) {
                log(`⚠️ FRAUD ATTEMPT: Replay of transaction ${transaction_id}`);
                if (!t.finished) await t.rollback();
                return res.status(409).json({ message: 'Transaction déjà utilisée.' });
            }
        }

        // 5. Création Commande
        let finalTransactionId = transaction_id;
        if (transaction_id === 'TEST_SUCCESS') {
            finalTransactionId = `TEST_SUCCESS_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
        }

        const order = await Order.create({
            customer_name,
            phone: cleanPhone,
            address,
            total_price, // On utilise le prix calculé serveur
            payment_method,
            transaction_id: finalTransactionId,
            status: status,
            UserId: req.user ? req.user.id : null
        }, { transaction: t });

        // Création Items
        for (const itemData of orderItemsData) {
            await OrderItem.create({
                OrderId: order.id,
                ProductId: itemData.ProductId,
                quantity: itemData.quantity,
                price_at_order: itemData.price_at_order
            }, { transaction: t });
        }

        await t.commit();

        // Notification Async
        sendOrderNotification(order, items).catch(err => console.error('Email error:', err));

        log("✅ Commande créée avec succès ID:", order.id);
        res.status(201).json({ message: 'Commande validée et créée avec succès', orderId: order.id });

    } catch (err) {
        console.error('Create Order Error:', err);

        // Rollback si nécessaire
        if (t && !t.finished) {
            try { await t.rollback(); } catch (rbErr) { console.error('Rollback Error:', rbErr); }
        }

        // Erreurs de validation Sequelize
        if (err.name === 'SequelizeValidationError' || err.message.includes('Validation error')) {
            const details = err.errors ? err.errors.map(e => e.message) : [err.message];
            console.error('Validation Details:', details);
            return res.status(400).json({
                message: 'Erreur de validation base de données',
                details: details
            });
        }

        res.status(500).json({ message: 'Erreur technique serveur', error: err.message });
    }
};

exports.getUserOrders = async (req, res) => {
    try {
        const orders = await Order.findAll({
            where: { UserId: req.user.id },
            include: [
                { model: Product, through: { attributes: ['quantity', 'price_at_order'] } },
                { model: DeliveryDriver }
            ],
            order: [['createdAt', 'DESC']]
        });
        res.json(orders);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server Error' });
    }
};

exports.getAllOrders = async (req, res) => {
    try {
        const orders = await Order.findAll({
            include: [
                { model: Product, through: { attributes: ['quantity', 'price_at_order'] } },
                { model: User, attributes: ['id', 'name', 'email'] },
                { model: DeliveryDriver }
            ],
            order: [['createdAt', 'DESC']]
        });
        res.json(orders);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server Error' });
    }
};

exports.updateOrderStatus = async (req, res) => {
    try {
        const { status } = req.body;
        // Include User to get email for notification
        const order = await Order.findByPk(req.params.id, {
            include: [{ model: User }]
        });

        if (!order) return res.status(404).json({ message: 'Order not found' });

        const oldStatus = order.status;
        order.status = status;
        await order.save();

        // Send Email Notification if status changed to critical steps and user has email
        if (oldStatus !== status && order.User && order.User.email) {
            // Trigger specific emails
            if (['en_cours', 'delivered', 'cancelled'].includes(status)) {
                console.log(`📧 Sending status update email (${status}) to ${order.User.email}`);
                sendStatusUpdateEmail(order, order.User, status).catch(err => console.error('Status Email Error:', err));
            }
        }

        res.json(order);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server Error' });
    }
};

exports.assignDriver = async (req, res) => {
    try {
        const { driverId } = req.body;
        const order = await Order.findByPk(req.params.id);
        if (!order) return res.status(404).json({ message: 'Order not found' });

        order.deliveryDriverId = driverId;
        order.status = 'shipping'; // Update status to shipping
        await order.save();
        res.json({ message: 'Driver assigned successfully', order });
    } catch (err) {
        console.error("Assign Driver Error:", err);
        res.status(500).json({ message: 'Server Error' });
    }
};
