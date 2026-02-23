import type { Match, MatchRegistration } from "../../../types/match";
import type { IMatchRepository } from "../match-repository";

export class InMemoryMatchRepository implements IMatchRepository {
    private matches: Match[] = [];
    private registrations: MatchRegistration[] = [];

    async create(match: Match): Promise<Match> {
        this.matches.push(match);
        return match;
    }

    async update(match: Match): Promise<Match> {
        const index = this.matches.findIndex((m) => m.id === match.id);
        if (index === -1) throw new Error("MATCH_NOT_FOUND");
        this.matches[index] = match;
        return match;
    }

    async findById(id: string): Promise<Match | null> {
        return this.matches.find((m) => m.id === id) || null;
    }

    async findByGroupId(groupId: string): Promise<Match[]> {
        return this.matches.filter((m) => m.groupId === groupId);
    }

    async addRegistration(registration: MatchRegistration): Promise<void> {
        this.registrations.push(registration);
    }

    async updateRegistration(registration: MatchRegistration): Promise<void> {
        const index = this.registrations.findIndex(
            (r) => r.matchId === registration.matchId && r.userId === registration.userId
        );
        if (index !== -1) {
            this.registrations[index] = registration;
        }
    }

    async removeRegistration(matchId: string, userId: string): Promise<void> {
        this.registrations = this.registrations.filter(
            (r) => !(r.matchId === matchId && r.userId === userId)
        );
    }

    async findRegistrationsByMatchId(matchId: string): Promise<MatchRegistration[]> {
        return this.registrations.filter((r) => r.matchId === matchId);
    }

    async findRegistration(matchId: string, userId: string): Promise<MatchRegistration | null> {
        return this.registrations.find((r) => r.matchId === matchId && r.userId === userId) || null;
    }

    async findLastMatchesByGroupId(groupId: string, limit: number): Promise<Match[]> {
        return this.matches
            .filter((m) => m.groupId === groupId && m.status === "finished")
            .sort((a, b) => b.scheduledAt.getTime() - a.scheduledAt.getTime())
            .slice(0, limit);
    }

    async findRegistrationsByUserInGroupsMatches(
        userId: string,
        matchIds: string[]
    ): Promise<MatchRegistration[]> {
        return this.registrations.filter(
            (r) => r.userId === userId && matchIds.includes(r.matchId)
        );
    }
}
