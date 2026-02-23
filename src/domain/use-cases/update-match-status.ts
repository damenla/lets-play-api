import type { MatchStatus, Match } from "../../types/match";
import type { IMatchRepository } from "../../infrastructure/persistence/match-repository";
import type { IGroupRepository } from "../../infrastructure/persistence/group-repository";
import { ListParticipantsUseCase } from "./list-participants";

export interface UpdateMatchStatusDto {
    matchId: string;
    requesterUserId: string;
    status: MatchStatus;
}

export class UpdateMatchStatusUseCase {
    constructor(
        private readonly matchRepository: IMatchRepository,
        private readonly groupRepository: IGroupRepository,
        private readonly listParticipantsUseCase: ListParticipantsUseCase
    ) {}

    static readonly Errors = {
        MATCH_NOT_FOUND: { code: "MATCH_NOT_FOUND", message: "Match not found" },
        INSUFFICIENT_PERMISSIONS: {
            code: "INSUFFICIENT_PERMISSIONS",
            message: "Only owners can change status"
        },
        INVALID_TRANSITION: { code: "INVALID_TRANSITION", message: "Invalid status transition" },
        MATCH_LOCKED: { code: "MATCH_LOCKED", message: "Match is locked and cannot be modified" }
    };

    async execute(dto: UpdateMatchStatusDto): Promise<void> {
        const match = await this.matchRepository.findById(dto.matchId);
        if (!match) throw new Error(UpdateMatchStatusUseCase.Errors.MATCH_NOT_FOUND.code);

        if (match.isLocked) throw new Error(UpdateMatchStatusUseCase.Errors.MATCH_LOCKED.code);

        await this.validatePermissions(match.groupId, dto.requesterUserId);
        this.validateTransition(match.status, dto.status);

        if (dto.status === "playing") {
            await this.sealReserves(dto.matchId);
        }

        match.status = dto.status;
        match.updatedAt = new Date();
        await this.matchRepository.update(match);
    }

    private async validatePermissions(groupId: string, userId: string) {
        const membership = await this.groupRepository.findMember(groupId, userId);
        if (!membership || membership.role !== "owner") {
            throw new Error(UpdateMatchStatusUseCase.Errors.INSUFFICIENT_PERMISSIONS.code);
        }
    }

    private validateTransition(current: MatchStatus, next: MatchStatus) {
        if (current === next) return;

        const allowed: Record<MatchStatus, MatchStatus[]> = {
            planning: ["playing", "cancelled"],
            playing: ["finished", "cancelled"],
            finished: [],
            cancelled: []
        };

        if (!allowed[current].includes(next)) {
            throw new Error(UpdateMatchStatusUseCase.Errors.INVALID_TRANSITION.code);
        }
    }

    private async sealReserves(matchId: string) {
        const participants = await this.listParticipantsUseCase.execute(matchId);
        for (const p of participants) {
            const reg = await this.matchRepository.findRegistration(matchId, p.userId);
            if (reg) {
                reg.isReserve = p.isReserveCalculated;
                await this.matchRepository.updateRegistration(reg);
            }
        }
    }
}
