const sequelize = require('../config/database');
const Product = require('./Product');
const Order = require('./Order');
const OrderItem = require('./OrderItem');
const User = require('./User');
const Promotion = require('./Promotion');
const Announcement = require('./Announcement');
const Reservation = require('./Reservation');
const ContactMessage = require('./ContactMessage');
const DeliveryDriver = require('./DeliveryDriver');
const Review = require('./Review');
const Notification = require('./Notification');
const DeliveryZone = require('./DeliveryZone');
const Testimonial = require('./Testimonial');

// Associations
Order.belongsToMany(Product, { through: OrderItem });
Product.belongsToMany(Order, { through: OrderItem });
Order.hasMany(OrderItem);
OrderItem.belongsTo(Order);
OrderItem.belongsTo(Product);

User.hasMany(Order);
Order.belongsTo(User);

User.hasMany(Reservation);
Reservation.belongsTo(User);

User.hasMany(Review);
Review.belongsTo(User);

DeliveryDriver.hasMany(Order, { foreignKey: 'deliveryDriverId' });
Order.belongsTo(DeliveryDriver, { foreignKey: 'deliveryDriverId' });

module.exports = {
    sequelize,
    Product,
    Order,
    OrderItem,
    User,
    Promotion,
    Announcement,
    Reservation,
    ContactMessage,
    DeliveryDriver,
    Review,
    Notification,
    DeliveryZone,
    Testimonial
};
