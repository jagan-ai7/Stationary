// models/chat.model.js
export default (sequelize, DataTypes) => {
  const Chat = sequelize.define(
    "Chat",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },

      userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },

      status: {
        type: DataTypes.ENUM("active", "closed"),
        defaultValue: "active",
      },
    },
    {
      timestamps: true,
    },
  );

  return Chat;
};
