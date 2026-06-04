export default (sequelize, DataTypes) => {
  const Order = sequelize.define(
    "Order",
    {
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },

      totalAmount: { type: DataTypes.FLOAT, allowNull: false },

      status: {
        type: DataTypes.ENUM("pending", "shipped", "delivered", "cancelled"),
        defaultValue: "pending",
      },
    },
    {
      timestamps: true,
    },
  );

  return Order;
};
