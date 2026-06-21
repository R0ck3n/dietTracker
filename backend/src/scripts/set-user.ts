import argon2 from 'argon2';
import { initDatabase, closeDatabase } from '../db/connection.js';
import { UserRepository } from '../repositories/user.repository.js';

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
    users.updatePassword(existing.UserID, passwordHash);
    console.log(`Mot de passe mis à jour : ${username} (id=${existing.UserID})`);
    closeDatabase();
    return;
  }

  const user = users.create(username, passwordHash);
  console.log(`Utilisateur créé : ${user.Username} (id=${user.UserID})`);

  closeDatabase();
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
