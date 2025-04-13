export interface GameState {
    resources: Resources;
    upgrades: Record<string, Upgrade>;
    stats: Statistics;
    session: FocusSession;
    multipliers: Multipliers;
    unlocks: Unlocks;
}

export interface Resources {
    focusPoints: number;
    timeTokens: number;
}

export interface Upgrade {
    id: string;
    name: string;
    description: string;
    cost: { resource: keyof Resources, amount: number };
    effect: UpgradeEffect;
    level: number;
    maxLevel: number;
    unlocked: boolean;
    visible: boolean;
}

export interface UpgradeEffect {
    type: EffectType;
    target: string;
    value: number;
}

export enum EffectType {
    MULTIPLY,
    ADD,
    UNLOCK
}

export interface Statistics {
    totalFocusTime: number; //in minutes
    completedSessions: number;
    totalFocusPoints: number;
    canceledSessions: number;
    gameStartedAt: number; //timestamp
    lastPlayedAt: number; //timestamp
}

export interface FocusSession {
    active: boolean;
    startTime: number | null;
    duration: number; //in milliseconds
    targetEndTime: number | null;
    currentReward: number;
}

export interface Multipliers {
    focusPointsPerMinute: number;
    timeTokensPerMinute: number;
}

export interface Unlocks {
    passiveGeneration: boolean;
    betterRewards: boolean;
    improvedFocus: boolean;
}

//UI related types
export interface UIElements {
    resources: {
        focusPoints: HTMLElement;
        timeTokens: HTMLElement;
    };
    timer: {
        display: HTMLElement;
        startButton: HTMLElement;
        cancelButton: HTMLElement;
        sessionOptions: HTMLElement;
        timeButtons: NodeListOf<HTMLElement>;
        customTimeInput: HTMLElement;
        minutesInput: HTMLInputElement;
        confirmCustomTime: HTMLElement;
        sessionInfo: HTMLElement;
        currentReward: HTMLElement;
    };
    upgrades: {
        container: HTMLElement;
    };
    stats: {
        totalFocusTime: HTMLElement;
        completedSessions: HTMLElement;
        totalFocusPoints: HTMLElement;
    };
}