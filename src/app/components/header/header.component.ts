import {ChangeDetectionStrategy, Component, OnInit} from '@angular/core';
import {Observable} from 'rxjs';
import {UserInfoModel} from '../../models/user-info.model';
import {AuthorizationService} from '../../services/authorization.service';
import {StoreService} from '../../services/store.service';
import {Router} from '@angular/router';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HeaderComponent implements OnInit {

  public userData$: Observable<UserInfoModel>;

  constructor(private authService: AuthorizationService,
              private storeService: StoreService,
              public store: StoreService,
              private router: Router) {
  }

  public ngOnInit(): void {
    this.userData$ = this.authService.getUserInfo();
  }

  public logout(): void {
    this.storeService.user.isAuthorized = false;
    this.router.navigate(['/login']);
  }
}
