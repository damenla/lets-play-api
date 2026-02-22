import type { IGroupRepository } from "../../infrastructure/persistence/group-repository";
import type { Group } from "../../types/group";

export class GetGroupByIdUseCase {
    constructor(private readonly groupRepository: IGroupRepository) {}

    static readonly Errors = {
        GROUP_NOT_FOUND: {
            code: "GROUP_NOT_FOUND",
            message: "Group not found"
        },
        NOT_A_GROUP_MEMBER: {
            code: "NOT_A_GROUP_MEMBER",
            message: "You are not a member of this group"
        }
    };

    async execute(groupId: string, userId: string): Promise<Group> {
        const group = await this.groupRepository.findById(groupId);

        if (!group) {
            throw new Error(GetGroupByIdUseCase.Errors.GROUP_NOT_FOUND.code);
        }

        // Check membership
        const membership = await this.groupRepository.findMember(groupId, userId);
        if (!membership) {
            throw new Error(GetGroupByIdUseCase.Errors.NOT_A_GROUP_MEMBER.code);
        }

        return group;
    }
}
