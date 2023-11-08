import { Component, ElementRef, Inject, OnInit  } from '@angular/core';
import { DOCUMENT } from '@angular/common';

import { ActivatedRoute } from '@angular/router';
import { interval } from 'rxjs';
import { paramsModel } from 'src/app/models/params.models';
import { ConectorService } from 'src/app/services/conector.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-publico',
  templateUrl: './publico.component.html',
  styleUrls: ['./publico.component.css']
})
export class PublicoComponent implements OnInit {


  loading                     = true;
  loadingComandas             = true;

  params             = new paramsModel();
  pass               = '';

  comandasAll:any[]           = []
  comandas:any[]              = []
  listos:any[]                = []
  pendientes:any[]            = []
  comanda:any                 = { 
                                  id: 0,
                                  detalle: [],
                                  new: true,
                                  minutos: 0
                                }


  cambio                      = true;
  ciclo                       = interval(5000);
  tiempo:any;
  tipoVista                   = 'cliente';
  primeraCarga                = true;
  modalTiempos                = false;
  elem:any;

  constructor(private route: ActivatedRoute,
             private conex: ConectorService,
             @Inject(DOCUMENT) private document: any) {
    this.params.node.url   = 'http://' + this.route.snapshot.paramMap.get('ip') || '';
    this.pass              = this.route.snapshot.paramMap.get('pass') || '';

    console.log('ip',  this.params.node.url);
    console.log('pass', this.pass);
    console.log('params', this.params);
   }

  ngOnInit(): void {
    this.probarConexion();   
    this.elem = document.documentElement;
    setTimeout(() =>   this.openFullscreen(), 0);
  
  }

//== ARMAR DATA == //
//== ARMAR DATA == //
//== ARMAR DATA == //
//== ARMAR DATA == //

  probarConexion() {
    this.loading = true;
    this.conex.traeDatos('/usuarios')
                .subscribe( (data:any) => {
                //  console.log(data);
                 if ( data["datos"].length > 0) {
                  //  this.ok('Excelente', 'Estás conectado a la Base de datos');
                   this.params.node.conectado = true;
                   this.getUsuarios();
                 } else {
                  this.loading = false;
                  this.error('Node corriendo, pero no conectado a la bd', `Revisa si escribiste bien la url o el puerto correcto` );
                  this.params.node.conectado = false;
                }
                this.guardarLocalStorage();
                },
                  (err) => {
                    console.log(err.error);
                    this.params.node.conectado = false;
                    this.loading = false;
                    this.guardarLocalStorage();
                    this.error('Node corriendo, pero no conectado a la bd', 'o revisa si está corriendo el node' );
                });
  }




  getUsuarios(){
    this.conex.traeDatos('/usuarios')
              .subscribe( (datos:any) => {
                        const usuarios = datos["datos"];
                        console.log('this.usuarios', usuarios);
                        const user = usuarios.find( (u:any) => u.CLAVE == this.pass);
                        console.log('user', user);
                        this.params.user.codigo == user.CODIGO;
                        this.params.user.nombre == user.NOMBRE;
                        this.guardarLocalStorage();
                        this.getImpresoras();
              }, err =>{
                this.error('Error', 'No hay conexion con la bd');
                this.loading = false;

              });
  }
  


  getImpresoras(){

    console.log('this params', this.params);

    this.conex.traeDatos('/impresoras').subscribe( (resp:any) => { 
              for (let imp of resp['datos']){
                
                console.log('imp', imp);

                // reviso si la impresora ya existe en los params.
                let existe = this.params.impresoras.find( (p:any) =>  p.CODIGO ==  imp.CODIGO );
                
                // si no existe reviso si el TODAS está activado para agregarla "seleccionada";
                if (!existe){
                  // console.log('no existe', existe);
                    imp.checked = false;
                    if (this.params.impresoras[0].checked){
                      imp.checked = true;
                    }
                 this.params.impresoras.push(imp);
               
                } else {
                  // console.log('ya existe', existe);
                }


              }

              console.log('gruposImpresion', this.params.impresoras);
              localStorage.setItem('paramsComandera', JSON.stringify(this.params));
              this.loading = false;


              this.filtrar();


              this.tiempo = this.ciclo.subscribe( (n) => {
                this.filtrar();

              });
          
            })
  }


