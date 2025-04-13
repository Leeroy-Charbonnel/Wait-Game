import { Game } from '../game/Game';
import { Component } from './Component';
import { ComponentID, ResourceCost } from '../types';

export class ComponentManager {
  private components: Map<ComponentID, Component> = new Map();
  private productionQueue: Map<string, {
    componentID: ComponentID;
    machineID: string;
    startTime: number;
    endTime: number;
  }> = new Map();
  
  constructor(private game: Game) {
    this.initializeComponents();
  }
  
  private initializeComponents(): void {
    // Basic components (0 seconds production time)
    this.components.set('wire', new Component(
      'wire',
      'Wire',
      'Basic conductive element used in electronic components.',
      {
        inputs: [
          { id: 'copper', amount: 1 },
          { id: 'electricity', amount: 1 }
        ],
        time: 0
      },
      'basic'
    ));
    
    this.components.set('screw', new Component(
      'screw',
      'Screw',
      'Basic fastener used in assembly.',
      {
        inputs: [
          { id: 'iron', amount: 1 },
          { id: 'electricity', amount: 1 }
        ],
        time: 0
      },
      'basic'
    ));
    
    this.components.set('metal_plate', new Component(
      'metal_plate',
      'Metal Plate',
      'Flat piece of metal used for structural components.',
      {
        inputs: [
          { id: 'iron', amount: 2 },
          { id: 'electricity', amount: 1 }
        ],
        time: 0
      },
      'basic'
    ));
    
    // Intermediate components
    this.components.set('pcb', new Component(
      'pcb',
      'PCB',
      'Printed Circuit Board - the foundation of electronic devices.',
      {
        inputs: [
          { id: 'copper', amount: 3 },
          { id: 'plastic', amount: 2 },
          { id: 'electricity', amount: 5 }
        ],
        time: 2000 // 2 seconds
      },
      'intermediate'
    ));
    
    this.components.set('battery', new Component(
      'battery',
      'Battery',
      'Stores electrical energy for portable use.',
      {
        inputs: [
          { id: 'copper', amount: 2 },
          { id: 'iron', amount: 2 },
          { id: 'electricity', amount: 10 }
        ],
        time: 5000 // 5 seconds
      },
      'intermediate'
    ));
    
    this.components.set('sensor', new Component(
      'sensor',
      'Sensor',
      'Detects changes in the environment.',
      {
        inputs: [
          { id: 'silicon', amount: 3 },
          { id: 'wire', amount: 2 },
          { id: 'electricity', amount: 8 }
        ],
        time: 10000 // 10 seconds
      },
      'intermediate'
    ));
    
    // Advanced components
    this.components.set('logic_unit', new Component(
      'logic_unit',
      'Logic Unit',
      'Processes and executes basic instructions.',
      {
        inputs: [
          { id: 'silicon', amount: 5 },
          { id: 'pcb', amount: 2 },
          { id: 'wire', amount: 4 },
          { id: 'electricity', amount: 15 }
        ],
        time: 15000 // 15 seconds
      },
      'advanced'
    ));
    
    this.components.set('laser_core', new Component(
      'laser_core',
      'Laser Core',
      'Emits a concentrated beam of light for precision tasks.',
      {
        inputs: [
          { id: 'silicon', amount: 6 },
          { id: 'pcb', amount: 1 },
          { id: 'metal_plate', amount: 3 },
          { id: 'electricity', amount: 20 }
        ],
        time: 25000 // 25 seconds
      },
      'advanced'
    ));
    
    this.components.set('ai_module', new Component(
      'ai_module',
      'AI Module',
      'Advanced processing unit capable of learning and adaptation.',
      {
        inputs: [
          { id: 'logic_unit', amount: 2 },
          { id: 'sensor', amount: 3 },
          { id: 'pcb', amount: 4 },
          { id: 'electricity', amount: 30 }
        ],
        time: 30000 // 30 seconds
      },
      'advanced'
    ));
  }
  
  public getComponent(id: ComponentID): Component | undefined {
    return this.components.get(id);
  }
  
  public addComponent(id: ComponentID, amount: number): void {
    const component = this.getComponent(id);
    if (component) {
      component.add(amount);
    }
  }
  
  public subtractComponent(id: ComponentID, amount: number): boolean {
    const component = this.getComponent(id);
    if (component) {
      return component.subtract(amount);
    }
    return false;
  }
  
  public setComponent(id: ComponentID, amount: number): void {
    const component = this.getComponent(id);
    if (component) {
      component.setAmount(amount);
    }
  }
  
  public getComponentAmount(id: ComponentID): number {
    const component = this.getComponent(id);
    return component ? component.getAmount() : 0;
  }
  
  public getAllComponents(): Record<ComponentID, number> {
    const components: Partial<Record<ComponentID, number>> = {};
    
    this.components.forEach((component, id) => {
      components[id] = component.getAmount();
    });
    
    return components as Record<ComponentID, number>;
  }
  
  public canCraft(id: ComponentID): boolean {
    const component = this.getComponent(id);
    if (!component) return false;
    
    return this.game.resourceManager.canAfford(component.recipe.inputs);
  }
  
  public craftComponent(id: ComponentID, machineID: string): boolean {
    const component = this.getComponent(id);
    if (!component) return false;
    
    // Check if resources are available
    if (!this.game.resourceManager.canAfford(component.recipe.inputs)) {
      return false;
    }
    
    // Pay the resource costs
    this.game.resourceManager.payCosts(component.recipe.inputs);
    
    const productionTime = component.getProductionTime();
    
    if (productionTime <= 0) {
      // Instant production
      this.addComponent(id, 1);
      return true;
    } else {
      // Delayed production
      const currentTime = Date.now();
      const startTime = currentTime;
      const endTime = currentTime + productionTime;
      
      const queueKey = `${machineID}-${id}-${startTime}`;
      
      this.productionQueue.set(queueKey, {
        componentID: id,
        machineID,
        startTime,
        endTime
      });
      
      return true;
    }
  }
  
  public update(deltaTime: number): void {
    const currentTime = Date.now();
    const completedItems: string[] = [];
    
    // Check for completed production
    this.productionQueue.forEach((item, key) => {
      if (currentTime >= item.endTime) {
        // Production completed
        this.addComponent(item.componentID, 1);
        completedItems.push(key);
      }
    });
    
    // Remove completed items from queue
    completedItems.forEach(key => {
      this.productionQueue.delete(key);
    });
  }
  
  public getComponentsByTier(tier: 'basic' | 'intermediate' | 'advanced'): Component[] {
    const filteredComponents: Component[] = [];
    
    this.components.forEach(component => {
      if (component.tier === tier) {
        filteredComponents.push(component);
      }
    });
    
    return filteredComponents;
  }
  
  public getComponentRecipeCost(id: ComponentID): ResourceCost[] {
    const component = this.getComponent(id);
    return component ? component.recipe.inputs : [];
  }
  
  public getAllComponentsList(): Component[] {
    return Array.from(this.components.values());
  }
}
