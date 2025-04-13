import { Game } from '../game/Game';
import { TabManager } from './TabManager';
import { ModalManager } from './ModalManager';
import { ComponentID, MachineID, ResourceID, TabID } from '../types';

export class UIManager {
  private rootElement: HTMLElement;
  private tabManager: TabManager;
  private modalManager: ModalManager;
  private resourceElements: Map<ResourceID, HTMLElement> = new Map();
  private componentElements: Map<ComponentID, HTMLElement> = new Map();
  private machineElements: Map<MachineID, HTMLElement> = new Map();
  private productionElements: Map<string, HTMLElement> = new Map();
  private researchProgressElement: HTMLElement | null = null;
  private researchProgressTextElement: HTMLElement | null = null;

  constructor(private game: Game, rootElement: HTMLElement) {
    this.rootElement = rootElement;
    this.tabManager = new TabManager(this, rootElement);
    this.modalManager = new ModalManager();
  }

  public initUI(): void {
    // Clear existing content
    this.rootElement.innerHTML = '';

    // Create the game container
    const gameContainer = document.createElement('div');
    gameContainer.className = 'game-container';
    this.rootElement.appendChild(gameContainer);

    // Create header
    const headerElement = document.createElement('header');
    headerElement.className = 'game-header';
    gameContainer.appendChild(headerElement);

    // Create title
    const titleElement = document.createElement('h1');
    titleElement.textContent = 'Wait Game';
    headerElement.appendChild(titleElement);

    // Create resources display
    const resourcesElement = document.createElement('div');
    resourcesElement.className = 'resources-display';
    headerElement.appendChild(resourcesElement);

    // Create main area with tabs
    this.tabManager.createTabs([
      { id: 'production', name: 'Production' },
      { id: 'machines', name: 'Machines' },
      { id: 'inventory', name: 'Inventory' },
      { id: 'research', name: 'Research' },
      { id: 'tech_tree', name: 'Tech Tree' },
      { id: 'automation', name: 'Automation' }
    ]);

    // Initialize all tabs
    this.initProductionTab();
    this.initMachinesTab();
    this.initInventoryTab();
    this.initResearchTab();
    this.initTechTreeTab();
    this.initAutomationTab();

    // Select the first tab by default
    this.tabManager.selectTab('production');

    // Initialize resources display
    this.initResourcesDisplay(resourcesElement);

    // Add footer with save/load options
    this.initFooter(gameContainer);
  }

  private initResourcesDisplay(container: HTMLElement): void {
    // Get all material resources
    const materials = this.game.resourceManager.getResourcesByType('material');
    const energyResources = this.game.resourceManager.getResourcesByType('energy');
    const researchResources = this.game.resourceManager.getResourcesByType('research');

    // Create material section
    const materialsSection = document.createElement('div');
    materialsSection.className = 'resource-section';
    container.appendChild(materialsSection);

    const materialsTitle = document.createElement('h3');
    materialsTitle.textContent = 'Materials';
    materialsSection.appendChild(materialsTitle);

    const materialsList = document.createElement('div');
    materialsList.className = 'resources-list';
    materialsSection.appendChild(materialsList);

    // Create energy section
    const energySection = document.createElement('div');
    energySection.className = 'resource-section';
    container.appendChild(energySection);

    const energyTitle = document.createElement('h3');
    energyTitle.textContent = 'Energy';
    energySection.appendChild(energyTitle);

    const energyList = document.createElement('div');
    energyList.className = 'resources-list';
    energySection.appendChild(energyList);

    // Create research section
    const researchSection = document.createElement('div');
    researchSection.className = 'resource-section';
    container.appendChild(researchSection);

    const researchTitle = document.createElement('h3');
    researchTitle.textContent = 'Research';
    researchSection.appendChild(researchTitle);

    const researchList = document.createElement('div');
    researchList.className = 'resources-list';
    researchSection.appendChild(researchList);

    // Initialize material resources
    materials.forEach(resource => {
      const resourceElement = document.createElement('div');
      resourceElement.className = 'resource-item';
      resourceElement.innerHTML = `${resource.name}: <span class="resource-value">0</span>`;
      materialsList.appendChild(resourceElement);

      this.resourceElements.set(resource.id, resourceElement.querySelector('.resource-value') as HTMLElement);
    });

    // Initialize energy resources
    energyResources.forEach(resource => {
      const resourceElement = document.createElement('div');
      resourceElement.className = 'resource-item';
      resourceElement.innerHTML = `${resource.name}: <span class="resource-value">0</span>`;
      energyList.appendChild(resourceElement);

      this.resourceElements.set(resource.id, resourceElement.querySelector('.resource-value') as HTMLElement);
    });

    // Initialize research resources
    researchResources.forEach(resource => {
      const resourceElement = document.createElement('div');
      resourceElement.className = 'resource-item';
      resourceElement.innerHTML = `${resource.name}: <span class="resource-value">0</span>`;
      researchList.appendChild(resourceElement);

      this.resourceElements.set(resource.id, resourceElement.querySelector('.resource-value') as HTMLElement);
    });
  }