  filtrar(){
    const impresoras     =  this.ValidarCheck('impresoras');
    const tipoComanda    =  this.ValidarCheck('tiposComanda');
    const estados        =  this.ValidarCheck('estados');
 
    const codigos = {
                     impresoras: '',
                     estados: '',
                     tipos: ''
                   }
 
    if (!impresoras){
     this.alertVacio('Tipo Comanda')
     return;
    }
   
    if (!tipoComanda){
     this.alertVacio('Tipo Comanda')
     return;
    }
    
    if (!estados){
     this.alertVacio('Estados de la comandas')
     return;
    }
 
 
 
    console.log('ok, traigo datos', this.params);
   
    localStorage.setItem('paramsComandera', JSON.stringify(this.params));
 
 
     for (let imp of this.params.impresoras){
       if (imp.DESCRIPCIO != 'TODAS' && imp.checked){
         codigos.impresoras += ",'" + imp.CODIGO + "'";
       }
     }
     
     for (let e of this.params.estados){
       if (e.descripcion != 'Todos' && e.checked){
         codigos.estados += ",'" + e.codigo.toString() + "'"
       }
     }
   
     for (let e of this.params.tiposComanda){
       if (e.descripcion != 'Todos' && e.checked){
         codigos.tipos += ",'" + e.descripcion.toUpperCase() + "'"
       }
     }
 
 
 
     codigos.impresoras = codigos.impresoras.substring(1)
     codigos.estados    = codigos.estados.substring(1)
     codigos.tipos      = codigos.tipos.substring(1)
 
     console.log('codigos ', codigos);
 
     this.getComandas(codigos);
   }






ValidarCheck(tipo:string){
  let contador = 0;

  switch (tipo){
    case 'impresoras':
          for (let t of this.params.impresoras){
              if (t.checked){
                contador ++
              }
          }

          if (contador < 1){
            this.alertVacio('impresoras')
            return false;
          } else {
            return true;
          }    

    case 'tiposComanda':

          for (let t of this.params.tiposComanda){
              if (t.checked){
                contador ++
              }
          }
          if (contador < 1){
            this.alertVacio('Tipo comandas')

            return false;
          } else {
            return true;
          }    
  
    case 'estados':
          for (let t of this.params.estados){
              if (t.checked){
                contador ++
              }
          }
          if (contador < 1){
            this.alertVacio('Estados de comanda')

            return false;
          } else {
            return true;
          }    
    
    default:
        return false;
  }

}







  guardarLocalStorage() {
    localStorage.setItem('paramsComandera', JSON.stringify(this.params));
  }


  // FIN ARMAR DATA //
  // FIN ARMAR DATA //
  // FIN ARMAR DATA //
  // FIN ARMAR DATA //
  // FIN ARMAR DATA //
  // FIN ARMAR DATA //
  // FIN ARMAR DATA //


  // ======================================================== //
  // ======================================================== //
  // ======================================================== //
  // ====================== COMANDAS ======================== //
  // ======================================================== //
  // ======================================================== //
  // ======================================================== //


  getComandas(codigos:any){
    this.loadingComandas = true;

    this.conex.traeDatos(`/comandera/${codigos.impresoras}/${codigos.estados}/${codigos.tipos}`)
                .subscribe( (resp:any )=> { 
                        console.log('comandas', resp['datos']);
                        console.log('cambio', this,this.cambio);

                        // if (this.cambio){
                            this.comandas   = [];
                            this.listos     = [];
                            this.pendientes = [];

                            let comandasTotem = resp['datos'].filter(  (r:any) => r.RAZON == 'Totem');
                            console.log('las comandas que vienen del totem son', comandasTotem);

                            for (let c of resp['datos']){
                             console.log('voy con esta comanda', c)

                              const existe = this.comandas.find( (com:any) => com.ncomanda === c.NUMERO);
                              if (existe){
                                console.log('existe', existe);
                                existe.minutos = this.calcularTiempos(c.FECHA, c.HORAREAL);

                                const repetido = existe.detalle.find( (det:any) => det.NUMEL === c.NUMEL);
                                if (repetido){
                                  console.log('ya existe ver si cambió', existe);
                                  console.log('compara con', c); 
                                } else {
                                  c.MENSAJE = !Number.isInteger(c.NUMEL)
                                  c.ESTADO  = Number(c.ESTADO)
                                  if ( c.CANTIDAD == 0){
                                    c.MENSAJE = true;
                                    console.log('mensajeee');
                                  }
                                  existe.detalle.push(c);
                                }

                              } else {
                                console.log('no existe', c)
                                c.ESTADO = Number(c.ESTADO)

                                c.MENSAJE = !Number.isInteger(c.NUMEL);
                                  const producto =  { 
                                    ncomanda: c.NUMERO,
                                    detalle: [c],
                                    new: true,
                                    minutos: this.calcularTiempos(c.FECHA, c.HORAREAL),
                                    estado: Number(c.ESTADO),
                                    HORAREAL: c.HORAREAL
                                  }
                                  
                               this.comandas.push(producto);
                              }
                            }

                            console.log('meter sonido refresh', this.comandas);

                            for (let com of this.comandas){
                              com.estado = this.evaluarEstado(com);
                              if (com.estado > 2){
                                this.listos.push(com);
                              } else {
                                this.pendientes.push(com);
                              }
                            }

                            console.log('pendientes', this.pendientes);
                         

                            // this.conex.sonido('Home.mp3')
                            this.loadingComandas = false;
                            this.cambio = false;
                            return

                          // } else if (this.cambio == false){
                          //   this.comparar(resp['datos']);
                          // }

                      })

  }

