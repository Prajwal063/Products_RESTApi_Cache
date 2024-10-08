import { Router } from "express";
import * as productController from "@/controllers/product";

const productRouter = Router();
const filterRouter = Router();

productRouter.get("/", productController.getProducts);
productRouter.get("/:id", productController.getProductById);
productRouter.post("/", productController.createProduct);
productRouter.put("/:id", productController.updateProduct);
productRouter.delete("/:id", productController.deleteProduct);

filterRouter.get("/", productController.filterProducts);
export { filterRouter, productRouter };
