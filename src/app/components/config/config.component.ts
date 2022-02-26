import { Component, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { paramsModel } from 'src/app/models/params.models';
import { ConectorService } from 'src/app/services/conector.service';
import versionApp from 'src/assets/js/version.json';
import Swal from 'sweetalert2';



@Component({
  selector: 'app-config',
  templateUrl: './config.component.html',
  styleUrls: ['./config.component.css']
})
export class ConfigComponent implements OnInit {
  params = new paramsModel();

  version = '0.0.0';

  constructor(private conex:ConectorService) { 
    this.version = versionApp.version; // valido en que versión estoy

    if (localStorage.getItem('paramsComandera')){
      this.params = JSON.parse( localStorage.getItem('paramsComandera') || '{}');
    }
  }

  ngOnInit(): void {
    this.probarConexion();
  }

  info(){
    console.log('params', this.params)
  }

  guardarFormulario(form: NgForm) {
    console.log('form', form);
    this.guardarLocalStorage();
    location.reload();
  }

  guardarLocalStorage() {
    localStorage.setItem('paramsComandera', JSON.stringify(this.params));
  }

  probarConexion() {
    this.conex.traeDatos('/usuarios')
                .subscribe( (data:any) => {
                //  console.log(data);
                 if ( data["datos"].length > 0) {
                   this.ok('Excelente', 'Estás conectado a la Base de datos');
                   this.params.node.conectado = true;
                   this.versionNode();
                  //  this.traerEntornos();
                 } else {
                  this.error('Node corriendo, pero no conectado a la bd', `Revisa si escribiste bien la url o el puerto correcto` );
                  this.params.node.conectado = false;
                }
                this.guardarLocalStorage();
                },
                  (err) => {
                    console.log(err.error);
                    this.params.node.conectado = false;
                    this.guardarLocalStorage();
                    this.error('Node corriendo, pero no conectado a la bd', 'o revisa si está corriendo el node' );
                });
  }


  versionNode() {
    this.conex.traeDatos('/version')
        .subscribe( (data:any) => {
          console.log(data["datos"]);
          this.params.node.version = data["datos"];
        });
  }


// ==============================================================
// ==============================================================
// ==============================================================
// WARNINGS
// ==============================================================
// ==============================================================
// ==============================================================



  error(titulo:string, texto:string) {
    Swal.fire({
      title: 'Error en la Conexión',
      text: texto,
      icon: 'error',
      confirmButtonText: 'Ok'
    });
  }
  
    ok(titulo:string, texto:string) {
    Swal.fire({
      title: titulo,
      text: texto,
      icon: 'success',
      confirmButtonText: 'Ok'
    });
  }
  
}
