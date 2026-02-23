import type { Match, SportType, RGB } from "../../types/match";
import type { IMatchRepository } from "../../infrastructure/persistence/match-repository";
import type { IGroupRepository } from "../../infrastructure/persistence/group-repository";

export interface UpdateMatchDto {
    matchId: string;
    requesterUserId: string;
    sport?: SportType;
    scheduledAt?: string;
    durationMinutes?: number;
    capacity?: number;
    location?: string;
    teamAColor?: RGB;
    teamBColor?: RGB;
}

export class UpdateMatchUseCase {
    constructor(
        private readonly matchRepository: IMatchRepository,
        private readonly groupRepository: IGroupRepository
    ) {}

    static readonly Errors = {
        MATCH_NOT_FOUND: { code: "MATCH_NOT_FOUND", message: "Match not found" },
        INSUFFICIENT_PERMISSIONS: {
            code: "INSUFFICIENT_PERMISSIONS",
            message: "Only owners can update matches"
        },
        MATCH_LOCKED: { code: "MATCH_LOCKED", message: "Match is locked and cannot be modified" }
    };

    async execute(dto: UpdateMatchDto): Promise<Match> {
        const match = await this.validate(dto);

        if (dto.sport !== undefined) match.sport = dto.sport;
        if (dto.scheduledAt !== undefined) match.scheduledAt = new Date(dto.scheduledAt);
        if (dto.durationMinutes !== undefined) match.durationMinutes = dto.durationMinutes;
        if (dto.capacity !== undefined) match.capacity = dto.capacity;
        if (dto.location !== undefined) match.location = dto.location;
        if (dto.teamAColor !== undefined) match.teamAColor = dto.teamAColor;
        if (dto.teamBColor !== undefined) match.teamBColor = dto.teamBColor;

        match.updatedAt = new Date();
        return this.matchRepository.update(match);
    }

    private async validate(dto: UpdateMatchDto): Promise<Match> {
        const match = await this.matchRepository.findById(dto.matchId);
        if (!match) throw new Error(UpdateMatchUseCase.Errors.MATCH_NOT_FOUND.code);

        if (match.isLocked) throw new Error(UpdateMatchUseCase.Errors.MATCH_LOCKED.code);

        const membership = await this.groupRepository.findMember(
            match.groupId,
            dto.requesterUserId
        );
        if (!membership || membership.role !== "owner") {
            throw new Error(UpdateMatchUseCase.Errors.INSUFFICIENT_PERMISSIONS.code);
        }

        return match;
    }
}
