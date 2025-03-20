import {Component, Input} from '@angular/core';
import {BagItemModel} from '../../../../../shared/models/player.model';
import {NgIf, NgStyle} from '@angular/common';

@Component({
  selector: 'app-bag-item',
  imports: [
    NgIf,
    NgStyle
  ],
  templateUrl: './bag-item.component.html',
  styleUrl: './bag-item.component.css'
})
export class BagItemComponent {
  @Input() item!: BagItemModel;


}
