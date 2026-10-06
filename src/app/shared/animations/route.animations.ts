// shared/animations/route.animations.ts
import { trigger, transition, style, animate, query, group } from '@angular/animations';

export const routeAnimations = trigger('routeAnimations', [
  transition('HomePage => StarterSelectionPage', [
    style({ position: 'relative' }),
    query(':enter, :leave', [
      style({
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%'
      })
    ]),
    query(':enter', [style({ opacity: 0 })]),
    group([
      query(':leave', [animate('200ms ease-out', style({ opacity: 0 }))]),
      query(':enter', [animate('200ms ease-in', style({ opacity: 1 }))])
    ])
  ]),
  transition('StarterSelectionPage => HomePage', [
    style({ position: 'relative' }),
    query(':enter, :leave', [
      style({
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%'
      })
    ]),
    query(':enter', [style({ opacity: 0 })]),
    group([
      query(':leave', [animate('200ms ease-out', style({ opacity: 0 }))]),
      query(':enter', [animate('200ms ease-in', style({ opacity: 1 }))])
    ])
  ])
]);
