import { GameState, EffectType } from './types';

//Initialize a new game state with default values
export function initializeGameState(): GameState {
    return {
        resources: {
            focusPoints: 0,
            timeTokens: 0
        },
        upgrades: {
            focusMultiplier1: {
                id: 'focusMultiplier1',
                name: 'Better Focus',
                description: 'Increase focus points earned per minute by 50%',
                cost: { resource: 'focusPoints', amount: 10 },
                effect: { type: EffectType.MULTIPLY, target: 'focusPointsPerMinute', value: 1.5 },
                level: 0,
                maxLevel: 5,
                unlocked: true,
                visible: true
            },
            shorterSessions: {
                id: 'shorterSessions',
                name: 'Efficient Focus',
                description: 'Earn the same rewards with 10% less time',
                cost: { resource: 'focusPoints', amount: 25 },
                effect: { type: EffectType.MULTIPLY, target: 'focusPointsPerMinute', value: 1.1 },
                level: 0,
                maxLevel: 3,
                unlocked: false,
                visible: false
            },
            timeTokenGen: {
                id: 'timeTokenGen',
                name: 'Time Banking',
                description: 'Start earning Time Tokens during focus sessions',
                cost: { resource: 'focusPoints', amount: 50 },
                effect: { type: EffectType.UNLOCK, target: 'timeTokensPerMinute', value: 0.2 },
                level: 0,
                maxLevel: 1,
                unlocked: false,
                visible: true
            },
            passiveGen: {
                id: 'passiveGen',
                name: 'Passive Focus',
                description: 'Earn 0.1 focus points per minute, even when not in a session',
                cost: { resource: 'timeTokens', amount: 5 },
                effect: { type: EffectType.UNLOCK, target: 'passiveGeneration', value: 1 },
                level: 0,
                maxLevel: 1,
                unlocked: false,
                visible: false
            }
        },
        stats: {
            totalFocusTime: 0,
            completedSessions: 0,
            totalFocusPoints: 0,
            canceledSessions: 0,
            gameStartedAt: Date.now(),
            lastPlayedAt: Date.now()
        },
        session: {
            active: false,
            startTime: null,
            duration: 0,
            targetEndTime: null,
            currentReward: 0
        },
        multipliers: {
            focusPointsPerMinute: 1,
            timeTokensPerMinute: 0
        },
        unlocks: {
            passiveGeneration: false,
            betterRewards: false,
            improvedFocus: false
        }
    };
}

//Save game state to localStorage
export function saveGameState(state: GameState): void {
    try {
        localStorage.setItem('waitGame', JSON.stringify({
            ...state,
            stats: {
                ...state.stats,
                lastPlayedAt: Date.now()
            }
        }));
    } catch (error) {
        console.error('Failed to save game state:', error);
    }
}

//Load game state from localStorage
export function loadGameState(): GameState | null {
    try {
        const savedState = localStorage.getItem('waitGame');
        if (savedState) {
            return JSON.parse(savedState) as GameState;
        }
    } catch (error) {
        console.error('Failed to load game state:', error);
    }
    return null;
}

//Add resources to the game state
export function addResources(state: GameState, resource: keyof GameState['resources'], amount: number): void {
    if (amount <= 0) return;
    
    state.resources[resource] += amount;
    
    //Update total focus points stat if adding focus points
    if (resource === 'focusPoints') {
        state.stats.totalFocusPoints += amount;
    }
}

//Check if player can afford an upgrade
export function canAffordUpgrade(state: GameState, upgradeId: string): boolean {
    const upgrade = state.upgrades[upgradeId];
    if (!upgrade || upgrade.level >= upgrade.maxLevel) return false;
    
    const { resource, amount } = upgrade.cost;
    const currentAmount = state.resources[resource];
    
    return currentAmount >= amount;
}

//Purchase an upgrade
export function purchaseUpgrade(state: GameState, upgradeId: string): boolean {
    if (!canAffordUpgrade(state, upgradeId)) return false;
    
    const upgrade = state.upgrades[upgradeId];
    const { resource, amount } = upgrade.cost;
    
    //Deduct cost
    state.resources[resource] -= amount;
    
    //Increase level
    upgrade.level += 1;
    
    //Apply effect
    applyUpgradeEffect(state, upgrade.id);
    
    //Increase cost for next level
    upgrade.cost.amount = Math.floor(amount * 1.5);
    
    //Check for unlocks based on this upgrade
    checkUnlocks(state);
    
    return true;
}

//Apply upgrade effect to game state
function applyUpgradeEffect(state: GameState, upgradeId: string): void {
    const upgrade = state.upgrades[upgradeId];
    const { type, target, value } = upgrade.effect;
    
    switch (type) {
        case EffectType.MULTIPLY:
            if (target in state.multipliers) {
                (state.multipliers as any)[target] *= value;
            }
            break;
        case EffectType.ADD:
            if (target in state.multipliers) {
                (state.multipliers as any)[target] += value;
            }
            break;
        case EffectType.UNLOCK:
            if (target in state.unlocks) {
                (state.unlocks as any)[target] = true;
            } else if (target === 'timeTokensPerMinute') {
                state.multipliers.timeTokensPerMinute = value;
            }
            break;
    }
}

//Check for new unlocks based on game progress
function checkUnlocks(state: GameState): void {
    //Unlock shorterSessions after buying focusMultiplier1
    if (state.upgrades.focusMultiplier1.level >= 1 && !state.upgrades.shorterSessions.unlocked) {
        state.upgrades.shorterSessions.unlocked = true;
        state.upgrades.shorterSessions.visible = true;
    }
    
    //Unlock passiveGen after buying timeTokenGen
    if (state.upgrades.timeTokenGen.level >= 1 && !state.upgrades.passiveGen.unlocked) {
        state.upgrades.passiveGen.unlocked = true;
        state.upgrades.passiveGen.visible = true;
    }
    
    //More unlocks can be added here as the game expands
}