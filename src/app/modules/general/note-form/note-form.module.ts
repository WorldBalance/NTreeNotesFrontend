import {NgModule} from '@angular/core';
import {NoteFormComponent} from './note-form.component';
import {RouterModule, Routes} from '@angular/router';
import {AppSharedModule} from '../../shared/shared.module';
import {ReactiveFormsModule} from '@angular/forms';

const routes: Routes = [
  {path: '', component: NoteFormComponent},
];

@NgModule({
  declarations: [NoteFormComponent],
    imports: [
        RouterModule.forChild(routes),
        AppSharedModule,
        ReactiveFormsModule
    ],
})
export class NoteFormModule {
}
