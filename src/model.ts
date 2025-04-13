// Game state and logic
export interface Resource {
  name: string;
  amount: number;
  description: string;
  icon: string;
}

export interface Upgrade {
  id: string;
  name: string;
  description: string;
  cost: {resource: string, amount: number}[];
  purchased: boolean;
  visible: boolean;
  effect: () => void;
  requirements: {upgrade?: string, resource?: {name: string, amount: number}}[];
}

export interface FocusTask {
  id: string;
  name: string;
  description: string;
  duration: number; // in seconds
  reward: {resource: string, amount: number}[];
  available: boolean;
  inProgress: boolean;
  completed: boolean;
  startTime?: number;
  endTime?: number;
  timeLeft?: number;
  unlocked: boolean;
}

export class GameModel {
  public resources: Record<string, Resource> = {};
  public upgrades: Record<string, Upgrade> = {};
  public tasks: Record<string, FocusTask> = {};
  public stats = {
    totalTimeSpent: 0,
    tasksCompleted: 0,
    resourcesEarned: 0,
  };
  public currentTask: string | null = null;
  public gameStarted: boolean = false;
  private saveInterval: number | null = null;
  
  constructor() {
    this.initializeGame();
    this.loadGame();
    
    //Start autosave
    this.saveInterval = window.setInterval(() => this.saveGame(), 30000);
  }
  
  private initializeGame(): void {
    //Initialize resources
    this.resources = {
      focus: {
        name: "Focus Points",
        amount: 0,
        description: "Earned by completing focus sessions",
        icon: "⚡"
      },
      productivity: {
        name: "Productivity",
        amount: 0,
        description: "Used to purchase upgrades",
        icon: "🔄"
      },
      energy: {
        name: "Energy",
        amount: 100,
        description: "Required to start focus tasks",
        icon: "🔋"
      }
    };
    
    //Initialize tasks
    this.tasks = {
      quickFocus: {
        id: "quickFocus",
        name: "Quick Focus",
        description: "A short focus session to get you started",
        duration: 60, // 1 minute
        reward: [{resource: "focus", amount: 5}, {resource: "productivity", amount: 1}],
        available: true,
        inProgress: false,
        completed: false,
        unlocked: true
      },
      standardFocus: {
        id: "standardFocus",
        name: "Standard Focus",
        description: "A typical focus session",
        duration: 300, // 5 minutes
        reward: [{resource: "focus", amount: 30}, {resource: "productivity", amount: 8}],
        available: true,
        inProgress: false,
        completed: false,
        unlocked: true
      },
      deepWork: {
        id: "deepWork",
        name: "Deep Work",
        description: "Extended, high-quality focus",
        duration: 900, // 15 minutes
        reward: [{resource: "focus", amount: 100}, {resource: "productivity", amount: 30}],
        available: true,
        inProgress: false,
        completed: false,
        unlocked: true
      },
      flowState: {
        id: "flowState",
        name: "Flow State",
        description: "Complete immersion in your work",
        duration: 1800, // 30 minutes
        reward: [{resource: "focus", amount: 250}, {resource: "productivity", amount: 80}],
        available: true,
        inProgress: false,
        completed: false,
        unlocked: false
      }
    };
    
    //Initialize upgrades
    this.upgrades = {
      focusEfficiency: {
        id: "focusEfficiency",
        name: "Focus Efficiency",
        description: "Increases focus points gained by 25%",
        cost: [{resource: "productivity", amount: 20}],
        purchased: false,
        visible: true,
        effect: () => this.applyFocusMultiplier(1.25),
        requirements: []
      },
      energyRegeneration: {
        id: "energyRegeneration",
        name: "Energy Regeneration",
        description: "Energy regenerates 50% faster",
        cost: [{resource: "productivity", amount: 50}],
        purchased: false,
        visible: true,
        effect: () => {
          //Effect is applied in the updateEnergyRegeneration method
        },
        requirements: []
      },
      flowStateUnlock: {
        id: "flowStateUnlock",
        name: "Unlock Flow State",
        description: "Unlock the Flow State focus task",
        cost: [{resource: "focus", amount: 200}, {resource: "productivity", amount: 100}],
        purchased: false,
        visible: true,
        effect: () => {
          this.tasks.flowState.unlocked = true;
        },
        requirements: [{resource: {name: "focus", amount: 150}}]
      },
      productivityBoost: {
        id: "productivityBoost",
        name: "Productivity Boost",
        description: "Increases productivity gained by 50%",
        cost: [{resource: "focus", amount: 300}],
        purchased: false,
        visible: false,
        effect: () => this.applyProductivityMultiplier(1.5),
        requirements: [{upgrade: "focusEfficiency"}]
      }
    };
  }
  
  private applyFocusMultiplier(multiplier: number): void {
    for (const taskId in this.tasks) {
      const task = this.tasks[taskId];
      for (let i = 0; i < task.reward.length; i++) {
        if (task.reward[i].resource === "focus") {
          task.reward[i].amount = Math.round(task.reward[i].amount * multiplier);
        }
      }
    }
  }
  
  private applyProductivityMultiplier(multiplier: number): void {
    for (const taskId in this.tasks) {
      const task = this.tasks[taskId];
      for (let i = 0; i < task.reward.length; i++) {
        if (task.reward[i].resource === "productivity") {
          task.reward[i].amount = Math.round(task.reward[i].amount * multiplier);
        }
      }
    }
  }
  
