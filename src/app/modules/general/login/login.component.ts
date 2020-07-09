import { Component, OnInit } from '@angular/core';
import { NzMessageService } from 'ng-zorro-antd/message';
import { concatMap } from 'rxjs/operators';
import { StoreService } from '../../../services/store.service';
import { Router } from '@angular/router';
import { ActionService } from '../../../services/action.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  public loginText = '1';
  public passwordText = '1';

  constructor(
    private message: NzMessageService,
    private store: StoreService,
    private router: Router,
    private action: ActionService
    ) {}

  ngOnInit(): void {

  }

  login(l, p){
    if (l === '' || p === ''){
      // tslint:disable-next-line: no-unused-expression
      this.message.error('Поля не могут быть пустыми!', { nzDuration: 2500 }).onClose;
      return;
    }
    if ((l !== '1' || p !== '1')){
      // tslint:disable-next-line: no-non-null-assertion
      this.message
      .loading('Авторизация', { nzDuration: 1300 })
      .onClose!.pipe(
        // tslint:disable-next-line: no-non-null-assertion
        concatMap(() => this.message.error('Логин либо пароль не подходят!', { nzDuration: 2000 }).onClose!)
      )
      .subscribe(() => {
        this.store.user.isAuthorized = false;
        return;
      });

    }else{
      // tslint:disable-next-line: no-non-null-assertion
      this.message
      .loading('Авторизация', { nzDuration: 900 })
      .onClose!.pipe(
        // tslint:disable-next-line: no-non-null-assertion
        concatMap(() => this.message.success('Успешно авторизован', { nzDuration: 700 }).onClose!)
      )
      .subscribe(() => {
        this.router.navigate(['/notes']);
        this.store.user.isAuthorized = true;
        this.action.appStart();
      });
    }
  }

}
