import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';


@Injectable({
  providedIn: 'root'
})
export class ConectorService {


  public url = '';
  public port = '';

  constructor(private http: HttpClient,
              private router: Router) {

    if ( localStorage.getItem('paramsComandera') ) {
      const node = JSON.parse(localStorage.getItem('paramsComandera') || '{}').node;
      this.url = node.url;
      this.port = node.puerto;
      }
   }

   test(){
     this.http.get(this.url + ':' + this.port + '/usuarios')
              .subscribe( (resp:any) => { 
                  if (resp['datos'].length > 0){
                    // console.log('gooood', resp['datos'])
                  } else {
                    this.router.navigateByUrl('/config');
                    Swal.fire({
                      title: 'Error de conexión',
                      text: 'revisa la red o los datos de conexión a la bd',
                      icon: 'error',
                      confirmButtonText: 'Ok'
                    });
                  }
              })
   }

  traeDatos( ruta:string ) {
    return this.http.get( this.url + ':' + this.port + ruta );
  }

  guardarDato(rutas:string, body:any) {
   return this.http.post( this.url + ':' + this.port + rutas, body );
  }


  sonido(sonido:any) {
    const audio = new Audio();
    audio.src = `./assets/sounds/${sonido}`;
    audio.play();
  }

}
