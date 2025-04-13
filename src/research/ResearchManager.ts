import { Game } from '../game/Game';
import { Research, ResearchRequirement, ResearchReward } from './Research';
import { ResearchID } from '../types';

export class ResearchManager {
  private research: Map<ResearchID, Research> = new Map();
  private completedResearch: Set<ResearchID> = new Set();
  private activeResearch: {
    id: ResearchID | null;
    startTime: number;
    duration: number;
  } = {
      id: null,
      startTime: 0,
      duration: 0
    };
  private researchCompletionCount: Map<ResearchID, number> = new Map(); // Track repeated research

  constructor(private game: Game) {
    this.initializeResearch();
  }

  private initializeResearch(): void {
    // Tier 1 Research
    this.research.set('mold_design', new Research(
      'mold_design',
      'Study Mold Design',
      'Improve your understanding of mold creation for more efficient basic component production.',
      30000, // 30 seconds
      [], // No requirements
      [
        {
          type: 'resource',
          id: 'research_point',
          amount: 5
        }
      ],
      1,
      true // Repeatable
    ));

    // Tier 2 Research
    this.research.set('power_cells', new Research(
      'power_cells',
      'Research Power Cells',
      'Study advanced energy storage technologies.',
      300000, // 5 minutes
      [
        {
          type: 'research',
          id: 'mold_design'
        },
        {
          type: 'component',
          id: 'battery',
          amount: 5
        }
      ],
      [
        {
          type: 'unlock_component',
          id: 'fuel_cell'
        },
        {
          type: 'resource',
          id: 'research_point',
          amount: 15
        }
      ],
      2,
      false // Not repeatable (has unlock reward)
    ));

    this.research.set('parallel_processing', new Research(
      'parallel_processing',
      'Parallel Processing',
      'Research methods to process multiple tasks simultaneously.',
      600000, // 10 minutes
      [
        {
          type: 'research',
          id: 'mold_design'
        },
        {
          type: 'component',
          id: 'pcb',
          amount: 10
        }
      ],
      [
        {
          type: 'unlock_machine',
          id: 'pcb_printer'
        },
        {
          type: 'resource',
          id: 'research_point',
          amount: 20
        }
      ],
      2,
      false
    ));

    // Tier 3 Research
    this.research.set('advanced_automation', new Research(
      'advanced_automation',
      'Advanced Automation',
      'Develop systems that can automate complex manufacturing processes.',
      1200000, // 20 minutes
      [
        {
          type: 'research',
          id: 'parallel_processing'
        },
        {
          type: 'component',
          id: 'logic_unit',
          amount: 3
        }
      ],
      [
        {
          type: 'unlock_machine',
          id: 'heat_chamber'
        },
        {
          type: 'resource',
          id: 'research_point',
          amount: 30
        }
      ],
      3,
      false
    ));

    this.research.set('efficiency_algorithms', new Research(
      'efficiency_algorithms',
      'Efficiency Algorithms',
      'Design algorithms to optimize production processes.',
      1800000, // 30 minutes
      [
        {
          type: 'research',
          id: 'power_cells'
        },
        {
          type: 'research',
          id: 'parallel_processing'
        }
      ],
      [
        {
          type: 'unlock_machine',
          id: 'nano_etcher'
        },
        {
          type: 'resource',
          id: 'research_point',
          amount: 40
        }
      ],
      3,
      false
    ));

    // Tier 4 Research
    this.research.set('quantum_manufacturing', new Research(
      'quantum_manufacturing',
      'Quantum Manufacturing',
      'Leverage quantum principles for unprecedented manufacturing capabilities.',
      3600000, // 1 hour
      [
        {
          type: 'research',
          id: 'advanced_automation'
        },
        {
          type: 'research',
          id: 'efficiency_algorithms'
        },
        {
          type: 'component',
          id: 'ai_module',
          amount: 1
        }
      ],
      [
        {
          type: 'unlock_machine',
          id: 'logic_fabricator'
        },
        {
          type: 'unlock_research',
          id: 'nano_fabrication'
        },
        {
          type: 'resource',
          id: 'research_point',
          amount: 100
        }
      ],
      4,
      false
    ));

    // Tier 5 Research
    this.research.set('nano_fabrication', new Research(
      'nano_fabrication',
      'Nano Fabrication',
      'Master the art of building at the nanoscale.',
      7200000, // 2 hours
      [
        {
          type: 'research',
          id: 'quantum_manufacturing'
        }
      ],
      [
        {
          type: 'resource',
          id: 'research_point',
          amount: 200
        }
      ],
      5,
      true // Repeatable because it only gives resources
    ));

    // Special repeatable research for farming research points
    this.research.set('focus_training', new Research(
      'focus_training',
      'Focus Training',
      'Practice techniques to improve your focus and productivity. Yields research points.',
      300000, // 5 minutes
      [], // No requirements 
      [
        {
          type: 'resource',
          id: 'research_point',
          amount: 10
        }
      ],
      1,
      true // Always repeatable
    ));
  }

  public getResearch(id: ResearchID): Research | undefined {
    return this.research.get(id);
  }

  public isResearchCompleted(id: ResearchID): boolean {
    return this.completedResearch.has(id);
  }

