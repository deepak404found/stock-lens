import { inventoryRepository } from "../inventory/inventory.repository.js";

export class TransactionRepository {
  list = inventoryRepository.listTransactions.bind(inventoryRepository);
  count = inventoryRepository.countTransactions.bind(inventoryRepository);
}

export const transactionRepository = new TransactionRepository();
