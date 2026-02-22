import type { GroupMember } from "../../types/group";
import type { IGroupRepository } from "../../infrastructure/persistence/group-repository";
import type { IUserRepository } from "../../infrastructure/persistence/user-repository";

export interface InviteMemberDto {
    groupId: string;
    targetUserId: string;
    invitedByUserId: string;
}

export class InviteMemberUseCase {
    constructor(
        private readonly groupRepository: IGroupRepository,
        private readonly userRepository: IUserRepository
    ) {}

    static readonly Errors = {
        GROUP_NOT_FOUND: { code: "GROUP_NOT_FOUND", message: "Group not found" },
        USER_NOT_FOUND: { code: "USER_NOT_FOUND", message: "User not found" },
        USER_INACTIVE: { code: "USER_INACTIVE", message: "User is inactive" },
        USER_ALREADY_IN_GROUP: {
            code: "USER_ALREADY_IN_GROUP",
            message: "User is already in the group"
        },
        INSUFFICIENT_PERMISSIONS: {
            code: "INSUFFICIENT_PERMISSIONS",
            message: "Only owners and managers can invite members"
        },
        NOT_A_GROUP_MEMBER: {
            code: "NOT_A_GROUP_MEMBER",
            message: "You are not a member of this group"
        }
    };

    async execute(dto: InviteMemberDto): Promise<GroupMember> {
        await this.validate(dto);

        const now = new Date();
        const newMember: GroupMember = {
            groupId: dto.groupId,
            userId: dto.targetUserId,
            status: "invited",
            role: "member",
            statusUpdatedAt: now,
            createdAt: now,
            updatedAt: now
        };

        await this.groupRepository.addMember(newMember);
        return newMember;
    }

    private async validate(dto: InviteMemberDto): Promise<void> {
        // 1. Check if group exists
        const group = await this.groupRepository.findById(dto.groupId);
        if (!group) {
            throw new Error(InviteMemberUseCase.Errors.GROUP_NOT_FOUND.code);
        }

        // 2. Check if the inviter has permissions (must be owner or manager)
        const inviterMembership = await this.groupRepository.findMember(
            dto.groupId,
            dto.invitedByUserId
        );
        if (!inviterMembership) {
            throw new Error(InviteMemberUseCase.Errors.NOT_A_GROUP_MEMBER.code);
        }
        if (inviterMembership.role !== "owner" && inviterMembership.role !== "manager") {
            throw new Error(InviteMemberUseCase.Errors.INSUFFICIENT_PERMISSIONS.code);
        }

        // 3. Check if target user exists and is active
        const targetUser = await this.userRepository.findById(dto.targetUserId);
        if (!targetUser) {
            throw new Error(InviteMemberUseCase.Errors.USER_NOT_FOUND.code);
        }
        if (!targetUser.isActive) {
            throw new Error(InviteMemberUseCase.Errors.USER_INACTIVE.code);
        }

        // 4. Check if already a member
        const existingMember = await this.groupRepository.findMember(dto.groupId, dto.targetUserId);
        if (existingMember) {
            throw new Error(InviteMemberUseCase.Errors.USER_ALREADY_IN_GROUP.code);
        }
    }
}
