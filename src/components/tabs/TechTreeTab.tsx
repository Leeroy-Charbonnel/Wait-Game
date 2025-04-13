import React from 'react';
import { Game } from '../../game/Game';

interface TechTreeTabProps {
  game: Game;
  completedResearch: string[];
}

export const TechTreeTab: React.FC<TechTreeTabProps> = ({ game, completedResearch }) => {
  //Generate 5 tiers for the tech tree
  const tiers = [1, 2, 3, 4, 5];
  
  return (
    <div className="tech-tree-tab">
      <h2>Technology Tree</h2>
      
      <div className="tech-tree-container">
        {tiers.map(tier => {
          const tierResearch = game.researchManager.getResearchByTier(tier);
          
          return (
            <div className="tech-tier" key={tier}>
              <h3>Tier {tier}</h3>
              
              <div className="tech-list">
                {tierResearch.map(research => {
                  const isCompleted = completedResearch.includes(research.id);
                  
                  return (
                    <div 
                      className={`tech-item ${isCompleted ? 'completed' : ''}`}
                      key={research.id}
                      data-id={research.id}
                    >
                      <div className="tech-name">{research.name}</div>
                      <div className="tech-time">{research.getFormattedDuration()}</div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};