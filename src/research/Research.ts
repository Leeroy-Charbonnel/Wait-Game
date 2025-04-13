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
  constructor(
    public readonly id: ResearchID,
    public readonly name: string,
    public readonly description: string,
    public readonly durationMs: number,
    public readonly requirements: ResearchRequirement[],
    public readonly rewards: ResearchReward[],
    public readonly tier: number
  ) {}
  
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
    
    if (seconds === 0) {
      return `${minutes} minute${minutes > 1 ? 's' : ''}`;
    }
    
    return `${minutes} minute${minutes > 1 ? 's' : ''} ${seconds} second${seconds > 1 ? 's' : ''}`;
  }
}
