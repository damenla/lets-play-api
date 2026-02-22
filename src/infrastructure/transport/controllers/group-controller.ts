import type { Request, Response } from "express";
import { CreateGroupUseCase } from "../../../domain/use-cases/create-group";
import { ListGroupsUseCase } from "../../../domain/use-cases/list-groups";
import { GetGroupByIdUseCase } from "../../../domain/use-cases/get-group-by-id";
import { InviteMemberUseCase } from "../../../domain/use-cases/invite-member";
import { ManageInvitationUseCase } from "../../../domain/use-cases/manage-invitation";
import { ChangeMemberRoleUseCase } from "../../../domain/use-cases/change-member-role";
import { LeaveGroupUseCase } from "../../../domain/use-cases/leave-group";
import { UpdateGroupUseCase } from "../../../domain/use-cases/update-group";
import type { IGroupRepository } from "../../persistence/group-repository";
import { TokenPayload } from "../../../domain/services/token-service";

export class GroupController {
    constructor(
        private readonly createGroupUseCase: CreateGroupUseCase,
        private readonly listGroupsUseCase: ListGroupsUseCase,
        private readonly getGroupByIdUseCase: GetGroupByIdUseCase,
        private readonly inviteMemberUseCase: InviteMemberUseCase,
        private readonly manageInvitationUseCase: ManageInvitationUseCase,
        private readonly changeMemberRoleUseCase: ChangeMemberRoleUseCase,
        private readonly leaveGroupUseCase: LeaveGroupUseCase,
        private readonly updateGroupUseCase: UpdateGroupUseCase,
        private readonly groupRepository: IGroupRepository
    ) {}

    createGroup = async (req: Request, res: Response): Promise<void> => {
        const { name, description } = req.body;
        const authenticated_user: TokenPayload = (req as any).authenticated_user;

        try {
            const group = await this.createGroupUseCase.execute(authenticated_user.id, {
                name,
                description
            });
            res.status(201).json(group);
        } catch (error) {
            const isKnownError = error instanceof Error;

            if (
                isKnownError &&
                error.message === CreateGroupUseCase.Errors.REQUIRED_FIELD_MISSING.code
            ) {
                res.status(400).json(CreateGroupUseCase.Errors.REQUIRED_FIELD_MISSING);
            } else if (
                isKnownError &&
                error.message === CreateGroupUseCase.Errors.GROUP_NAME_ALREADY_EXISTS.code
            ) {
                res.status(409).json(CreateGroupUseCase.Errors.GROUP_NAME_ALREADY_EXISTS);
            } else if (
                isKnownError &&
                error.message === CreateGroupUseCase.Errors.USER_INACTIVE.code
            ) {
                res.status(403).json(CreateGroupUseCase.Errors.USER_INACTIVE);
            } else {
                res.status(500).json({
                    code: "INTERNAL_SERVER_ERROR",
                    message: "Internal Server Error"
                });
            }
        }
    };

    listGroups = async (req: Request, res: Response): Promise<void> => {
        const authenticated_user: TokenPayload = (req as any).authenticated_user;

        try {
            const groups = await this.listGroupsUseCase.execute(authenticated_user.id);
            res.status(200).json(groups);
        } catch (error) {
            res.status(500).json({
                code: "INTERNAL_SERVER_ERROR",
                message: "Internal Server Error"
            });
        }
    };

    getGroupById = async (req: Request, res: Response): Promise<void> => {
        const id = req.params.id as string;
        const authenticated_user: TokenPayload = (req as any).authenticated_user;

        try {
            const group = await this.getGroupByIdUseCase.execute(id, authenticated_user.id);
            res.status(200).json(group);
        } catch (error) {
            const isKnownError = error instanceof Error;

            if (isKnownError && error.message === GetGroupByIdUseCase.Errors.GROUP_NOT_FOUND.code) {
                res.status(404).json(GetGroupByIdUseCase.Errors.GROUP_NOT_FOUND);
            } else if (
                isKnownError &&
                error.message === GetGroupByIdUseCase.Errors.NOT_A_GROUP_MEMBER.code
            ) {
                res.status(403).json(GetGroupByIdUseCase.Errors.NOT_A_GROUP_MEMBER);
            } else {
                res.status(500).json({
                    code: "INTERNAL_SERVER_ERROR",
                    message: "Internal Server Error"
                });
            }
        }
    };