  private initProductionTab(): void {
    const tabContent = this.tabManager.getTabContent('production');
    if (!tabContent) return;

    tabContent.innerHTML = '<h2>Production</h2>';

    // Basic components section
    const basicSection = document.createElement('div');
    basicSection.className = 'component-section';
    basicSection.innerHTML = '<h3>Basic Components</h3>';
    tabContent.appendChild(basicSection);

    const basicComponentsList = document.createElement('div');
    basicComponentsList.className = 'components-list';
    basicSection.appendChild(basicComponentsList);

    // Intermediate components section
    const intermediateSection = document.createElement('div');
    intermediateSection.className = 'component-section';
    intermediateSection.innerHTML = '<h3>Intermediate Components</h3>';
    tabContent.appendChild(intermediateSection);

    const intermediateComponentsList = document.createElement('div');
    intermediateComponentsList.className = 'components-list';
    intermediateSection.appendChild(intermediateComponentsList);

    // Advanced components section
    const advancedSection = document.createElement('div');
    advancedSection.className = 'component-section';
    advancedSection.innerHTML = '<h3>Advanced Components</h3>';
    tabContent.appendChild(advancedSection);

    const advancedComponentsList = document.createElement('div');
    advancedComponentsList.className = 'components-list';
    advancedSection.appendChild(advancedComponentsList);

    // Add basic components
    const basicComponents = this.game.componentManager.getComponentsByTier('basic');
    basicComponents.forEach(component => {
      const componentElement = this.createComponentElement(component.id, basicComponentsList);
      this.componentElements.set(component.id, componentElement);
    });

    // Add intermediate components
    const intermediateComponents = this.game.componentManager.getComponentsByTier('intermediate');
    intermediateComponents.forEach(component => {
      const componentElement = this.createComponentElement(component.id, intermediateComponentsList);
      this.componentElements.set(component.id, componentElement);
    });

    // Add advanced components
    const advancedComponents = this.game.componentManager.getComponentsByTier('advanced');
    advancedComponents.forEach(component => {
      const componentElement = this.createComponentElement(component.id, advancedComponentsList);
      this.componentElements.set(component.id, componentElement);
    });

    // Add active production section
    const productionSection = document.createElement('div');
    productionSection.className = 'production-section';
    productionSection.innerHTML = '<h3>Active Production</h3>';
    tabContent.appendChild(productionSection);

    const productionList = document.createElement('div');
    productionList.id = 'active-production-list';
    productionList.className = 'production-list';
    productionSection.appendChild(productionList);
  }

