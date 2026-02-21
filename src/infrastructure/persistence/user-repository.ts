import type { User } from "../../types/user";

export interface IUserRepository {
    create(user: User, passwordHash: string): Promise<User>;
    findByEmail(email: string): Promise<User | null>;
    findByUsername(username: string): Promise<User | null>;
    findById(id: string): Promise<User | null>;
    update(id: string, user: Partial<User>): Promise<User | null>;
    updatePassword(id: string, passwordHash: string): Promise<void>;
    getPasswordHash(id: string): Promise<string | null>;
}