  calcularTiempos(fecha:string, hora:any){

    let minutos = 0;
    let endTime = new Date().toLocaleTimeString().toString();
    
    let hora1 = (endTime).split(":")
    let hora2 = (hora).split(":");
    let t1 = new Date();
    let t2 = new Date();
    
    t1.setHours(Number(hora1[0]), Number(hora1[1]), Number(hora1[2]));
    t2.setHours(Number(hora2[0]), Number(hora2[1]), Number(hora2[2]));
    
    //Aquí hago la resta
    t1.setHours(t1.getHours() - t2.getHours(), t1.getMinutes() - t2.getMinutes(), t1.getSeconds() - t2.getSeconds());
    
    //Imprimo el resultado
    // let resultado = "La diferencia es de: " + (t1.getHours() ? t1.getHours() + (t1.getHours() > 1 ? " horas" : " hora") : "") + (t1.getMinutes() ? ", " + t1.getMinutes() + (t1.getMinutes() > 1 ? " minutos" : " minuto") : "") + (t1.getSeconds() ? (t1.getHours() || t1.getMinutes() ? " y " : "") + t1.getSeconds() + (t1.getSeconds() > 1 ? " segundos" : " segundo") : "");
    // console.log('resultado', resultado);
    
    if (minutos < t1.getMinutes()){
    minutos = t1.getMinutes()
    }
    
    if (t1.getHours() >= 1){
    minutos = minutos + (t1.getHours() * 60)
    }
    
    return minutos
    
    }
    

    guardarFiltros(){
      console.log('params', this.params);
      this.filtrar();
    }

  // fullscreen() {
  //   const elem = this.elementRef.nativeElement;
      