  private createComponentElement(componentId: ComponentID, container: HTMLElement): HTMLElement {
    const component = this.game.componentManager.getComponent(componentId);
    if (!component) throw new Error(`Component ${componentId} not found`);

    const componentElement = document.createElement('div');
    componentElement.className = 'component-item';

    const componentHeader = document.createElement('div');
    componentHeader.className = 'component-header';
    componentElement.appendChild(componentHeader);

    const nameElement = document.createElement('span');
    nameElement.className = 'component-name';
    nameElement.textContent = component.name;
    componentHeader.appendChild(nameElement);

    const countElement = document.createElement('span');
    countElement.className = 'component-count';
    countElement.textContent = '0';
    componentHeader.appendChild(countElement);

    const descriptionElement = document.createElement('div');
    descriptionElement.className = 'component-description';
    descriptionElement.textContent = component.description;
    componentElement.appendChild(descriptionElement);

    const recipeElement = document.createElement('div');
    recipeElement.className = 'component-recipe';

    const recipeTitle = document.createElement('span');
    recipeTitle.textContent = 'Recipe: ';
    recipeElement.appendChild(recipeTitle);

    component.recipe.inputs.forEach((input, index) => {
      const inputElement = document.createElement('span');
      const resource = this.game.resourceManager.getResource(input.id);
      inputElement.textContent = `${input.amount} ${resource?.name || input.id}`;
      recipeElement.appendChild(inputElement);

      if (index < component.recipe.inputs.length - 1) {
        const separator = document.createElement('span');
        separator.textContent = ', ';
        recipeElement.appendChild(separator);
      }
    });

    if (component.recipe.time > 0) {
      const timeElement = document.createElement('span');
      timeElement.textContent = ` (${component.recipe.time / 1000}s)`;
      recipeElement.appendChild(timeElement);
    }

    componentElement.appendChild(recipeElement);

    // Add produce button
    const produceButton = document.createElement('button');
    produceButton.className = 'produce-button';
    produceButton.textContent = 'Produce';
    produceButton.onclick = () => this.handleProduceComponent(componentId);
    componentElement.appendChild(produceButton);

    container.appendChild(componentElement);

    this.componentElements.set(componentId, countElement);

    return countElement;
  }

  private handleProduceComponent(componentId: ComponentID): void {
    // Find a compatible machine
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
      return;
    }

    // Try to start production
    const success = this.game.machineManager.startProduction(selectedMachine, componentId);