  public getResearchCompletionCount(id: ResearchID): number {
    return this.researchCompletionCount.get(id) || 0;
  }

  public getAllResearch(): Research[] {
    return Array.from(this.research.values());
  }

  public getCompletedResearch(): ResearchID[] {
    return Array.from(this.completedResearch);
  }

  public setCompletedResearch(completedResearch: ResearchID[]): void {
    this.completedResearch = new Set(completedResearch);
  }

  public getAvailableResearch(): Research[] {
    return this.getAllResearch().filter(research => {
      // Skip if not repeatable and already completed
      if (this.isResearchCompleted(research.id) &&
        !research.repeatable &&
        !research.isInherentlyRepeatable()) {
        return false;
      }

      // Check if all requirements are met
      return this.areRequirementsMet(research.requirements);
    });
  }

  private areRequirementsMet(requirements: ResearchRequirement[]): boolean {
    return requirements.every(req => {
      switch (req.type) {
        case 'research':
          return this.isResearchCompleted(req.id as ResearchID);

        case 'component':
          return this.game.componentManager.getComponentAmount(req.id as any) >= (req.amount || 0);

        case 'resource':
          return this.game.resourceManager.getResourceAmount(req.id as any) >= (req.amount || 0);

        default:
          return false;
      }
    });
  }

  public startResearch(id: ResearchID): boolean {
    const research = this.getResearch(id);

    if (!research) return false;

    // Check if requirements are met
    if (!this.areRequirementsMet(research.requirements)) {
      return false;
    }

    // Check for resource costs (if any)
    if (!this.payResearchCosts(research.requirements)) {
      return false;
    }

    // Set as active research
    this.activeResearch = {
      id,
      startTime: Date.now(),
      duration: research.durationMs
    };

    return true;
  }

  private payResearchCosts(requirements: ResearchRequirement[]): boolean {
    // We only need to pay for component and resource requirements
    const costs = requirements.filter(req =>
      req.type === 'component' || req.type === 'resource'
    );

    // Check if we can afford all costs
    for (const cost of costs) {
      if (cost.type === 'component') {
        const amount = this.game.componentManager.getComponentAmount(cost.id as any);
        if (amount < (cost.amount || 0)) {
          return false;
        }
      } else if (cost.type === 'resource') {
        const amount = this.game.resourceManager.getResourceAmount(cost.id as any);
        if (amount < (cost.amount || 0)) {
          return false;
        }
      }
    }

    // Pay all costs
    for (const cost of costs) {
      if (cost.type === 'component') {
        this.game.componentManager.subtractComponent(cost.id as any, cost.amount || 0);
      } else if (cost.type === 'resource') {
        this.game.resourceManager.subtractResource(cost.id as any, cost.amount || 0);
      }
    }

    return true;
  }

  public cancelResearch(): void {
    this.activeResearch = {
      id: null,
      startTime: 0,
      duration: 0
    };
  }

  public getActiveResearch(): {
    id: ResearchID | null;
    startTime: number;
    duration: number;
  } {
    return { ...this.activeResearch };
  }

  public setActiveResearch(activeResearch: {
    id: ResearchID | null;
    startTime: number;
    duration: number;
  }): void {
    this.activeResearch = { ...activeResearch };
  }

  public getResearchProgress(): number {
    if (!this.activeResearch.id) return 0;

    const elapsed = Date.now() - this.activeResearch.startTime;
    return Math.min(1, elapsed / this.activeResearch.duration);
  }

  public getRemainingTime(): number {
    if (!this.activeResearch.id) return 0;

    const elapsed = Date.now() - this.activeResearch.startTime;
    return Math.max(0, this.activeResearch.duration - elapsed);
  }

  public update(currentTime: number): void {
    if (!this.activeResearch.id) return;

    const elapsed = currentTime - this.activeResearch.startTime;

    // Check if research is complete
    if (elapsed >= this.activeResearch.duration) {
      const researchId = this.activeResearch.id;
      const research = this.getResearch(researchId);

      if (research) {
        // Mark as completed (if not already)
        this.completedResearch.add(researchId);

        // Increment completion count
        const currentCount = this.researchCompletionCount.get(researchId) || 0;
        this.researchCompletionCount.set(researchId, currentCount + 1);
        research.incrementCompletionCount();

        // Grant rewards
        this.grantRewards(research);

        // Clear active research
        this.activeResearch = {
          id: null,
          startTime: 0,
          duration: 0
        };
      }
    }
  }

  private grantRewards(research: Research): void {
    research.rewards.forEach(reward => {
      switch (reward.type) {
        case 'resource':
          // Apply scaled rewards for repeatable research
          const amount = research.getScaledReward(reward);
          this.game.resourceManager.addResource(reward.id as any, amount);
          break;

        case 'unlock_component':
          // Just unlock - no action needed as components are already defined
          break;

        case 'unlock_machine':
          // Machines are already defined, but could trigger a UI notification
          break;

        case 'unlock_research':
          // Already handled by requirements system
          break;
      }
    });
  }

  public getResearchByTier(tier: number): Research[] {
    return this.getAllResearch().filter(research => research.tier === tier);
  }
}