import React, { useState, useEffect, useCallback } from 'react';
import { Game } from '../game/Game';
import { Header } from './Header';
import { Footer } from './Footer';
import { TabContent } from './TabContent';
import { ProductionPanel } from './ProductionPanel';
import { TabID } from '../types';

// Create a global event for state updates
export const GameEvents = {
  stateChanged: 'game-state-changed'
};

interface AppProps {
  game: Game;
}

export const App: React.FC<AppProps> = ({ game }) => {
  const [activeTab, setActiveTab] = useState<TabID>('machines');
  const [gameState, setGameState] = useState({
    resources: game.resourceManager.getAllResources(),
    components: game.componentManager.getAllComponents(),
    machines: game.machineManager.getAllMachines(),
    research: game.researchManager.getCompletedResearch(),
    activeResearch: game.researchManager.getActiveResearch(),
    activeProductions: game.machineManager.getActiveProductions(),
    gameTime: game.timeManager.getFormattedElapsedTime(),
  });

  // Function to update game state
  const updateGameState = useCallback(() => {
    setGameState({
      resources: game.resourceManager.getAllResources(),
      components: game.componentManager.getAllComponents(),
      machines: game.machineManager.getAllMachines(),
      research: game.researchManager.getCompletedResearch(),
      activeResearch: game.researchManager.getActiveResearch(),
      activeProductions: game.machineManager.getActiveProductions(),
      gameTime: game.timeManager.getFormattedElapsedTime(),
    });
  }, [game]);

  // Update game state every second
  useEffect(() => {
    const interval = setInterval(updateGameState, 1000);

    // Listen for immediate state update events
    const handleStateChanged = () => {
      updateGameState();
    };
    
    document.addEventListener(GameEvents.stateChanged, handleStateChanged);

    return () => {
      clearInterval(interval);
      document.removeEventListener(GameEvents.stateChanged, handleStateChanged);
    };
  }, [game, updateGameState]);

  const handleTabChange = (tabId: TabID) => {
    setActiveTab(tabId);
  };

  return (
    <div className="game-container">
      <Header game={game} resources={gameState.resources} />
      
      <div className="main-content">
        {/* Production Panel moved to the left */}
        <ProductionPanel 
          game={game}
          components={gameState.components}
          resources={gameState.resources}
          activeProductions={gameState.activeProductions}
        />
        
        <div className="tab-section">
          <div className="tab-nav">
            <button 
              className={activeTab === 'machines' ? 'tab-button active' : 'tab-button'}
              onClick={() => handleTabChange('machines')}
            >
              Machines
            </button>
            <button 
              className={activeTab === 'inventory' ? 'tab-button active' : 'tab-button'}
              onClick={() => handleTabChange('inventory')}
            >
              Inventory
            </button>
            <button 
              className={activeTab === 'research' ? 'tab-button active' : 'tab-button'}
              onClick={() => handleTabChange('research')}
            >
              Research
            </button>
            <button 
              className={activeTab === 'tech_tree' ? 'tab-button active' : 'tab-button'}
              onClick={() => handleTabChange('tech_tree')}
            >
              Tech Tree
            </button>
            <button 
              className={activeTab === 'automation' ? 'tab-button active' : 'tab-button'}
              onClick={() => handleTabChange('automation')}
            >
              Automation
            </button>
          </div>
          
          <TabContent 
            game={game}
            activeTab={activeTab}
            gameState={gameState}
          />
        </div>
      </div>
      
      <Footer 
        game={game}
        gameTime={gameState.gameTime}
      />
    </div>
  );
};