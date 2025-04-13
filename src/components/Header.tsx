import React from 'react';
import { Game } from '../game/Game';
import { ResourceID } from '../types';

interface HeaderProps {
  game: Game;
  resources: Record<ResourceID, number>;
}

export const Header: React.FC<HeaderProps> = ({ game, resources }) => {
  // Group resources by type
  const materialResources = game.resourceManager.getResourcesByType('material');
  const energyResources = game.resourceManager.getResourcesByType('energy');
  const researchResources = game.resourceManager.getResourcesByType('research');
  
  return (
    <header className="game-header">
      <h1>Wait Game</h1>
      
      <div className="resources-display">
        <div className="resource-section">
          <h3>Materials</h3>
          <div className="resources-list">
            {materialResources.map(resource => (
              <div className="resource-item" key={resource.id}>
                {resource.name}: <span className="resource-value">{resources[resource.id]}</span>
              </div>
            ))}
          </div>
        </div>
        
        <div className="resource-section">
          <h3>Energy</h3>
          <div className="resources-list">
            {energyResources.map(resource => (
              <div className="resource-item" key={resource.id}>
                {resource.name}: <span className="resource-value">{resources[resource.id]}</span>
              </div>
            ))}
          </div>
        </div>
        
        <div className="resource-section">
          <h3>Research</h3>
          <div className="resources-list">
            {researchResources.map(resource => (
              <div className="resource-item" key={resource.id}>
                {resource.name}: <span className="resource-value">{resources[resource.id]}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </header>
  );
};