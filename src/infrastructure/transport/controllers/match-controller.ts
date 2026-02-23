import type { Request, Response } from "express";
import { CreateMatchUseCase } from "../../../domain/use-cases/create-match";
import { JoinMatchUseCase } from "../../../domain/use-cases/join-match";
import { LeaveMatchUseCase } from "../../../domain/use-cases/leave-match";
import { ListParticipantsUseCase } from "../../../domain/use-cases/list-participants";
import { UpdateMatchStatusUseCase } from "../../../domain/use-cases/update-match-status";
import { LockMatchUseCase } from "../../../domain/use-cases/lock-match";
import { EvaluateParticipantUseCase } from "../../../domain/use-cases/evaluate-participant";
import { ListGroupMatchesUseCase } from "../../../domain/use-cases/list-group-matches";
import { UpdateMatchUseCase } from "../../../domain/use-cases/update-match";
import { TokenPayload } from "../../../domain/services/token-service";

export class MatchController {
    constructor(
        private readonly createMatchUseCase: CreateMatchUseCase,
        private readonly joinMatchUseCase: JoinMatchUseCase,
        private readonly leaveMatchUseCase: LeaveMatchUseCase,
        private readonly listParticipantsUseCase: ListParticipantsUseCase,
        private readonly updateMatchStatusUseCase: UpdateMatchStatusUseCase,
        private readonly lockMatchUseCase: LockMatchUseCase,
        private readonly evaluateParticipantUseCase: EvaluateParticipantUseCase,
        private readonly listGroupMatchesUseCase: ListGroupMatchesUseCase,
        private readonly updateMatchUseCase: UpdateMatchUseCase
    ) {}

    createMatch = async (req: Request, res: Response): Promise<void> => {
        const {
            groupId,
            sport,
            scheduledAt,
            durationMinutes,
            capacity,
            location,
            teamAColor,
            teamBColor
        } = req.body;
        const authenticated_user: TokenPayload = (req as any).authenticated_user;
        try {
            const match = await this.createMatchUseCase.execute({
                groupId,
                requesterUserId: authenticated_user.id,
                sport,
                scheduledAt,
                durationMinutes,
                capacity,
                location,
                teamAColor,
                teamBColor
            });
            res.status(201).json(match);
        } catch (error: any) {
            this.handleError(res, error, CreateMatchUseCase.Errors);
        }
    };

    joinMatch = async (req: Request, res: Response): Promise<void> => {
        const { id } = req.params;
        const authenticated_user: TokenPayload = (req as any).authenticated_user;
        try {
            const registration = await this.joinMatchUseCase.execute({
                matchId: id as string,
                userId: authenticated_user.id
            });
            res.status(201).json(registration);
        } catch (error: any) {
            this.handleError(res, error, JoinMatchUseCase.Errors);
        }
    };

    leaveMatch = async (req: Request, res: Response): Promise<void> => {
        const { id } = req.params;
        const authenticated_user: TokenPayload = (req as any).authenticated_user;
        try {
            await this.leaveMatchUseCase.execute({
                matchId: id as string,
                userId: authenticated_user.id
            });
            res.status(200).send();
        } catch (error: any) {
            this.handleError(res, error, LeaveMatchUseCase.Errors);
        }
    };

    listParticipants = async (req: Request, res: Response): Promise<void> => {
        const { id } = req.params;
        try {
            const participants = await this.listParticipantsUseCase.execute(id as string);
            res.status(200).json(participants);
        } catch (error: any) {
            this.handleError(res, error, ListParticipantsUseCase.Errors);
        }
    };

    updateMatchStatus = async (req: Request, res: Response): Promise<void> => {
        const { id } = req.params;
        const { status } = req.body;
        const authenticated_user: TokenPayload = (req as any).authenticated_user;
        try {
            await this.updateMatchStatusUseCase.execute({
                matchId: id as string,
                requesterUserId: authenticated_user.id,
                status
            });
            const updatedMatch = await (
                this.updateMatchStatusUseCase as any
            ).matchRepository.findById(id as string);
            res.status(200).json(updatedMatch);
        } catch (error: any) {
            this.handleError(res, error, UpdateMatchStatusUseCase.Errors);
        }
    };

    lockMatch = async (req: Request, res: Response): Promise<void> => {
        const { id } = req.params;
        const authenticated_user: TokenPayload = (req as any).authenticated_user;
        try {
            await this.lockMatchUseCase.execute({
                matchId: id as string,
                requesterUserId: authenticated_user.id
            });
            res.status(200).send();
        } catch (error: any) {
            this.handleError(res, error, LockMatchUseCase.Errors);
        }
    };

    evaluateParticipant = async (req: Request, res: Response): Promise<void> => {
        const { id, userId } = req.params;
        const { didPlay, attitude } = req.body;
        const authenticated_user: TokenPayload = (req as any).authenticated_user;
        try {
            await this.evaluateParticipantUseCase.execute({
                matchId: id as string,
                userId: userId as string,
                requesterUserId: authenticated_user.id,
                didPlay,
                attitude
            });
            res.status(200).send();
        } catch (error: any) {
            this.handleError(res, error, EvaluateParticipantUseCase.Errors);
        }
    };

    listGroupMatches = async (req: Request, res: Response): Promise<void> => {
        const { groupId } = req.params;
        const authenticated_user: TokenPayload = (req as any).authenticated_user;
        try {
            const matches = await this.listGroupMatchesUseCase.execute(
                groupId as string,
                authenticated_user.id
            );
            res.status(200).json(matches);
        } catch (error: any) {
            this.handleError(res, error, ListGroupMatchesUseCase.Errors);
        }
    };

    updateMatch = async (req: Request, res: Response): Promise<void> => {
        const { id } = req.params;
        const authenticated_user: TokenPayload = (req as any).authenticated_user;
        try {
            const match = await this.updateMatchUseCase.execute({
                matchId: id as string,
                requesterUserId: authenticated_user.id,
                ...req.body
            });
            res.status(200).json(match);
        } catch (error: any) {
            this.handleError(res, error, UpdateMatchUseCase.Errors);
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
            if (msg.includes("NOT_FOUND")) {
                return res.status(404).json(matchedError);
            }
            if (msg.includes("PERMISSIONS") || msg.includes("LOCKED")) {
                return res.status(403).json(matchedError);
            }
            return res.status(400).json(matchedError);
        }

        console.error("🧨 Unhandled error in MatchController:", error);
        res.status(500).json({ code: "INTERNAL_SERVER_ERROR", message: "Internal Server Error" });
    }
}
