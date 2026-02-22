import { GROUP_MEMBER_ROLES, GroupMember, GroupMemberRole } from "../../types/group";
import type { IGroupRepository } from "../../infrastructure/persistence/group-repository";

export interface ChangeMemberRoleDto {
    groupId: string;
    targetUserId: string;
    requesterUserId: string;
    newRole: GroupMemberRole;
}

export class ChangeMemberRoleUseCase {
    constructor(private readonly groupRepository: IGroupRepository) {}

    static readonly Errors = {
        GROUP_NOT_FOUND: { code: "GROUP_NOT_FOUND", message: "Group not found" },
        NOT_A_GROUP_MEMBER: {
            code: "NOT_A_GROUP_MEMBER",
            message: "User is not a member of this group"
        },
        INSUFFICIENT_PERMISSIONS: {
            code: "INSUFFICIENT_PERMISSIONS",
            message: "Only owners can change roles"
        },
        INVALID_ROLE: { code: "INVALID_ROLE", message: "The provided role is invalid" },
        MINIMUM_OWNER_REQUIRED: {
            code: "MINIMUM_OWNER_REQUIRED",
            message: "A group must have at least one owner"
        },
        ONLY_OLDEST_OWNER_CAN_DEMOTE_OWNERS: {
            code: "ONLY_OLDEST_OWNER_CAN_DEMOTE_OWNERS",
            message: "Only the oldest active owner can demote another owner"
        }
    };

    async execute(dto: ChangeMemberRoleDto): Promise<GroupMember> {
        const { targetMember, requesterMember, groupMembers } = await this.validate(dto);

        const now = new Date();
        const updatedMember: GroupMember = {
            ...targetMember,
            role: dto.newRole,
            updatedAt: now
        };

        await this.groupRepository.updateMember(updatedMember);
        return updatedMember;
    }

    private async validate(dto: ChangeMemberRoleDto): Promise<{
        targetMember: GroupMember;
        requesterMember: GroupMember;
        groupMembers: GroupMember[];
    }> {
        // 1. Validar que el rol sea uno de los permitidos (Runtime check usando la constante compartida)
        if (!GROUP_MEMBER_ROLES.includes(dto.newRole)) {
            throw new Error(ChangeMemberRoleUseCase.Errors.INVALID_ROLE.code);
        }

        // 2. Obtener todos los miembros del grupo
        const groupMembers = await this.groupRepository.findMembersByGroupId(dto.groupId);
        if (groupMembers.length === 0) {
            throw new Error(ChangeMemberRoleUseCase.Errors.GROUP_NOT_FOUND.code);
        }

        const targetMember = groupMembers.find((m) => m.userId === dto.targetUserId);
        const requesterMember = groupMembers.find((m) => m.userId === dto.requesterUserId);

        if (!targetMember || !requesterMember) {
            throw new Error(ChangeMemberRoleUseCase.Errors.NOT_A_GROUP_MEMBER.code);
        }

        // 3. Solo un 'owner' puede cambiar roles
        if (requesterMember.role !== "owner") {
            throw new Error(ChangeMemberRoleUseCase.Errors.INSUFFICIENT_PERMISSIONS.code);
        }

        // 4. Reglas si el objetivo es un Owner (degradación)
        if (targetMember.role === "owner" && dto.newRole !== "owner") {
            const activeOwners = groupMembers.filter(
                (m) => m.role === "owner" && m.status === "accepted"
            );

            // No se puede degradar al último owner
            if (activeOwners.length <= 1) {
                throw new Error(ChangeMemberRoleUseCase.Errors.MINIMUM_OWNER_REQUIRED.code);
            }

            // Solo el owner más antiguo puede degradar a otros owners
            const oldestOwner = activeOwners.sort(
                (a, b) => a.createdAt.getTime() - b.createdAt.getTime()
            )[0];
            if (requesterMember.userId !== oldestOwner.userId) {
                throw new Error(
                    ChangeMemberRoleUseCase.Errors.ONLY_OLDEST_OWNER_CAN_DEMOTE_OWNERS.code
                );
            }
        }

        return { targetMember, requesterMember, groupMembers };
    }
}
