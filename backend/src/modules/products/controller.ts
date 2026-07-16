import type { Request, Response } from "express";
import { sendSuccess } from "../../shared/api-response.js";
import { productsService } from "./service.js";

export class ProductsController {
  list = async (_req: Request, res: Response) => {
    const items = await productsService.listProducts();
    return sendSuccess(res, { products: items }, "Success");
  };

  batches = async (req: Request, res: Response) => {
    const productId = req.params.productId as string;
    const data = await productsService.getFifoBatches(productId);
    return sendSuccess(res, data, "Success");
  };
}

export const productsController = new ProductsController();
