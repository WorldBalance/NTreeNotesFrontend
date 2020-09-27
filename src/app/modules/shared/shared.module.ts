import {NgModule} from '@angular/core';
import { NzModalModule } from 'ng-zorro-antd/modal';

@NgModule({
  imports: [NzModalModule],
  exports: [NzModalModule],
})
export class AppSharedModule {
}
