import { Game } from '../game/Game';
import { Machine } from './Machine';
import { ComponentID, MachineID } from '../types';

export class MachineManager {
  private machines: Map<MachineID, Machine> = new Map();
  private activeProductions: Array<{
    machineID: MachineID;
    componentID: ComponentID;
    startTime: number;
    endTime: number;
  }> = [];
  
  constructor(private game: Game) {
    this.initializeMachines();
  }
  
  private initializeMachines(): void {
    // Manual Assembler
    this.machines.set('manual_assembler', new Machine(
      'manual_assembler',
      'Manual Assembler',
      'A basic workstation for assembling components by hand.',
      [
        { id: 'iron', amount: 5 },
        { id: 'electricity', amount: 10 }
      ],
      ['wire', 'screw', 'metal_plate', 'pcb']
    ));
    
    // PCB Printer
    this.machines.set('pcb_printer', new Machine(
      'pcb_printer',
      'PCB Printer',
      'Specialized machine for creating printed circuit boards.',
      [
        { id: 'iron', amount: 10 },
        { id: 'copper', amount: 15 },
        { id: 'electricity', amount: 20 }
      ],
      ['pcb'],
      0,
      1,
      [
        {
          id: 'pcb_printer_speed',
          name: 'High-Precision Nozzles',
          description: 'Increases PCB printing speed by 50%.',
          effect: 'speed',
          value: 1.5,
          cost: [
            { id: 'copper', amount: 30 },
            { id: 'research_point', amount: 5 }
          ],
          applied: false
        }
      ]
    ));
    
    // Heat Chamber
    this.machines.set('heat_chamber', new Machine(
      'heat_chamber',
      'Heat Chamber',
      'Controls temperature for specific manufacturing processes.',
      [
        { id: 'iron', amount: 20 },
        { id: 'silicon', amount: 10 },
        { id: 'electricity', amount: 30 }
      ],
      ['battery', 'sensor'],
      0,
      1,
      [
        {
          id: 'heat_chamber_efficiency',
          name: 'Thermal Regulators',
          description: 'Reduces energy consumption by 30%.',
          effect: 'efficiency',
          value: 1.3,
          cost: [
            { id: 'silicon', amount: 20 },
            { id: 'research_point', amount: 10 }
          ],
          applied: false
        }
      ]
    ));
    
    // Nano-Etcher
    this.machines.set('nano_etcher', new Machine(
      'nano_etcher',
      'Nano-Etcher',
      'Precision tool for microscopic etching on silicon wafers.',
      [
        { id: 'iron', amount: 25 },
        { id: 'silicon', amount: 30 },
        { id: 'electricity', amount: 40 }
      ],
      ['logic_unit', 'laser_core'],
      0,
      1,
      [
        {
          id: 'nano_etcher_parallel',
          name: 'Multi-Beam Array',
          description: 'Adds an additional production slot.',
          effect: 'parallel',
          value: 1,
          cost: [
            { id: 'logic_unit', amount: 5 },
            { id: 'laser_core', amount: 3 },
            { id: 'research_point', amount: 20 }
          ],
          applied: false
        }
      ]
    ));
    
    // Logic Fabricator
    this.machines.set('logic_fabricator', new Machine(
      'logic_fabricator',
      'Logic Fabricator',
      'Advanced machine for creating complex computational components.',
      [
        { id: 'iron', amount: 40 },
        { id: 'silicon', amount: 50 },
        { id: 'pcb', amount: 20 },
        { id: 'electricity', amount: 100 }
      ],
      ['logic_unit', 'ai_module'],
      0,
      1,
      [
        {
          id: 'logic_fabricator_speed',
          name: 'Quantum Processors',
          description: 'Doubles production speed.',
          effect: 'speed',
          value: 2.0,
          cost: [
            { id: 'ai_module', amount: 1 },
            { id: 'research_point', amount: 50 }
          ],
          applied: false
        }
      ]
    ));
  }
  
  public getMachine(id: MachineID): Machine | undefined {
    return this.machines.get(id);
  }
  
  public addMachine(id: MachineID, count: number): void {
    const machine = this.getMachine(id);
    if (machine) {
      machine.addMachines(count);
    }
  }
  
