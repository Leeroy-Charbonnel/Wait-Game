import React from 'react';
import { Game } from '../game/Game';

interface FooterProps {
  game: Game;
  gameTime: string;
}

export const Footer: React.FC<FooterProps> = ({ game, gameTime }) => {
  const handleSaveGame = () => {
    const success = game.saveManager.saveGame();
    if (success) {
      alert('Game saved successfully');
    } else {
      alert('Failed to save game');
    }
  };
  
  const handleLoadGame = () => {
    const savedGame = game.saveManager.loadGame();
    if (savedGame) {
      game.loadState(savedGame);
      alert('Game loaded successfully');
    } else {
      alert('No saved game found');
    }
  };
  
  const handleResetGame = () => {
    if (confirm('Are you sure you want to reset the game? All progress will be lost.')) {
      game.saveManager.resetGame();
      window.location.reload();
    }
  };
  
  return (
    <footer className="game-footer">
      <div className="game-footer-buttons">
        <button className="save-button" onClick={handleSaveGame}>Save Game</button>
        <button className="load-button" onClick={handleLoadGame}>Load Game</button>
        <button className="reset-button" onClick={handleResetGame}>Reset Game</button>
      </div>
      
      <div className="game-time">
        Time: {gameTime}
      </div>
    </footer>
  );
};