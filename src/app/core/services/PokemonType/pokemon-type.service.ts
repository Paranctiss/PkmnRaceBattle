import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class PokemonTypeService {

  constructor() { }

  getColorByType(type:string):string{
    switch (type) {
      case "grass":
        return "#42c991";
      case "fire":
        return "#f29626";
      case "water":
        return "#4bb7ed"
      case "ghost":
        return "#7858b0"
      case "bug":
        return "#789850"
      case "flying":
        return "#baebfb"
      case "fairy":
        return "#ed55b5"
      case "poison":
        return "#b848e0"
      case "steel":
        return "#9090b0"
      case "electric":
        return "#b1a90f"
      case "ground":
        return "#907838"
      case "dragon":
        return "#d04040"
      case "ice":
        return "#389888"
      case "rock":
        return "#905d38"
      case "fighting":
        return "#d05340"
      case "normal":
        return "#989078"
      case "dark":
        return "#586060"
      case "psychic":
        return "#c02888"
      default:
        return "#fff"
    }
  }

}
