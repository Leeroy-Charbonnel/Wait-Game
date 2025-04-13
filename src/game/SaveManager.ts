import { Game } from './Game';
import { GameState } from '../types';

export class SaveManager {
  private saveKey = 'wait_game_save';
  
  constructor(private game: Game) {}
  
  public saveGame(): boolean {
    try {
      const gameState = this.game.getState();
      const saveData = JSON.stringify(gameState);
      
      localStorage.setItem(this.saveKey, saveData);
      console.log('Game saved successfully');
      return true;
    } catch (error) {
      console.error('Error saving game:', error);
      return false;
    }
  }
  
  public loadGame(): GameState | null {
    try {
      const saveData = localStorage.getItem(this.saveKey);
      
      if (!saveData) {
        console.log('No saved game found');
        return null;
      }
      
      const gameState = JSON.parse(saveData) as GameState;
      console.log('Game loaded successfully');
      return gameState;
    } catch (error) {
      console.error('Error loading game:', error);
      return null;
    }
  }
  
  public resetGame(): boolean {
    try {
      localStorage.removeItem(this.saveKey);
      console.log('Game reset successfully');
      return true;
    } catch (error) {
      console.error('Error resetting game:', error);
      return false;
    }
  }
  
  public exportSave(): string {
    const gameState = this.game.getState();
    return btoa(JSON.stringify(gameState));
  }
  
  public importSave(saveString: string): boolean {
    try {
      const gameState = JSON.parse(atob(saveString)) as GameState;
      this.game.loadState(gameState);
      return true;
    } catch (error) {
      console.error('Error importing save:', error);
      return false;
    }
  }
}
