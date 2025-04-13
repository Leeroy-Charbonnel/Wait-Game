import React from 'react';
import { Game } from '../../game/Game';

interface AutomationTabProps {
  game: Game;
}

export const AutomationTab: React.FC<AutomationTabProps> = ({ game }) => {
  return (
    <div className="automation-tab">
      <h2>Automation</h2>
      
      {/* Placeholder content - will be implemented in future updates */}
      <div className="placeholder">
        Automation features will be unlocked as you progress through research.
      </div>
    </div>
  );
};