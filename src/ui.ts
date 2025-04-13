import { GameState, UIElements, Upgrade } from './types';
import { canAffordUpgrade, purchaseUpgrade, saveGameState } from './core';

let uiElements: UIElements;

//Initialize UI with game state
export function initializeUI(gameState: GameState): void {
    //Cache UI elements
    uiElements = {
        resources: {
            focusPoints: document.getElementById('focus-points')!,
            timeTokens: document.getElementById('time-tokens')!
        },
        timer: {
            display: document.getElementById('timer-display')!,
            startButton: document.getElementById('start-session')!,
            cancelButton: document.getElementById('cancel-session')!,
            sessionOptions: document.getElementById('session-options')!,
            timeButtons: document.querySelectorAll('.time-btn') as NodeListOf<HTMLElement>,
            customTimeInput: document.getElementById('custom-time-input')!,
            minutesInput: document.getElementById('minutes-input') as HTMLInputElement,
            confirmCustomTime: document.getElementById('confirm-custom-time')!,
            sessionInfo: document.getElementById('session-info')!,
            currentReward: document.getElementById('current-reward')!
        },
        upgrades: {
            container: document.getElementById('upgrades-container')!
        },
        stats: {
            totalFocusTime: document.getElementById('total-focus-time')!,
            completedSessions: document.getElementById('completed-sessions')!,
            totalFocusPoints: document.getElementById('total-focus-points')!
        }
    };
    
    //Update UI with initial state
    updateUI(gameState);
    
    //Render upgrades
    renderUpgrades(gameState);
}

//Update UI to reflect current game state
export function updateUI(gameState: GameState): void {
    //Update resources
    uiElements.resources.focusPoints.textContent = gameState.resources.focusPoints.toString();
    uiElements.resources.timeTokens.textContent = gameState.resources.timeTokens.toString();
    
    //Update stats
    uiElements.stats.totalFocusTime.textContent = gameState.stats.totalFocusTime.toFixed(1);
    uiElements.stats.completedSessions.textContent = gameState.stats.completedSessions.toString();
    uiElements.stats.totalFocusPoints.textContent = gameState.stats.totalFocusPoints.toString();
    
    //Update current reward if in a session
    if (gameState.session.active) {
        uiElements.timer.currentReward.textContent = gameState.session.currentReward.toString();
    }
    
    //Update upgrades (check affordability, etc.)
    updateUpgradeButtons(gameState);
}

//Render all visible upgrades
function renderUpgrades(gameState: GameState): void {
    //Clear container
    uiElements.upgrades.container.innerHTML = '';
    
    //Render each visible upgrade
    Object.values(gameState.upgrades).forEach(upgrade => {
        if (upgrade.visible) {
            renderUpgrade(gameState, upgrade);
        }
    });
}

//Render a single upgrade
function renderUpgrade(gameState: GameState, upgrade: Upgrade): void {
    const upgradeElement = document.createElement('div');
    upgradeElement.className = 'upgrade-item';
    upgradeElement.dataset.id = upgrade.id;
    
    const maxedOut = upgrade.level >= upgrade.maxLevel;
    const canAfford = canAffordUpgrade(gameState, upgrade.id);
    
    upgradeElement.innerHTML = `
        <div class="upgrade-name">${upgrade.name} ${upgrade.level > 0 ? `(Level ${upgrade.level})` : ''}</div>
        <div class="upgrade-description">${upgrade.description}</div>
        <div class="upgrade-cost">Cost: ${upgrade.cost.amount} ${upgrade.cost.resource === 'focusPoints' ? 'Focus Points' : 'Time Tokens'}</div>
        <button class="upgrade-button" data-id="${upgrade.id}" ${!canAfford || maxedOut ? 'disabled' : ''}>${
            maxedOut ? 'Maxed Out' : (canAfford ? 'Purchase' : 'Cannot Afford')
        }</button>
    `;
    
    //Add click handler for the purchase button
    const button = upgradeElement.querySelector('button');
    if (button && !maxedOut) {
        button.addEventListener('click', () => {
            if (purchaseUpgrade(gameState, upgrade.id)) {
                //Update UI after purchase
                updateUI(gameState);
                //Re-render upgrades in case new ones are unlocked
                renderUpgrades(gameState);
                //Save game after purchase
                saveGameState(gameState);
            }
        });
    }
    
    //Add to container
    uiElements.upgrades.container.appendChild(upgradeElement);
}

//Update upgrade buttons based on affordability
function updateUpgradeButtons(gameState: GameState): void {
    const upgradeButtons = document.querySelectorAll('.upgrade-button') as NodeListOf<HTMLButtonElement>;
    
    upgradeButtons.forEach(button => {
        const upgradeId = button.dataset.id;
        if (!upgradeId) return;
        
        const upgrade = gameState.upgrades[upgradeId];
        const maxedOut = upgrade.level >= upgrade.maxLevel;
        const canAfford = canAffordUpgrade(gameState, upgradeId);
        
        button.disabled = !canAfford || maxedOut;
        button.textContent = maxedOut ? 'Maxed Out' : (canAfford ? 'Purchase' : 'Cannot Afford');
    });
}