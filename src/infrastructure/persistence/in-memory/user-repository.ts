import type { User } from "../../../types/user";
import type { IUserRepository } from "../user-repository";

export class InMemoryUserRepository implements IUserRepository {
    private users: User[] = [];
    private passwords: Map<string, string> = new Map(); // Store passwords separately indexed by userId

    async create(user: User, passwordHash: string): Promise<User> {
        user.createdAt = new Date();
        user.updatedAt = new Date();
        this.users.push(user);
        this.passwords.set(user.id, passwordHash);
        return user;
    }

    async findByEmail(email: string): Promise<User | null> {
        const user = this.users.find((u) => u.email === email);
        return user || null;
    }

    async findByUsername(username: string): Promise<User | null> {
        const user = this.users.find((u) => u.username === username);
        return user || null;
    }

    async findById(id: string): Promise<User | null> {
        const user = this.users.find((u) => u.id === id);
        return user || null;
    }

    async update(id: string, user: Partial<User>): Promise<User | null> {
        const index = this.users.findIndex((u) => u.id === id);
        if (index === -1) {
            return null;
        }
        const updatedUser = { ...this.users[index], ...user, updatedAt: new Date() };
        this.users[index] = updatedUser;
        return updatedUser;
    }

    async updatePassword(id: string, passwordHash: string): Promise<void> {
        if (!this.users.some(u => u.id === id)) {
            return;
        }
        this.passwords.set(id, passwordHash);
    }
}
