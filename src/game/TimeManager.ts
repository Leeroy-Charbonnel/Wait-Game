export class TimeManager {
  private gameStartTime: number;
  
  constructor() {
    this.gameStartTime = Date.now();
  }
  
  public getGameStartTime(): number {
    return this.gameStartTime;
  }
  
  public setGameStartTime(time: number): void {
    this.gameStartTime = time;
  }
  
  public getElapsedTime(): number {
    return Date.now() - this.gameStartTime;
  }
  
  public getFormattedElapsedTime(): string {
    const totalSeconds = Math.floor(this.getElapsedTime() / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    
    if (hours > 0) {
      return `${hours}h ${minutes}m ${seconds}s`;
    } else if (minutes > 0) {
      return `${minutes}m ${seconds}s`;
    } else {
      return `${seconds}s`;
    }
  }
  
  public getFormattedTime(ms: number): string {
    const totalSeconds = Math.floor(ms / 1000);
    
    if (totalSeconds < 60) {
      return `${totalSeconds}s`;
    }
    
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    
    if (minutes < 60) {
      return `${minutes}m ${seconds}s`;
    }
    
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    
    return `${hours}h ${remainingMinutes}m ${seconds}s`;
  }
  
  public getPercentage(current: number, max: number): number {
    return Math.min(100, Math.max(0, (current / max) * 100));
  }
}
