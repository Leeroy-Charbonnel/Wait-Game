import React from 'react';
import { Game } from '../../game/Game';
import { MachineID } from '../../types';

interface MachinesTabProps {
  game: Game;
  machines: Record<MachineID, number>;
}

export const MachinesTab: React.FC<MachinesTabProps> = ({ game, machines }) => {
  const handleBuildMachine = (machineId: MachineID) => {
    const success = game.machineManager.buildMachine(machineId);
    
    if (!success) {
      alert('Cannot build machine. Check resources.');
    }
  };
  
  const handleUpgradeMachine = (machineId: MachineID, upgradeId: string) => {
    const success = game.machineManager.upgradeMachine(machineId, upgradeId);
    
    if (!success) {
      alert('Cannot upgrade machine. Check resources.');
    }
  };
  
  // Check if player can afford to build a machine
  const canAffordMachine = (machineId: MachineID): boolean => {
    const machine = game.machineManager.getMachine(machineId);
    if (!machine) return false;
    
    return game.resourceManager.canAfford(machine.buildCost);
  };
  
  // Check if player can afford an upgrade
  const canAffordUpgrade = (upgradeId: string, machineCosts: any[]): boolean => {
    return game.resourceManager.canAfford(machineCosts);
  };
  
  const machinesList = game.machineManager.getAllMachinesList();
  
  return (
    <div className="machines-tab">
      <h2>Machines</h2>
      
      <div className="machines-list">
        {machinesList.map(machine => {
          const canBuild = canAffordMachine(machine.id);
          
          return (
            <div className="machine-item" key={machine.id}>
              <div className="machine-header">
                <span className="machine-name">{machine.name}</span>
                <span className="machine-count">{machines[machine.id]}</span>
              </div>
              
              <div className="machine-description">{machine.description}</div>
              
              <div className="machine-compatible">
                Compatible components: 
                {machine.getCompatibleComponents().map((compId, index) => {
                  const comp = game.componentManager.getComponent(compId);
                  if (!comp) return null;
                  
                  return (
                    <span key={compId}>
                      {index > 0 ? ', ' : ' '}
                      {comp.name}
                    </span>
                  );
                })}
              </div>
              
              <div className="machine-cost">
                Cost: 
                {machine.buildCost.map((cost, index) => {
                  const resource = game.resourceManager.getResource(cost.id);
                  return (
                    <span key={cost.id}>
                      {index > 0 ? ', ' : ' '}
                      {cost.amount} {resource?.name || cost.id}
                    </span>
                  );
                })}
              </div>
              
              <button
                className="build-button"
                onClick={() => handleBuildMachine(machine.id)}
                disabled={!canBuild}
              >
                Build
              </button>
              
              {/* Upgrades */}
              {machine.getUpgrades().length > 0 && (
                <div className="machine-upgrades">
                  <h4>Upgrades</h4>
                  
                  {machine.getUpgrades().map(upgrade => {
                    const canUpgrade = !upgrade.applied && canAffordUpgrade(upgrade.id, upgrade.cost);
                    
                    return (
                      <div className="machine-upgrade-item" key={upgrade.id}>
                        <div className="upgrade-name">{upgrade.name}</div>
                        <div className="upgrade-description">{upgrade.description}</div>
                        
                        <div className="upgrade-cost">
                          Cost: 
                          {upgrade.cost.map((cost, index) => {
                            const resource = game.resourceManager.getResource(cost.id);
                            return (
                              <span key={cost.id}>
                                {index > 0 ? ', ' : ' '}
                                {cost.amount} {resource?.name || cost.id}
                              </span>
                            );
                          })}
                        </div>
                        
                        <button
                          className="upgrade-button"
                          onClick={() => handleUpgradeMachine(machine.id, upgrade.id)}
                          disabled={upgrade.applied || !canUpgrade}
                        >
                          {upgrade.applied ? 'Applied' : 'Upgrade'}
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};