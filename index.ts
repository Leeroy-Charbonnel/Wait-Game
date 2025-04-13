import { GameState } from './src/types';
import { initializeUI } from './src/ui';
import { setupTimerEvents } from './src/timer';
import { setupUpgrades } from './src/upgrades';
import { initializeGameState, saveGameState, loadGameState } from './src/core';

//Main entry point for the game
document.addEventListener('DOMContentLoaded', () => {
    console.log('Wait Game starting...');
    
    //Initialize or load game state
    let gameState: GameState;
    const savedState = loadGameState();
    
    if (savedState) {
        gameState = savedState;
        console.log('Loaded saved game state');
    } else {
        gameState = initializeGameState();
        console.log('Initialized new game state');
    }
    
    //Setup UI with game state
    initializeUI(gameState);
    
    //Setup timer and waiting mechanics
    setupTimerEvents(gameState);
    
    //Setup upgrades
    setupUpgrades(gameState);
    
    //Auto-save game every 30 seconds
    setInterval(() => {
        saveGameState(gameState);
        console.log('Game state auto-saved');
    }, 30000);
    
    //Also save on page unload
    window.addEventListener('beforeunload', () => {
        saveGameState(gameState);
    });
});