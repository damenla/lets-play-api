export const MATCH_STATUSES = ["planning", "playing", "finished", "cancelled"] as const;
export type MatchStatus = (typeof MATCH_STATUSES)[number];

export const SPORT_TYPES = ["football", "basketball", "padel"] as const;
export type SportType = (typeof SPORT_TYPES)[number];

export const PLAYER_ATTITUDES = ["positive", "negative", "neutral"] as const;
export type PlayerAttitude = (typeof PLAYER_ATTITUDES)[number];

export interface RGB {
    r: number;
    g: number;
    b: number;
}

export interface Match {
    id: string;
    groupId: string;
    sport: SportType;
    scheduledAt: Date;
    durationMinutes: number;
    capacity: number;
    location: string;
    status: MatchStatus;
    isLocked: boolean;
    teamAColor: RGB;
    teamBColor: RGB;
    createdAt: Date;
    updatedAt: Date;
}

export interface MatchRegistration {
    matchId: string;
    userId: string;
    registeredAt: Date;
    isReserve: boolean;
    didPlay: boolean;
    attitude: PlayerAttitude;
    isLateCancellation: boolean;
}
