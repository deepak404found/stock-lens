import { transactionRepository } from "./repository.js";
import type { ListTransactionsQuery } from "./validation.js";

export class TransactionService {
  async list(query: ListTransactionsQuery) {
    const [items, total] = await Promise.all([
      transactionRepository.list(query.limit, query.offset),
      transactionRepository.count(),
    ]);

    return {
      transactions: items,
      pagination: {
        limit: query.limit,
        offset: query.offset,
        total,
      },
    };
  }
}

export const transactionService = new TransactionService();
