import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NoteComponent } from './note.component';
import { FormsModule } from '@angular/forms';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzUploadModule } from 'ng-zorro-antd/upload';
import { NzTabsModule } from 'ng-zorro-antd/tabs';
import { NzBadgeModule } from 'ng-zorro-antd/badge';
import { NzModalModule } from 'ng-zorro-antd/modal';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { NzCheckboxModule } from 'ng-zorro-antd/checkbox';
import {RouterModule, Routes} from '@angular/router';

const routes: Routes = [
  { path: '', component: NoteComponent }
];

@NgModule({
  declarations: [NoteComponent],
  imports: [
    CommonModule,
    FormsModule,
    NzIconModule,
    NzSelectModule,
    NzUploadModule,
    NzTabsModule,
    NzBadgeModule,
    NzModalModule,
    NzTagModule,
    NzCheckboxModule,
    RouterModule.forChild(routes)
  ]
})
export class NoteModule { }