  //   if (elem.requestFullscreen) {
  //     elem.requestFullscreen();
  //   } else if (elem.mozRequestFullScreen) {
  //     elem.mozRequestFullScreen();
  //   } else if (elem.webkitRequestFullscreen) {
  //     elem.webkitRequestFullscreen();
  //   } else if (elem.msRequestFullscreen) {
  //     elem.msRequestFullscreen();
  //   }

// }





evaluarEstado(c:any){
  let estado = 4;
  console.log('c', c);
 
  for (let d of c.detalle){
    if (d.ESTADO < estado){
      console.log('es menor', d.ESTADO);
      estado = d.ESTADO;
    }
  }
 
  console.log('devuelvo', estado);
  return estado
}

//1: Pendiente de tomar en cocina
//2: cocinando
//3: por Entregar
//4: Entregado / fade
//5: Borrado



//  =========================================================== //
//  =========================================================== //
//  =========================================================== //
// =============  MANEJO DE COMANDAS Y ESTADOS ================= //
//  =========================================================== //
//  =========================================================== //
//  =========================================================== //



tomarPedido(pedido:any){
  console.log('tomar Pedido', pedido);
  for ( let d of pedido.detalle){
    d.ESTADO = Number(d.ESTADO) + 1;
    d.tarea = 'UPDATE';

    if (d.ESTADO > 3){
      d.tarea = 'DELETE'
    }
    this.conex.guardarDato('/updatecomandera', d)
                .subscribe( resp => { 
                  console.log('actualizdo', resp);
                  this.filtrar();
                })
    }
}

guardarParam(tarea:string){

  if (this.params.config.warning >= this.params.config.danger){
    this.error('error', 'warning debe tener una cantidad de minutos inferior a danger');
    return;
  }

  if(this.params.config.warning < 1 || this.params.config.danger < 1){
    this.error('error', 'La cantidad de tiempo debe ser mayor que 0');
    return;
  }


  console.log('guardo params', this.params);

  if (tarea=== 'cerrar'){
    this.modalTiempos = false;
  }

  localStorage.setItem('paramsComandera', JSON.stringify(this.params));
  this.conex.sonido('exito.mp3')
}


// ====================================== //
// ====================================== //
// ====================================== //
// ============= FILTROS  =============== //
// ====================================== //
// ====================================== //
// ====================================== //
// ====================================== //
  
selectTipo(value:any){
  this.cambio = true;

  if (value.descripcion === 'Todos' && value.checked == true){
      for (let t of this.params.tiposComanda){
        t.checked = false;
      }

      this.ValidarCheck('tiposComanda')
      return;
  }
  
  if (value.descripcion === 'Todos' && value.checked == false){
      for (let t of this.params.tiposComanda){
        t.checked = true;
      }

      this.ValidarCheck('tiposComanda')
      return;
  }

  if (value.descripcion != 'Todos'){
     if (this.params.tiposComanda[0].checked == true) { 
       this.params.tiposComanda[0].checked = false;
     }  

     let este = this.params.tiposComanda.find( (t:any) => t.descripcion === value.descripcion);
     if (este){
       este.checked = !este.checked;
     }
  }
  
  this.ValidarCheck('tiposComanda')


}

selectImpresora(value:any){
  this.cambio = true;

  if (value.DESCRIPCIO === 'TODAS' && value.checked == true){
      for (let t of this.params.impresoras){
        t.checked = false;
      }
      this.ValidarCheck('impresoras');
      return;
  }
  
  if (value.DESCRIPCIO === 'TODAS' && value.checked == false){
      for (let t of this.params.impresoras){
        t.checked = true;
      }
      this.ValidarCheck('impresoras');
      return;
  }

  if (value.DESCRIPCIO != 'TODAS'){
     if (this.params.impresoras[0].checked == true) { 
       this.params.impresoras[0].checked = false;
     }  

     let este = this.params.impresoras.find( (t:any) => t.DESCRIPCIO === value.DESCRIPCIO);
     if (este){
       este.checked = !este.checked;
     }
     this.ValidarCheck('impresoras');
  }
}

selectEstado(value:any){
  this.cambio = true;

  if (value.descripcion === 'Todos' && value.checked == true){
      for (let t of this.params.estados){
        t.checked = false;
      }
      this.ValidarCheck('estados');
      return;
  }
  
  if (value.descripcion === 'Todos' && value.checked == false){
      for (let t of this.params.estados){
        t.checked = true;
      }
      this.ValidarCheck('estados');
      return;
  }

  if (value.descripcion != 'Todos'){
     if (this.params.estados[0].checked == true) { 
       this.params.estados[0].checked = false;
     }  

     let este = this.params.estados.find( (t:any) => t.descripcion === value.descripcion);
     if (este){
       este.checked = !este.checked;
     }
  }

  this.ValidarCheck('estados');
}



checkTodo(){
  for (let t of this.params.impresoras){
    t.checked = true;
  }

  for (let t of this.params.tiposComanda){
    t.checked = true; 
  }

  for (let t of this.params.estados){
    t.checked = true; 
  }

  this.filtrar();
  
  this.tiempo = this.ciclo.subscribe( (n) => {
                this.filtrar();
  });
  
}

openFullscreen() {
  if (this.elem.requestFullscreen) {
    this.elem.requestFullscreen();
  } else if (this.elem.mozRequestFullScreen) {
    /* Firefox */
    this.elem.mozRequestFullScreen();
  } else if (this.elem.webkitRequestFullscreen) {
    /* Chrome, Safari and Opera */
    this.elem.webkitRequestFullscreen();
  } else if (this.elem.msRequestFullscreen) {
    /* IE/Edge */
    this.elem.msRequestFullscreen();
  }
}


  // ==============================
// ==============================
// WARNINGS
// ==============================
// ==============================
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


 alertVacio(texto:string) {
  Swal.fire({
    title: 'Faltan datos',
    text: 'Debes escoger por lo menos una opción en ' + texto,
    icon: 'warning',
    confirmButtonText: 'Ok'
  });
}

// error(texto:string) {
//   // this._gs.sonido('Error.mp3');
//   Swal.fire({
//     title: 'Atención',
//     text:  texto,
//     icon: 'warning',
//     confirmButtonText: 'Ok'
//   });
// }
  

}


