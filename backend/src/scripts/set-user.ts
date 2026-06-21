import argon2 from 'argon2';
import { initDatabase, closeDatabase, getDb } from '../db/connection.js';
import { UserRepository } from '../repositories/user.repository.js';
import type { UserRow } from '../types/index.js';

async function main(): Promise<void> {
  const username = process.argv[2] ?? 'nico';
  const password = process.argv[3] ?? 'nico';

  if (!username || !password) {
    throw new Error('Identifiant et mot de passe requis.');
  }

  initDatabase();
  const users = new UserRepository();
  const passwordHash = await argon2.hash(password);

  const existing = users.findByUsername(username);
  if (existing) {
    getDb()
      .prepare('UPDATE User SET PasswordHash = ? WHERE UserID = ?')
      .run(passwordHash, existing.UserID);
    console.log(`Mot de passe mis à jour : ${username} (id=${existing.UserID})`);
    closeDatabase();
    return;
  }

  if (users.count() === 0) {
    const user = users.create(username, passwordHash);
    console.log(`Utilisateur créé : ${user.Username} (id=${user.UserID})`);
    closeDatabase();
    return;
  }

  const current = getDb().prepare('SELECT * FROM User LIMIT 1').get() as UserRow;
  getDb()
    .prepare('UPDATE User SET Username = ?, PasswordHash = ? WHERE UserID = ?')
    .run(username, passwordHash, current.UserID);
  console.log(`Utilisateur mis à jour : ${username} (id=${current.UserID})`);

  closeDatabase();
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
