import type { Match, MatchRegistration } from "../../types/match";

export interface IMatchRepository {
    create(match: Match): Promise<Match>;
    update(match: Match): Promise<Match>;
    findById(id: string): Promise<Match | null>;
    findByGroupId(groupId: string): Promise<Match[]>;

    // Participation
    addRegistration(registration: MatchRegistration): Promise<void>;
    updateRegistration(registration: MatchRegistration): Promise<void>;
    removeRegistration(matchId: string, userId: string): Promise<void>;
    findRegistrationsByMatchId(matchId: string): Promise<MatchRegistration[]>;
    findRegistration(matchId: string, userId: string): Promise<MatchRegistration | null>;

    // Historical data for merits
    findLastMatchesByGroupId(groupId: string, limit: number): Promise<Match[]>;
    findRegistrationsByUserInGroupsMatches(
        userId: string,
        matchIds: string[]
    ): Promise<MatchRegistration[]>;
}
