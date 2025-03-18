import {Component, signal, WritableSignal} from '@angular/core';
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
    this.changeTrainerSprite()
    this.Host = this.route.snapshot.queryParams['host'] === 'true';
    this.changeTrainerSprite()
    this.hubService.onGameCreated((gameCode, userId) => {
      this.hubService.userId = userId;
      this.hubService.gameCode = gameCode;
      this.router.navigate(['/room']);
    })
    this.hubService.onJoinSuccess((gameCode, userId) => {
      this.hubService.userId = userId;
      this.hubService.gameCode = gameCode;
      this.router.navigate(['/room']);
    })

  }

  loadPokemon(id:number){
    this.pokemonBaseService.getPokemonById(id).subscribe({
      next: (data)=>{
        this.Starters.push(data)
      },
      error: (error)=>console.log('Erreur lors du chargement du Pokémon', error)
    })
  }

      selectedPokemonId:number = 0

      selectPokemonId(id:number) {
        this.selectedPokemonId = id;
      }

  createGame() {
    this.hubService.createGame(this.username, this.selectedPokemonId, this.trainerSprite)
  }
  joinGame() {
    this.hubService.joinGame(this.username, this.selectedPokemonId, this.trainerSprite, this.roomCode)
  }

  changeTrainerSprite() {
      this.trainerSprite = this.TrainerSprites[Math.floor(Math.random() * this.TrainerSprites.length)];
  }
}
