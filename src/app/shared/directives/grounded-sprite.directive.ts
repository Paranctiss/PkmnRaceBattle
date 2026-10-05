import {Directive, ElementRef, HostListener} from '@angular/core';

/**
 * Mesure la marge transparente sous les pieds d'un sprite et l'expose en CSS (--ground-gap, fraction de la hauteur).
 * Le CSS s'en sert pour poser les pieds pile sur la plateforme au lieu du bas de l'image.
 */
@Directive({
  selector: 'img[appGroundedSprite]'
})
export class GroundedSpriteDirective {
  private static readonly cache = new Map<string, number>();

  constructor(private el: ElementRef<HTMLImageElement>) {
    // Nécessaire pour lire les pixels des sprites hébergés ailleurs (raw.githubusercontent.com autorise le CORS)
    el.nativeElement.crossOrigin = 'anonymous';
  }

  @HostListener('load')
  onLoad(): void {
    const img = this.el.nativeElement;
    const cached = GroundedSpriteDirective.cache.get(img.src);
    const gap = cached ?? this.measureBottomGap(img);
    if (gap === null) return;

    GroundedSpriteDirective.cache.set(img.src, gap);
    img.style.setProperty('--ground-gap', gap.toFixed(3));
  }

  private measureBottomGap(img: HTMLImageElement): number | null {
    const {naturalWidth: width, naturalHeight: height} = img;
    if (!width || !height) return null;

    try {
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d', {willReadFrequently: true});
      if (!ctx) return null;
      ctx.drawImage(img, 0, 0);
      const pixels = ctx.getImageData(0, 0, width, height).data;

      // Dernière ligne contenant un pixel visible, en partant du bas
      for (let y = height - 1; y >= 0; y--) {
        for (let x = 0; x < width; x++) {
          if (pixels[(y * width + x) * 4 + 3] > 24) {
            return (height - 1 - y) / height;
          }
        }
      }
      return null;
    } catch {
      // Image non lisible (CORS refusé) : on garde la valeur par défaut du CSS
      return null;
    }
  }
}
