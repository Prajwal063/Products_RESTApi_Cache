import { Sequelize } from 'sequelize';
import * as config from '@/config/sequelize';

// Import models
import productModel from './models/product';

// Configuration
const env = process.env.NODE_ENV || 'development';  // Ensuring the environment is defined
const sequelizeConfig = config[env];

// Create sequelize instance
const sequelize = new Sequelize(sequelizeConfig);

// Define the product model
const modelDefiners = [
  productModel
];

// Initialize models
for (const modelDefiner of modelDefiners) {
  modelDefiner(sequelize);
}

// Check for model associations (if any)
Object.keys(sequelize.models).forEach((modelName) => {
  if (sequelize.models[modelName].associate) {
    sequelize.models[modelName].associate(sequelize.models);
  }
});

// Export the sequelize instance
export default sequelize;
