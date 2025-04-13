// UI management for the game
import { GameModel, FocusTask, Upgrade, Resource } from './model';

export class GameUI {
  private game: GameModel;
  private resources: HTMLElement;
  private tasksContainer: HTMLElement;
  private upgradesContainer: HTMLElement;
  private statsContainer: HTMLElement;
  private currentTaskDisplay: HTMLElement;
  private progressBar: HTMLElement;
  
  constructor(game: GameModel) {
    this.game = game;
    
    // Get UI elements
    this.resources = document.getElementById('resources')!;
    this.tasksContainer = document.getElementById('tasks')!;
    this.upgradesContainer = document.getElementById('upgrades')!;
    this.statsContainer = document.getElementById('stats')!;
    this.currentTaskDisplay = document.getElementById('current-task')!;
    this.progressBar = document.getElementById('progress-bar')!;
    
    // Initialize UI
    this.initializeUI();
    
    // Start update loop
    this.startUpdateLoop();
  }
  
  private initializeUI(): void {
    // Create task elements
    this.renderTasks();
    
    // Create upgrades
    this.renderUpgrades();
    
    // Initialize event listeners
    this.initializeEventListeners();
    
    // Add reset button listener
    const resetButton = document.getElementById('reset-game');
    if (resetButton) {
      resetButton.addEventListener('click', () => {
        if (confirm('Are you sure you want to reset the game? All progress will be lost.')) {
          this.game.resetGame();
          this.renderAll();
        }
      });
    }
  }
  
  private initializeEventListeners(): void {
    // Task buttons
    const taskButtons = document.querySelectorAll('.task-button');
    taskButtons.forEach(button => {
      button.addEventListener('click', (e) => {
        const taskId = (e.currentTarget as HTMLElement).dataset.taskId;
        if (taskId) {
          this.startTask(taskId);
        }
      });
    });
    
    // Upgrade buttons
    const upgradeButtons = document.querySelectorAll('.upgrade-button');
    upgradeButtons.forEach(button => {
      button.addEventListener('click', (e) => {
        const upgradeId = (e.currentTarget as HTMLElement).dataset.upgradeId;
        if (upgradeId) {
          this.purchaseUpgrade(upgradeId);
        }
      });
    });
    
    // Cancel button
    const cancelButton = document.getElementById('cancel-task');
    if (cancelButton) {
      cancelButton.addEventListener('click', () => {
        this.game.cancelTask();
        this.renderCurrentTask();
        this.renderResources();
      });
    }
  }
  
  private startTask(taskId: string): void {
    if (this.game.startTask(taskId)) {
      this.renderCurrentTask();
      this.renderResources();
    } else {
      alert('Cannot start task. Check if you have enough energy or if another task is already in progress.');
    }
  }
  
  private purchaseUpgrade(upgradeId: string): void {
    if (this.game.purchaseUpgrade(upgradeId)) {
      this.renderUpgrades();
      this.renderResources();
      this.renderTasks(); // Re-render tasks in case upgrade affects them
    } else {
      alert('Cannot purchase upgrade. Check if you have enough resources.');
    }
  }
  
  private renderResources(): void {
    let html = '<h2>Resources</h2>';
    
    for (const key in this.game.resources) {
      const resource = this.game.resources[key];
      html += `
        <div class="resource">
          <span class="resource-icon">${resource.icon}</span>
          <span class="resource-name">${resource.name}:</span>
          <span class="resource-amount">${Math.floor(resource.amount)}</span>
          <div class="resource-description">${resource.description}</div>
        </div>
      `;
    }
    
    this.resources.innerHTML = html;
  }
  
  private renderTasks(): void {
    let html = '<h2>Focus Tasks</h2>';
    
    for (const key in this.game.tasks) {
      const task = this.game.tasks[key];
      
      if (!task.unlocked) continue;
      
      let rewardText = '';
      for (const reward of task.reward) {
        const resourceIcon = this.game.resources[reward.resource].icon;
        rewardText += `${resourceIcon} ${reward.amount} `;
      }
      
      const minutesDisplay = Math.floor(task.duration / 60);
      const secondsDisplay = task.duration % 60;
      const timeDisplay = `${minutesDisplay}:${secondsDisplay < 10 ? '0' : ''}${secondsDisplay}`;
      
      const disabledClass = this.game.currentTask || !task.available ? 'disabled' : '';
      
      html += `
        <div class="task ${task.inProgress ? 'in-progress' : ''}">
          <div class="task-header">
            <h3>${task.name}</h3>
            <div class="task-time">${timeDisplay}</div>
          </div>
          <div class="task-description">${task.description}</div>
          <div class="task-reward">Reward: ${rewardText}</div>
          <button class="task-button ${disabledClass}" data-task-id="${task.id}" ${this.game.currentTask ? 'disabled' : ''}>
            Start Task
          </button>
        </div>
      `;
    }
    
    this.tasksContainer.innerHTML = html;
    
    // Reinitialize task button listeners
    const taskButtons = document.querySelectorAll('.task-button');
    taskButtons.forEach(button => {
      button.addEventListener('click', (e) => {
        const taskId = (e.currentTarget as HTMLElement).dataset.taskId;
        if (taskId) {
          this.startTask(taskId);
        }
      });
    });
  }
  
