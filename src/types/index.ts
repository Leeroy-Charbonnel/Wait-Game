// Type definitions for the game

export type ResourceType = 'material' | 'energy' | 'research';

export type ResourceID = 
    // Materials
    | 'copper' 
    | 'plastic' 
    | 'silicon' 
    | 'iron'
    // Energy
    | 'electricity' 
    | 'fuel_cell' 
    | 'solar_unit'
    // Research
    | 'research_point';

export type ComponentID = 
    // Basic (0 seconds)
    | 'wire' 
    | 'screw' 
    | 'metal_plate'
    // Intermediate
    | 'pcb' 
    | 'battery' 
    | 'sensor'
    // Advanced
    | 'logic_unit' 
    | 'laser_core' 
    | 'ai_module';

export type MachineID = 
    | 'manual_assembler' 
    | 'pcb_printer' 
    | 'heat_chamber' 
    | 'nano_etcher' 
    | 'logic_fabricator';

export type ResearchID = 
    | 'mold_design' 
    | 'power_cells' 
    | 'quantum_manufacturing' 
    | 'parallel_processing' 
    | 'advanced_automation'
    | 'efficiency_algorithms'
    | 'nano_fabrication';

export type TabID = 
    | 'production' 
    | 'machines' 
    | 'inventory' 
    | 'research' 
    | 'tech_tree' 
    | 'automation';

export interface ResourceCost {
    id: ResourceID;
    amount: number;
}

export interface Recipe {
    inputs: ResourceCost[];
    time: number; // Production time in milliseconds
}

export interface GameState {
    resources: Record<ResourceID, number>;
    components: Record<ComponentID, number>;
    machines: Record<MachineID, number>;
    researchCompleted: ResearchID[];
    activeResearch: {
        id: ResearchID | null;
        startTime: number;
        duration: number;
    };
    activeProductions: Array<{
        machineID: MachineID;
        componentID: ComponentID;
        startTime: number;
        endTime: number;
    }>;
    lastSaveTime: number;
    gameStartTime: number;
}
