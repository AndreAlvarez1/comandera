import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { paramsModel } from 'src/app/models/params.models';
import { ConectorService } from 'src/app/services/conector.service';

@Component({
  selector: 'app-principal',
  templateUrl: './principal.component.html',
  styleUrls: ['./principal.component.css']
})
export class PrincipalComponent implements OnInit {


  params: paramsModel = new paramsModel();

  constructor(private conex:ConectorService,
              private router: Router) {

    if (localStorage.getItem('paramsComanda')){
      this.params = JSON.parse(localStorage.getItem('paramsComanda') || '{}');
      // this.getUsuarios();
      this.conex.test();
      if (this.params.user.codigo == ''){
        this.router.navigateByUrl('/config');
      }
    } else {
      this.router.navigateByUrl('/config');
    }

    this.conex.test();

   }

  ngOnInit(): void {
  }

}
