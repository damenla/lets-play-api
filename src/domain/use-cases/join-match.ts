import type { Match, MatchRegistration } from "../../types/match";
import type { IMatchRepository } from "../../infrastructure/persistence/match-repository";
import type { IGroupRepository } from "../../infrastructure/persistence/group-repository";

export interface JoinMatchDto {
    matchId: string;
    userId: string;
}

export class JoinMatchUseCase {
    constructor(
        private readonly matchRepository: IMatchRepository,
        private readonly groupRepository: IGroupRepository
    ) {}

    static readonly Errors = {
        MATCH_NOT_FOUND: { code: "MATCH_NOT_FOUND", message: "Match not found" },
        NOT_A_GROUP_MEMBER: {
            code: "NOT_A_GROUP_MEMBER",
            message: "You are not an active member of this group"
        },
        MATCH_NOT_PLANNING: {
            code: "MATCH_NOT_PLANNING",
            message: "Match is no longer in planning state"
        },
        ALREADY_JOINED: {
            code: "ALREADY_JOINED",
            message: "User is already registered for this match"
        }
    };

    async execute(dto: JoinMatchDto): Promise<MatchRegistration> {
        const match = await this.validate(dto);

        const registration: MatchRegistration = {
            matchId: dto.matchId,
            userId: dto.userId,
            registeredAt: new Date(),
            isReserve: false,
            didPlay: false,
            attitude: "neutral",
            isLateCancellation: false
        };

        await this.matchRepository.addRegistration(registration);
        return registration;
    }

    private async validate(dto: JoinMatchDto): Promise<Match> {
        const match = await this.matchRepository.findById(dto.matchId);
        if (!match) {
            throw new Error(JoinMatchUseCase.Errors.MATCH_NOT_FOUND.code);
        }

        if (match.status !== "planning") {
            throw new Error(JoinMatchUseCase.Errors.MATCH_NOT_PLANNING.code);
        }

        const membership = await this.groupRepository.findMember(match.groupId, dto.userId);
        if (!membership || membership.status !== "accepted") {
            throw new Error(JoinMatchUseCase.Errors.NOT_A_GROUP_MEMBER.code);
        }

        const existing = await this.matchRepository.findRegistration(dto.matchId, dto.userId);
        if (existing) {
            throw new Error(JoinMatchUseCase.Errors.ALREADY_JOINED.code);
        }

        return match;
    }
}
