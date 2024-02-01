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


  formatearFechaYHora(fecha: Date): string {
    const dia = this.agregarCero(fecha.getDate());
    const mes = this.agregarCero(fecha.getMonth() + 1); // Los meses comienzan desde 0
    const anio = fecha.getFullYear();

    const horas = this.agregarCero(fecha.getHours());
    const minutos = this.agregarCero(fecha.getMinutes());
    const segundos = this.agregarCero(fecha.getSeconds());

    return `${anio}-${mes}-${dia} ${horas}:${minutos}:${segundos}`;
  }

  agregarCero(numero: number): string {
    return numero < 10 ? `0${numero}` : `${numero}`;
  }
  

  fechaSql(): string {
    const fechaObjeto: Date = new Date();
    
    const year    = fechaObjeto.getFullYear();
    const month   = fechaObjeto.getMonth() + 1;
    const day     = fechaObjeto.getDate();
    const hours   = fechaObjeto.getHours();
    const minutes = fechaObjeto.getMinutes();
    const seconds = fechaObjeto.getSeconds();

    // Formatea la fecha en el formato 'YYYY-MM-DDTHH:mm:ss'
    const fechaFormateada = `${year}-${this.pad(month)}-${this.pad(day)}T${this.pad(hours)}:${this.pad(minutes)}:${this.pad(seconds)}`;

    return fechaFormateada;
  }

  private pad(num: number): string {
    return num < 10 ? `0${num}` : num.toString();
  }


}
