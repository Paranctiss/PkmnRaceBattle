import {Component, EventEmitter, Input, Output} from '@angular/core';
import {NgForOf, NgIf} from '@angular/common';
import {PathPoint} from '../../../../shared/models/player.model';
import {GameModalComponent} from '../../../../shared/components/game-modal/game-modal.component';
import {PixelIconComponent} from '../../../../shared/components/pixel-icon/pixel-icon.component';
import {EnvironmentInfo, getEnvironmentInfo} from '../../../../shared/utils/environment';
import {levelRangeLabel} from '../../../../shared/utils/level-range';

@Component({
  selector: 'app-path-choice',
  imports: [
    NgForOf,
    NgIf,
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

  levels(option: PathPoint): string {
    return levelRangeLabel(option);
  }

  choose(option: PathPoint) {
    this.PathChosen.emit(option);
  }
}
