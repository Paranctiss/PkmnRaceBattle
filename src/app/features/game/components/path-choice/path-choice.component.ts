import {Component, EventEmitter, Input, Output} from '@angular/core';
import {NgForOf} from '@angular/common';
import {PathPoint} from '../../../../shared/models/player.model';
import {GameModalComponent} from '../../../../shared/components/game-modal/game-modal.component';
import {PixelIconComponent} from '../../../../shared/components/pixel-icon/pixel-icon.component';
import {EnvironmentInfo, getEnvironmentInfo} from '../../../../shared/utils/environment';

@Component({
  selector: 'app-path-choice',
  imports: [
    NgForOf,
    GameModalComponent,
    PixelIconComponent,
  ],
  templateUrl: './path-choice.component.html',
  styleUrl: './path-choice.component.css'
})
export class PathChoiceComponent {
  @Input() Options: PathPoint[] = [];
  @Output() PathChosen = new EventEmitter<PathPoint>();

  info(option: PathPoint): EnvironmentInfo {
    return getEnvironmentInfo(option.environmentName);
  }

  choose(option: PathPoint) {
    this.PathChosen.emit(option);
  }
}
