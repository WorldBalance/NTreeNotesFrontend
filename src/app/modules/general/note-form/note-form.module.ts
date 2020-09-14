import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {NoteFormComponent} from './note-form.component';
import {NzSelectModule} from 'ng-zorro-antd/select';
import {RouterModule, Routes} from '@angular/router';
import {NzTabsModule} from 'ng-zorro-antd/tabs';
import {NzBadgeModule} from 'ng-zorro-antd/badge';
import {NzUploadModule} from 'ng-zorro-antd/upload';
import {NzTagModule} from 'ng-zorro-antd/tag';
import {NzCheckboxModule} from 'ng-zorro-antd';
import { NzIconModule } from 'ng-zorro-antd/icon';

const routes: Routes = [
  {path: '', component: NoteFormComponent},
];

@NgModule({
  declarations: [NoteFormComponent],
  imports: [
    CommonModule,
    FormsModule,
    NzSelectModule,
    RouterModule.forChild(routes),
    NzTabsModule,
    NzBadgeModule,
    NzUploadModule,
    NzTagModule,
    NzCheckboxModule,
    NzIconModule,
  ],
})
export class NoteFormModule {
}
