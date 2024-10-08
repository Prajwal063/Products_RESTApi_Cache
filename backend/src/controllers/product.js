import createError from "http-errors";
import db from "@/database";
import redisClient from "@/libs/redis";
import { Sequelize } from "sequelize";

/**
 * POST /products
 * Create a new product
 */
export const createProduct = async (req, res, next) => {
  try {
    const productData = req.body;

    // Create product
    const product = await db.models.product.create(productData);

    // Invalidate related caches
    if (redisClient.connected) {
      redisClient.del("ProductsList");
    }
    return res.status(201).json(product);
  } catch (err) {
    return next(err);
  }
};

/**
 * GET /products
 * List all products with pagination
 */
export const getProducts = async (req, res, next) => {
  try {
    const { page = 1, perPage = 10 } = req.query;
    const offset = (page - 1) * perPage;

    const cacheKey = `ProductsList:${page}:${perPage}`;

    // Check cache
    redisClient.get(cacheKey, async (err, cachedData) => {
      if (err) return next(err);

      if (cachedData) {
        return res.json(JSON.parse(cachedData)); // Return cached response
      }

      const productListResponse = await db.models.product.findAndCountAll({
        offset,
        limit: perPage,
        order: [["createdAt", "DESC"]],
      });

      const totalPage = Math.ceil(productListResponse.count / perPage);
      const response = {
        ...productListResponse,
        page,
        totalPage,
        perPage,
      };

      // Cache the response
      if (redisClient.connected) {
        redisClient.setex(cacheKey, 600, JSON.stringify(response)); // Cache for 10 minutes
      }
      return res.json(response);
    });
  } catch (err) {
    return next(err);
  }
};

/**
 * GET /products/:id
 * Get product by id
 */
export const getProductById = async (req, res, next) => {
  try {
    const { id: productId } = req.params;

    const cacheKey = `Product:${req.query.evalString}`;

    // Check cache
    redisClient.get(cacheKey, async (err, cachedData) => {
      if (err) return next(err);

      if (cachedData) {
        return res.status(200).json(JSON.parse(cachedData)); // Return cached response
      }

      const product = await db.models.product.findOne({
        where: { id: productId },
      });
      if (!product) {
        return next(createError(404, "There is no product with this id!"));
      }

      // Cache the product details
      if (redisClient.connected) {
        redisClient.setex(cacheKey, 600, JSON.stringify(product)); // Cache for 10 minutes
      }
      return res.status(200).json(product);
    });
  } catch (err) {
    return next(err);
  }
};

/**
 * GET /products/filter
 * Filter products by category, price, and availability
 */
export const filterProducts = async (req, res, next) => {
  try {
    const { category, price_min, price_max } = req.query;

    // Parse price_min and price_max to numbers
    const parsedPriceMin = price_min ? parseInt(price_min, 10) : undefined;
    const parsedPriceMax = price_max ? parseInt(price_max, 10) : undefined;

    const filterCriteria = {};
    if (category) filterCriteria.category = category;
    if (parsedPriceMin !== undefined)
      filterCriteria.price = {
        ...filterCriteria.price,
        [Sequelize.Op.gte]: parsedPriceMin,
      };
    if (parsedPriceMax !== undefined)
      filterCriteria.price = {
        ...filterCriteria.price,
        [Sequelize.Op.lte]: parsedPriceMax,
      };

    const cacheKey = `FilteredProducts:${JSON.stringify(filterCriteria)}`;

    // Check cache
    redisClient.get(cacheKey, async (err, cachedData) => {
      if (err) return next(err);

      if (cachedData) {
        return res.json(JSON.parse(cachedData)); // Return cached response
      }

      console.log("Querying the database...");
      const products = await db.models.product.findAll({
        where: filterCriteria,
        order: [["createdAt", "DESC"]],
      });

      // Cache the filtered response
      if (redisClient.connected) {
        redisClient.setex(cacheKey, 600, JSON.stringify(products)); // Cache for 10 minutes
      }
      return res.json(products);
    });
  } catch (err) {
    console.error("Error occurred:", err);
    return next(err);
  }
};

/**
 * PUT /products/:id
 * Update product details
 */
export const updateProduct = async (req, res, next) => {
  try {
    const { id: productId } = req.params;
    const productData = req.body;

    const product = await db.models.product.findByPk(productId);
    if (!product) {
      return next(createError(404, "There is no product with this id!"));
    }

    await product.update(productData);

    // Invalidate the cache for this specific product
    if (redisClient.connected) {
      redisClient.del(`Product:${productId}`);
      redisClient.del("ProductsList"); // Invalidate product list cache
    }

    return res.json(product);
  } catch (err) {
    return next(err);
  }
};

/**
 * DELETE /products/:id
 * Delete a product
 */
export const deleteProduct = async (req, res, next) => {
  try {
    const { id: productId } = req.params;

    const product = await db.models.product.findByPk(productId);
    if (!product) {
      return next(createError(404, "There is no product with this id!"));
    }

    await product.destroy();

    // Invalidate the cache for this product
    if (redisClient.connected) {
      redisClient.del(`Product:${productId}`);
      redisClient.del("ProductsList"); // Invalidate product list cache
    }

    return res.status(204).send();
  } catch (err) {
    return next(err);
  }
};