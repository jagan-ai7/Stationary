export default (sequelize, DataTypes) => {
  const Notification = sequelize.define(
    "Notification",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },

      userId: {
        type: DataTypes.INTEGER,
        allowNull: true, // optional
      },

      audience: {
        type: DataTypes.ENUM("user", "admin"),
        allowNull: true,
      },

      kind: {
        type: DataTypes.ENUM(
          "order_placed",
          "order_shipped",
          "order_delivered",
          "order_cancelled",
          "offer",
          "low_stock",
          "out_of_stock",
          "new_order",
        ),
        allowNull: false,
      },

      title: {
        type: DataTypes.STRING,
        allowNull: false,
      },

      message: {
        type: DataTypes.TEXT,
        allowNull: false,
      },

      read: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
    },
    {
      timestamps: true,
    },
  );

  return Notification;
};
