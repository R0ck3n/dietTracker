import { getDb } from '../db/connection.js';
import type { FoodEntryRow, FoodUnit } from '../types/index.js';

export class FoodRepository {
  findByJournal(journalId: number): FoodEntryRow[] {
    return getDb()
      .prepare(`
        SELECT * FROM FoodEntry
        WHERE JournalID = ?
        ORDER BY FoodEntryID ASC
      `)
      .all(journalId) as FoodEntryRow[];
  }

  findById(foodEntryId: number): FoodEntryRow | undefined {
    return getDb()
      .prepare('SELECT * FROM FoodEntry WHERE FoodEntryID = ?')
      .get(foodEntryId) as FoodEntryRow | undefined;
  }

  create(
    journalId: number,
    foodName: string,
    weightGrams: number,
    caloriesPer100g: number,
    unit: FoodUnit,
  ): FoodEntryRow {
    const result = getDb()
      .prepare(`
        INSERT INTO FoodEntry (JournalID, FoodName, WeightGrams, CaloriesPer100g, Unit)
        VALUES (?, ?, ?, ?, ?)
      `)
      .run(journalId, foodName, weightGrams, caloriesPer100g, unit);

    return this.findById(Number(result.lastInsertRowid))!;
  }

  update(
    foodEntryId: number,
    foodName: string,
    weightGrams: number,
    caloriesPer100g: number,
    unit: FoodUnit,
  ): FoodEntryRow {
    getDb()
      .prepare(`
        UPDATE FoodEntry
        SET FoodName = ?, WeightGrams = ?, CaloriesPer100g = ?, Unit = ?
        WHERE FoodEntryID = ?
      `)
      .run(foodName, weightGrams, caloriesPer100g, unit, foodEntryId);

    return this.findById(foodEntryId)!;
  }

  delete(foodEntryId: number): void {
    getDb().prepare('DELETE FROM FoodEntry WHERE FoodEntryID = ?').run(foodEntryId);
  }
}
