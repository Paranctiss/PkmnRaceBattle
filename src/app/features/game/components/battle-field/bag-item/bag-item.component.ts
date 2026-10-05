import {Component, Input} from '@angular/core';
import {NgIf} from '@angular/common';
import {BagItemModel} from '../../../../../shared/models/player.model';
import {getItemSprite} from '../../../../../shared/utils/items';

@Component({
  selector: 'app-bag-item',
  imports: [NgIf],
  templateUrl: './bag-item.component.html',
  styleUrl: './bag-item.component.css'
})
export class BagItemComponent {
  @Input() item!: BagItemModel;

  get sprite(): string {
    return getItemSprite(this.item.name);
  }
}
