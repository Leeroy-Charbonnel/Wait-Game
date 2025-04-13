import './style.css';
import { GameModel } from './model';
import { GameUI } from './ui';

//Initialize the game
document.addEventListener('DOMContentLoaded', () => {
  const gameModel = new GameModel();
  
  //Create UI structure with minimal HTML
  document.querySelector<HTMLDivElement>('#app')!.innerHTML = `
    <h1>Wait & Work</h1>
    <p class="subtitle">A minimal idle game for productivity</p>
    
    <div class="game-layout">
      <div class="left-column">
        <div id="resources" class="panel"></div>
        <div id="current-task" class="panel current-task-panel"></div>
        <div id="stats" class="panel"></div>
      </div>
      
      <div class="right-column">
        <div id="tasks" class="panel"></div>
        <div id="upgrades" class="panel"></div>
      </div>
    </div>
    
    <div class="footer">
      <button id="reset-game">Reset Game</button>
    </div>
  `;
  
  //Initialize UI
  const gameUI = new GameUI(gameModel);
  gameUI.renderAll();
  
  //Handle tab visibility changes
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') {
      //Save and reload when tab becomes visible again
      gameModel.saveGame();
      gameModel.loadGame();
      gameUI.renderAll();
    } else {
      //Save when tab is hidden
      gameModel.saveGame();
    }
  });
  
  //Handle before unload
  window.addEventListener('beforeunload', () => {
    gameModel.saveGame();
  });
});