import { Game } from '../game/Game';
import { Resource } from './Resource';
import { ResourceCost, ResourceID } from '../types';

export class ResourceManager {
  private resources: Map<ResourceID, Resource> = new Map();
  
  constructor(private game: Game) {
    this.initializeResources();
  }
  
  private initializeResources(): void {
    // Materials
    this.resources.set('copper', new Resource('copper', 'Copper', 'material', 'A basic conductive material used in many components.'));
    this.resources.set('plastic', new Resource('plastic', 'Plastic', 'material', 'A versatile material used for casings and insulators.'));
    this.resources.set('silicon', new Resource('silicon', 'Silicon', 'material', 'The foundation of electronic components.'));
    this.resources.set('iron', new Resource('iron', 'Iron', 'material', 'A sturdy material used for structural components.'));
    
    // Energy
    this.resources.set('electricity', new Resource('electricity', 'Electricity', 'energy', 'Powers machines and production.'));
    this.resources.set('fuel_cell', new Resource('fuel_cell', 'Fuel Cell', 'energy', 'A dense energy storage medium.'));
    this.resources.set('solar_unit', new Resource('solar_unit', 'Solar Unit', 'energy', 'Clean energy generated from light.'));
    
    // Research
    this.resources.set('research_point', new Resource('research_point', 'Research Point', 'research', 'Used to unlock new technologies.'));
  }
  
  public getResource(id: ResourceID): Resource | undefined {
    return this.resources.get(id);
  }
  
  public addResource(id: ResourceID, amount: number): void {
    const resource = this.getResource(id);
    if (resource) {
      resource.add(amount);
    }
  }
  
  public subtractResource(id: ResourceID, amount: number): boolean {
    const resource = this.getResource(id);
    if (resource) {
      return resource.subtract(amount);
    }
    return false;
  }
  
  public setResource(id: ResourceID, amount: number): void {
    const resource = this.getResource(id);
    if (resource) {
      resource.setAmount(amount);
    }
  }
  
  public getResourceAmount(id: ResourceID): number {
    const resource = this.getResource(id);
    return resource ? resource.getAmount() : 0;
  }
  
  public getAllResources(): Record<ResourceID, number> {
    const resources: Partial<Record<ResourceID, number>> = {};
    
    this.resources.forEach((resource, id) => {
      resources[id] = resource.getAmount();
    });
    
    return resources as Record<ResourceID, number>;
  }
  
  public canAfford(costs: ResourceCost[]): boolean {
    return costs.every(cost => {
      const resource = this.getResource(cost.id);
      return resource && resource.canSubtract(cost.amount);
    });
  }
  
  public payCosts(costs: ResourceCost[]): boolean {
    if (!this.canAfford(costs)) {
      return false;
    }
    
    costs.forEach(cost => {
      this.subtractResource(cost.id, cost.amount);
    });
    
    return true;
  }
  
  public getResourcesByType(type: 'material' | 'energy' | 'research'): Resource[] {
    const filteredResources: Resource[] = [];
    
    this.resources.forEach(resource => {
      if (resource.type === type) {
        filteredResources.push(resource);
      }
    });
    
    return filteredResources;
  }
}
