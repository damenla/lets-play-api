import type { MatchRegistration, PlayerAttitude } from "../../types/match";
import type { IMatchRepository } from "../../infrastructure/persistence/match-repository";
import type { IGroupRepository } from "../../infrastructure/persistence/group-repository";

export interface ParticipantWithMerits extends MatchRegistration {
    totalPoints: number;
    isReserveCalculated: boolean;
}

export class ListParticipantsUseCase {
    constructor(
        private readonly matchRepository: IMatchRepository,
        private readonly groupRepository: IGroupRepository
    ) {}

    static readonly Errors = {
        MATCH_NOT_FOUND: { code: "MATCH_NOT_FOUND", message: "Match not found" }
    };

    async execute(matchId: string): Promise<ParticipantWithMerits[]> {
        const match = await this.matchRepository.findById(matchId);
        if (!match) {
            throw new Error(ListParticipantsUseCase.Errors.MATCH_NOT_FOUND.code);
        }

        const group = await this.groupRepository.findById(match.groupId);
        if (!group) throw new Error("GROUP_NOT_FOUND");

        // 1. Get all registrations for current match
        const registrations = await this.matchRepository.findRegistrationsByMatchId(matchId);

        // 2. Get last X finished matches for merit calculation (excluding current)
        const pastMatches = await this.matchRepository.findLastMatchesByGroupId(
            match.groupId,
            group.meritConfigMaxMatches
        );
        const pastMatchIds = pastMatches.map((m) => m.id).filter((id) => id !== matchId);

        // 3. Calculate points for each participant
        const participantsWithPoints = await Promise.all(
            registrations.map(async (reg) => {
                const points = await this.calculatePoints(reg.userId, pastMatchIds, group);
                return {
                    ...reg,
                    totalPoints: points
                };
            })
        );

        // 4. Sort by Points (DESC) then by Registration Date (ASC)
        participantsWithPoints.sort((a, b) => {
            if (b.totalPoints !== a.totalPoints) {
                return b.totalPoints - a.totalPoints;
            }
            return a.registeredAt.getTime() - b.registeredAt.getTime();
        });

        // 5. Calculate on-the-fly who is reserve based on capacity
        // Note: isLateCancellation users go to the end
        const activeParticipants = participantsWithPoints.filter((p) => !p.isLateCancellation);
        const penalizedParticipants = participantsWithPoints.filter((p) => p.isLateCancellation);

        const finalSorted = [...activeParticipants, ...penalizedParticipants];

        return finalSorted.map((p, index) => ({
            ...p,
            isReserveCalculated: index >= match.capacity
        }));
    }

    private async calculatePoints(
        userId: string,
        pastMatchIds: string[],
        group: any
    ): Promise<number> {
        if (pastMatchIds.length === 0) return 0;

        const history = await this.matchRepository.findRegistrationsByUserInGroupsMatches(
            userId,
            pastMatchIds
        );

        let total = 0;
        for (const reg of history) {
            if (reg.isLateCancellation) {
                total += group.meritPointsLateCancel;
                continue; // If they cancelled late, we don't count other points for that match
            }

            if (reg.didPlay) {
                total += group.meritPointsPlayed;
                if (reg.attitude === "positive") total += group.meritPointsPositiveAttitude;
                if (reg.attitude === "negative") total += group.meritPointsNegativeAttitude;
            } else if (reg.isReserve) {
                total += group.meritPointsReserve;
            } else {
                // Was not a reserve but didn't play -> No Show
                total += group.meritPointsNoShow;
            }
        }
        return total;
    }
}
