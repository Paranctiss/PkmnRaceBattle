import {ChangeDetectionStrategy, Component, Input, OnChanges} from '@angular/core';
import {NgForOf} from '@angular/common';
import {PIXEL_ICONS} from './pixel-icons';
import {normalizeEnvironmentName} from '../../utils/environment';

interface PixelRun {
  x: number;
  y: number;
  width: number;
  color: string;
}

@Component({
  selector: 'app-pixel-icon',
  imports: [NgForOf],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <svg viewBox="0 0 12 12" [attr.width]="size" [attr.height]="size" shape-rendering="crispEdges" aria-hidden="true">
      <rect *ngFor="let run of runs" [attr.x]="run.x" [attr.y]="run.y" [attr.width]="run.width" height="1" [attr.fill]="run.color"/>
    </svg>
  `,
  styles: [`:host { display: inline-flex; line-height: 0; }`]
})
export class PixelIconComponent implements OnChanges {
  @Input() name: string = 'Default';
  @Input() size: number = 36;

  runs: PixelRun[] = [];

  ngOnChanges(): void {
    const icon = PIXEL_ICONS[normalizeEnvironmentName(this.name)] ?? PIXEL_ICONS['Default'];
    this.runs = [];

    // Regroupe les pixels consécutifs de même couleur pour limiter le nombre de <rect>
    icon.rows.forEach((row, y) => {
      let x = 0;
      while (x < row.length) {
        const char = row[x];
        let width = 1;
        while (x + width < row.length && row[x + width] === char) width++;
        if (char !== '.') this.runs.push({x, y, width, color: icon.palette[char]});
        x += width;
      }
    });
  }
}
