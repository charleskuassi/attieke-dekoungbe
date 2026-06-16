const { sequelize, Order, Product, OrderItem } = require('./models');

async function reproduce() {
    try {
        console.log("OrderItem attributes for OrderId:", OrderItem.rawAttributes.OrderId);
        await sequelize.sync({ alter: true }); // sync to match current definitions

        const transaction = await sequelize.transaction();

        try {
            // Create dummy order
            const order = await Order.create({
                customer_name: 'Test',
                phone: '0000',
                address: 'Test Addr',
                total_price: 1000,
                transaction_id: `TEST_${Date.now()}`
            }, { transaction });

            console.log("Order created:", order.id);

            // Create dummy product
            const product1 = await Product.create({
                name: 'P1', price: 100, description: 'd'
            }, { transaction });

            const product2 = await Product.create({
                name: 'P2', price: 200, description: 'd'
            }, { transaction });

            console.log("Products created");

            // Create Items
            // item 1
            await OrderItem.create({
                OrderId: order.id,
                ProductId: product1.id,
                quantity: 1,
                price_at_order: 100
            }, { transaction });
            console.log("Item 1 created");

            // item 2
            await OrderItem.create({
                OrderId: order.id,
                ProductId: product2.id,
                quantity: 1,
                price_at_order: 200
            }, { transaction });
            console.log("Item 2 created");

            await transaction.rollback();
            console.log("Success (Rolled back)");
        } catch (err) {
            console.error("FAIL:", err.message);
            if (err.errors) {
                err.errors.forEach(e => console.error(" - ", e.message));
            }
            await transaction.rollback();
        }

    } catch (e) {
        console.error("Global Error:", e);
    } finally {
        await sequelize.close();
    }
}

reproduce();
