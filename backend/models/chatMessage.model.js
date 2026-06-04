// models/chatMessage.model.js
export default (sequelize, DataTypes) => {
  const ChatMessage = sequelize.define(
    "ChatMessage",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },

      chatId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },

      sender: {
        type: DataTypes.ENUM("user", "bot", "admin"),
        allowNull: false,
      },

      message: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
    },
    {
      timestamps: true,
    },
  );

  return ChatMessage;
};
