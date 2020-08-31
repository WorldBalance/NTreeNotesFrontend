import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AuthGuard } from './guards/auth-guard.service';

import { HomeComponent } from './modules/general/home/home.component';
import { NotFoundComponent } from './components/not-found/not-found.component';

const routes: Routes = [
  {
    path: '',
    component: HomeComponent,
    data: {animation: 'HomePageAnimation'}
  },
  {
    path: 'notes',
    canActivate: [AuthGuard],
    data: {animation: 'NotesPageAnimation'},
    loadChildren: () => import('./modules/general/notes/notes.module')
      .then(mod => mod.NotesModule)
  },
  {
    path: 'note',
    canActivate: [AuthGuard],
    loadChildren: () => import('./modules/general/note-form/note-form.module')
      .then(mod => mod.NoteFormModule)
  },
  {
    path: 'note/:id',
    canActivate: [AuthGuard],
    loadChildren: () => import('./modules/general/note-form/note-form.module')
      .then(mod => mod.NoteFormModule)
  },
  {
    path: 'about',
    loadChildren: () => import('./modules/general/about/about.module')
      .then(mod => mod.AboutModule)
  },
  {
    path: 'contacts',
    loadChildren: () => import('./modules/general/contact/contact.module')
      .then(mod => mod.ContactModule)
  },
  {
    path: 'login',
    data: {animation: 'LoginPageAnimation'},
    loadChildren: () => import('./modules/general/login/login.module')
      .then(mod => mod.LoginModule)
  },
  { path: '**', component: NotFoundComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
  declarations: [],
  providers: [AuthGuard]
})
export class AppRoutingModule { }