  public startTask(taskId: string): boolean {
    const task = this.tasks[taskId];
    
    if (!task || task.inProgress || !task.available || !task.unlocked) {
      return false;
    }
    
    // Check energy
    if (this.resources.energy.amount < 20) {
      return false;
    }
    
    // Consume energy
    this.resources.energy.amount -= 20;
    
    // Set task in progress
    task.inProgress = true;
    task.startTime = Date.now();
    task.endTime = Date.now() + (task.duration * 1000);
    this.currentTask = taskId;
    
    return true;
  }
  
  public cancelTask(): void {
    if (this.currentTask) {
      const task = this.tasks[this.currentTask];
      task.inProgress = false;
      task.startTime = undefined;
      task.endTime = undefined;
      this.currentTask = null;
      
      // Return half the energy
      this.resources.energy.amount += 10;
    }
  }
  
  public completeTask(): void {
    if (this.currentTask) {
      const task = this.tasks[this.currentTask];
      
      // Add rewards
      for (const reward of task.reward) {
        this.resources[reward.resource].amount += reward.amount;
      }
      
      // Update stats
      this.stats.tasksCompleted++;
      this.stats.totalTimeSpent += task.duration;
      
      // Reset task
      task.inProgress = false;
      task.completed = true;
      task.startTime = undefined;
      task.endTime = undefined;
      this.currentTask = null;
      
      // Update visibility of upgrades
      this.updateUpgradeVisibility();
    }
  }
  
  public updateUpgradeVisibility(): void {
    for (const upgradeId in this.upgrades) {
      const upgrade = this.upgrades[upgradeId];
      
      if (upgrade.purchased) {
        continue;
      }
      
      let visible = true;
      
      for (const req of upgrade.requirements) {
        // Check resource requirements
        if (req.resource) {
          const resource = this.resources[req.resource.name];
          if (!resource || resource.amount < req.resource.amount) {
            visible = false;
          }
        }
        
        // Check upgrade dependencies
        if (req.upgrade) {
          const dependency = this.upgrades[req.upgrade];
          if (!dependency || !dependency.purchased) {
            visible = false;
          }
        }
      }
      
      upgrade.visible = visible;
    }
  }
  
  public purchaseUpgrade(upgradeId: string): boolean {
    const upgrade = this.upgrades[upgradeId];
    
    if (!upgrade || upgrade.purchased || !upgrade.visible) {
      return false;
    }
    
    // Check cost
    for (const cost of upgrade.cost) {
      const resource = this.resources[cost.resource];
      if (!resource || resource.amount < cost.amount) {
        return false;
      }
    }
    
    // Apply cost
    for (const cost of upgrade.cost) {
      this.resources[cost.resource].amount -= cost.amount;
    }
    
    // Apply upgrade
    upgrade.purchased = true;
    upgrade.effect();
    this.updateUpgradeVisibility();
    
    return true;
  }
  
  public update(): void {
    // Update task progress
    if (this.currentTask) {
      const task = this.tasks[this.currentTask];
      const now = Date.now();
      
      if (task.endTime && now >= task.endTime) {
        this.completeTask();
      } else if (task.endTime) {
        task.timeLeft = Math.max(0, Math.floor((task.endTime - now) / 1000));
      }
    }
    
    // Update energy
    this.updateEnergy();
  }
  
  private updateEnergy(): void {
    // Energy regenerates over time if not at max
    if (this.resources.energy.amount < 100) {
      // Base regeneration rate
      let regenRate = 1; // 1 energy per 10 seconds
      
      // Apply upgrades
      if (this.upgrades.energyRegeneration.purchased) {
        regenRate *= 1.5;
      }
      
      // Add energy (assuming update is called every second)
      // Only add a fraction of the regen rate each second
      this.resources.energy.amount += regenRate / 10;
      
      // Cap at 100
      this.resources.energy.amount = Math.min(100, this.resources.energy.amount);
    }
  }
  
  public saveGame(): void {
    const saveData = {
      resources: this.resources,
      upgrades: this.upgrades,
      tasks: this.tasks,
      stats: this.stats,
      currentTask: this.currentTask,
      gameStarted: true
    };
    
    localStorage.setItem('waitGameSave', JSON.stringify(saveData));
  }
  
  public loadGame(): void {
    const saveData = localStorage.getItem('waitGameSave');
    
    if (saveData) {
      const parsedData = JSON.parse(saveData);
      
      // Load data
      this.resources = parsedData.resources;
      this.upgrades = parsedData.upgrades;
      this.tasks = parsedData.tasks;
      this.stats = parsedData.stats;
      this.currentTask = parsedData.currentTask;
      this.gameStarted = parsedData.gameStarted;
      
      // If a task was in progress, check if it completed while away
      if (this.currentTask) {
        const task = this.tasks[this.currentTask];
        if (task.endTime && Date.now() >= task.endTime) {
          this.completeTask();
        }
      }
    }
  }
  
  public resetGame(): void {
    localStorage.removeItem('waitGameSave');
    this.initializeGame();
    this.gameStarted = false;
    this.currentTask = null;
  }
  
  public cleanup(): void {
    if (this.saveInterval !== null) {
      window.clearInterval(this.saveInterval);
    }
  }
}