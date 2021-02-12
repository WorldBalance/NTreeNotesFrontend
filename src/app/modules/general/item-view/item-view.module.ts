import {NgModule} from '@angular/core';
import {ItemViewComponent} from './item-view.component';
import {RouterModule, Routes} from '@angular/router';
import {AppSharedModule} from '../../shared/shared.module';

const routes: Routes = [
  {path: '', component: ItemViewComponent},
];

@NgModule({
  declarations: [ItemViewComponent],
    imports: [
        RouterModule.forChild(routes),
        AppSharedModule
    ],
})
export class ItemViewModule {
}
