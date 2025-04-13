import { GameState } from './types';
import { addResources, saveGameState } from './core';
import { updateUI } from './ui';

let passiveGenerationInterval: number | null = null;

//Setup upgrades and their effects
export function setupUpgrades(gameState: GameState): void {
    //Setup passive generation if unlocked
    if (gameState.unlocks.passiveGeneration) {
        startPassiveGeneration(gameState);
    }
    
    //Setup other upgrade effects as they're implemented
    checkUpgradeEffects(gameState);
}

//Start passive generation of resources
function startPassiveGeneration(gameState: GameState): void {
    //Clear any existing interval
    if (passiveGenerationInterval !== null) {
        clearInterval(passiveGenerationInterval);
    }
    
    //Set up passive generation (every 10 seconds)
    passiveGenerationInterval = setInterval(() => {
        //Only generate if passive generation is unlocked
        if (gameState.unlocks.passiveGeneration) {
            //Generate focus points (0.1 per minute = 0.0167 per 10 seconds)
            const passiveAmount = 0.1 / 6; //0.1 per minute divided by 6 (10-second intervals)
            
            //Add to resources (accumulate fractional amounts)
            gameState.resources.focusPoints += passiveAmount;
            
            //Update UI
            updateUI(gameState);
        }
    }, 10000) as unknown as number;
}

//Check for and apply any upgrade effects that need to be monitored
function checkUpgradeEffects(gameState: GameState): void {
    //Passive generation check
    if (gameState.unlocks.passiveGeneration && passiveGenerationInterval === null) {
        startPassiveGeneration(gameState);
    }
    
    //Add more upgrade effect checks as they are implemented
}