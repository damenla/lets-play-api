import type { Group } from "../../types/group";
import type { IGroupRepository } from "../../infrastructure/persistence/group-repository";

export interface UpdateGroupDto {
    groupId: string;
    requesterUserId: string;
    name?: string;
    description?: string;
    isActive?: boolean;
}

export class UpdateGroupUseCase {
    constructor(private readonly groupRepository: IGroupRepository) {}

    static readonly Errors = {
        GROUP_NOT_FOUND: { code: "GROUP_NOT_FOUND", message: "Group not found" },
        NOT_A_GROUP_MEMBER: {
            code: "NOT_A_GROUP_MEMBER",
            message: "You are not a member of this group"
        },
        ONLY_OWNER_CAN_EDIT_METADATA: {
            code: "ONLY_OWNER_CAN_EDIT_METADATA",
            message: "Only owners can edit group metadata"
        },
        INSUFFICIENT_PERMISSIONS: {
            code: "INSUFFICIENT_PERMISSIONS",
            message: "Only owners can manage group status"
        },
        ONLY_OLDEST_OWNER_CAN_DEACTIVATE_GROUP: {
            code: "ONLY_OLDEST_OWNER_CAN_DEACTIVATE_GROUP",
            message: "Only the oldest active owner can deactivate the group"
        },
        GROUP_NAME_ALREADY_EXISTS: {
            code: "GROUP_NAME_ALREADY_EXISTS",
            message: "Group name already exists"
        }
    };

    async execute(dto: UpdateGroupDto): Promise<Group> {
        const group = await this.validate(dto);

        const now = new Date();
        const updatedGroup: Group = {
            ...group,
            name: dto.name !== undefined ? dto.name : group.name,
            description: dto.description !== undefined ? dto.description : group.description,
            isActive: dto.isActive !== undefined ? dto.isActive : group.isActive,
            updatedAt: now
        };

        return this.groupRepository.update(updatedGroup);
    }

    private async validate(dto: UpdateGroupDto): Promise<Group> {
        // 1. Check if group exists
        const group = await this.groupRepository.findById(dto.groupId);
        if (!group) {
            throw new Error(UpdateGroupUseCase.Errors.GROUP_NOT_FOUND.code);
        }

        // 2. Get members to verify permissions and seniority
        const members = await this.groupRepository.findMembersByGroupId(dto.groupId);
        const requesterMembership = members.find((m) => m.userId === dto.requesterUserId);

        if (!requesterMembership) {
            throw new Error(UpdateGroupUseCase.Errors.NOT_A_GROUP_MEMBER.code);
        }

        // 3. Metadata edit permissions (Name/Description -> Only Owner)
        if (dto.name !== undefined || dto.description !== undefined) {
            if (requesterMembership.role !== "owner") {
                throw new Error(UpdateGroupUseCase.Errors.ONLY_OWNER_CAN_EDIT_METADATA.code);
            }
        }

        // 4. Status management permissions (Only Owner)
        if (dto.isActive !== undefined) {
            if (requesterMembership.role !== "owner") {
                throw new Error(UpdateGroupUseCase.Errors.INSUFFICIENT_PERMISSIONS.code);
            }

            // Seniority rule for deactivation
            if (dto.isActive === false && group.isActive === true) {
                const activeOwners = members
                    .filter((m) => m.role === "owner" && m.status === "accepted")
                    .sort(
                        (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
                    );

                if (activeOwners.length > 0 && activeOwners[0].userId !== dto.requesterUserId) {
                    throw new Error(
                        UpdateGroupUseCase.Errors.ONLY_OLDEST_OWNER_CAN_DEACTIVATE_GROUP.code
                    );
                }
            }
        }

        // 5. Name uniqueness validation (if name is being changed)
        if (dto.name !== undefined && dto.name !== group.name) {
            const existingGroup = await this.groupRepository.findByName(dto.name);
            if (existingGroup) {
                throw new Error(UpdateGroupUseCase.Errors.GROUP_NAME_ALREADY_EXISTS.code);
            }
        }

        return group;
    }
}
