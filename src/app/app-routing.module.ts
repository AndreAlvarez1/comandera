import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ConfigComponent } from './components/config/config.component';
import { LoginComponent } from './components/login/login.component';
import { PrincipalComponent } from './components/principal/principal.component';
import { TotemComponent } from './components/totem/totem.component';
import { PublicoComponent } from './components/publico/publico.component';

const routes: Routes = [
  {path: 'principal', component: PrincipalComponent},
  {path: 'totem', component: TotemComponent},
  {path: 'config', component: ConfigComponent},
  {path: 'publico/:ip/:pass', component: PublicoComponent},
  {path: 'login', component: LoginComponent},
  {path: '', pathMatch: 'full', redirectTo: 'principal'},
  {path: '**', pathMatch: 'full', redirectTo: 'principal'},
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
