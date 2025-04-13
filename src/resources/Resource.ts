import { ResourceID, ResourceType } from '../types';

export class Resource {
  private amount: number;
  
  constructor(
    public readonly id: ResourceID,
    public readonly name: string,
    public readonly type: ResourceType,
    public readonly description: string,
    initialAmount: number = 0
  ) {
    this.amount = initialAmount;
  }
  
  public getAmount(): number {
    return this.amount;
  }
  
  public setAmount(amount: number): void {
    this.amount = Math.max(0, amount);
  }
  
  public add(amount: number): void {
    if (amount > 0) {
      this.amount += amount;
    }
  }
  
  public subtract(amount: number): boolean {
    if (amount <= 0) return true;
    
    if (this.amount >= amount) {
      this.amount -= amount;
      return true;
    }
    return false;
  }
  
  public canSubtract(amount: number): boolean {
    return this.amount >= amount;
  }
}