    inviteMember = async (req: Request, res: Response): Promise<void> => {
        const groupId = req.params.id as string;
        const { userId: targetUserId } = req.body;
        const authenticated_user: TokenPayload = (req as any).authenticated_user;

        try {
            const member = await this.inviteMemberUseCase.execute({
                groupId,
                targetUserId,
                invitedByUserId: authenticated_user.id
            });
            res.status(201).json(member);
        } catch (error) {
            const isKnownError = error instanceof Error;
            const msg = isKnownError ? error.message : "";

            if (msg === InviteMemberUseCase.Errors.GROUP_NOT_FOUND.code) {
                res.status(404).json(InviteMemberUseCase.Errors.GROUP_NOT_FOUND);
            } else if (msg === InviteMemberUseCase.Errors.USER_NOT_FOUND.code) {
                res.status(404).json(InviteMemberUseCase.Errors.USER_NOT_FOUND);
            } else if (msg === InviteMemberUseCase.Errors.INSUFFICIENT_PERMISSIONS.code) {
                res.status(403).json(InviteMemberUseCase.Errors.INSUFFICIENT_PERMISSIONS);
            } else if (msg === InviteMemberUseCase.Errors.USER_ALREADY_IN_GROUP.code) {
                res.status(409).json(InviteMemberUseCase.Errors.USER_ALREADY_IN_GROUP);
            } else if (msg === InviteMemberUseCase.Errors.USER_INACTIVE.code) {
                res.status(403).json(InviteMemberUseCase.Errors.USER_INACTIVE);
            } else if (msg === InviteMemberUseCase.Errors.NOT_A_GROUP_MEMBER.code) {
                res.status(403).json(InviteMemberUseCase.Errors.NOT_A_GROUP_MEMBER);
            } else {
                res.status(500).json({
                    code: "INTERNAL_SERVER_ERROR",
                    message: "Internal Server Error"
                });
            }
        }
    };

    manageInvitation = async (req: Request, res: Response): Promise<void> => {
        const groupId = req.params.id as string;
        const { status } = req.body;
        const authenticated_user: TokenPayload = (req as any).authenticated_user;

        try {
            const updatedMember = await this.manageInvitationUseCase.execute({
                groupId,
                userId: authenticated_user.id,
                status
            });
            res.status(200).json(updatedMember);
        } catch (error) {
            const isKnownError = error instanceof Error;
            const msg = isKnownError ? error.message : "";

            if (msg === ManageInvitationUseCase.Errors.NO_INVITATION_FOUND.code) {
                res.status(403).json(ManageInvitationUseCase.Errors.NO_INVITATION_FOUND);
            } else if (msg === ManageInvitationUseCase.Errors.INVALID_STATUS.code) {
                res.status(400).json(ManageInvitationUseCase.Errors.INVALID_STATUS);
            } else if (msg === ManageInvitationUseCase.Errors.ALREADY_PROCESSED.code) {
                res.status(409).json(ManageInvitationUseCase.Errors.ALREADY_PROCESSED);
            } else {
                res.status(500).json({
                    code: "INTERNAL_SERVER_ERROR",
                    message: "Internal Server Error"
                });
            }
        }
    };

    changeMemberRole = async (req: Request, res: Response): Promise<void> => {
        const groupId = req.params.id as string;
        const targetUserId = req.params.userId as string;
        const { role } = req.body;
        const authenticated_user: TokenPayload = (req as any).authenticated_user;

        try {
            const updatedMember = await this.changeMemberRoleUseCase.execute({
                groupId,
                targetUserId,
                requesterUserId: authenticated_user.id,
                newRole: role
            });
            res.status(200).json(updatedMember);
        } catch (error) {
            const isKnownError = error instanceof Error;
            const msg = isKnownError ? error.message : "";

            if (msg === ChangeMemberRoleUseCase.Errors.GROUP_NOT_FOUND.code) {
                res.status(404).json(ChangeMemberRoleUseCase.Errors.GROUP_NOT_FOUND);
            } else if (msg === ChangeMemberRoleUseCase.Errors.NOT_A_GROUP_MEMBER.code) {
                res.status(403).json(ChangeMemberRoleUseCase.Errors.NOT_A_GROUP_MEMBER);
            } else if (msg === ChangeMemberRoleUseCase.Errors.INSUFFICIENT_PERMISSIONS.code) {
                res.status(403).json(ChangeMemberRoleUseCase.Errors.INSUFFICIENT_PERMISSIONS);
            } else if (msg === ChangeMemberRoleUseCase.Errors.INVALID_ROLE.code) {
                res.status(400).json(ChangeMemberRoleUseCase.Errors.INVALID_ROLE);
            } else if (msg === ChangeMemberRoleUseCase.Errors.MINIMUM_OWNER_REQUIRED.code) {
                res.status(400).json(ChangeMemberRoleUseCase.Errors.MINIMUM_OWNER_REQUIRED);
            } else if (
                msg === ChangeMemberRoleUseCase.Errors.ONLY_OLDEST_OWNER_CAN_DEMOTE_OWNERS.code
            ) {
                res.status(403).json(
                    ChangeMemberRoleUseCase.Errors.ONLY_OLDEST_OWNER_CAN_DEMOTE_OWNERS
                );
            } else {
                res.status(500).json({
                    code: "INTERNAL_SERVER_ERROR",
                    message: "Internal Server Error"
                });
            }
        }
    };

