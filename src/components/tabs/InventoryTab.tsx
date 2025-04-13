import React from 'react';
import { Game } from '../../game/Game';
import { ComponentID, ResourceID } from '../../types';

interface InventoryTabProps {
  game: Game;
  resources: Record<ResourceID, number>;
  components: Record<ComponentID, number>;
}

export const InventoryTab: React.FC<InventoryTabProps> = ({ game, resources, components }) => {
  //Get all resources by type
  const materialResources = game.resourceManager.getResourcesByType('material');
  const energyResources = game.resourceManager.getResourcesByType('energy');
  const researchResources = game.resourceManager.getResourcesByType('research');
  
  //Get all components
  const allComponents = game.componentManager.getAllComponentsList();
  
  return (
    <div className="inventory-tab">
      <h2>Inventory</h2>
      
      {/* Resources section */}
      <div className="inventory-section">
        <h3>Resources</h3>
        <div className="inventory-list">
          {[...materialResources, ...energyResources, ...researchResources].map(resource => (
            <div className="inventory-item" key={resource.id}>
              <span className="item-name">{resource.name}</span>
              <span className="item-count">{resources[resource.id]}</span>
            </div>
          ))}
        </div>
      </div>
      
      {/* Components section */}
      <div className="inventory-section">
        <h3>Components</h3>
        <div className="inventory-list">
          {allComponents.map(component => (
            <div className="inventory-item" key={component.id}>
              <span className="item-name">{component.name}</span>
              <span className="item-count">{components[component.id]}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};