  private renderUpgrades(): void {
    let html = '<h2>Upgrades</h2>';
    let hasVisibleUpgrades = false;
    
    for (const key in this.game.upgrades) {
      const upgrade = this.game.upgrades[key];
      
      if (!upgrade.visible) continue;
      if (upgrade.purchased) {
        html += `
          <div class="upgrade purchased">
            <h3>${upgrade.name}</h3>
            <div class="upgrade-description">${upgrade.description}</div>
            <div class="upgrade-status">Purchased</div>
          </div>
        `;
      } else {
        hasVisibleUpgrades = true;
        let costText = '';
        for (const cost of upgrade.cost) {
          const resourceIcon = this.game.resources[cost.resource].icon;
          costText += `${resourceIcon} ${cost.amount} `;
        }
        
        let canAfford = true;
        for (const cost of upgrade.cost) {
          if (this.game.resources[cost.resource].amount < cost.amount) {
            canAfford = false;
            break;
          }
        }
        
        const disabledClass = !canAfford ? 'disabled' : '';
        
        html += `
          <div class="upgrade">
            <h3>${upgrade.name}</h3>
            <div class="upgrade-description">${upgrade.description}</div>
            <div class="upgrade-cost">Cost: ${costText}</div>
            <button class="upgrade-button ${disabledClass}" data-upgrade-id="${upgrade.id}" ${!canAfford ? 'disabled' : ''}>
              Purchase
            </button>
          </div>
        `;
      }
    }
    
    if (!hasVisibleUpgrades && Object.values(this.game.upgrades).every(u => u.purchased)) {
      html += '<div class="no-upgrades">All upgrades purchased!</div>';
    } else if (!hasVisibleUpgrades) {
      html += '<div class="no-upgrades">No upgrades available yet. Complete focus tasks to unlock upgrades.</div>';
    }
    
    this.upgradesContainer.innerHTML = html;
    
    // Reinitialize upgrade button listeners
    const upgradeButtons = document.querySelectorAll('.upgrade-button');
    upgradeButtons.forEach(button => {
      button.addEventListener('click', (e) => {
        const upgradeId = (e.currentTarget as HTMLElement).dataset.upgradeId;
        if (upgradeId) {
          this.purchaseUpgrade(upgradeId);
        }
      });
    });
  }
  
  private renderStats(): void {
    const { totalTimeSpent, tasksCompleted } = this.game.stats;
    
    // Convert seconds to hours, minutes, seconds
    const hours = Math.floor(totalTimeSpent / 3600);
    const minutes = Math.floor((totalTimeSpent % 3600) / 60);
    const seconds = totalTimeSpent % 60;
    
    const timeString = `${hours}h ${minutes}m ${seconds}s`;
    
    let html = `
      <h2>Stats</h2>
      <div class="stat">
        <div class="stat-name">Total Focus Time:</div>
        <div class="stat-value">${timeString}</div>
      </div>
      <div class="stat">
        <div class="stat-name">Tasks Completed:</div>
        <div class="stat-value">${tasksCompleted}</div>
      </div>
    `;
    
    this.statsContainer.innerHTML = html;
  }
  
  private renderCurrentTask(): void {
    if (this.game.currentTask) {
      const task = this.game.tasks[this.game.currentTask];
      
      let timeLeft = '';
      if (task.timeLeft !== undefined) {
        const minutes = Math.floor(task.timeLeft / 60);
        const seconds = task.timeLeft % 60;
        timeLeft = `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
      }
      
      let progress = 0;
      if (task.startTime && task.endTime) {
        const elapsed = Date.now() - task.startTime;
        const total = task.endTime - task.startTime;
        progress = Math.min(100, Math.floor((elapsed / total) * 100));
      }
      
      let html = `
        <h2>Current Task</h2>
        <div class="current-task-info">
          <h3>${task.name}</h3>
          <div class="time-left">${timeLeft} remaining</div>
          <div class="progress-container">
            <div class="progress-bar" style="width: ${progress}%"></div>
          </div>
          <button id="cancel-task" class="cancel-button">Cancel</button>
        </div>
      `;
      
      this.currentTaskDisplay.innerHTML = html;
      
      // Reinitialize cancel button listener
      const cancelButton = document.getElementById('cancel-task');
      if (cancelButton) {
        cancelButton.addEventListener('click', () => {
          this.game.cancelTask();
          this.renderCurrentTask();
          this.renderResources();
        });
      }
      
      this.currentTaskDisplay.style.display = 'block';
    } else {
      this.currentTaskDisplay.innerHTML = '';
      this.currentTaskDisplay.style.display = 'none';
    }
  }
  
  private startUpdateLoop(): void {
    setInterval(() => {
      this.game.update();
      this.renderCurrentTask();
      this.renderResources();
      this.renderStats();
    }, 1000); // Update UI every second
  }
  
  public renderAll(): void {
    this.renderResources();
    this.renderTasks();
    this.renderUpgrades();
    this.renderStats();
    this.renderCurrentTask();
  }
}