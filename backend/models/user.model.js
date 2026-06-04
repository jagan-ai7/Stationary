export default (sequelize, DataTypes) => {
  const User = sequelize.define(
    "User",
    {
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },

      firstName: { type: DataTypes.STRING, allowNull: false },
      lastName: { type: DataTypes.STRING, allowNull: false },

      email: { type: DataTypes.STRING, allowNull: false, unique: true },
      phoneNumber: { type: DataTypes.STRING, allowNull: false },

      address: { type: DataTypes.STRING, allowNull: false },
      country: { type: DataTypes.STRING, allowNull: false },
      state: { type: DataTypes.STRING, allowNull: false },
      city: { type: DataTypes.STRING, allowNull: false },
      zipCode: { type: DataTypes.STRING, allowNull: false },

      password: { type: DataTypes.STRING, allowNull: false },

      role: {
        type: DataTypes.ENUM("user", "admin"),
        defaultValue: "user",
      },
    },
    {
      timestamps: true,
    },
  );

  return User;
};
