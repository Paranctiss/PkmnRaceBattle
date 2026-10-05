import {BSON, MongoClient, ObjectId} from 'mongodb';
import * as fs from 'node:fs';
import * as path from 'node:path';
import {TEST_DB_NAME, TEST_MONGO_URL} from '../../playwright.config';

// Recrée la base de test à partir des fixtures du projet de tests serveur (Pokemon, Move, Environment)
export default async function globalSetup() {
  const url = new URL(TEST_MONGO_URL);
  if (!['localhost', '127.0.0.1'].includes(url.hostname) || !TEST_DB_NAME.endsWith('_Test')) {
    throw new Error(`Refus d'initialiser ${TEST_MONGO_URL}/${TEST_DB_NAME} : seule une base locale « *_Test » est autorisée.`);
  }

  const fixtures = path.resolve(__dirname, '..', '..', '..', 'PkmnRaceBattle.API', 'PkmnRaceBattle.Tests', 'Fixtures');
  const load = (file: string) => BSON.EJSON.parse(fs.readFileSync(path.join(fixtures, file), 'utf8'), {relaxed: true}) as any[];

  const pokemons = load('pokemon.json');
  // Identifiants neufs à chaque exécution : le garde-fou des tests vérifie que l'API lit bien CETTE base
  pokemons.forEach(p => p._id = new ObjectId());
  process.env['E2E_MARKER_ID'] = pokemons.find(p => p.Id === 1)._id.toHexString();

  const client = await MongoClient.connect(TEST_MONGO_URL, {serverSelectionTimeoutMS: 5000});
  try {
    const db = client.db(TEST_DB_NAME);
    await db.dropDatabase();
    await db.collection('Pokemon').insertMany(pokemons);
    await db.collection('Move').insertMany(load('moves.json'));
    await db.collection('Environment').insertMany(load('environments.json'));
  } finally {
    await client.close();
  }
}
