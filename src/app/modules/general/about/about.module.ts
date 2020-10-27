import { NgModule } from '@angular/core';
import { AboutComponent } from './about.component';
import {RouterModule, Routes} from '@angular/router';
import {AppSharedModule} from '../../shared/shared.module';

const routes: Routes = [
  { path: '', component: AboutComponent },
];

@NgModule({
  imports: [
    AppSharedModule,
    RouterModule.forChild(routes)
  ],
  declarations: [
    AboutComponent
  ],
})
export class AboutModule { }
