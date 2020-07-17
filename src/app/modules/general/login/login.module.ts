import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgZorroAntdModule} from 'ng-zorro-antd';
import { FormsModule } from '@angular/forms';
import { LoginComponent } from './login.component';
import {RouterModule, Routes} from '@angular/router';

const routes: Routes = [
  { path: '', component: LoginComponent },
];

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    FormsModule,
    NgZorroAntdModule
  ],
  declarations: [
    LoginComponent
  ],
})
export class LoginModule {}
