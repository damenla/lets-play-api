import type { IGroupRepository } from "../../infrastructure/persistence/group-repository";
import type { Group } from "../../types/group";

export class ListGroupsUseCase {
    constructor(private readonly groupRepository: IGroupRepository) {}

    async execute(userId: string): Promise<Group[]> {
        return this.groupRepository.findByUserId(userId);
    }
}
