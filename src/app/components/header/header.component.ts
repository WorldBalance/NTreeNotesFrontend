import {ChangeDetectionStrategy, Component, Input} from '@angular/core';
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
export class HeaderComponent {

  @Input() userData: UserInfoModel;

  constructor(private authService: AuthorizationService,
              private storeService: StoreService,
              public store: StoreService,
              private router: Router) {
  }

  public logout(): void {
    this.storeService.user.isAuthorized = false;
    this.router.navigate(['/login']);
  }
}
