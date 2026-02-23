import type { Request, Response } from "express";
import { CreateGroupUseCase } from "../../../domain/use-cases/create-group";
import { ListGroupsUseCase } from "../../../domain/use-cases/list-groups";
import { GetGroupByIdUseCase } from "../../../domain/use-cases/get-group-by-id";
import { InviteMemberUseCase } from "../../../domain/use-cases/invite-member";
import { ManageInvitationUseCase } from "../../../domain/use-cases/manage-invitation";
import { ChangeMemberRoleUseCase } from "../../../domain/use-cases/change-member-role";
import { LeaveGroupUseCase } from "../../../domain/use-cases/leave-group";
import { UpdateGroupUseCase } from "../../../domain/use-cases/update-group";
import { ListGroupMatchesUseCase } from "../../../domain/use-cases/list-group-matches";
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
        private readonly groupRepository: IGroupRepository,
        private readonly listGroupMatchesUseCase: ListGroupMatchesUseCase
    ) {}

    createGroup = async (req: Request, res: Response): Promise<void> => {
        const {
            name,
            description,
            meritConfigMaxMatches,
            meritPointsPlayed,
            meritPointsNoShow,
            meritPointsReserve,
            meritPointsPositiveAttitude,
            meritPointsNegativeAttitude,
            meritConfigHoursBeforePenalty,
            meritPointsLateCancel
        } = req.body;
        const authenticated_user: TokenPayload = (req as any).authenticated_user;

        try {
            const group = await this.createGroupUseCase.execute(authenticated_user.id, {
                name,
                description,
                meritConfigMaxMatches,
                meritPointsPlayed,
                meritPointsNoShow,
                meritPointsReserve,
                meritPointsPositiveAttitude,
                meritPointsNegativeAttitude,
                meritConfigHoursBeforePenalty,
                meritPointsLateCancel
            });
            res.status(201).json(group);
        } catch (error: any) {
            this.handleError(res, error, CreateGroupUseCase.Errors);
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
        const { id } = req.params;
        const authenticated_user: TokenPayload = (req as any).authenticated_user;
        try {
            const group = await this.getGroupByIdUseCase.execute(
                id as string,
                authenticated_user.id
            );
            res.status(200).json(group);
        } catch (error: any) {
            this.handleError(res, error, GetGroupByIdUseCase.Errors);
        }
    };

    inviteMember = async (req: Request, res: Response): Promise<void> => {
        const { id } = req.params;
        const { userId: targetUserId } = req.body;
        const authenticated_user: TokenPayload = (req as any).authenticated_user;
        try {
            const member = await this.inviteMemberUseCase.execute({
                groupId: id as string,
                targetUserId,
                invitedByUserId: authenticated_user.id
            });
            res.status(201).json(member);
        } catch (error: any) {
            this.handleError(res, error, InviteMemberUseCase.Errors);
        }
    };

    manageInvitation = async (req: Request, res: Response): Promise<void> => {
        const { id } = req.params;
        const { status } = req.body;
        const authenticated_user: TokenPayload = (req as any).authenticated_user;
        try {
            const updatedMember = await this.manageInvitationUseCase.execute({
                groupId: id as string,
                userId: authenticated_user.id,
                status
            });
            res.status(200).json(updatedMember);
        } catch (error: any) {
            this.handleError(res, error, ManageInvitationUseCase.Errors);
        }
    };

    changeMemberRole = async (req: Request, res: Response): Promise<void> => {
        const { id, userId: targetUserId } = req.params;
        const { role } = req.body;
        const authenticated_user: TokenPayload = (req as any).authenticated_user;
        try {
            const updatedMember = await this.changeMemberRoleUseCase.execute({
                groupId: id as string,
                targetUserId: targetUserId as string,
                requesterUserId: authenticated_user.id,
                newRole: role
            });
            res.status(200).json(updatedMember);
        } catch (error: any) {
            this.handleError(res, error, ChangeMemberRoleUseCase.Errors);
        }
    };

    leaveGroup = async (req: Request, res: Response): Promise<void> => {
        const { id } = req.params;
        const authenticated_user: TokenPayload = (req as any).authenticated_user;
        try {
            await this.leaveGroupUseCase.execute({
                groupId: id as string,
                userId: authenticated_user.id
            });
            res.status(204).send();
        } catch (error: any) {
            this.handleError(res, error, LeaveGroupUseCase.Errors);
        }
    };

    updateGroup = async (req: Request, res: Response): Promise<void> => {
        const { id } = req.params;
        const authenticated_user: TokenPayload = (req as any).authenticated_user;
        try {
            const updatedGroup = await this.updateGroupUseCase.execute({
                groupId: id as string,
                requesterUserId: authenticated_user.id,
                ...req.body
            });
            res.status(200).json(updatedGroup);
        } catch (error: any) {
            this.handleError(res, error, UpdateGroupUseCase.Errors);
        }
    };

    getMembers = async (req: Request, res: Response): Promise<void> => {
        const { id } = req.params;
        const authenticated_user: TokenPayload = (req as any).authenticated_user;
        try {
            const membership = await this.groupRepository.findMember(
                id as string,
                authenticated_user.id
            );
            if (!membership) {
                res.status(403).json({
                    code: "NOT_A_GROUP_MEMBER",
                    message: "You are not a member of this group"
                });
                return;
            }
            const members = await this.groupRepository.findMembersByGroupId(id as string);
            res.status(200).json(members);
        } catch (error) {
            res.status(500).json({
                code: "INTERNAL_SERVER_ERROR",
                message: "Internal Server Error"
            });
        }
    };

    listGroupMatches = async (req: Request, res: Response): Promise<void> => {
        const { id } = req.params;
        const authenticated_user: TokenPayload = (req as any).authenticated_user;
        try {
            const matches = await this.listGroupMatchesUseCase.execute(
                id as string,
                authenticated_user.id
            );
            res.status(200).json(matches);
        } catch (error: any) {
            this.handleError(res, error, ListGroupMatchesUseCase.Errors);
        }
    };

    private handleError(res: Response, error: any, useCaseErrors: any) {
        const msg = error instanceof Error ? error.message : "";
        let matchedError = null;
        for (const key in useCaseErrors) {
            if (useCaseErrors[key].code === msg) {
                matchedError = useCaseErrors[key];
                break;
            }
        }
        if (matchedError) {
            let status = 400;
            if (msg.includes("NOT_FOUND")) {
                status = 404;
            } else if (
                msg.includes("ALREADY_EXISTS") ||
                msg.includes("ALREADY_IN_GROUP") ||
                msg.includes("ALREADY_PROCESSED")
            ) {
                status = 409;
            } else if (
                msg.includes("PERMISSIONS") ||
                msg.includes("MEMBER") ||
                msg.includes("ONLY_OWNER") ||
                msg.includes("ONLY_OLDEST_OWNER") ||
                msg.includes("NO_INVITATION_FOUND") ||
                msg.includes("USER_INACTIVE")
            ) {
                status = 403;
            }
            return res.status(status).json(matchedError);
        }
        console.error("🧨 Unhandled error in GroupController:", error);
        res.status(500).json({ code: "INTERNAL_SERVER_ERROR", message: "Internal Server Error" });
    }
}
