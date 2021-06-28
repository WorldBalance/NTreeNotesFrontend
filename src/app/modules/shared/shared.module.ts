import {NgModule} from '@angular/core';
import {TagsComponent} from './tags/tags.component';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';
import { NgZorroAntdModule} from 'ng-zorro-antd';
import {TextContentTruncate} from "../general/notes/TextTruncate.pipe";

@NgModule({
  imports: [CommonModule, FormsModule, NgZorroAntdModule],
  exports: [FormsModule, CommonModule, TagsComponent, NgZorroAntdModule, TextContentTruncate],
  declarations: [TagsComponent, TextContentTruncate],
})
export class AppSharedModule {
}
