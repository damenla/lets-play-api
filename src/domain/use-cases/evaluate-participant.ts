import type { PlayerAttitude, Match, MatchRegistration } from "../../types/match";
import type { IMatchRepository } from "../../infrastructure/persistence/match-repository";
import type { IGroupRepository } from "../../infrastructure/persistence/group-repository";

export interface EvaluateParticipantDto {
    matchId: string;
    userId: string;
    requesterUserId: string;
    didPlay?: boolean;
    attitude?: PlayerAttitude;
}

export class EvaluateParticipantUseCase {
    constructor(
        private readonly matchRepository: IMatchRepository,
        private readonly groupRepository: IGroupRepository
    ) {}

    static readonly Errors = {
        MATCH_NOT_FOUND: { code: "MATCH_NOT_FOUND", message: "Match not found" },
        REGISTRATION_NOT_FOUND: {
            code: "REGISTRATION_NOT_FOUND",
            message: "Participant not registered"
        },
        INSUFFICIENT_PERMISSIONS: {
            code: "INSUFFICIENT_PERMISSIONS",
            message: "Only owners can evaluate"
        },
        MATCH_NOT_FINISHED: {
            code: "MATCH_NOT_FINISHED",
            message: "Match must be finished to evaluate"
        },
        MATCH_LOCKED: { code: "MATCH_LOCKED", message: "Match is locked and cannot be modified" }
    };

    async execute(dto: EvaluateParticipantDto): Promise<void> {
        const { registration } = await this.validate(dto);

        if (dto.didPlay !== undefined) registration.didPlay = dto.didPlay;
        if (dto.attitude !== undefined) registration.attitude = dto.attitude;

        await this.matchRepository.updateRegistration(registration);
    }

    private async validate(
        dto: EvaluateParticipantDto
    ): Promise<{ match: Match; registration: MatchRegistration }> {
        const match = await this.matchRepository.findById(dto.matchId);
        if (!match) throw new Error(EvaluateParticipantUseCase.Errors.MATCH_NOT_FOUND.code);

        if (match.isLocked) throw new Error(EvaluateParticipantUseCase.Errors.MATCH_LOCKED.code);
        if (match.status !== "finished")
            throw new Error(EvaluateParticipantUseCase.Errors.MATCH_NOT_FINISHED.code);

        const membership = await this.groupRepository.findMember(
            match.groupId,
            dto.requesterUserId
        );
        if (!membership || membership.role !== "owner") {
            throw new Error(EvaluateParticipantUseCase.Errors.INSUFFICIENT_PERMISSIONS.code);
        }

        const registration = await this.matchRepository.findRegistration(dto.matchId, dto.userId);
        if (!registration)
            throw new Error(EvaluateParticipantUseCase.Errors.REGISTRATION_NOT_FOUND.code);

        return { match, registration };
    }
}
