import {Component, signal, WritableSignal, DestroyRef, inject} from '@angular/core';
import {NgForOf, NgIf} from '@angular/common';
import {ActivatedRoute, Router, RouterLink} from '@angular/router';
import {PokemonBaseService} from '../../core/services/PokemonBase/pokemon-base.service';
import {PokemonBaseModel} from '../../shared/models/pokemon-base.model';
import {StarterCardComponent} from './starter-card/starter-card.component';
import {HubService} from '../../core/services/Hub/hub.service';
import {FormsModule} from '@angular/forms';

@Component({
  selector: 'app-starter-selection',
  imports: [
    NgForOf,
    RouterLink,
    NgIf,
    StarterCardComponent,
    FormsModule
  ],
  templateUrl: './starter-selection.component.html',
  styleUrl: './starter-selection.component.css'
})
export class StarterSelectionComponent {
  private readonly destroyRef = inject(DestroyRef);
  constructor(
    private pokemonBaseService:PokemonBaseService,
    private hubService: HubService,
    private router:Router,
    private route:ActivatedRoute) {
  }
  Starters:PokemonBaseModel[] = [];
  Host:boolean = false;
  TrainerSprites:string[] =
    [
      "aaron", "aarune", "acerola", "acetrainer", "acetrainer1", "acetrainer2", "acetrainer3", "acetrainerf", "acetrainerf1", "acetrainerf2", "acetrainerf3",
      "acetrainersnow", "acetrainersnowf", "adaman", "akari", "akari-isekai", "alder", "alec", "allister", "anthea", "aquagrunt", "aquagrunt1", "aquagruntf",
      "archie", "arezu", "ariana", "artistf", "arven", "ash", "ballguy", "barry", "bea", "beauty", "bede", "birch", "blue", "brendan", "brock", "buck", "burnet",
      "cynthia", "dawn", "delinquent", "elesa", "erika", "gardenia", "geeta", "ghetsis", "gladion", "gold", "hala", "iono", "iris", "leon", "lillie", "lucy", "misty", "n", "oak", "ogreclan",
      "red", "ryuki", "swimmer", "volo", "youngn", "zinnia"
    ];
  trainerSprite:string = "";
  roomCode:string = "";
  username:string = "";
  ngOnInit() {
    this.loadPokemon(1)
    this.loadPokemon(4)
    this.loadPokemon(7)
    this.Host = this.route.snapshot.queryParams['host'] === 'true';
    this.changeTrainerSprite()
    // « Rejouer » : retour dans la même salle avec le même dresseur
    const replayRoom = this.route.snapshot.queryParams['room'];
    if (replayRoom) {
      this.roomCode = replayRoom;
      this.username = this.hubService.Player.name;
      if (this.hubService.Player.sprite) this.trainerSprite = this.hubService.Player.sprite;
    }
    this.destroyRef.onDestroy(this.hubService.onGameCreated((gameCode, userId) => {
      this.hubService.userId = userId;
      this.hubService.gameCode = gameCode;
      this.router.navigate(['/room']);
    }))
    this.destroyRef.onDestroy(this.hubService.onJoinSuccess((gameCode, userId) => {
      this.hubService.userId = userId;
      this.hubService.gameCode = gameCode;
      this.router.navigate(['/room']);
    }))

  }

  loadPokemon(id:number){
    this.pokemonBaseService.getPokemonById(id).subscribe({
      next: (data)=>{
        this.Starters.push(data)
        this.Starters.sort((a, b) => a.id - b.id)
      },
      error: (error)=>console.log('Erreur lors du chargement du Pokémon', error)
    })
  }

  selectedPokemonId:number = 0

  selectPokemonId(id:number) {
    this.selectedPokemonId = id;
  }

  get selectedStarter(): PokemonBaseModel | undefined {
    return this.Starters.find(s => s.id === this.selectedPokemonId);
  }

  // Ce qu'il manque pour valider le formulaire (vide = prêt)
  get missingHint(): string {
    if (!this.selectedPokemonId) return 'Choisis un Pokémon de départ.';
    if (this.username.trim().length === 0) return 'Entre ton nom de dresseur.';
    if (!this.Host && this.roomCode.trim().length === 0) return 'Entre le code de la salle.';
    return '';
  }

  submit() {
    if (this.missingHint) return;
    if (this.Host) this.createGame();
    else this.joinGame();
  }

  createGame() {
    this.hubService.createGame(this.username.trim(), this.selectedPokemonId, this.trainerSprite)
  }
  joinGame() {
    // Les codes de salle générés par le serveur sont en majuscules
    this.hubService.joinGame(this.username.trim(), this.selectedPokemonId, this.trainerSprite, this.roomCode.trim().toUpperCase())
  }

  changeTrainerSprite() {
      this.trainerSprite = this.TrainerSprites[Math.floor(Math.random() * this.TrainerSprites.length)];
  }
}
