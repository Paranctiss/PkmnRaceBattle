import {AfterViewInit, Component, ElementRef, Input, OnChanges, ViewChild} from '@angular/core';
import {NgForOf, NgIf} from '@angular/common';
import {PathPoint} from '../../../../../shared/models/player.model';
import {PixelIconComponent} from '../../../../../shared/components/pixel-icon/pixel-icon.component';
import {EnvironmentInfo, getEnvironmentInfo} from '../../../../../shared/utils/environment';
import {levelRangeLabel} from '../../../../../shared/utils/level-range';

type NodeState = 'visited' | 'current' | 'skipped' | 'upcoming';

interface MapNode {
  point: PathPoint;
  left: number;
  top: number;
  state: NodeState;
  info: EnvironmentInfo;
}

interface MapLink {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  state: 'travelled' | 'skipped' | 'upcoming';
}

const STATE_LABELS: Record<NodeState, string> = {
  visited: 'Visité',
  current: 'Vous êtes ici',
  skipped: 'Chemin non choisi',
  upcoming: 'À venir',
};

// Carte du parcours façon Pokématos : grille, routes et lieux
@Component({
  selector: 'app-map',
  imports: [NgForOf, NgIf, PixelIconComponent],
  templateUrl: './map.component.html',
  styleUrl: './map.component.css'
})
export class MapComponent implements OnChanges, AfterViewInit {
  @Input() PathNodes!: PathPoint[];
  @Input() CurrentNode!: PathPoint;
  @Input() TrainerSprite: string = '';

  @ViewChild('scroller') scroller?: ElementRef<HTMLElement>;

  readonly stepSpacing = 124;
  readonly branchOffset = 62;
  readonly padding = 76;
  readonly height = 330;
  readonly stateLabels = STATE_LABELS;

  nodes: MapNode[] = [];
  links: MapLink[] = [];
  width = 0;
  hoveredNode: MapNode | null = null;

  ngOnChanges(): void {
    this.buildMap();
  }

  ngAfterViewInit(): void {
    // Centre la vue sur la position du joueur
    const current = this.nodes.find(n => n.state === 'current');
    const el = this.scroller?.nativeElement;
    if (current && el) el.scrollLeft = current.left - el.clientWidth / 2;
  }

  private buildMap(): void {
    // Point de départ fictif (X = 0) avant la première map
    const start: PathPoint = {x: 0, y: 1, environmentName: 'Default'};
    const points = [start, ...(this.PathNodes ?? [])];
    const currentX = this.CurrentNode?.x ?? 0;
    const centerY = this.height / 2 - 10;

    const steps = new Map<number, PathPoint[]>();
    points.forEach(point => {
      if (!steps.has(point.x)) steps.set(point.x, []);
      steps.get(point.x)!.push(point);
    });

    this.nodes = [];
    const nodesByStep = new Map<number, MapNode[]>();
    Array.from(steps.keys()).sort((a, b) => a - b).forEach(x => {
      const group = steps.get(x)!.sort((a, b) => a.y - b.y);
      const stepNodes = group.map((point, i) => {
        const offset = group.length === 1 ? 0 : (i === 0 ? -this.branchOffset : this.branchOffset);
        const node: MapNode = {
          point,
          left: this.padding + x * this.stepSpacing,
          top: centerY + offset,
          state: this.stateOf(point, currentX),
          info: getEnvironmentInfo(point.environmentName),
        };
        return node;
      });
      nodesByStep.set(x, stepNodes);
      this.nodes.push(...stepNodes);
    });

    // Routes entre deux étapes consécutives
    this.links = [];
    const xs = Array.from(nodesByStep.keys()).sort((a, b) => a - b);
    for (let i = 0; i < xs.length - 1; i++) {
      for (const from of nodesByStep.get(xs[i])!) {
        for (const to of nodesByStep.get(xs[i + 1])!) {
          this.links.push({
            x1: from.left, y1: from.top, x2: to.left, y2: to.top,
            state: this.linkState(from, to),
          });
        }
      }
    }

    const maxX = Math.max(...xs);
    this.width = this.padding * 2 + maxX * this.stepSpacing;
  }

  private stateOf(point: PathPoint, currentX: number): NodeState {
    if (point.isSkipped) return 'skipped';
    if (point.x === currentX && (point.x === 0 || point.y === this.CurrentNode.y)) return 'current';
    if (point.x < currentX) return 'visited';
    return 'upcoming';
  }

  private linkState(from: MapNode, to: MapNode): MapLink['state'] {
    if (from.state === 'skipped' || to.state === 'skipped') return 'skipped';
    const reached = (n: MapNode) => n.state === 'visited' || n.state === 'current';
    return reached(from) && reached(to) ? 'travelled' : 'upcoming';
  }

  levels(point: PathPoint): string {
    // Position actuelle : fourchette à jour (tours de boucle en fin de chemin)
    if (point.x === this.CurrentNode?.x && point.y === this.CurrentNode?.y) return levelRangeLabel(this.CurrentNode);
    return levelRangeLabel(point);
  }

  linkPath(link: MapLink): string {
    // Route en "S" doux entre deux lieux
    const mid = (link.x1 + link.x2) / 2;
    return `M ${link.x1} ${link.y1} C ${mid} ${link.y1}, ${mid} ${link.y2}, ${link.x2} ${link.y2}`;
  }
}
