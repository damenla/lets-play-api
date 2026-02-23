import { randomUUID } from "node:crypto";
import type { Group, GroupMember } from "../../types/group";
import type { IGroupRepository } from "../../infrastructure/persistence/group-repository";
import type { IUserRepository } from "../../infrastructure/persistence/user-repository";

export interface CreateGroupDto {
    name: string;
    description?: string;
    meritConfigMaxMatches?: number;
    meritPointsPlayed?: number;
    meritPointsNoShow?: number;
    meritPointsReserve?: number;
    meritPointsPositiveAttitude?: number;
    meritPointsNegativeAttitude?: number;
    meritConfigHoursBeforePenalty?: number;
    meritPointsLateCancel?: number;
}

export class CreateGroupUseCase {
    constructor(
        private readonly groupRepository: IGroupRepository,
        private readonly userRepository: IUserRepository
    ) {}

    static readonly Errors = {
        REQUIRED_FIELD_MISSING: {
            code: "REQUIRED_FIELD_MISSING",
            message: "Group name is required"
        },
        GROUP_NAME_ALREADY_EXISTS: {
            code: "GROUP_NAME_ALREADY_EXISTS",
            message: "Group name already exists"
        },
        USER_NOT_FOUND: {
            code: "USER_NOT_FOUND",
            message: "User not found"
        },
        USER_INACTIVE: {
            code: "USER_INACTIVE",
            message: "Inactive users cannot create groups"
        }
    };

    async execute(userId: string, input: CreateGroupDto): Promise<Group> {
        await this.validate(userId, input);

        const now = new Date();
        const group: Group = {
            id: randomUUID(),
            name: input.name,
            description: input.description,
            isActive: true,
            // Use custom config if provided, otherwise defaults
            meritConfigMaxMatches: input.meritConfigMaxMatches ?? 10,
            meritPointsPlayed: input.meritPointsPlayed ?? 3,
            meritPointsNoShow: input.meritPointsNoShow ?? -5,
            meritPointsReserve: input.meritPointsReserve ?? 1,
            meritPointsPositiveAttitude: input.meritPointsPositiveAttitude ?? 1,
            meritPointsNegativeAttitude: input.meritPointsNegativeAttitude ?? -1,
            meritConfigHoursBeforePenalty: input.meritConfigHoursBeforePenalty ?? 12,
            meritPointsLateCancel: input.meritPointsLateCancel ?? -2,
            createdAt: now,
            updatedAt: now
        };

        const createdGroup = await this.groupRepository.create(group);

        // Automatically add the creator as the first owner
        const ownerMember: GroupMember = {
            groupId: createdGroup.id,
            userId: userId,
            role: "owner",
            status: "accepted",
            statusUpdatedAt: now,
            createdAt: now,
            updatedAt: now
        };

        await this.groupRepository.addMember(ownerMember);

        return createdGroup;
    }

    private async validate(userId: string, input: CreateGroupDto): Promise<void> {
        // 1. Check required fields
        if (!input.name) {
            throw new Error(CreateGroupUseCase.Errors.REQUIRED_FIELD_MISSING.code);
        }

        // 2. Check if user exists and is active
        const user = await this.userRepository.findById(userId);
        if (!user) {
            throw new Error(CreateGroupUseCase.Errors.USER_NOT_FOUND.code);
        }
        if (!user.isActive) {
            throw new Error(CreateGroupUseCase.Errors.USER_INACTIVE.code);
        }

        // 3. Check name uniqueness
        const existingGroup = await this.groupRepository.findByName(input.name);
        if (existingGroup) {
            throw new Error(CreateGroupUseCase.Errors.GROUP_NAME_ALREADY_EXISTS.code);
        }
    }
}
