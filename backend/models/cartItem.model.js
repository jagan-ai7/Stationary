export default (sequelize, DataTypes) => {
  const CartItem = sequelize.define(
    "CartItem",
    {
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      cartId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      productId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      quantity: { type: DataTypes.INTEGER, defaultValue: 1 },
    },
    {
      timestamps: true,
      indexes: [
        {
          unique: true,
          fields: ["cartId", "productId"],
        },
      ],
    },
  );

  return CartItem;
};
