import {Component, Input} from '@angular/core';
import {BagItemModel} from '../../../../../shared/models/player.model';

@Component({
  selector: 'app-bag-item',
  imports: [],
  templateUrl: './bag-item.component.html',
  styleUrl: './bag-item.component.css'
})
export class BagItemComponent {
  @Input() item!: BagItemModel;

}
