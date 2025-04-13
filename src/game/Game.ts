import { ResourceManager } from '../resources/ResourceManager';
import { ComponentManager } from '../components/ComponentManager';
import { MachineManager } from '../machines/MachineManager';
import { ResearchManager } from '../research/ResearchManager';
import { UIManager } from '../ui/UIManager';
import { TimeManager } from './TimeManager';
import { SaveManager } from './SaveManager';
import { GameState } from '../types';

export class Game {
  // Game managers
  public resourceManager: ResourceManager;
  public componentManager: ComponentManager;
  public machineManager: MachineManager;
  public researchManager: ResearchManager;
  public uiManager: UIManager;
  public timeManager: TimeManager;
  public saveManager: SaveManager;

  // Game state
  private lastUpdateTime: number;
  private gameLoopInterval: number | null = null;
  private fps = 30; // Updates per second

  constructor(private rootElement: HTMLElement) {
    // Create all managers
    this.resourceManager = new ResourceManager(this);
    this.componentManager = new ComponentManager(this);
    this.machineManager = new MachineManager(this);
    this.researchManager = new ResearchManager(this);
    this.timeManager = new TimeManager();
    this.saveManager = new SaveManager(this);
    this.uiManager = new UIManager(this, rootElement);

    this.lastUpdateTime = Date.now();
  }

  public init(): void {
    // Try to load saved game
    const savedGame = this.saveManager.loadGame();

    if (savedGame) {
      this.loadState(savedGame);
    } else {
      this.initNewGame();
    }

    // Initialize UI
    this.uiManager.initUI();

    // Set up auto-save
    setInterval(() => this.saveManager.saveGame(), 60000); // Auto-save every minute
  }

  public start(): void {
    if (this.gameLoopInterval !== null) return;

    const interval = 1000 / this.fps;
    this.gameLoopInterval = setInterval(() => this.update(), interval) as unknown as number;
  }

  public stop(): void {
    if (this.gameLoopInterval === null) return;

    clearInterval(this.gameLoopInterval);
    this.gameLoopInterval = null;
  }

  private update(): void {
    const currentTime = Date.now();
    const deltaTime = currentTime - this.lastUpdateTime;
    this.lastUpdateTime = currentTime;

    // Update managers
    this.componentManager.update(deltaTime);
    this.machineManager.update(deltaTime);
    this.researchManager.update(currentTime);

    // Update UI
    this.uiManager.update();
  }

  private initNewGame(): void {
    // Initialize with starting resources and machines
    this.resourceManager.addResource('copper', 50);
    this.resourceManager.addResource('plastic', 30);
    this.resourceManager.addResource('electricity', 100);

    // Start with a manual assembler
    this.machineManager.addMachine('manual_assembler', 1);
  }

  public getState(): GameState {
    // Convert research completion counts map to record
    const researchCounts: Partial<Record<string, number>> = {};
    this.researchManager.getAllResearch().forEach(research => {
      researchCounts[research.id] = this.researchManager.getResearchCompletionCount(research.id);
    });

    return {
      resources: this.resourceManager.getAllResources(),
      components: this.componentManager.getAllComponents(),
      machines: this.machineManager.getAllMachines(),
      researchCompleted: this.researchManager.getCompletedResearch(),
      researchCompletionCounts: researchCounts as Record<string, number>,
      activeResearch: this.researchManager.getActiveResearch(),
      activeProductions: this.machineManager.getActiveProductions(),
      lastSaveTime: Date.now(),
      gameStartTime: this.timeManager.getGameStartTime()
    };
  }

  public loadState(state: GameState): void {
    // Load resources
    for (const [id, amount] of Object.entries(state.resources)) {
      this.resourceManager.setResource(id as any, amount);
    }

    // Load components
    for (const [id, amount] of Object.entries(state.components)) {
      this.componentManager.setComponent(id as any, amount);
    }

    // Load machines
    for (const [id, amount] of Object.entries(state.machines)) {
      this.machineManager.setMachine(id as any, amount);
    }

    // Load research
    this.researchManager.setCompletedResearch(state.researchCompleted);

    // Load research completion counts if available
    if (state.researchCompletionCounts) {
      for (const [id, count] of Object.entries(state.researchCompletionCounts)) {
        const research = this.researchManager.getResearch(id as any);
        if (research) {
          research.setCompletionCount(count);
        }
      }
    }

    // Load active research
    this.researchManager.setActiveResearch(state.activeResearch);

    // Load active productions
    this.machineManager.setActiveProductions(state.activeProductions);

    // Set game start time
    this.timeManager.setGameStartTime(state.gameStartTime);
  }
}