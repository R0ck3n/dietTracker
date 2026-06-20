import { computeFoodCalories } from '../lib/calculations.js';
import { AppError } from '../lib/errors.js';
import { FoodRepository } from '../repositories/food.repository.js';
import { JournalRepository } from '../repositories/journal.repository.js';
import type { FoodEntryDto, FoodUnit } from '../types/index.js';
import type { FoodEntryRow } from '../types/index.js';

type FoodInput = {
  foodName: string;
  weightGrams: number;
  caloriesPer100g: number;
  unit: FoodUnit;
};

export class FoodService {
  constructor(
    private readonly foods = new FoodRepository(),
    private readonly journals = new JournalRepository(),
  ) {}

  add(userId: number, date: string, input: FoodInput): FoodEntryDto {
    const journal = this.journals.ensure(userId, date);
    const row = this.foods.create(
      journal.JournalID,
      input.foodName,
      input.weightGrams,
      input.caloriesPer100g,
      input.unit,
    );
    return this.toDto(row);
  }

  update(userId: number, foodId: number, input: FoodInput): FoodEntryDto {
    const row = this.getOwnedFood(userId, foodId);
    const updated = this.foods.update(
      row.FoodEntryID,
      input.foodName,
      input.weightGrams,
      input.caloriesPer100g,
      input.unit,
    );
    return this.toDto(updated);
  }

  delete(userId: number, foodId: number): void {
    const row = this.getOwnedFood(userId, foodId);
    this.foods.delete(row.FoodEntryID);
  }

  private getOwnedFood(userId: number, foodId: number): FoodEntryRow {
    const row = this.foods.findById(foodId);
    if (!row) {
      throw new AppError('Aliment introuvable.', 404, 'FOOD_NOT_FOUND');
    }

    const journal = this.journals.findByIdForUser(row.JournalID, userId);
    if (!journal) {
      throw new AppError('Aliment introuvable.', 404, 'FOOD_NOT_FOUND');
    }

    return row;
  }

  private toDto(row: FoodEntryRow): FoodEntryDto {
    const unit = row.Unit ?? 'g';
    return {
      id: row.FoodEntryID,
      foodName: row.FoodName,
      weightGrams: row.WeightGrams,
      caloriesPer100g: row.CaloriesPer100g,
      unit,
      totalCalories: computeFoodCalories(row.WeightGrams, row.CaloriesPer100g),
      createdAt: row.CreatedAt,
    };
  }
}