    if (!success) {
      this.modalManager.showAlert('Cannot produce component. Check resources and machine availability.');
    }
  }

  private initMachinesTab(): void {
    const tabContent = this.tabManager.getTabContent('machines');
    if (!tabContent) return;

    tabContent.innerHTML = '<h2>Machines</h2>';

    const machinesList = document.createElement('div');
    machinesList.className = 'machines-list';
    tabContent.appendChild(machinesList);

    // Add all machines
    const machines = this.game.machineManager.getAllMachinesList();
    machines.forEach(machine => {
      const machineElement = document.createElement('div');
      machineElement.className = 'machine-item';

      const machineHeader = document.createElement('div');
      machineHeader.className = 'machine-header';
      machineElement.appendChild(machineHeader);

      const nameElement = document.createElement('span');
      nameElement.className = 'machine-name';
      nameElement.textContent = machine.name;
      machineHeader.appendChild(nameElement);

      const countElement = document.createElement('span');
      countElement.className = 'machine-count';
      countElement.textContent = '0';
      machineHeader.appendChild(countElement);

      const descriptionElement = document.createElement('div');
      descriptionElement.className = 'machine-description';
      descriptionElement.textContent = machine.description;
      machineElement.appendChild(descriptionElement);

      const compatibleElement = document.createElement('div');
      compatibleElement.className = 'machine-compatible';
      compatibleElement.textContent = 'Compatible components: ';

      machine.getCompatibleComponents().forEach((compId, index) => {
        const comp = this.game.componentManager.getComponent(compId);
        if (comp) {
          const compElement = document.createElement('span');
          compElement.textContent = comp.name;
          compatibleElement.appendChild(compElement);

          if (index < machine.getCompatibleComponents().length - 1) {
            const separator = document.createElement('span');
            separator.textContent = ', ';
            compatibleElement.appendChild(separator);
          }
        }
      });

      machineElement.appendChild(compatibleElement);

      const costElement = document.createElement('div');
      costElement.className = 'machine-cost';
      costElement.textContent = 'Cost: ';

      machine.buildCost.forEach((cost, index) => {
        const resource = this.game.resourceManager.getResource(cost.id);
        const costItemElement = document.createElement('span');
        costItemElement.textContent = `${cost.amount} ${resource?.name || cost.id}`;
        costElement.appendChild(costItemElement);

        if (index < machine.buildCost.length - 1) {
          const separator = document.createElement('span');
          separator.textContent = ', ';
          costElement.appendChild(separator);
        }
      });

      machineElement.appendChild(costElement);

      // Add build button
      const buildButton = document.createElement('button');
      buildButton.className = 'build-button';
      buildButton.textContent = 'Build';
      buildButton.onclick = () => this.handleBuildMachine(machine.id);
      machineElement.appendChild(buildButton);

      // Add upgrades section if available
      const upgrades = machine.getUpgrades();
      if (upgrades.length > 0) {
        const upgradesSection = document.createElement('div');
        upgradesSection.className = 'machine-upgrades';
        upgradesSection.innerHTML = '<h4>Upgrades</h4>';
        machineElement.appendChild(upgradesSection);

        upgrades.forEach(upgrade => {
          const upgradeElement = document.createElement('div');
          upgradeElement.className = 'machine-upgrade-item';

          const upgradeNameElement = document.createElement('div');
          upgradeNameElement.className = 'upgrade-name';
          upgradeNameElement.textContent = upgrade.name;
          upgradeElement.appendChild(upgradeNameElement);

          const upgradeDescElement = document.createElement('div');
          upgradeDescElement.className = 'upgrade-description';
          upgradeDescElement.textContent = upgrade.description;
          upgradeElement.appendChild(upgradeDescElement);

          const upgradeCostElement = document.createElement('div');
          upgradeCostElement.className = 'upgrade-cost';
          upgradeCostElement.textContent = 'Cost: ';

          upgrade.cost.forEach((cost, index) => {
            const resource = this.game.resourceManager.getResource(cost.id);
            const costItemElement = document.createElement('span');
            costItemElement.textContent = `${cost.amount} ${resource?.name || cost.id}`;
            upgradeCostElement.appendChild(costItemElement);

            if (index < upgrade.cost.length - 1) {
              const separator = document.createElement('span');
              separator.textContent = ', ';
              upgradeCostElement.appendChild(separator);
            }
          });

          upgradeElement.appendChild(upgradeCostElement);

          // Add upgrade button
          const upgradeButton = document.createElement('button');
          upgradeButton.className = 'upgrade-button';
          upgradeButton.textContent = 'Upgrade';
          upgradeButton.disabled = upgrade.applied;
          upgradeButton.onclick = () => this.handleUpgradeMachine(machine.id, upgrade.id);
          upgradeElement.appendChild(upgradeButton);

          upgradesSection.appendChild(upgradeElement);
        });
      }

      machinesList.appendChild(machineElement);

      this.machineElements.set(machine.id, countElement);
    });
  }

  private handleBuildMachine(machineId: MachineID): void {
    const success = this.game.machineManager.buildMachine(machineId);

    if (!success) {
      this.modalManager.showAlert('Cannot build machine. Check resources.');
    }
  }

  private handleUpgradeMachine(machineId: MachineID, upgradeId: string): void {
    const success = this.game.machineManager.upgradeMachine(machineId, upgradeId);

    if (!success) {
      this.modalManager.showAlert('Cannot upgrade machine. Check resources.');
    } else {
      // Disable the button after successful upgrade
      const upgradeButtons = document.querySelectorAll('.upgrade-button');
      upgradeButtons.forEach(button => {
        if ((button as HTMLElement).onclick.toString().includes(upgradeId)) {
          button.setAttribute('disabled', 'true');
        }
      });
    }
  }

  private initInventoryTab(): void {
    const tabContent = this.tabManager.getTabContent('inventory');
    if (!tabContent) return;

    tabContent.innerHTML = '<h2>Inventory</h2>';

    // Resources section
    const resourcesSection = document.createElement('div');
    resourcesSection.className = 'inventory-section';
    resourcesSection.innerHTML = '<h3>Resources</h3>';
    tabContent.appendChild(resourcesSection);

    const resourcesList = document.createElement('div');
    resourcesList.className = 'inventory-list';
    resourcesSection.appendChild(resourcesList);

    // Components section
    const componentsSection = document.createElement('div');
    componentsSection.className = 'inventory-section';
    componentsSection.innerHTML = '<h3>Components</h3>';
    tabContent.appendChild(componentsSection);

    const componentsList = document.createElement('div');
    componentsList.className = 'inventory-list';
    componentsSection.appendChild(componentsList);

    // Add resources to inventory
    const allResources = [
      ...this.game.resourceManager.getResourcesByType('material'),
      ...this.game.resourceManager.getResourcesByType('energy'),
      ...this.game.resourceManager.getResourcesByType('research')
    ];

    allResources.forEach(resource => {
      const resourceElement = document.createElement('div');
      resourceElement.className = 'inventory-item';

      const nameElement = document.createElement('span');
      nameElement.className = 'item-name';
      nameElement.textContent = resource.name;
      resourceElement.appendChild(nameElement);

      const countElement = document.createElement('span');
      countElement.className = 'item-count';
      countElement.textContent = '0';
      resourceElement.appendChild(countElement);

      resourcesList.appendChild(resourceElement);

      // No need to store these elements again as we already store them in resourceElements
    });

    // Add components to inventory
    const allComponents = this.game.componentManager.getAllComponentsList();

    allComponents.forEach(component => {
      const componentElement = document.createElement('div');
      componentElement.className = 'inventory-item';

      const nameElement = document.createElement('span');
      nameElement.className = 'item-name';
      nameElement.textContent = component.name;
      componentElement.appendChild(nameElement);

      const countElement = document.createElement('span');
      countElement.className = 'item-count';
      countElement.textContent = '0';
      componentElement.appendChild(countElement);

      componentsList.appendChild(componentElement);

      // No need to store these elements again as we already store them in componentElements
    });
  }

  private initResearchTab(): void {
    const tabContent = this.tabManager.getTabContent('research');
    if (!tabContent) return;

    tabContent.innerHTML = '<h2>Research</h2>';

    // Active research section
    const activeSection = document.createElement('div');
    activeSection.className = 'research-section';
    activeSection.innerHTML = '<h3>Active Research</h3>';
    tabContent.appendChild(activeSection);

    const activeResearch = document.createElement('div');
    activeResearch.id = 'active-research';
    activeResearch.className = 'active-research';
    activeResearch.innerHTML = '<div>No active research</div>';
    activeSection.appendChild(activeResearch);

    // Improved progress bar
    const progressContainer = document.createElement('div');
    progressContainer.className = 'research-progress-container';
    activeSection.appendChild(progressContainer);

    const progressBar = document.createElement('div');
    progressBar.id = 'research-progress';
    progressBar.className = 'research-progress-bar';
    progressContainer.appendChild(progressBar);

    const progressText = document.createElement('div');
    progressText.id = 'research-time';
    progressText.className = 'research-progress-text';
    progressText.textContent = '';
    progressContainer.appendChild(progressText);

    this.researchProgressElement = progressBar;
    this.researchProgressTextElement = progressText;

    // ASCII progress bar
    const asciiProgressContainer = document.createElement('div');
    asciiProgressContainer.id = 'ascii-progress-container';
    asciiProgressContainer.className = 'ascii-progress';
    activeSection.appendChild(asciiProgressContainer);

    // Add cancel button
    const cancelButton = document.createElement('button');
    cancelButton.id = 'cancel-research';
    cancelButton.textContent = 'Cancel Research';
    cancelButton.onclick = () => this.handleCancelResearch();
    cancelButton.style.display = 'none';
    activeSection.appendChild(cancelButton);

    // Available research section
    const availableSection = document.createElement('div');
    availableSection.className = 'research-section';
    availableSection.innerHTML = '<h3>Available Research</h3>';
    tabContent.appendChild(availableSection);

    const availableResearch = document.createElement('div');
    availableResearch.id = 'available-research';
    availableResearch.className = 'available-research';
    availableSection.appendChild(availableResearch);

    // Update available research
    this.updateAvailableResearch();
  }

  private updateAvailableResearch(): void {
    const availableElement = document.getElementById('available-research');
    if (!availableElement) return;

    availableElement.innerHTML = '';

    const availableResearch = this.game.researchManager.getAvailableResearch();

    if (availableResearch.length === 0) {
      const noResearch = document.createElement('div');
      noResearch.textContent = 'No research available';
      availableElement.appendChild(noResearch);
      return;
    }

    availableResearch.forEach(research => {
      const researchElement = document.createElement('div');
      researchElement.className = 'research-item';

      const nameElement = document.createElement('div');
      nameElement.className = 'research-name';
      nameElement.textContent = research.name;
      researchElement.appendChild(nameElement);

      const descElement = document.createElement('div');
      descElement.className = 'research-description';
      descElement.textContent = research.description;
      researchElement.appendChild(descElement);

      const timeElement = document.createElement('div');
      timeElement.className = 'research-time';
      timeElement.textContent = `Time: ${research.getFormattedDuration()}`;
      researchElement.appendChild(timeElement);

      // Add requirements section if any
      if (research.requirements.length > 0) {
        const reqElement = document.createElement('div');
        reqElement.className = 'research-requirements';
        reqElement.textContent = 'Requirements: ';

        research.requirements.forEach((req, index) => {
          const reqItemElement = document.createElement('span');

          switch (req.type) {
            case 'research':
              const reqResearch = this.game.researchManager.getResearch(req.id as any);
              reqItemElement.textContent = reqResearch ? reqResearch.name : req.id;
              break;

            case 'component':
              const component = this.game.componentManager.getComponent(req.id as any);
              reqItemElement.textContent = `${req.amount || 0} ${component ? component.name : req.id}`;
              break;

            case 'resource':
              const resource = this.game.resourceManager.getResource(req.id as any);
              reqItemElement.textContent = `${req.amount || 0} ${resource ? resource.name : req.id}`;
              break;
          }

          reqElement.appendChild(reqItemElement);

          if (index < research.requirements.length - 1) {
            const separator = document.createElement('span');
            separator.textContent = ', ';
            reqElement.appendChild(separator);
          }
        });

        researchElement.appendChild(reqElement);
      }

      // Add rewards section
      const rewardsElement = document.createElement('div');
      rewardsElement.className = 'research-rewards';
      rewardsElement.textContent = 'Rewards: ';

      research.rewards.forEach((reward, index) => {
        const rewardItemElement = document.createElement('span');

        switch (reward.type) {
          case 'resource':
            const resource = this.game.resourceManager.getResource(reward.id as any);
            rewardItemElement.textContent = `${reward.amount || 0} ${resource ? resource.name : reward.id}`;
            break;

          case 'unlock_component':
            const component = this.game.componentManager.getComponent(reward.id as any);
            rewardItemElement.textContent = `Unlock: ${component ? component.name : reward.id}`;
            break;

          case 'unlock_machine':
            const machine = this.game.machineManager.getMachine(reward.id as any);
            rewardItemElement.textContent = `Unlock: ${machine ? machine.name : reward.id}`;
            break;

          case 'unlock_research':
            const unlockResearch = this.game.researchManager.getResearch(reward.id as any);
            rewardItemElement.textContent = `Unlock: ${unlockResearch ? unlockResearch.name : reward.id}`;
            break;
        }

        rewardsElement.appendChild(rewardItemElement);

        if (index < research.rewards.length - 1) {
          const separator = document.createElement('span');
          separator.textContent = ', ';
          rewardsElement.appendChild(separator);
        }
      });

      researchElement.appendChild(rewardsElement);

      // Add start button
      const startButton = document.createElement('button');
      startButton.className = 'start-research-button';
      startButton.textContent = 'Start Research';
      startButton.onclick = () => this.handleStartResearch(research.id);
      researchElement.appendChild(startButton);

      availableElement.appendChild(researchElement);
    });
  }

  private handleStartResearch(researchId: string): void {
    const success = this.game.researchManager.startResearch(researchId as any);

    if (!success) {
      this.modalManager.showAlert('Cannot start research. Check requirements.');
    } else {
      this.updateActiveResearch();
    }
  }

  private handleCancelResearch(): void {
    this.game.researchManager.cancelResearch();
    this.updateActiveResearch();
  }

  private updateActiveResearch(): void {
    const activeElement = document.getElementById('active-research');
    const progressElement = document.getElementById('research-progress');
    const timeElement = document.getElementById('research-time');
    const cancelButton = document.getElementById('cancel-research');
    const asciiProgressContainer = document.getElementById('ascii-progress-container');

    if (!activeElement || !progressElement || !timeElement || !cancelButton || !asciiProgressContainer) return;

    const activeResearch = this.game.researchManager.getActiveResearch();

    if (!activeResearch.id) {
      activeElement.innerHTML = '<div>No active research</div>';
      progressElement.style.width = '0%';
      timeElement.textContent = '';
      cancelButton.style.display = 'none';
      asciiProgressContainer.textContent = '';
      return;
    }

    const research = this.game.researchManager.getResearch(activeResearch.id);
    if (!research) return;

    activeElement.innerHTML = `<div>${research.name}</div><div>${research.description}</div>`;

    const progress = this.game.researchManager.getResearchProgress() * 100;
    progressElement.style.width = `${progress}%`;

    const remainingTime = this.game.researchManager.getRemainingTime();
    const formattedTime = this.game.timeManager.getFormattedTime(remainingTime);
    timeElement.textContent = `${Math.round(progress)}% - ${formattedTime} remaining`;

    // Update ASCII progress bar
    const totalBars = 30;
    const filledBars = Math.floor((progress / 100) * totalBars);
    const emptyBars = totalBars - filledBars;

    const progressBar = `[${'\u2588'.repeat(filledBars)}${'\u2591'.repeat(emptyBars)}] ${Math.round(progress)}%`;
    asciiProgressContainer.textContent = progressBar;

    cancelButton.style.display = 'block';
  }

  private initTechTreeTab(): void {
    const tabContent = this.tabManager.getTabContent('tech_tree');
    if (!tabContent) return;

    tabContent.innerHTML = '<h2>Technology Tree</h2>';

    // Create a simple tech tree layout
    const techTreeContainer = document.createElement('div');
    techTreeContainer.className = 'tech-tree-container';
    tabContent.appendChild(techTreeContainer);

    // Add tiers
    for (let tier = 1; tier <= 5; tier++) {
      const tierElement = document.createElement('div');
      tierElement.className = 'tech-tier';
      tierElement.innerHTML = `<h3>Tier ${tier}</h3>`;
      techTreeContainer.appendChild(tierElement);

      const techList = document.createElement('div');
      techList.className = 'tech-list';
      tierElement.appendChild(techList);

      // Add research for this tier
      const tierResearch = this.game.researchManager.getResearchByTier(tier);

      tierResearch.forEach(research => {
        const techElement = document.createElement('div');
        techElement.className = 'tech-item';
        techElement.dataset.id = research.id;

        // Mark as completed if already researched
        if (this.game.researchManager.isResearchCompleted(research.id)) {
          techElement.classList.add('completed');
        }

        const nameElement = document.createElement('div');
        nameElement.className = 'tech-name';
        nameElement.textContent = research.name;
        techElement.appendChild(nameElement);

        const timeElement = document.createElement('div');
        timeElement.className = 'tech-time';
        timeElement.textContent = research.getFormattedDuration();
        techElement.appendChild(timeElement);

        techList.appendChild(techElement);
      });
    }
  }

  private initAutomationTab(): void {
    const tabContent = this.tabManager.getTabContent('automation');
    if (!tabContent) return;

    tabContent.innerHTML = '<h2>Automation</h2>';

    // Placeholder content - will be implemented in future updates
    const placeholderElement = document.createElement('div');
    placeholderElement.className = 'placeholder';
    placeholderElement.textContent = 'Automation features will be unlocked as you progress through research.';
    tabContent.appendChild(placeholderElement);
  }

  private initFooter(container: HTMLElement): void {
    const footerElement = document.createElement('footer');
    footerElement.className = 'game-footer';
    container.appendChild(footerElement);

    // Create button container
    const buttonContainer = document.createElement('div');
    buttonContainer.className = 'game-footer-buttons';
    footerElement.appendChild(buttonContainer);

    // Add save/load buttons
    const saveButton = document.createElement('button');
    saveButton.className = 'save-button';
    saveButton.textContent = 'Save Game';
    saveButton.onclick = () => this.handleSaveGame();
    buttonContainer.appendChild(saveButton);

    const loadButton = document.createElement('button');
    loadButton.className = 'load-button';
    loadButton.textContent = 'Load Game';
    loadButton.onclick = () => this.handleLoadGame();
    buttonContainer.appendChild(loadButton);

    const resetButton = document.createElement('button');
    resetButton.className = 'reset-button';
    resetButton.textContent = 'Reset Game';
    resetButton.onclick = () => this.handleResetGame();
    buttonContainer.appendChild(resetButton);

    // Add game time display
    const timeDisplay = document.createElement('div');
    timeDisplay.id = 'game-time';
    timeDisplay.className = 'game-time';
    timeDisplay.textContent = 'Time: 0s';
    footerElement.appendChild(timeDisplay);
  }

  private handleSaveGame(): void {
    const success = this.game.saveManager.saveGame();

    if (success) {
      this.modalManager.showAlert('Game saved successfully');
    } else {
      this.modalManager.showAlert('Failed to save game');
    }
  }

  private handleLoadGame(): void {
    const savedGame = this.game.saveManager.loadGame();

    if (savedGame) {
      this.game.loadState(savedGame);
      this.update();
      this.modalManager.showAlert('Game loaded successfully');
    } else {
      this.modalManager.showAlert('No saved game found');
    }
  }

  private handleResetGame(): void {
    this.modalManager.showConfirm('Are you sure you want to reset the game? All progress will be lost.', () => {
      this.game.saveManager.resetGame();
      window.location.reload();
    });
  }

  public update(): void {
    // Update resources display
    this.resourceElements.forEach((element, id) => {
      const amount = this.game.resourceManager.getResourceAmount(id);
      element.textContent = amount.toString();
    });

    // Update components display
    this.componentElements.forEach((element, id) => {
      const amount = this.game.componentManager.getComponentAmount(id);
      element.textContent = amount.toString();
    });

    // Update machines display
    this.machineElements.forEach((element, id) => {
      const amount = this.game.machineManager.getMachineCount(id);
      element.textContent = amount.toString();
    });

    // Update active production display
    this.updateActiveProduction();

    // Update active research display
    this.updateActiveResearch();

    // Update available research
    this.updateAvailableResearch();

    // Update tech tree
    this.updateTechTree();

    // Update game time
    this.updateGameTime();
  }

  private updateActiveProduction(): void {
    const productionList = document.getElementById('active-production-list');
    if (!productionList) return;

    // Clear current production list
    productionList.innerHTML = '';

    const activeProductions = this.game.machineManager.getActiveProductions();

    if (activeProductions.length === 0) {
      const noProduction = document.createElement('div');
      noProduction.textContent = 'No active production';
      productionList.appendChild(noProduction);
      return;
    }

    // Add each active production
    activeProductions.forEach(production => {
      const productionElement = document.createElement('div');
      productionElement.className = 'production-item';

      const machine = this.game.machineManager.getMachine(production.machineID);
      const component = this.game.componentManager.getComponent(production.componentID);

      if (!machine || !component) return;

      const nameElement = document.createElement('div');
      nameElement.className = 'production-name';
      nameElement.textContent = `${machine.name} -> ${component.name}`;
      productionElement.appendChild(nameElement);

      const progressContainer = document.createElement('div');
      progressContainer.className = 'progress-container';
      productionElement.appendChild(progressContainer);

      const currentTime = Date.now();
      const totalTime = production.endTime - production.startTime;
      const elapsedTime = currentTime - production.startTime;
      const progress = Math.min(1, elapsedTime / totalTime) * 100;

      const progressBar = document.createElement('div');
      progressBar.className = 'progress-bar';
      progressBar.style.width = `${progress}%`;
      progressContainer.appendChild(progressBar);

      const timeElement = document.createElement('div');
      timeElement.className = 'production-time';

      const remainingTime = Math.max(0, production.endTime - currentTime);
      timeElement.textContent = this.game.timeManager.getFormattedTime(remainingTime);
      productionElement.appendChild(timeElement);

      productionList.appendChild(productionElement);
    });
  }

  private updateTechTree(): void {
    const techItems = document.querySelectorAll('.tech-item');

    techItems.forEach(item => {
      const researchId = item.getAttribute('data-id');
      if (!researchId) return;

      if (this.game.researchManager.isResearchCompleted(researchId as any)) {
        item.classList.add('completed');
      } else {
        item.classList.remove('completed');
      }
    });
  }

  private updateGameTime(): void {
    const timeDisplay = document.getElementById('game-time');
    if (!timeDisplay) return;

    timeDisplay.textContent = `Time: ${this.game.timeManager.getFormattedElapsedTime()}`;
  }
}