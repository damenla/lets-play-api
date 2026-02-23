import type { Match } from "../../types/match";
import type { IMatchRepository } from "../../infrastructure/persistence/match-repository";
import type { IGroupRepository } from "../../infrastructure/persistence/group-repository";

export interface LockMatchDto {
    matchId: string;
    requesterUserId: string;
}

export class LockMatchUseCase {
    constructor(
        private readonly matchRepository: IMatchRepository,
        private readonly groupRepository: IGroupRepository
    ) {}

    static readonly Errors = {
        MATCH_NOT_FOUND: { code: "MATCH_NOT_FOUND", message: "Match not found" },
        INSUFFICIENT_PERMISSIONS: {
            code: "INSUFFICIENT_PERMISSIONS",
            message: "Only owners can lock matches"
        },
        MATCH_NOT_FINISHED: {
            code: "MATCH_NOT_FINISHED",
            message: "Only finished matches can be locked"
        }
    };

    async execute(dto: LockMatchDto): Promise<void> {
        const match = await this.validate(dto);

        match.isLocked = true;
        match.updatedAt = new Date();
        await this.matchRepository.update(match);
    }

    private async validate(dto: LockMatchDto): Promise<Match> {
        const match = await this.matchRepository.findById(dto.matchId);
        if (!match) throw new Error(LockMatchUseCase.Errors.MATCH_NOT_FOUND.code);

        // 1. Check permissions first (403)
        const membership = await this.groupRepository.findMember(
            match.groupId,
            dto.requesterUserId
        );
        if (!membership || membership.role !== "owner") {
            throw new Error(LockMatchUseCase.Errors.INSUFFICIENT_PERMISSIONS.code);
        }

        // 2. Then check match state (400)
        if (match.status !== "finished") {
            throw new Error(LockMatchUseCase.Errors.MATCH_NOT_FINISHED.code);
        }

        return match;
    }
}
