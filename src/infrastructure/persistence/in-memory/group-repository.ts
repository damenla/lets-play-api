import { Group, GroupMember } from "../../../types/group";
import type { IGroupRepository } from "../group-repository";

export class InMemoryGroupRepository implements IGroupRepository {
    private groups: Group[] = [];
    private members: GroupMember[] = [];

    async create(group: Group): Promise<Group> {
        this.groups.push(group);
        return group;
    }

    async update(group: Group): Promise<Group> {
        const index = this.groups.findIndex((g) => g.id === group.id);
        if (index === -1) {
            throw new Error("GROUP_NOT_FOUND");
        }
        this.groups[index] = group;
        return group;
    }

    async findByName(name: string): Promise<Group | null> {
        return this.groups.find((g) => g.name === name) || null;
    }

    async findById(id: string): Promise<Group | null> {
        return this.groups.find((g) => g.id === id) || null;
    }

    async findByUserId(userId: string): Promise<Group[]> {
        const userGroupIds = this.members.filter((m) => m.userId === userId).map((m) => m.groupId);

        return this.groups.filter((g) => userGroupIds.includes(g.id));
    }

    async addMember(member: GroupMember): Promise<void> {
        const exists = this.members.some(
            (m) => m.groupId === member.groupId && m.userId === member.userId
        );

        if (exists) {
            throw new Error("MEMBER_ALREADY_EXISTS");
        }

        this.members.push(member);
    }

    async updateMember(member: GroupMember): Promise<void> {
        const index = this.members.findIndex(
            (m) => m.groupId === member.groupId && m.userId === member.userId
        );

        if (index === -1) {
            throw new Error("MEMBER_NOT_FOUND");
        }

        this.members[index] = member;
    }

    async removeMember(groupId: string, userId: string): Promise<void> {
        const index = this.members.findIndex((m) => m.groupId === groupId && m.userId === userId);

        if (index !== -1) {
            this.members.splice(index, 1);
        }
    }

    async findMembersByGroupId(groupId: string): Promise<GroupMember[]> {
        return this.members.filter((m) => m.groupId === groupId);
    }

    async findMember(groupId: string, userId: string): Promise<GroupMember | null> {
        return this.members.find((m) => m.groupId === groupId && m.userId === userId) || null;
    }
}
