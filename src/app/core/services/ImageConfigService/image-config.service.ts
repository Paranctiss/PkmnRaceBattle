import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ImageConfigService {
  constructor() {}

  disableDragForAllImages() {
    document.addEventListener('DOMContentLoaded', () => {
      const observer = new MutationObserver(mutations => {
        const images = document.querySelectorAll('img');
        images.forEach(img => this.makeNonDraggable(img));
      });

      observer.observe(document.body, {
        childList: true,
        subtree: true
      });

      // Traiter les images déjà présentes
      const images = document.querySelectorAll('img');
      images.forEach(img => this.makeNonDraggable(img));
    });
  }

  private makeNonDraggable(img: HTMLImageElement) {
    img.setAttribute('draggable', 'false');
  }
}
