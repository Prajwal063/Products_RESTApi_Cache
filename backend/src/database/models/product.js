import { DataTypes, Model } from "sequelize";

export default function (sequelize) {
  class Product extends Model {
    // No fullName getter needed for products
  }

  Product.init(
    {
      id: {
        type: DataTypes.BIGINT(),
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,  // Auto-increment ID for new products
      },
      productname: {
        type: DataTypes.STRING(30),
        allowNull: false,
      },
      price: {
        type: DataTypes.INTEGER(),
        allowNull: false,
      },
      category: {
        type: DataTypes.STRING(50),  // Category of the product
        allowNull: false,
      },
      availability: {
        type: DataTypes.BOOLEAN(),  // true if in stock, false if out of stock
        allowNull: false,
        defaultValue: true,  // Default to available
      },
      createdAt: {
        type: DataTypes.DATE(),
        allowNull: false,
        defaultValue: DataTypes.NOW,  // Automatically set timestamp
      },
      updatedAt: {
        type: DataTypes.DATE(),
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
      deletedAt: {
        type: DataTypes.DATE(),  // Optional, for soft-deletes
      },
    },
    {
      modelName: "product",
      sequelize,
      paranoid: true,  // Soft deletes
      timestamps: true,  // Enable automatic handling of createdAt, updatedAt
    }
  );

  return Product;
}
