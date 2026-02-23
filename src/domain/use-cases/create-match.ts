import { randomUUID } from "node:crypto";
import type { Match, SportType, RGB } from "../../types/match";
import type { IMatchRepository } from "../../infrastructure/persistence/match-repository";
import type { IGroupRepository } from "../../infrastructure/persistence/group-repository";

export interface CreateMatchDto {
    groupId: string;
    requesterUserId: string;
    sport: SportType;
    scheduledAt: string;
    durationMinutes: number;
    capacity: number;
    location: string;
    teamAColor: RGB;
    teamBColor: RGB;
}

export class CreateMatchUseCase {
    constructor(
        private readonly matchRepository: IMatchRepository,
        private readonly groupRepository: IGroupRepository
    ) {}

    static readonly Errors = {
        GROUP_NOT_FOUND: { code: "GROUP_NOT_FOUND", message: "Group not found" },
        NOT_A_GROUP_MEMBER: {
            code: "NOT_A_GROUP_MEMBER",
            message: "You are not a member of this group"
        },
        INSUFFICIENT_PERMISSIONS: {
            code: "INSUFFICIENT_PERMISSIONS",
            message: "Only owners can create matches"
        }
    };

    async execute(dto: CreateMatchDto): Promise<Match> {
        await this.validate(dto);

        const now = new Date();
        const match: Match = {
            id: randomUUID(),
            groupId: dto.groupId,
            sport: dto.sport,
            scheduledAt: new Date(dto.scheduledAt),
            durationMinutes: dto.durationMinutes,
            capacity: dto.capacity,
            location: dto.location,
            status: "planning",
            isLocked: false,
            teamAColor: dto.teamAColor,
            teamBColor: dto.teamBColor,
            createdAt: now,
            updatedAt: now
        };

        return this.matchRepository.create(match);
    }

    private async validate(dto: CreateMatchDto): Promise<void> {
        const group = await this.groupRepository.findById(dto.groupId);
        if (!group) {
            throw new Error(CreateMatchUseCase.Errors.GROUP_NOT_FOUND.code);
        }

        const membership = await this.groupRepository.findMember(dto.groupId, dto.requesterUserId);
        if (!membership) {
            throw new Error(CreateMatchUseCase.Errors.NOT_A_GROUP_MEMBER.code);
        }

        if (membership.role !== "owner") {
            throw new Error(CreateMatchUseCase.Errors.INSUFFICIENT_PERMISSIONS.code);
        }
    }
}
