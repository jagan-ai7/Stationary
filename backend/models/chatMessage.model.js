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
        index: true, // add index
      },

      sender: {
        type: DataTypes.ENUM("user", "bot"), // remove admin for now
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
