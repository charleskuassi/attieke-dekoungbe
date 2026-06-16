const { User, Order, Reservation, sequelize } = require('./models');

async function deleteUser() {
    try {
        await sequelize.authenticate();
        console.log('Database connected.');

        const email = 'legerolt@gmail.com';
        const user = await User.findOne({ where: { email } });

        if (!user) {
            console.log(`User with email ${email} not found.`);
            return;
        }

        console.log(`Found user ${user.name} (ID: ${user.id}). Deleting dependencies...`);

        // Delete Reservations
        const resCount = await Reservation.destroy({ where: { UserId: user.id } });
        console.log(`Deleted ${resCount} reservations.`);

        // Delete Orders
        // Note: OrderItems might prevent Order deletion if not cascaded, but OrderItems belong to Order.
        // Usually we need to delete OrderItems first if constraint exists.
        // Let's first find orders to get their IDs, then delete items.
        const orders = await Order.findAll({ where: { UserId: user.id } });
        const orderIds = orders.map(o => o.id);

        if (orderIds.length > 0) {
            const { OrderItem } = require('./models');
            const itemCount = await OrderItem.destroy({ where: { OrderId: orderIds } });
            console.log(`Deleted ${itemCount} order items.`);

            const orderCount = await Order.destroy({ where: { id: orderIds } });
            console.log(`Deleted ${orderCount} orders.`);
        }

        // Finally delete user
        await user.destroy();
        console.log(`User ${email} deleted successfully.`);

    } catch (error) {
        console.error('Error deleting user:', error);
    } finally {
        await sequelize.close();
    }
}

deleteUser();