    leaveGroup = async (req: Request, res: Response): Promise<void> => {
        const groupId = req.params.id as string;
        const authenticated_user: TokenPayload = (req as any).authenticated_user;

        try {
            await this.leaveGroupUseCase.execute({ groupId, userId: authenticated_user.id });
            res.status(204).send();
        } catch (error) {
            const isKnownError = error instanceof Error;
            const msg = isKnownError ? error.message : "";

            if (msg === LeaveGroupUseCase.Errors.GROUP_NOT_FOUND.code) {
                res.status(404).json(LeaveGroupUseCase.Errors.GROUP_NOT_FOUND);
            } else if (msg === LeaveGroupUseCase.Errors.NOT_A_GROUP_MEMBER.code) {
                res.status(403).json(LeaveGroupUseCase.Errors.NOT_A_GROUP_MEMBER);
            } else if (msg === LeaveGroupUseCase.Errors.MINIMUM_OWNER_REQUIRED.code) {
                res.status(400).json(LeaveGroupUseCase.Errors.MINIMUM_OWNER_REQUIRED);
            } else {
                res.status(500).json({
                    code: "INTERNAL_SERVER_ERROR",
                    message: "Internal Server Error"
                });
            }
        }
    };

    updateGroup = async (req: Request, res: Response): Promise<void> => {
        const groupId = req.params.id as string;
        const { name, description, isActive } = req.body;
        const authenticated_user: TokenPayload = (req as any).authenticated_user;

        try {
            const updatedGroup = await this.updateGroupUseCase.execute({
                groupId,
                requesterUserId: authenticated_user.id,
                name,
                description,
                isActive
            });
            res.status(200).json(updatedGroup);
        } catch (error) {
            const isKnownError = error instanceof Error;
            const msg = isKnownError ? error.message : "";

            if (msg === UpdateGroupUseCase.Errors.GROUP_NOT_FOUND.code) {
                res.status(404).json(UpdateGroupUseCase.Errors.GROUP_NOT_FOUND);
            } else if (msg === UpdateGroupUseCase.Errors.NOT_A_GROUP_MEMBER.code) {
                res.status(403).json(UpdateGroupUseCase.Errors.NOT_A_GROUP_MEMBER);
            } else if (msg === UpdateGroupUseCase.Errors.ONLY_OWNER_CAN_EDIT_METADATA.code) {
                res.status(403).json(UpdateGroupUseCase.Errors.ONLY_OWNER_CAN_EDIT_METADATA);
            } else if (msg === UpdateGroupUseCase.Errors.INSUFFICIENT_PERMISSIONS.code) {
                res.status(403).json(UpdateGroupUseCase.Errors.INSUFFICIENT_PERMISSIONS);
            } else if (msg === UpdateGroupUseCase.Errors.GROUP_NAME_ALREADY_EXISTS.code) {
                res.status(409).json(UpdateGroupUseCase.Errors.GROUP_NAME_ALREADY_EXISTS);
            } else if (
                msg === UpdateGroupUseCase.Errors.ONLY_OLDEST_OWNER_CAN_DEACTIVATE_GROUP.code
            ) {
                res.status(403).json(
                    UpdateGroupUseCase.Errors.ONLY_OLDEST_OWNER_CAN_DEACTIVATE_GROUP
                );
            } else {
                res.status(500).json({
                    code: "INTERNAL_SERVER_ERROR",
                    message: "Internal Server Error"
                });
            }
        }
    };

    getMembers = async (req: Request, res: Response): Promise<void> => {
        const groupId = req.params.id as string;
        const authenticated_user: TokenPayload = (req as any).authenticated_user;

        try {
            // Check if requester is a member
            const membership = await this.groupRepository.findMember(
                groupId,
                authenticated_user.id
            );
            if (!membership) {
                res.status(403).json({
                    code: "NOT_A_GROUP_MEMBER",
                    message: "You are not a member of this group"
                });
                return;
            }

            const members = await this.groupRepository.findMembersByGroupId(groupId);
            res.status(200).json(members);
        } catch (error) {
            res.status(500).json({
                code: "INTERNAL_SERVER_ERROR",
                message: "Internal Server Error"
            });
        }
    };
}
