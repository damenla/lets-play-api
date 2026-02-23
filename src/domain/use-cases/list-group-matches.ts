import type { Match } from "../../types/match";
import type { IMatchRepository } from "../../infrastructure/persistence/match-repository";
import type { IGroupRepository } from "../../infrastructure/persistence/group-repository";

export class ListGroupMatchesUseCase {
    constructor(
        private readonly matchRepository: IMatchRepository,
        private readonly groupRepository: IGroupRepository
    ) {}

    static readonly Errors = {
        GROUP_NOT_FOUND: { code: "GROUP_NOT_FOUND", message: "Group not found" },
        NOT_A_GROUP_MEMBER: {
            code: "NOT_A_GROUP_MEMBER",
            message: "You are not a member of this group"
        }
    };

    async execute(groupId: string, userId: string): Promise<Match[]> {
        await this.validate(groupId, userId);
        return this.matchRepository.findByGroupId(groupId);
    }

    private async validate(groupId: string, userId: string) {
        const group = await this.groupRepository.findById(groupId);
        if (!group) throw new Error(ListGroupMatchesUseCase.Errors.GROUP_NOT_FOUND.code);

        const membership = await this.groupRepository.findMember(groupId, userId);
        if (!membership) throw new Error(ListGroupMatchesUseCase.Errors.NOT_A_GROUP_MEMBER.code);
    }
}
