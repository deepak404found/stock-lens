import { transactionRepository } from "./repository.js";
import type { ListTransactionsQuery } from "./validation.js";

export class TransactionService {
  async list(query: ListTransactionsQuery) {
    const [items, total] = await Promise.all([
      transactionRepository.list(query.limit, query.offset),
      transactionRepository.count(),
    ]);

    const page = Math.floor(query.offset / query.limit) + 1;
    const pageCount = Math.max(1, Math.ceil(total / query.limit));

    return {
      transactions: items,
      pagination: {
        limit: query.limit,
        offset: query.offset,
        total,
        page,
        pageCount,
        hasNext: query.offset + query.limit < total,
        hasPrev: query.offset > 0,
      },
    };
  }
}

export const transactionService = new TransactionService();