  public setMachine(id: MachineID, count: number): void {
    const machine = this.getMachine(id);
    if (machine) {
      machine.setCount(count);
    }
  }
  
  public getMachineCount(id: MachineID): number {
    const machine = this.getMachine(id);
    return machine ? machine.getCount() : 0;
  }
  
  public getAllMachines(): Record<MachineID, number> {
    const machines: Partial<Record<MachineID, number>> = {};
    
    this.machines.forEach((machine, id) => {
      machines[id] = machine.getCount();
    });
    
    return machines as Record<MachineID, number>;
  }
  
  public buildMachine(id: MachineID): boolean {
    const machine = this.getMachine(id);
    if (!machine) return false;
    
    // Check if resources are available
    if (!this.game.resourceManager.canAfford(machine.buildCost)) {
      return false;
    }
    
    // Pay the resource costs
    this.game.resourceManager.payCosts(machine.buildCost);
    
    // Add the machine
    this.addMachine(id, 1);
    
    return true;
  }
  
  public startProduction(machineID: MachineID, componentID: ComponentID): boolean {
    const machine = this.getMachine(machineID);
    if (!machine || machine.getCount() <= 0) return false;
    
    // Check if the machine can produce this component
    if (!machine.canProduceComponent(componentID)) {
      return false;
    }
    
    // Check available production slots
    const usedSlots = this.activeProductions.filter(p => p.machineID === machineID).length;
    if (usedSlots >= machine.getProductionSlots()) {
      return false;
    }
    
    // Try to craft the component
    const component = this.game.componentManager.getComponent(componentID);
    if (!component) return false;
    
    // Calculate adjusted production time
    const baseTime = component.getProductionTime();
    const adjustedTime = machine.calculateProductionTime(baseTime);
    
    // Start production
    if (adjustedTime <= 0) {
      // Instant production
      return this.game.componentManager.craftComponent(componentID, machineID);
    } else {
      // Check if resources are available
      if (!this.game.resourceManager.canAfford(component.recipe.inputs)) {
        return false;
      }
      
      // Pay the resource costs
      this.game.resourceManager.payCosts(component.recipe.inputs);
      
      // Add to production queue
      const currentTime = Date.now();
      this.activeProductions.push({
        machineID,
        componentID,
        startTime: currentTime,
        endTime: currentTime + adjustedTime
      });
      
      return true;
    }
  }
  
  public update(deltaTime: number): void {
    const currentTime = Date.now();
    const completedProductions: number[] = [];
    
    // Check for completed productions
    this.activeProductions.forEach((production, index) => {
      if (currentTime >= production.endTime) {
        // Production completed
        this.game.componentManager.addComponent(production.componentID, 1);
        completedProductions.push(index);
      }
    });
    
    // Remove completed productions (in reverse order to avoid index shifting)
    completedProductions.sort((a, b) => b - a).forEach(index => {
      this.activeProductions.splice(index, 1);
    });
  }
  
  public getActiveProductions(): Array<{
    machineID: MachineID;
    componentID: ComponentID;
    startTime: number;
    endTime: number;
  }> {
    return [...this.activeProductions];
  }
  
  public setActiveProductions(productions: Array<{
    machineID: MachineID;
    componentID: ComponentID;
    startTime: number;
    endTime: number;
  }>): void {
    this.activeProductions = [...productions];
  }
  
  public getAllMachinesList(): Machine[] {
    return Array.from(this.machines.values());
  }
  
  public upgradeMachine(machineID: MachineID, upgradeID: string): boolean {
    const machine = this.getMachine(machineID);
    if (!machine) return false;
    
    const upgrades = machine.getUpgrades();
    const upgradeToApply = upgrades.find(u => u.id === upgradeID && !u.applied);
    
    if (!upgradeToApply) return false;
    
    // Check if resources are available
    if (!this.game.resourceManager.canAfford(upgradeToApply.cost)) {
      return false;
    }
    
    // Pay the resource costs
    this.game.resourceManager.payCosts(upgradeToApply.cost);
    
    // Apply the upgrade
    return machine.applyUpgrade(upgradeID);
  }
}
