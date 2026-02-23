import { Router } from "express";
import { CreateMatchUseCase } from "../../../domain/use-cases/create-match";
import { JoinMatchUseCase } from "../../../domain/use-cases/join-match";
import { LeaveMatchUseCase } from "../../../domain/use-cases/leave-match";
import { ListParticipantsUseCase } from "../../../domain/use-cases/list-participants";
import { UpdateMatchStatusUseCase } from "../../../domain/use-cases/update-match-status";
import { LockMatchUseCase } from "../../../domain/use-cases/lock-match";
import { EvaluateParticipantUseCase } from "../../../domain/use-cases/evaluate-participant";
import { UpdateMatchUseCase } from "../../../domain/use-cases/update-match";
import type { IMatchRepository } from "../../persistence/match-repository";
import type { IGroupRepository } from "../../persistence/group-repository";
import type { IUserRepository } from "../../persistence/user-repository";
import { JwtService } from "../../security/jwt-service";
import { MatchController } from "../controllers/match-controller";
import { createAuthMiddleware } from "../middleware/auth";
import { ListGroupMatchesUseCase } from "../../../domain/use-cases/list-group-matches";

export function createMatchRouter(
    matchRepository: IMatchRepository,
    groupRepository: IGroupRepository,
    userRepository: IUserRepository
): Router {
    const router = Router();
    const tokenService = new JwtService();

    // Use cases
    const createMatchUseCase = new CreateMatchUseCase(matchRepository, groupRepository);
    const joinMatchUseCase = new JoinMatchUseCase(matchRepository, groupRepository);
    const leaveMatchUseCase = new LeaveMatchUseCase(matchRepository, groupRepository);
    const listParticipantsUseCase = new ListParticipantsUseCase(matchRepository, groupRepository);
    const updateMatchStatusUseCase = new UpdateMatchStatusUseCase(
        matchRepository,
        groupRepository,
        listParticipantsUseCase
    );
    const lockMatchUseCase = new LockMatchUseCase(matchRepository, groupRepository);
    const evaluateParticipantUseCase = new EvaluateParticipantUseCase(
        matchRepository,
        groupRepository
    );
    const listGroupMatchesUseCase = new ListGroupMatchesUseCase(matchRepository, groupRepository);
    const updateMatchUseCase = new UpdateMatchUseCase(matchRepository, groupRepository);

    const matchController = new MatchController(
        createMatchUseCase,
        joinMatchUseCase,
        leaveMatchUseCase,
        listParticipantsUseCase,
        updateMatchStatusUseCase,
        lockMatchUseCase,
        evaluateParticipantUseCase,
        listGroupMatchesUseCase,
        updateMatchUseCase
    );

    router.use(createAuthMiddleware(tokenService, userRepository));

    // Match Base routes (mounted at /api/matches in app.ts)
    router.post("/", (req, res) => matchController.createMatch(req, res));
    router.patch("/:id", (req, res) => matchController.updateMatch(req, res));
    router.patch("/:id/status", (req, res) => matchController.updateMatchStatus(req, res));
    router.patch("/:id/lock", (req, res) => matchController.lockMatch(req, res));

    // Participants & Evaluation
    router.post("/:id/participants", (req, res) => matchController.joinMatch(req, res));
    router.delete("/:id/participants/me", (req, res) => matchController.leaveMatch(req, res));
    router.get("/:id/participants", (req, res) => matchController.listParticipants(req, res));
    router.patch("/:id/participants/:userId/evaluation", (req, res) =>
        matchController.evaluateParticipant(req, res)
    );

    return router;
}
