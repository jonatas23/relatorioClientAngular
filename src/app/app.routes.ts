import {Routes} from '@angular/router';
import {RelatorioComponent} from './componets/relatorio-component/relatorio-component';

export const routes: Routes = [
  {path: '', redirectTo: '/relatorios', pathMatch: 'full'},
  {path: 'relatorios', component: RelatorioComponent},
];
