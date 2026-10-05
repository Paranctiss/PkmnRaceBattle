# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

**Always respond to the user in French.**

Angular 19 client (standalone components) of PkmnRaceBattle. The server lives in the sibling `../PkmnRaceBattle.API` repo; the workspace-level `../CLAUDE.md` describes the client ↔ server SignalR contract.

## Commands

```bash
npm start                                   # ng serve on http://localhost:4200
npm run build
npm test                                    # Karma + Jasmine (watch)
npm run test:ci                             # single headless run (~240 specs, Chrome)
npx ng test --watch=false --browsers=ChromeHeadless --include src/app/features/home/home.component.spec.ts   # single spec
npm run e2e                                 # Playwright end-to-end (see e2e/README.md) — port 5000 must be free
```

## Tests

- **Unit/component specs** (`*.spec.ts`, Jasmine/Karma): use `provideTestingDefaults(fake)` from `src/testing/fake-signalr.ts`. `FakeSignalRService.connection` records every `invoke` (`invoked('HandleMove')`, `lastInvocation(...)`) and simulates server events with `emit('useMoveResult', ctx)`. The real `HubService` is used on top of it, so specs also check the client → server contract. Data builders (`makePlayer`, `makePokemon`, `makeTurnContext`, `changes`, `makeWildOpponent`, `makeTrainer`…) are in `src/testing/test-data.ts`. Battle animations are timer based: use `fakeAsync` + `tick(1000)` per message / `tick(500)` per HP change (call `tick()` once after setting `TurnContext` to flush the promise chain).
- A spec that renders the same component several times must call `TestBed.resetTestingModule()` before each `configureTestingModule`.
- 1 spec fails on purpose today (real bug): `HubService.on*` registers SignalR listeners that are never removed, so a destroyed component (e.g. a previous fight) keeps reacting to server events.
- All 12 E2E scenarios pass (06/10/2026).
- **E2E** (`e2e/`, Playwright with the installed Chrome): starts the API on port 5000 against the local MongoDB database `PkmnRaceBattle_Test` (re-created from `../PkmnRaceBattle.API/PkmnRaceBattle.Tests/Fixtures` on every run) and reuses/starts `ng serve` on 4200. A guard aborts if the API is not reading that database.

## Architecture

### Server connection
- `core/services/SignalR/signal-r.service.ts` builds and starts the single `HubConnection` (WebSockets only, `skipNegotiation: true`).
- `core/services/Hub/hub.service.ts` wraps every hub call: `invoke(...)` methods for client→server, `on...`/`response...` methods registering server→client callbacks. Add new hub interactions here rather than calling the connection from components.
- `core/services/PokemonBase/pokemon-base.service.ts` is the only HTTP call (`GET /Pokemon/{id}`).

Server URLs are hard-coded in `signal-r.service.ts` and `pokemon-base.service.ts`, toggled between `localhost` and the production IP by commenting lines; there are no Angular environment files. Check both before running locally or deploying — they are not always pointing at the same server.

### State
`HubService` is a root singleton that also holds session state (`userId`, `gameCode`, `pending`, current `Player`, timer). Components read and write it directly; there is no store. Shared TS models in `shared/models/` mirror the server Mongo documents (camelCase, `_id`).

### Screens
Routes (`app.routes.ts`): `''` home → `starter` (starter selection) → `room` (waiting room) → `game`. Route `data.animation` keys drive `shared/animations/route.animations.ts`.

`GameComponent` hosts the in-game screens under `features/game/components/` (battle-field, wild-fight, trainer-fight, poke-center, poke-shop, bracket, map, timer, my-team, hp-bar, exp-bar). The server's `response*` / `chooseNextPath` / `TimerEnded` / `bracketCreated` events decide which screen is shown (the `NewTurn` listener is dead code: the server never sends it). In fights, the server returns a `TurnContext` (`useMoveResult`) with messages and HP/stat changes that the battle-field animates in sequence; the server-side `CalculateDelay()` timing (1000 ms per message, 500 ms per HP change) assumes this playback. HP changes are deltas (`currHp -= change`, negative = heal) applied to `PlayerPokemon` (or its `substitute`), or to `Player.team[index]` for an item used on a benched Pokémon. Game rules themselves live on the server: see `../PkmnRaceBattle.API/docs/MECANIQUES_COMBAT.md`.
