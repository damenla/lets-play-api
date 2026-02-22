import { Router } from "express";
import { CreateGroupUseCase } from "../../../domain/use-cases/create-group";
import { ListGroupsUseCase } from "../../../domain/use-cases/list-groups";
import { GetGroupByIdUseCase } from "../../../domain/use-cases/get-group-by-id";
import { InviteMemberUseCase } from "../../../domain/use-cases/invite-member";
import { ManageInvitationUseCase } from "../../../domain/use-cases/manage-invitation";
import { ChangeMemberRoleUseCase } from "../../../domain/use-cases/change-member-role";
import { LeaveGroupUseCase } from "../../../domain/use-cases/leave-group";
import { UpdateGroupUseCase } from "../../../domain/use-cases/update-group";
import { IGroupRepository } from "../../persistence/group-repository";
import { IUserRepository } from "../../persistence/user-repository";
import { JwtService } from "../../security/jwt-service";
import { GroupController } from "../controllers/group-controller";
import { createAuthMiddleware } from "../middleware/auth";

export function createGroupRouter(
    groupRepository: IGroupRepository,
    userRepository: IUserRepository
): Router {
    const router = Router();
    const tokenService = new JwtService();

    const createGroupUseCase = new CreateGroupUseCase(groupRepository, userRepository);
    const listGroupsUseCase = new ListGroupsUseCase(groupRepository);
    const getGroupByIdUseCase = new GetGroupByIdUseCase(groupRepository);
    const inviteMemberUseCase = new InviteMemberUseCase(groupRepository, userRepository);
    const manageInvitationUseCase = new ManageInvitationUseCase(groupRepository);
    const changeMemberRoleUseCase = new ChangeMemberRoleUseCase(groupRepository);
    const leaveGroupUseCase = new LeaveGroupUseCase(groupRepository);
    const updateGroupUseCase = new UpdateGroupUseCase(groupRepository);

    const groupController = new GroupController(
        createGroupUseCase,
        listGroupsUseCase,
        getGroupByIdUseCase,
        inviteMemberUseCase,
        manageInvitationUseCase,
        changeMemberRoleUseCase,
        leaveGroupUseCase,
        updateGroupUseCase,
        groupRepository
    );

    // All group routes are protected by authentication
    router.use(createAuthMiddleware(tokenService, userRepository));

    router.post("/", (req, res) => groupController.createGroup(req, res));
    router.get("/", (req, res) => groupController.listGroups(req, res));
    router.get("/:id", (req, res) => groupController.getGroupById(req, res));
    router.patch("/:id", (req, res) => groupController.updateGroup(req, res));

    // Member management
    router.post("/:id/members", (req, res) => groupController.inviteMember(req, res));
    router.patch("/:id/invitations", (req, res) => groupController.manageInvitation(req, res));
    router.patch("/:id/members/:userId/role", (req, res) =>
        groupController.changeMemberRole(req, res)
    );
    router.delete("/:id/members/me", (req, res) => groupController.leaveGroup(req, res));
    router.get("/:id/members", (req, res) => groupController.getMembers(req, res));

    return router;
}
