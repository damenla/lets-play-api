export const GROUP_MEMBER_STATUSES = ["invited", "accepted", "rejected", "disabled"] as const;
export type GroupMemberStatus = (typeof GROUP_MEMBER_STATUSES)[number];

export const GROUP_MEMBER_ROLES = ["owner", "manager", "member"] as const;
export type GroupMemberRole = (typeof GROUP_MEMBER_ROLES)[number];

export interface Group {
    id: string;
    name: string;
    description?: string;
    isActive: boolean;
    // Merit System Config
    meritConfigMaxMatches: number;
    meritPointsPlayed: number;
    meritPointsNoShow: number;
    meritPointsReserve: number;
    meritPointsPositiveAttitude: number;
    meritPointsNegativeAttitude: number;
    // Penalty Config
    meritConfigHoursBeforePenalty: number;
    meritPointsLateCancel: number;

    createdAt: Date;
    updatedAt: Date;
}

export interface GroupMember {
    groupId: string;
    userId: string;
    status: GroupMemberStatus;
    role: GroupMemberRole;
    statusUpdatedAt: Date;
    createdAt: Date;
    updatedAt: Date;
}
