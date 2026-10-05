# AGENTS.md

Instructions pour les agents de code (Claude Code, Codex, etc.) travaillant sur ce dépôt.

- Répondre à l'utilisateur **en français**.
- Lire `CLAUDE.md` (commandes, architecture, tests) et `e2e/README.md` avant de toucher aux tests de bout en bout.
- Les règles du jeu (combat, objets, carte) sont côté serveur : `../PkmnRaceBattle.API/docs/MECANIQUES_COMBAT.md`.
- Ne pas modifier le code de l'application (hors tests) sans l'accord du propriétaire ; ne pas committer à sa place.
- Tout changement de méthode/événement SignalR se fait des deux côtés (`core/services/Hub/hub.service.ts` + `GameHub`), avec le modèle TS correspondant dans `shared/models/`.
