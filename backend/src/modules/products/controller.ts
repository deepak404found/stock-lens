import type { Request, Response } from "express";
import { sendSuccess } from "../../shared/api-response.js";
import { productsService } from "./service.js";

export class ProductsController {
  list = async (_req: Request, res: Response) => {
    const items = await productsService.listProducts();
    return sendSuccess(res, { products: items }, "Success");
  };
}

export const productsController = new ProductsController();
