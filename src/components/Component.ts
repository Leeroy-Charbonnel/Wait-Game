import { ComponentID, Recipe } from '../types';

export class Component {
  private amount: number;
  
  constructor(
    public readonly id: ComponentID,
    public readonly name: string,
    public readonly description: string,
    public readonly recipe: Recipe,
    public readonly tier: 'basic' | 'intermediate' | 'advanced',
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
  
  public getProductionTime(): number {
    return this.recipe.time;
  }
}
