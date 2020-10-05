import {NgModule} from '@angular/core';
import {NoteFormComponent} from './note-form.component';
import {RouterModule, Routes} from '@angular/router';
import {NzTabsModule} from 'ng-zorro-antd/tabs';
import {NzBadgeModule} from 'ng-zorro-antd/badge';
import {NzUploadModule} from 'ng-zorro-antd/upload';
import {NzTagModule} from 'ng-zorro-antd/tag';
import {NzCheckboxModule} from 'ng-zorro-antd';
import {AppSharedModule} from '../../shared/shared.module';
import { NzIconModule } from 'ng-zorro-antd/icon';

const routes: Routes = [
  {path: '', component: NoteFormComponent},
];

@NgModule({
  declarations: [NoteFormComponent],
  imports: [
    RouterModule.forChild(routes),
    NzTabsModule,
    NzBadgeModule,
    NzUploadModule,
    NzTagModule,
    NzCheckboxModule,
    AppSharedModule,
    NzIconModule,
  ],
})
export class NoteFormModule {
}
