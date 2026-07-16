import { eq } from "drizzle-orm";
import { db } from "../../config/db.js";
import { users } from "../../db/schema/index.js";

export class AuthRepository {
  async findByEmail(email: string) {
    const [user] = await db.select().from(users).where(eq(users.email, email)).limit(1);
    return user ?? null;
  }

  async findById(id: string) {
    const [user] = await db.select().from(users).where(eq(users.id, id)).limit(1);
    return user ?? null;
  }

  async updateLastLogin(id: string) {
    const [user] = await db
      .update(users)
      .set({ lastLoginAt: new Date(), updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning();
    return user ?? null;
  }
}

export const authRepository = new AuthRepository();
