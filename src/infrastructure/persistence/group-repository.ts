import type { Group, GroupMember } from "../../types/group";

export interface IGroupRepository {
    create(group: Group): Promise<Group>;
    update(group: Group): Promise<Group>;
    findByName(name: string): Promise<Group | null>;
    findById(id: string): Promise<Group | null>;
    findByUserId(userId: string): Promise<Group[]>;

    // Membership operations
    addMember(member: GroupMember): Promise<void>;
    updateMember(member: GroupMember): Promise<void>;
    removeMember(groupId: string, userId: string): Promise<void>;
    findMembersByGroupId(groupId: string): Promise<GroupMember[]>;
    findMember(groupId: string, userId: string): Promise<GroupMember | null>;
}
