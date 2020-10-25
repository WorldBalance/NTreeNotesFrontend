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
import { NzInputModule } from 'ng-zorro-antd/input';
import {ReactiveFormsModule} from '@angular/forms';
import { NzCollapseModule } from 'ng-zorro-antd/collapse';
import { NzDropDownModule } from 'ng-zorro-antd/dropdown';

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
    NzInputModule,
    ReactiveFormsModule,
    NzCollapseModule,
    NzDropDownModule
  ],
})
export class NoteFormModule {
}
