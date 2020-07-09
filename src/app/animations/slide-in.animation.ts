import { trigger, animate, transition, style, query, group, animateChild, stagger, state } from '@angular/animations';

export const slideInAnimation =
  trigger('routeAnimations', [
    transition('LoginPageAnimation => NotesPageAnimation', [
      style({ position: 'relative' }),
      query(':enter, :leave', [
        style({
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          opacity: 1,
        })
      ]),
      query(':enter', [
        style({ opacity: 0})
      ]),
      query(':enter', animateChild()),
      group([
        query(':enter', [
          animate('2.65s cubic-bezier(0, 1.8, 1, 1.8)', style({opacity: 1}))
        ])
      ]),
      query(':enter', animateChild()),
    ]),

    /*transition('*', [
      style({ position: 'relative' }),
      query(':enter, :leave', [
        style({
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          opacity: 1,
        })
      ]),
      query(':enter', [
        style({ opacity: 0})
      ]),
      query(':leave', animateChild()),
      group([
        query(':enter', [
          animate('2.65s cubic-bezier(0, 1.8, 1, 1.8)', style({opacity: 1}))
        ])
      ]),
      query(':enter', animateChild()),
    ])*/
  ]);
