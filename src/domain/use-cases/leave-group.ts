import type { IGroupRepository } from "../../infrastructure/persistence/group-repository";
import type { GroupMember } from "../../types/group";

export interface LeaveGroupDto {
    groupId: string;
    userId: string;
}

export class LeaveGroupUseCase {
    constructor(private readonly groupRepository: IGroupRepository) {}

    static readonly Errors = {
        GROUP_NOT_FOUND: { code: "GROUP_NOT_FOUND", message: "Group not found" },
        NOT_A_GROUP_MEMBER: {
            code: "NOT_A_GROUP_MEMBER",
            message: "You are not a member of this group"
        },
        MINIMUM_OWNER_REQUIRED: {
            code: "MINIMUM_OWNER_REQUIRED",
            message: "A group must have at least one owner. Nominate another owner before leaving."
        }
    };

    async execute(dto: LeaveGroupDto): Promise<void> {
        await this.validate(dto);
        await this.groupRepository.removeMember(dto.groupId, dto.userId);
    }

    private async validate(dto: LeaveGroupDto): Promise<void> {
        // 1. Get all members to check group existence and membership
        const members = await this.groupRepository.findMembersByGroupId(dto.groupId);
        if (members.length === 0) {
            // If repository returns empty, maybe group doesn't exist or has no members
            // Let's verify group existence explicitly
            const group = await this.groupRepository.findById(dto.groupId);
            if (!group) {
                throw new Error(LeaveGroupUseCase.Errors.GROUP_NOT_FOUND.code);
            }
        }

        const userMembership = members.find((m) => m.userId === dto.userId);
        if (!userMembership) {
            throw new Error(LeaveGroupUseCase.Errors.NOT_A_GROUP_MEMBER.code);
        }

        // 2. Rule: Minimum Owners
        if (userMembership.role === "owner" && userMembership.status === "accepted") {
            const otherActiveOwners = members.filter(
                (m) => m.role === "owner" && m.status === "accepted" && m.userId !== dto.userId
            );

            if (otherActiveOwners.length === 0) {
                throw new Error(LeaveGroupUseCase.Errors.MINIMUM_OWNER_REQUIRED.code);
            }
        }
    }
}
