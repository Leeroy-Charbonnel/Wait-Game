import React from 'react';
import { createRoot } from 'react-dom/client';
import { Game } from '../game/Game';
import { ModalManager } from './ModalManager';
import { ComponentID, MachineID, ResourceID, TabID, ResearchID } from '../types';
import { App } from '../components/App';

export class UIManager {
  private rootElement: HTMLElement;
  private modalManager: ModalManager;

  constructor(private game: Game, rootElement: HTMLElement) {
    this.rootElement = rootElement;
    this.modalManager = new ModalManager();
  }

  public initUI(): void {
    //Create React root and render the App component
    const root = createRoot(this.rootElement);
    // Using React.createElement instead of JSX
    root.render(React.createElement(App, { game: this.game }));
  }

  //Game action methods - these are used by React components

  public handleProduceComponent(componentId: ComponentID): boolean {
    //Find a compatible machine
    const machines = this.game.machineManager.getAllMachinesList();
    let selectedMachine: MachineID | null = null;

    for (const machine of machines) {
      if (machine.getCount() > 0 && machine.canProduceComponent(componentId)) {
        selectedMachine = machine.id;
        break;
      }
    }

    if (!selectedMachine) {
      this.modalManager.showAlert('No compatible machine available');
      return false;
    }

    //Try to start production
    const success = this.game.machineManager.startProduction(selectedMachine, componentId);

    if (success) {
      //Trigger UI update
      document.dispatchEvent(new Event('game-state-changed'));
    } else {
      this.modalManager.showAlert('Cannot produce component. Check resources and machine availability.');
    }

    return success;
  }

  public handleBuildMachine(machineId: MachineID): boolean {
    const success = this.game.machineManager.buildMachine(machineId);

    if (success) {
      //Trigger UI update
      document.dispatchEvent(new Event('game-state-changed'));
    } else {
      this.modalManager.showAlert('Cannot build machine. Check resources.');
    }
    
    return success;
  }

  public handleUpgradeMachine(machineId: MachineID, upgradeId: string): boolean {
    const success = this.game.machineManager.upgradeMachine(machineId, upgradeId);

    if (success) {
      //Trigger UI update
      document.dispatchEvent(new Event('game-state-changed'));
    } else {
      this.modalManager.showAlert('Cannot upgrade machine. Check resources.');
    }
    
    return success;
  }

  public handleStartResearch(researchId: ResearchID): boolean {
    const success = this.game.researchManager.startResearch(researchId);

    if (success) {
      //Trigger UI update
      document.dispatchEvent(new Event('game-state-changed'));
    } else {
      this.modalManager.showAlert('Cannot start research. Check requirements.');
    }
    
    return success;
  }

  public handleCancelResearch(): void {
    this.game.researchManager.cancelResearch();
    //Trigger UI update
    document.dispatchEvent(new Event('game-state-changed'));
  }

  public handleSaveGame(): boolean {
    const success = this.game.saveManager.saveGame();

    if (success) {
      this.modalManager.showAlert('Game saved successfully');
    } else {
      this.modalManager.showAlert('Failed to save game');
    }
    
    return success;
  }

  public handleLoadGame(): boolean {
    const savedGame = this.game.saveManager.loadGame();

    if (savedGame) {
      this.game.loadState(savedGame);
      this.modalManager.showAlert('Game loaded successfully');
      return true;
    } else {
      this.modalManager.showAlert('No saved game found');
      return false;
    }
  }

  public handleResetGame(): void {
    this.modalManager.showConfirm('Are you sure you want to reset the game? All progress will be lost.', () => {
      this.game.saveManager.resetGame();
      window.location.reload();
    });
  }

  //State checking methods - these are used by React components

  public canProduceComponent(componentId: ComponentID): boolean {
    //Check if we have a compatible machine
    const machines = this.game.machineManager.getAllMachinesList();
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
    const component = this.game.componentManager.getComponent(componentId);
    if (!component) return false;

    return this.game.resourceManager.canAfford(component.recipe.inputs);
  }

  public canBuildMachine(machineId: MachineID): boolean {
    const machine = this.game.machineManager.getMachine(machineId);
    if (!machine) return false;
    
    return this.game.resourceManager.canAfford(machine.buildCost);
  }

  public canUpgradeMachine(machineId: MachineID, upgradeId: string): boolean {
    const machine = this.game.machineManager.getMachine(machineId);
    if (!machine) return false;
    
    const upgrade = machine.getUpgrades().find(u => u.id === upgradeId);
    if (!upgrade || upgrade.applied) return false;
    
    return this.game.resourceManager.canAfford(upgrade.cost);
  }

  public canStartResearch(researchId: ResearchID): boolean {
    const research = this.game.researchManager.getResearch(researchId);
    if (!research) return false;
    
    //Check if already researched
    if (this.game.researchManager.isResearchCompleted(researchId)) {
      return false;
    }
    
    //Check if another research is already active
    const activeResearch = this.game.researchManager.getActiveResearch();
    if (activeResearch.id) {
      return false;
    }
    
    //Check requirements
    return research.requirements.every(req => {
      switch (req.type) {
        case 'research':
          return this.game.researchManager.isResearchCompleted(req.id as ResearchID);
        
        case 'component':
          return this.game.componentManager.getComponentAmount(req.id as ComponentID) >= (req.amount || 0);
        
        case 'resource':
          return this.game.resourceManager.getResourceAmount(req.id as ResourceID) >= (req.amount || 0);
        
        default:
          return false;
      }
    });
  }

  //Modal helpers
  public showAlert(message: string): void {
    this.modalManager.showAlert(message);
  }

  public showConfirm(message: string, onConfirm: () => void, onCancel?: () => void): void {
    this.modalManager.showConfirm(message, onConfirm, onCancel);
  }

  //Legacy method that's still needed by Game class
  public update(): void {
    //React handles updates through its own state system
    //This method is kept for compatibility with the Game class
  }
}