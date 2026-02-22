import type { GroupMember, GroupMemberStatus } from "../../types/group";
import type { IGroupRepository } from "../../infrastructure/persistence/group-repository";

export interface ManageInvitationDto {
    groupId: string;
    userId: string;
    status: GroupMemberStatus;
}

export class ManageInvitationUseCase {
    constructor(private readonly groupRepository: IGroupRepository) {}

    static readonly Errors = {
        NO_INVITATION_FOUND: {
            code: "NO_INVITATION_FOUND",
            message: "No invitation found for this user in this group"
        },
        INVALID_STATUS: { code: "INVALID_STATUS", message: "Invalid status for invitation" },
        ALREADY_PROCESSED: {
            code: "ALREADY_PROCESSED",
            message: "Invitation has already been accepted or rejected"
        }
    };

    async execute(dto: ManageInvitationDto): Promise<GroupMember> {
        const membership = await this.validate(dto);

        const now = new Date();
        const updatedMember: GroupMember = {
            ...membership,
            status: dto.status,
            statusUpdatedAt: now,
            updatedAt: now
        };

        await this.groupRepository.updateMember(updatedMember);
        return updatedMember;
    }

    private async validate(dto: ManageInvitationDto): Promise<GroupMember> {
        // 1. Check if status is valid for this action
        if (dto.status !== "accepted" && dto.status !== "rejected") {
            throw new Error(ManageInvitationUseCase.Errors.INVALID_STATUS.code);
        }

        // 2. Check if the invitation exists
        const membership = await this.groupRepository.findMember(dto.groupId, dto.userId);
        if (!membership) {
            throw new Error(ManageInvitationUseCase.Errors.NO_INVITATION_FOUND.code);
        }

        // 3. Ensure current status is 'invited'
        if (membership.status !== "invited") {
            throw new Error(ManageInvitationUseCase.Errors.ALREADY_PROCESSED.code);
        }

        return membership;
    }
}
