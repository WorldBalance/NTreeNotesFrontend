import {NgModule} from '@angular/core';
import { NzModalModule } from 'ng-zorro-antd/modal';
import { TagsComponent } from './tags/tags.component';
import {NzSelectModule} from 'ng-zorro-antd/select';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';

@NgModule({
  imports: [NzModalModule, NzSelectModule, CommonModule, FormsModule],
  exports: [NzModalModule, FormsModule, CommonModule, TagsComponent],
  declarations: [TagsComponent],
})
export class AppSharedModule {
}
