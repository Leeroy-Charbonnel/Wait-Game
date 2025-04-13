import React, { useState, useEffect } from 'react';
import { Game } from '../game/Game';
import { ComponentID, MachineID, ResourceID } from '../types';
import { ProgressBar } from './ProgressBar';

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
  //Force a component re-render every 100ms to update progress bars
  const [, setTick] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setTick(tick => tick + 1);
    }, 100);

    return () => clearInterval(interval);
  }, []);

  //Get components by tier
  const basicComponents = game.componentManager.getComponentsByTier('basic');
  const intermediateComponents = game.componentManager.getComponentsByTier('intermediate');
  const advancedComponents = game.componentManager.getComponentsByTier('advanced');

  const handleProduceComponent = (componentId: ComponentID) => {
    //Find a compatible machine
    const machines = game.machineManager.getAllMachinesList();
    let selectedMachine: MachineID | null = null;

    for (const machine of machines) {
      if (machine.getCount() > 0 && machine.canProduceComponent(componentId)) {
        selectedMachine = machine.id;
        break;
      }
    }

    if (!selectedMachine) {
      //Don't show alert, just return silently
      return;
    }

    //Try to start production
    const success = game.machineManager.startProduction(selectedMachine, componentId);

    if (success) {
      //Trigger immediate UI update
      document.dispatchEvent(new Event('game-state-changed'));
    }
  };

  //Check if component can be produced (has resources and machine)
  const canProduceComponent = (componentId: ComponentID): boolean => {
    //Check if we have a compatible machine
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

    //Check if we have enough resources
    const component = game.componentManager.getComponent(componentId);
    if (!component) return false;

    return game.resourceManager.canAfford(component.recipe.inputs);
  };

  //Find active production for a component
  const getActiveProduction = (componentId: ComponentID) => {
    return activeProductions.find(p => p.componentID === componentId);
  };

  //Calculate progress percentage for production
  const getProductionProgress = (startTime: number, endTime: number): number => {
    const currentTime = Date.now();
    const totalTime = endTime - startTime;
    const elapsedTime = currentTime - startTime;
    return Math.min(100, Math.max(0, (elapsedTime / totalTime) * 100));
  };

  //Format remaining time
  const getRemainingTime = (endTime: number): string => {
    const remainingTime = Math.max(0, endTime - Date.now());
    return game.timeManager.getFormattedTime(remainingTime);
  };

  //Render a component section
  const renderComponentSection = (title: string, componentsList: any[]) => {
    return (
      <div className="component-section">
        <h3>{title}</h3>
        <div className="components-list">
          {componentsList.map(component => {
            const canProduce = canProduceComponent(component.id);
            const activeProduction = getActiveProduction(component.id);
            const isProducing = !!activeProduction;

            return (
              <div
                className={`component-item ${isProducing ? 'producing' : ''}`}
                key={component.id}
              >
                <div className="component-header">
                  <span className="component-name">{component.name}</span>
                  <span className="component-count">{components[component.id]}</span>
                </div>

                <div className="component-description">{component.description}</div>

                <div className="component-recipe">
                  Recipe:
                  {component.recipe.inputs.map((input, index) => {
                    const resource = game.resourceManager.getResource(input.id);
                    const componentObj = game.componentManager.getComponent(input.id as any);
                    const name = resource?.name || componentObj?.name || input.id;

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

                {isProducing && (
                  <ProgressBar
                    progress={getProductionProgress(
                      activeProduction.startTime,
                      activeProduction.endTime
                    )}
                    showText={true}
                    customText={getRemainingTime(activeProduction.endTime)}
                  />
                )}

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
    );
  };

  return (
    <div className="production-panel">
      <h2>Production</h2>

      {/* Basic Components */}
      {renderComponentSection("Basic Components", basicComponents)}

      {/* Intermediate Components */}
      {renderComponentSection("Intermediate Components", intermediateComponents)}

      {/* Advanced Components */}
      {renderComponentSection("Advanced Components", advancedComponents)}
    </div>
  );
};