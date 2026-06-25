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
        allowNull: true, // true because bot messages can be null
        index: true, // add index
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
