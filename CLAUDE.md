# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

**Always respond to the user in French.**

Angular 19 client (standalone components) of PkmnRaceBattle. The server lives in the sibling `../PkmnRaceBattle.API` repo; the workspace-level `../CLAUDE.md` describes the client ↔ server SignalR contract.

## Commands

```bash
npm start                                   # ng serve on http://localhost:4200
npm run build
npm test                                    # Karma + Jasmine
npx ng test --include src/app/features/home/home.component.spec.ts   # single spec
```

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

`GameComponent` hosts the in-game screens under `features/game/components/` (battle-field, wild-fight, trainer-fight, poke-center, poke-shop, bracket, map, timer, my-team, hp-bar, exp-bar). The server's `NewTurn` / `response*` events decide which screen is shown. In fights, the server returns a `TurnContext` (`useMoveResult`) with messages and HP/stat changes that the battle-field animates in sequence; the server-side `CalculateDelay()` timing (1000 ms per message, 500 ms per HP change) assumes this playback.
