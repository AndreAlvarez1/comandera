import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { paramsModel } from 'src/app/models/params.models';
import { ConectorService } from 'src/app/services/conector.service';
import Swal from 'sweetalert2';
import versionApp from 'src/assets/js/version.json';


@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {

  loading           = false;
  pass              = '';
  password          = '';
  usuarios: any[]   = [];

  // activos;
  // locales: any[] = [];
  // turno: boolean;

  // asteriscos;
  // elem;
  // version;
  params: paramsModel = new paramsModel();
  version = '0.0.0';


  constructor(private conex:ConectorService,
              private router: Router) { 
                this.version = versionApp.version; // valido en que versión estoy


                if (localStorage.getItem('paramsComandera')){
                  this.params = JSON.parse(localStorage.getItem('paramsComandera') || '{}');
                  this.getUsuarios();
                  this.conex.test();
                } else {
                  this.router.navigateByUrl('/config');
                }
  } 

  ngOnInit(): void {

  }



  getUsuarios(){
    this.conex.traeDatos('/usuarios')
              .subscribe( (datos:any) => {
                        this.usuarios = datos["datos"];
                        console.log('this.usuarios', this.usuarios);
              }, err =>{
                this.error('Error', 'No hay conexion con la bd');
                this.router.navigateByUrl('/config');
              });
  }

  tecleo(digito:any) {
    // this._gs.sonido('Klick.mp3');
    switch (digito) {
      case 'delete':
        this.pass = this.pass.slice(0, -1);
        break;
      case 'ok':
        this.buscarUsuario(this.pass);
        break;
      default:
        if (this.pass === 'x') {
          this.pass = digito;
        } else {
          this.pass = this.pass + digito;
        }

        if (this.pass.length === 4) {
          this.buscarUsuario(this.pass);
        }

        if (this.pass.length > 4) {
          this.pass = this.pass.slice(0, -1);
        }
    }

    console.log('pass', this.pass);
  }


  buscarUsuario(pass:any) {
   const resultado = this.usuarios.find( user => user.CLAVE === `${pass}`);
  console.log('resultado', resultado);
    if (!resultado) {
      this.error('Error en contraseña', 'Intentalo de nuevo por favor');
      this.pass = '';
    } else {
      this.loading = true;
      this.params.user.nombre = resultado.NOMBRE;
      this.params.user.codigo = resultado.CODIGO;
      localStorage.setItem('paramsComandera', JSON.stringify(this.params));
      this.router.navigateByUrl('/principal')


    }
  }


// ==============================
// ==============================
// WARNINGS
// ==============================
// ==============================

 error(titulo:string, texto:string) {
    // this._gs.sonido('Error.mp3');
    Swal.fire({
      title: titulo,
      text: texto,
      icon: 'error',
      confirmButtonText: 'Ok'
    });
  }



}
