import {Component} from '@angular/core';
import {RouterOutlet} from '@angular/router';
import {slideInAnimation} from './animations/slide-in.animation';
import {slideInOutAnimation} from './animations';
import {ActionService} from './services/action.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  animations: [slideInAnimation, slideInOutAnimation]
})
export class AppComponent {
  constructor(private action: ActionService) {
    action.appStart();
  }

  prepareRoute(outlet: RouterOutlet) {
    return outlet && outlet.activatedRouteData && outlet.activatedRouteData['animation'];
  }
}
