import type { User } from "../../../types/user";
import type { IUserRepository } from "../user-repository";

export class InMemoryUserRepository implements IUserRepository {
    private users: User[] = [];

    async create(user: User): Promise<User> {
        this.users.push(user);
        return user;
    }

    async findByEmail(email: string): Promise<User | null> {
        const user = this.users.find((u) => u.email === email);
        return user || null;
    }
}
