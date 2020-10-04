import {Component, OnInit} from '@angular/core';
import {RouterOutlet} from '@angular/router';
import {ActionService} from './services/action.service';
import {Observable} from 'rxjs';
import {UserInfoModel} from './models/user-info.model';
import {AuthorizationService} from './services/authorization.service';
import {tap} from 'rxjs/operators';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.less']
})
export class AppComponent implements OnInit {

  public userData$: Observable<UserInfoModel>;

  constructor(private action: ActionService, private authService: AuthorizationService) {
    action.appStart();
  }

  public ngOnInit(): void {
    this.userData$ = this.authService.getUserInfo().pipe(
      tap((userInfo: UserInfoModel) => {
        if (!userInfo.ok) {
          this.authService.login();
        }
      })
    );
  }

  prepareRoute(outlet: RouterOutlet) {
    return outlet && outlet.activatedRouteData && outlet.activatedRouteData.animation;
  }
}
