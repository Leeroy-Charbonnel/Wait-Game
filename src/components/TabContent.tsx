import React from 'react';
import { Game } from '../game/Game';
import { MachinesTab } from './tabs/MachinesTab';
import { InventoryTab } from './tabs/InventoryTab';
import { ResearchTab } from './tabs/ResearchTab';
import { TechTreeTab } from './tabs/TechTreeTab';
import { AutomationTab } from './tabs/AutomationTab';
import { ComponentID, MachineID, ResourceID, TabID } from '../types';

interface TabContentProps {
  game: Game;
  activeTab: TabID;
  gameState: {
    resources: Record<ResourceID, number>;
    components: Record<ComponentID, number>;
    machines: Record<MachineID, number>;
    research: string[];
    activeResearch: {
      id: string | null;
      startTime: number;
      duration: number;
    };
    activeProductions: Array<{
      machineID: MachineID;
      componentID: ComponentID;
      startTime: number;
      endTime: number;
    }>;
    gameTime: string;
  };
}

export const TabContent: React.FC<TabContentProps> = ({ game, activeTab, gameState }) => {
  return (
    <div className="tab-content">
      {activeTab === 'machines' && (
        <MachinesTab 
          game={game} 
          machines={gameState.machines} 
        />
      )}
      
      {activeTab === 'inventory' && (
        <InventoryTab 
          game={game} 
          resources={gameState.resources}
          components={gameState.components}
        />
      )}
      
      {activeTab === 'research' && (
        <ResearchTab 
          game={game} 
          completedResearch={gameState.research}
          activeResearch={gameState.activeResearch} 
        />
      )}
      
      {activeTab === 'tech_tree' && (
        <TechTreeTab 
          game={game} 
          completedResearch={gameState.research} 
        />
      )}
      
      {activeTab === 'automation' && (
        <AutomationTab 
          game={game} 
        />
      )}
    </div>
  );
};