import { ResearchID } from '../types';

export interface ResearchRequirement {
  type: 'research' | 'component' | 'resource';
  id: string;
  amount?: number;
}

export interface ResearchReward {
  type: 'unlock_component' | 'unlock_machine' | 'unlock_research' | 'resource';
  id: string;
  amount?: number;
}

export class Research {
  private completionCount: number = 0; //Track how many times this research has been completed

  constructor(
    public readonly id: ResearchID,
    public readonly name: string,
    public readonly description: string,
    public readonly durationMs: number,
    public readonly requirements: ResearchRequirement[],
    public readonly rewards: ResearchReward[],
    public readonly tier: number,
    public readonly repeatable: boolean = false
  ) { }

  public getDurationMinutes(): number {
    return this.durationMs / 60000;
  }

  public getDurationSeconds(): number {
    return this.durationMs / 1000;
  }

  public getFormattedDuration(): string {
    const totalSeconds = this.getDurationSeconds();

    if (totalSeconds < 60) {
      return `${totalSeconds} seconds`;
    }

    const minutes = Math.floor(totalSeconds / 60);
    const seconds = Math.floor(totalSeconds % 60);

    if (minutes < 60) {
      if (seconds === 0) {
        return `${minutes} minute${minutes > 1 ? 's' : ''}`;
      }
      return `${minutes} minute${minutes > 1 ? 's' : ''} ${seconds} second${seconds > 1 ? 's' : ''}`;
    }

    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;

    if (remainingMinutes === 0) {
      return `${hours} hour${hours > 1 ? 's' : ''}`;
    }

    return `${hours} hour${hours > 1 ? 's' : ''} ${remainingMinutes} minute${remainingMinutes > 1 ? 's' : ''}`;
  }

  public incrementCompletionCount(): void {
    this.completionCount++;
  }

  public getCompletionCount(): number {
    return this.completionCount;
  }

  public setCompletionCount(count: number): void {
    this.completionCount = count;
  }

  //Calculate bonus rewards based on completion count
  public getScaledReward(reward: ResearchReward): number {
    if (reward.type !== 'resource' || !reward.amount) {
      return reward.amount || 0;
    }

    //First completion gives full amount
    if (this.completionCount === 0) {
      return reward.amount;
    }

    //Subsequent completions give a percentage
    return Math.floor(reward.amount * 0.5);
  }

  //Some research types should always be repeatable
  public isInherentlyRepeatable(): boolean {
    //Research that only gives resource rewards should be repeatable
    return this.rewards.every(reward => reward.type === 'resource');
  }
}