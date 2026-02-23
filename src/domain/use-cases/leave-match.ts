import type { IMatchRepository } from "../../infrastructure/persistence/match-repository";
import type { IGroupRepository } from "../../infrastructure/persistence/group-repository";

export interface LeaveMatchDto {
    matchId: string;
    userId: string;
}

export class LeaveMatchUseCase {
    constructor(
        private readonly matchRepository: IMatchRepository,
        private readonly groupRepository: IGroupRepository
    ) {}

    static readonly Errors = {
        MATCH_NOT_FOUND: { code: "MATCH_NOT_FOUND", message: "Match not found" },
        NOT_REGISTERED: {
            code: "NOT_REGISTERED",
            message: "You are not registered for this match"
        },
        MATCH_NOT_PLANNING: {
            code: "MATCH_NOT_PLANNING",
            message: "Cannot leave match outside planning state"
        }
    };

    async execute(dto: LeaveMatchDto): Promise<void> {
        const { match, registration } = await this.validate(dto);

        const group = await this.groupRepository.findById(match.groupId);
        if (!group) {
            throw new Error("GROUP_NOT_FOUND");
        }

        const now = new Date();
        const scheduledTime = match.scheduledAt.getTime();
        const limitTime = scheduledTime - group.meritConfigHoursBeforePenalty * 60 * 60 * 1000;

        if (now.getTime() > limitTime) {
            // Late cancellation: Update record instead of deleting
            registration.isLateCancellation = true;
            await this.matchRepository.updateRegistration(registration);
        } else {
            // Early cancellation: Remove record
            await this.matchRepository.removeRegistration(dto.matchId, dto.userId);
        }
    }

    private async validate(dto: LeaveMatchDto) {
        const match = await this.matchRepository.findById(dto.matchId);
        if (!match) {
            throw new Error(LeaveMatchUseCase.Errors.MATCH_NOT_FOUND.code);
        }

        if (match.status !== "planning") {
            throw new Error(LeaveMatchUseCase.Errors.MATCH_NOT_PLANNING.code);
        }

        const registration = await this.matchRepository.findRegistration(dto.matchId, dto.userId);
        if (!registration) {
            throw new Error(LeaveMatchUseCase.Errors.NOT_REGISTERED.code);
        }

        return { match, registration };
    }
}
