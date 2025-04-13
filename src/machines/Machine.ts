import { ComponentID, MachineID, ResourceCost } from '../types';

export interface MachineUpgrade {
  id: string;
  name: string;
  description: string;
  effect: 'speed' | 'efficiency' | 'parallel';
  value: number;
  cost: ResourceCost[];
  applied: boolean;
}

export class Machine {
  private count: number;
  private productionSlots: number;
  private speedMultiplier: number;
  private efficiencyMultiplier: number;
  private upgrades: MachineUpgrade[];
  private compatibleComponents: Set<ComponentID>;
  
  constructor(
    public readonly id: MachineID,
    public readonly name: string,
    public readonly description: string,
    public readonly buildCost: ResourceCost[],
    compatibleComponents: ComponentID[],
    initialCount: number = 0,
    initialProductionSlots: number = 1,
    upgrades: MachineUpgrade[] = []
  ) {
    this.count = initialCount;
    this.productionSlots = initialProductionSlots;
    this.speedMultiplier = 1.0;
    this.efficiencyMultiplier = 1.0;
    this.upgrades = upgrades;
    this.compatibleComponents = new Set(compatibleComponents);
  }
  
  public getCount(): number {
    return this.count;
  }
  
  public setCount(count: number): void {
    this.count = Math.max(0, count);
  }
  
  public addMachines(count: number): void {
    if (count > 0) {
      this.count += count;
    }
  }
  
  public removeMachines(count: number): boolean {
    if (count <= 0) return true;
    
    if (this.count >= count) {
      this.count -= count;
      return true;
    }
    return false;
  }
  
  public getProductionSlots(): number {
    return this.productionSlots * this.count;
  }
  
  public getSpeedMultiplier(): number {
    return this.speedMultiplier;
  }
  
  public getEfficiencyMultiplier(): number {
    return this.efficiencyMultiplier;
  }
  
  public applyUpgrade(upgradeId: string): boolean {
    const upgrade = this.upgrades.find(u => u.id === upgradeId && !u.applied);
    
    if (!upgrade) return false;
    
    upgrade.applied = true;
    
    switch (upgrade.effect) {
      case 'speed':
        this.speedMultiplier *= upgrade.value;
        break;
      case 'efficiency':
        this.efficiencyMultiplier *= upgrade.value;
        break;
      case 'parallel':
        this.productionSlots += upgrade.value;
        break;
    }
    
    return true;
  }
  
  public getUpgrades(): MachineUpgrade[] {
    return [...this.upgrades];
  }
  
  public canProduceComponent(componentId: ComponentID): boolean {
    return this.compatibleComponents.has(componentId);
  }
  
  public getCompatibleComponents(): ComponentID[] {
    return Array.from(this.compatibleComponents);
  }
  
  public calculateProductionTime(baseTime: number): number {
    return baseTime / this.speedMultiplier;
  }
}
