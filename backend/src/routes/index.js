import { Router } from "express";
import { productRouter, filterRouter } from "./product";

const router = Router();

// Product routes (Import from product.js in the routes folder)
router.use("/products", productRouter);
router.use("/filter", filterRouter);

export default router;
