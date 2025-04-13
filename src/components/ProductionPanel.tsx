import React from 'react';
import { Game } from '../game/Game';
import { ComponentID, MachineID, ResourceID } from '../types';

interface ProductionPanelProps {
  game: Game;
  components: Record<ComponentID, number>;
  resources: Record<ResourceID, number>;
  activeProductions: Array<{
    machineID: MachineID;
    componentID: ComponentID;
    startTime: number;
    endTime: number;
  }>;
}

export const ProductionPanel: React.FC<ProductionPanelProps> = ({ 
  game, 
  components, 
  resources, 
  activeProductions 
}) => {
  // Get components by tier
  const basicComponents = game.componentManager.getComponentsByTier('basic');
  const intermediateComponents = game.componentManager.getComponentsByTier('intermediate');
  const advancedComponents = game.componentManager.getComponentsByTier('advanced');
  
  const handleProduceComponent = (componentId: ComponentID) => {
    // Find a compatible machine
    const machines = game.machineManager.getAllMachinesList();
    let selectedMachine: MachineID | null = null;
    
    for (const machine of machines) {
      if (machine.getCount() > 0 && machine.canProduceComponent(componentId)) {
        selectedMachine = machine.id;
        break;
      }
    }
    
    if (!selectedMachine) {
      alert('No compatible machine available');
      return;
    }
    
    // Try to start production
    const success = game.machineManager.startProduction(selectedMachine, componentId);
    
    if (success) {
      // Trigger immediate UI update
      document.dispatchEvent(new Event('game-state-changed'));
    } else {
      alert('Cannot produce component. Check resources and machine availability.');
    }
  };
  
  // Check if component can be produced (has resources and machine)
  const canProduceComponent = (componentId: ComponentID): boolean => {
    // Check if we have a compatible machine
    const machines = game.machineManager.getAllMachinesList();
    let hasMachine = false;
    
    for (const machine of machines) {
      if (machine.getCount() > 0 && machine.canProduceComponent(componentId)) {
        hasMachine = true;
        break;
      }
    }
    
    if (!hasMachine) {
      return false;
    }
    
    // Check if we have enough resources
    const component = game.componentManager.getComponent(componentId);
    if (!component) return false;
    
    return game.resourceManager.canAfford(component.recipe.inputs);
  };
  
  // Calculate progress percentage for production
  const getProductionProgress = (startTime: number, endTime: number): number => {
    const currentTime = Date.now();
    const totalTime = endTime - startTime;
    const elapsedTime = currentTime - startTime;
    return Math.min(100, Math.max(0, (elapsedTime / totalTime) * 100));
  };
  
  // Format remaining time
  const getRemainingTime = (endTime: number): string => {
    const remainingTime = Math.max(0, endTime - Date.now());
    return game.timeManager.getFormattedTime(remainingTime);
  };
  
  return (
    <div className="production-panel">
      <h2>Production</h2>
      
      {/* Basic Components */}
      <div className="component-section">
        <h3>Basic Components</h3>
        <div className="components-list">
          {basicComponents.map(component => {
            const canProduce = canProduceComponent(component.id);
            
            return (
              <div className="component-item" key={component.id}>
                <div className="component-header">
                  <span className="component-name">{component.name}</span>
                  <span className="component-count">{components[component.id]}</span>
                </div>
                
                <div className="component-description">{component.description}</div>
                
                <div className="component-recipe">
                  Recipe: 
                  {component.recipe.inputs.map((input, index) => {
                    const resource = game.resourceManager.getResource(input.id);
                    return (
                      <span key={input.id}>
                        {index > 0 ? ', ' : ' '}
                        {input.amount} {resource?.name || input.id}
                      </span>
                    );
                  })}
                  
                  {component.recipe.time > 0 && (
                    <span> ({component.recipe.time / 1000}s)</span>
                  )}
                </div>
                
                <button 
                  className="produce-button"
                  onClick={() => handleProduceComponent(component.id)}
                  disabled={!canProduce}
                >
                  Produce
                </button>
              </div>
            );
          })}
        </div>
      </div>
      
      {/* Intermediate Components */}
      <div className="component-section">
        <h3>Intermediate Components</h3>
        <div className="components-list">
          {intermediateComponents.map(component => {
            const canProduce = canProduceComponent(component.id);
            
            return (
              <div className="component-item" key={component.id}>
                <div className="component-header">
                  <span className="component-name">{component.name}</span>
                  <span className="component-count">{components[component.id]}</span>
                </div>
                
                <div className="component-description">{component.description}</div>
                
                <div className="component-recipe">
                  Recipe: 
                  {component.recipe.inputs.map((input, index) => {
                    const resource = game.resourceManager.getResource(input.id);
                    return (
                      <span key={input.id}>
                        {index > 0 ? ', ' : ' '}
                        {input.amount} {resource?.name || input.id}
                      </span>
                    );
                  })}
                  
                  {component.recipe.time > 0 && (
                    <span> ({component.recipe.time / 1000}s)</span>
                  )}
                </div>
                
                <button 
                  className="produce-button"
                  onClick={() => handleProduceComponent(component.id)}
                  disabled={!canProduce}
                >
                  Produce
                </button>
              </div>
            );
          })}
        </div>
      </div>
      
      {/* Advanced Components */}
      <div className="component-section">
        <h3>Advanced Components</h3>
        <div className="components-list">
          {advancedComponents.map(component => {
            const canProduce = canProduceComponent(component.id);
            
            return (
              <div className="component-item" key={component.id}>
                <div className="component-header">
                  <span className="component-name">{component.name}</span>
                  <span className="component-count">{components[component.id]}</span>
                </div>
                
                <div className="component-description">{component.description}</div>
                
                <div className="component-recipe">
                  Recipe: 
                  {component.recipe.inputs.map((input, index) => {
                    const resource = game.resourceManager.getResource(input.id);
                    const component = game.componentManager.getComponent(input.id as any);
                    const name = resource?.name || component?.name || input.id;
                    
                    return (
                      <span key={input.id}>
                        {index > 0 ? ', ' : ' '}
                        {input.amount} {name}
                      </span>
                    );
                  })}
                  
                  {component.recipe.time > 0 && (
                    <span> ({component.recipe.time / 1000}s)</span>
                  )}
                </div>
                
                <button 
                  className="produce-button"
                  onClick={() => handleProduceComponent(component.id)}
                  disabled={!canProduce}
                >
                  Produce
                </button>
              </div>
            );
          })}
        </div>
      </div>
      
      {/* Active Production */}
      <div className="production-section">
        <h3>Active Production</h3>
        <div className="production-list">
          {activeProductions.length === 0 ? (
            <div>No active production</div>
          ) : (
            activeProductions.map((production, index) => {
              const machine = game.machineManager.getMachine(production.machineID);
              const component = game.componentManager.getComponent(production.componentID);
              
              if (!machine || !component) return null;
              
              const progress = getProductionProgress(production.startTime, production.endTime);
              const remainingTime = getRemainingTime(production.endTime);
              
              return (
                <div className="production-item" key={index}>
                  <div className="production-name">
                    {machine.name} → {component.name}
                  </div>
                  
                  <div className="progress-container">
                    <div 
                      className="progress-bar"
                      style={{ width: `${progress}%` }}
                    ></div>
                  </div>
                  
                  <div className="production-time">{remainingTime}</div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};