import { createInterface } from 'node:readline/promises';
import { stdin as input, stdout as output } from 'node:process';
import { initDatabase, closeDatabase } from '../db/connection.js';
import { AuthService } from '../services/auth.service.js';

async function promptHidden(question: string): Promise<string> {
  const rl = createInterface({ input, output });
  const answer = await rl.question(question);
  rl.close();
  return answer;
}

async function main(): Promise<void> {
  initDatabase();

  const authService = new AuthService();
  const username = process.argv[2] ?? (await promptHidden('Identifiant : '));
  const password = process.argv[3] ?? (await promptHidden('Mot de passe : '));

  if (!username || !password) {
    throw new Error('Identifiant et mot de passe requis.');
  }

    const user = await authService.createUser(username, password);
  console.log(`Utilisateur créé : ${user.username} (id=${user.userId})`);

  closeDatabase();
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
