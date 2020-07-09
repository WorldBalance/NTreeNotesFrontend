import { Component, OnInit} from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { slideInAnimation } from './animations/slide-in.animation';
import { slideInOutAnimation } from './animations/slide-in-out.animation';
import { StoreService } from '../app/services/store.service';
import { ActionService } from '../app/services/action.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  animations: [slideInAnimation, slideInOutAnimation]
})
export class AppComponent {
  constructor(
    public store: StoreService,
    private router: Router,
    private action: ActionService
  ){
    action.appStart();
  }


  logout(){
    this.store.user.isAuthorized = false;
    this.router.navigate(['/login']);
  }

  prepareRoute(outlet: RouterOutlet) {
    return outlet && outlet.activatedRouteData && outlet.activatedRouteData['animation'];
  }
}
