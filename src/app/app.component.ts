import {Component, OnInit} from '@angular/core';
import {RouterOutlet} from '@angular/router';
import {slideInAnimation} from './animations/slide-in.animation';
import {slideInOutAnimation} from './animations';
import {ActionService} from './services/action.service';
import {Observable} from 'rxjs';
import {UserInfoModel} from './models/user-info.model';
import {AuthorizationService} from './services/authorization.service';
import {CrudService} from './services/crud.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.less'],
  animations: [slideInAnimation, slideInOutAnimation]
})
export class AppComponent implements OnInit {

  public userData$: Observable<UserInfoModel>;

  constructor(private action: ActionService, private authService: AuthorizationService) {
    action.appStart();
  }

  public ngOnInit(): void {
    this.userData$ = this.authService.getUserInfo();
  }

  prepareRoute(outlet: RouterOutlet) {
    return outlet && outlet.activatedRouteData && outlet.activatedRouteData.animation;
  }
}
