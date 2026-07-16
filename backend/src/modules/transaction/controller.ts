import type { Request, Response } from "express";
import { sendSuccess } from "../../shared/api-response.js";
import { transactionService } from "./service.js";
import type { ListTransactionsQuery } from "./validation.js";

export class TransactionController {
  list = async (req: Request, res: Response) => {
    const data = await transactionService.list(req.query as unknown as ListTransactionsQuery);
    return sendSuccess(res, data, "Success");
  };
}

export const transactionController = new TransactionController();
