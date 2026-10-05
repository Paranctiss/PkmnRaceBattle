# Tests de bout en bout (Playwright)

Vrai navigateur (Chrome installé, `channel: 'chrome'`), vraie API, vraie base MongoDB **locale de test**.

```bash
npm run e2e                 # tous les scénarios (≈ 5 min, dont ≈ 2 min pour le PvP qui attend la fin du minuteur)
npx playwright test e2e/01-accueil-et-partie.spec.ts
npm run e2e:report          # rapport HTML (traces et captures des échecs)
```

## Prérequis

- MongoDB local sur `mongodb://localhost:27017` (modifiable avec `E2E_MONGO_URL`, uniquement `localhost`).
- **Port 5000 libre** : arrêter l'API lancée depuis l'IDE. Playwright démarre sa propre API (`dotnet run`, compilée dans le dossier temporaire du système) avec `MongoSettings__DatabaseName=PkmnRaceBattle_Test`. Si le port est occupé, Playwright refuse de démarrer.
- `ng serve` sur 4200 est réutilisé s'il tourne déjà (le client appelle `localhost:5000` en dur ; l'origine 4200 est la seule autorisée par le CORS de l'API).

## Données et sécurité

`support/global-setup.ts` supprime puis recrée la base `PkmnRaceBattle_Test` à partir de `../PkmnRaceBattle.API/PkmnRaceBattle.Tests/Fixtures` (Pokemon, Move, Environment) et refuse toute base qui n'est pas locale ou dont le nom ne finit pas par `_Test`. Les Pokémon reçoivent des `_id` neufs ; avant chaque fichier, le garde-fou `testDatabaseGuard` (`support/game.ts`) vérifie que `GET /Pokemon/1` renvoie bien cet `_id`, sinon tout s'arrête.

## Scénarios

| Fichier | Couvre |
|---|---|
| `01-accueil-et-partie.spec.ts` | Page d'accueil, chargement des starters, création + jonction à deux navigateurs, salle d'attente, lancement, starter choisi présent et niveau 5, code inconnu |
| `02-combat-sauvage.spec.ts` | Première map (Plaine, progression 1/5, décor), HUD, attaque et journal, sac, carte, changement de Pokémon, lancer de Poké Ball |
| `03-pvp.spec.ts` | Minuteur réécrit à 1 minute (`forceTimerMinutes` modifie le message SignalR `StartGame`), fin de course, tournoi, combat PvP avec l'attente du tour de l'adversaire, jusqu'au vainqueur/éliminé |

Le combat reste aléatoire (pas de contrôle du hasard côté serveur en E2E) : les assertions portent sur le déroulé, pas sur des valeurs de dégâts. Les règles chiffrées sont couvertes par les tests xUnit du serveur.

## État au 06/10/2026

12 scénarios, 12 réussis (après correction du niveau du starter, de la jonction à une salle inconnue et de la position du joueur au premier combat).
