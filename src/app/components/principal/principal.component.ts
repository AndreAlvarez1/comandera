import { Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { interval } from 'rxjs';
import { paramsModel } from 'src/app/models/params.models';
import { ConectorService } from 'src/app/services/conector.service';
import { forkJoin } from 'rxjs';
import Swal from 'sweetalert2';




@Component({
  selector: 'app-principal',
  templateUrl: './principal.component.html',
  styleUrls: ['./principal.component.css']
})
export class PrincipalComponent implements OnInit {
  
  loading                     = true;
  loadingComandas             = true;

  params: paramsModel         = new paramsModel();
  modalComanda                = false;
  modalTiempos                = false;
 
  comandasAll:any[]           = []; 
  comandas:any[]              = [];
  orders:any[]                = [];
  comanda:any                 = { 
                                  id: 0,
                                  detalle: [],
                                  new: true,
                                  minutos: 0
                                }

  cambio                      = true;
  ciclo                       = interval(10000);
  // ciclo                       = interval(100000);
  tiempo:any;



  constructor(private conex:ConectorService,
              private router: Router) {
    


    if (localStorage.getItem('paramsComandera')){
      this.params = JSON.parse(localStorage.getItem('paramsComandera') || '{}');
      this.conex.test();

      if (this.params.user.codigo == ''){
        this.router.navigateByUrl('/config');
      }

    } else {
      this.router.navigateByUrl('/config');
    }
   }





  ngOnInit(): void {
    this.getImpresoras();


    

  }





  autoAceptar(){
    this.params.config.autoAceptar = !this.params.config.autoAceptar;
    this.guardarParam('cerrar');
  }
 
  autoEntregar(){
    this.params.config.autoEntregar = !this.params.config.autoEntregar;
    this.guardarParam('cerrar');
  }

  getImpresoras(){

    console.log('this params', this.params);

    this.conex.traeDatos('/impresoras').subscribe( (resp:any) => { 
              for (let imp of resp['datos']){
                
                // console.log('imp', imp);

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

// ====================================== //
// ====================================== //
// ====================================== //
// ============= FILTROS  =============== //
// ====================================== //
// ====================================== //
// ====================================== //
// ====================================== //
  
  selectTipo(value:any){
    console.log('tipo comanda', value);
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
    console.log('estado', value);
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

            console.log('contador', contador);
            if (contador < 1){
              this.alertVacio('impresoras')
              return false;
            } else {
              return true;
            }    

      case 'tiposComanda':
            console.log('contador tipo', contador);

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


// calcularTiempos(fecha:string, hora:any){ 
//  let minutos = 0;
//  let endTime = new Date().toLocaleTimeString().toString();
//   console.log('endTime', endTime);

//  let hora1 = (endTime).split(":")
//  let hora2 = (hora).split(":");
//  let t1    = new Date();
//  let t2    = new Date();
 
//  console.log('hora1', hora1)
//  console.log('hora2', hora2)


//  t1.setHours(Number(hora1[0]), Number(hora1[1]), Number(hora1[2]));
//  t2.setHours(Number(hora2[0]), Number(hora2[1]), Number(hora2[2]));
//  t1.setHours(t1.getHours() - t2.getHours(), t1.getMinutes() - t2.getMinutes(), t1.getSeconds() - t2.getSeconds());
 
// if (minutos < t1.getMinutes()){
//   minutos = t1.getMinutes()
// }

// if (t1.getHours() >= 1){
//   minutos = minutos + (t1.getHours() * 60)
// }

// console.log('minutos', minutos);

// return minutos

// }


 calcularTiempos(fecha:any, hora:any) {
  // Parse the current time to 24-hour format
  let endTime = new Date();
  let horaActual = endTime.toLocaleTimeString('en-US', { hour12: false }).split(':');

  let horaIngresada = hora.split(':');

  let t1:any = new Date(endTime);
  let t2:any = new Date(endTime);

  // Set the current time to t1
  t1.setHours(Number(horaActual[0]), Number(horaActual[1]), Number(horaActual[2]));

  // Set the input time to t2
  t2.setHours(Number(horaIngresada[0]), Number(horaIngresada[1]), Number(horaIngresada[2]));

  // Calculate the difference in minutes
  let diff = (t1 - t2) / 1000 / 60;
  if (diff < 0) {
    diff += 24 * 60; // handle cases where the time difference spans midnight
  }

  console.log('Minutos:', diff);

  return Math.round(diff);
}




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

                  console.log('cambio', this.cambio);
                        console.log('comander', resp['datos']);


                        if (this.cambio){
                            this.comandas = [];
                            console.log('this.cambio', this.cambio, this.comandas.length);
                            
                            for (let c of resp['datos']){
                              console.log('this.comandas', this.comandas);

                              const existe = this.comandas.find( (com:any) => com.id === c.IDIMP);
                              
                              if (existe){
                                console.log('existe', existe);

                                existe.minutos = this.calcularTiempos(c.FECHA, c.HORAREAL);

                                // console.log('existe ver si son productos diferentes', existe);    
                                const repetido = existe.detalle.find( (det:any) => det.NUMEL === c.NUMEL);
                                console.log('repetido', repetido);
                                if (repetido){
                                  // console.log('ya existe ver si cambió', existe);
                                  // console.log('compara con', c); 
                                } else {
                                 
                                  c.MENSAJE = !Number.isInteger(c.NUMEL)
                                  if ( c.CANTIDAD == 0){
                                    c.MENSAJE = true;
                                    // console.log('mensajeee');
                                  }
                                  existe.detalle.push(c);
                                }

                              } else {
                                console.log('no existe', existe);

                                const mismaComanda = this.comandas.find( c2 => c2.comanda == c.NUMERO);
                                if (mismaComanda){
                                  console.log('misma comanda', mismaComanda);
                                  
                                  const repetido = mismaComanda.detalle.find( (det:any) => det.NUMEL === c.NUMEL);
                                  if (repetido){
                                    continue;
                                  }

                                  if (this.compararTiempos(mismaComanda.ingreso, c.HORAREAL )){
                                    // console.log('menos de 10 segundos')

                                    c.MENSAJE = !Number.isInteger(c.NUMEL)
                                    if ( c.CANTIDAD == 0){
                                      c.MENSAJE = true;
                                      // console.log('mensajeee');
                                    }
                                    mismaComanda.detalle.push(c);

                                  } else{
                                    // console.log('mas de 10 segundos')
                                    c.MENSAJE = !Number.isInteger(c.NUMEL);
                                    const producto =  { 
                                      id: c.IDIMP,
                                      detalle: [c],
                                      new: true,
                                      minutos: this.calcularTiempos(c.FECHA, c.HORAREAL),
                                      comanda: c.NUMERO,
                                      ingreso: c.HORAREAL
                                    }
                                    this.comandas.push(producto);
                                  }
                                } else {
                                  console.log('NO LA ENCONTRÉ');
                                  c.MENSAJE = !Number.isInteger(c.NUMEL);
                                  const producto =  { 
                                    id: c.IDIMP,
                                    detalle: [c],
                                    new: true,
                                    minutos: this.calcularTiempos(c.FECHA, c.HORAREAL),
                                    comanda: c.NUMERO,
                                    ingreso: c.HORAREAL
                                  }
                                  this.comandas.push(producto);
                                 }

                              }
                            }

                            if(this.params.config.autoAceptar){
                              this.recorrerYaceptar();
                            } else {
                              console.log('meter sonido refresh', this.comandas);
                              this.conex.sonido('Home.mp3')
                              this.loadingComandas = false;
                              this.cambio          = false;
                              return
                            }


                          } else if (this.cambio == false){
                            this.comparar(resp['datos']);
                          }


                      })

  }


comparar(all:any){
  console.log('comparar');
 const temp:any [] = [];

 for (let c of all){
    let nuevo = true;

    const existe = this.comandas.find( (com:any) => com.id === c.IDIMP);
    if (existe){
      // console.log('compara a ver si existe', existe);
      existe.minutos = this.calcularTiempos(c.FECHA, c.HORAREAL);
      nuevo = false;

    }  else {
      console.log('no existe....')
    }

      const existeTemp = temp.find( (com:any) => com.id === c.IDIMP);
      
      if (existeTemp){
          const repetidoTemp = existeTemp.detalle.find( (det:any) => det.NUMEL === c.NUMEL);
          if (repetidoTemp){
            console.log('ya existe ver si cambió',)

            repetidoTemp.MENSAJE = !Number.isInteger(c.NUMEL);
                                  
            if ( repetidoTemp.CANTIDAD === 0){
              repetidoTemp.MENSAJE = true;
              // console.log('mensajeee');
            }

            repetidoTemp.minutos = this.calcularTiempos(c.FECHA, c.HORAREAL);
          } else {
            c.MENSAJE = !Number.isInteger(c.NUMEL);
                                  
            if ( c.CANTIDAD == 0){
              c.MENSAJE = true;
              // console.log('mensajeee');
            }
    
            
            existeTemp.detalle.push(c);
          }
      } else {
        
        //BUSCO SI TENGO QUE CONSOLIDAR
        const mismaComanda = temp.find( c2 => c2.comanda == c.NUMERO);
        if (mismaComanda){
          if (this.compararTiempos(mismaComanda.ingreso, c.HORAREAL )){
            // console.log('menos de 10 segundos')
            c.MENSAJE = !Number.isInteger(c.NUMEL)
            if ( c.CANTIDAD == 0){
              c.MENSAJE = true;
              // console.log('mensajeee');
            }
            mismaComanda.detalle.push(c);
          } else{
            const prod = this.agregarNuevo(c, nuevo);
            temp.push(prod);  
            if (prod.new){
              this.conex.sonido('bing.mp3')        
            }
          }

        } else {
          const prod = this.agregarNuevo(c, nuevo);
          temp.push(prod);  
          if (prod.new){
            this.conex.sonido('bing.mp3')        
          }
        }

       
      }
    
   
  }

  this.comandas = temp;
  this.comandas.sort((a, b) => (a.id < b.id ? -1 : 1));
 

  if(this.params.config.autoAceptar){
    this.recorrerYaceptar();
  } else {
    console.log('meter sonido refresh', this.comandas);
    this.loadingComandas = false;
    this.cambio          = false;
    return
  }



}




recorrerYaceptar(){
  for (let c of this.comandas){
    if (c.detalle[0].ESTADO == 1){
      this.tomarPedido(c);
    }
  }

  this.loadingComandas = false;
  this.cambio          = false;
}





agregarNuevo(c:any, nuevo:any){
  // console.log('no existe en temp')
  c.MENSAJE = !Number.isInteger(c.NUMEL);
                            
  if ( c.CANTIDAD == 0){
    c.MENSAJE = true;
    // console.log('mensajeee');
  }

  const producto =  { 
                      id: c.IDIMP,
                      detalle: [c],
                      new: nuevo,
                      minutos: this.calcularTiempos(c.FECHA, c.HORAREAL),
                      comanda: c.NUMERO,
                      ingreso: c.HORAREAL
                    }

                    
  // console.log('pusheo', producto);
  return producto;
  
}

  verDetalle(c:any){
    console.log('ver detalle', c)
    this.modalComanda = true;
    this.comanda      = c;
    this.orders       = [];

    // PRIMERO ARMO LOS ITEMS PRINCIPALES
    for (let det of this.comanda.detalle){
      det.isModif = this.evaluarModif(det);
      if (!det.isModif){
        det.modifs = [];
        this.orders.push(det);
      }
    }
 
    // LUEGO LOS MODIFICADORES
    for (let det of this.comanda.detalle){
      const esteNumel = Math.floor(det.NUMEL);
      if (det.isModif){
        const padre = this.orders.find( o => o.NUMEL == esteNumel);
        padre.modifs.push(det);
      }
    }

    console.log('orders', this.orders);

  }


  evaluarModif(det:any){
    if (Number.isInteger(det.NUMEL)){
      return false;
    } else {
      return true;
    }
  }

  compararTiempos(tiempo1: string, tiempo2: string): boolean {
    const t1 = new Date(`2000-01-01T${tiempo1}`);
    const t2 = new Date(`2000-01-01T${tiempo2}`);
    const diferenciaEnMilisegundos = Math.abs(t2.getTime() - t1.getTime());
    const diferenciaEnSegundos = diferenciaEnMilisegundos / 1000;
    return diferenciaEnSegundos <= 10;
  }


//  =========================================================== //
//  =========================================================== //
//  =========================================================== //
// =============  MANEJO DE COMANDAS Y ESTADOS ================= //
//  =========================================================== //
//  =========================================================== //
//  =========================================================== //


  tomarPedido(pedido: any) {
    console.log('tomar Pedido', pedido);
    let contador = 0;
  
    const observables = pedido.detalle.map( (d:any) => {
      d.ESTADO = Number(d.ESTADO) + 1;
      d.tarea = 'UPDATE';
  
      if (d.ESTADO == 2) {
        d.PREPARANDO = this.conex.formatearFechaYHora(new Date());
      }
  
      if (d.ESTADO == 3) {
        d.TERMINADA = this.conex.formatearFechaYHora(new Date());
        if (this.params.config.autoEntregar){
          d.ENTREGADA = this.conex.formatearFechaYHora(new Date());
          d.ESTADO = 4;
        }
      }
  
      if (d.ESTADO == 4) {
        d.ENTREGADA = this.conex.formatearFechaYHora(new Date());
      }
  
      if (d.ESTADO > 4) {
        d.tarea = 'DELETE';
      }
  
      console.log('voy a guardar', d);
  
      return this.conex.guardarDato('/updatecomandera', d);
    });
  
    // Utilizar forkJoin para combinar múltiples observables y esperar a que todos se completen
    forkJoin(observables)
      .subscribe({
        next: (resp: any) => {
          console.log('guardé ok', resp);
          console.log('-------------------------------')
          // Llamar a filtrar después de que todas las actualizaciones se completen

         
          this.filtrar();
        },
        error: (err: any) => {
          console.log('error', err);
        }
      });
  }



// estado 1 = 'por tomar' // PORTOMAR
// estado 2 = 'preparando' //PREPARANDO
// estado 3 = 'Listo para entregar' // TERMINADA
// estado 4 = 'Entregado' // ENTREGADA
// estado 5 = 'Anulada' // Anulada


tomarItem(comanda:any, d:any){
  console.log('tomar Item', d);
  console.log('comanda', comanda);
  
  const newArray:any[] = [];
  newArray.push(d);

  if (d.modifs.length > 0 ){
    for (let m of d.modifs){
      newArray.push(m)
    }
  }


  const pedido = {
                  detalle: newArray
                } 

  
  this.tomarPedido(pedido);


}






  guardarParam(tarea:string){

    if (this.params.config.warning >= this.params.config.danger){
      this.error('warning debe tener una cantidad de minutos inferior a danger');
      return;
    }

    if(this.params.config.warning < 1 || this.params.config.danger < 1){
      this.error('La cantidad de tiempo debe ser mayor que 0');
      return;
    }


    console.log('guardo params', this.params);

    if (tarea=== 'cerrar'){
      this.modalTiempos = false;
    }

    localStorage.setItem('paramsComandera', JSON.stringify(this.params));
    this.conex.sonido('exito.mp3')
  }


  preguntaBorrar(){
    console.log('pregunta borrar');

    Swal.fire({
      title: '¿Estas seguro?',
      text: "¿Quieres borrar todas las comandas?",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Si Borrar!'
    }).then((result) => {
      if (result.isConfirmed) {
        console.log('confimadoooooooooooooooo', this.comandas)
        for (let comanda of this.comandas){
           for (let c of comanda.detalle){
            c.tarea = 'DELETE'
            console.log('aca c')
            this.conex.guardarDato('/updatecomandera', c)
                  .subscribe( resp => { 
                    console.log('----------------------------');
                    console.log('----------------------------');
                    console.log('actualizdo', resp);
                    console.log('----------------------------');
                    console.log('----------------------------');
                    console.log('----------------------------');
                  })
          }
           }
         

        this.filtrar();

        Swal.fire(
          'Eliminadas!',
          'Comandas borradas',
          'success'
        )
      }
    })


  }



    // Función para cambiar el modo de pantalla completa
    toggleFullScreen() {
      if (document.fullscreenElement) {
        // Si ya está en pantalla completa, sal de ella
        if (document.exitFullscreen) {
          document.exitFullscreen();
        }
      } else {
        // Si no está en pantalla completa, entra en pantalla completa
        const element = document.documentElement;
        if (element.requestFullscreen) {
          element.requestFullscreen();
        }
      }
    }
  

    
    

// ==============================
// ==============================
// WARNINGS
// ==============================
// ==============================

 alertVacio(texto:string) {
  // this._gs.sonido('Error.mp3');
  Swal.fire({
    title: 'Faltan datos',
    text: 'Debes escoger por lo menos una opción en ' + texto,
    icon: 'warning',
    confirmButtonText: 'Ok'
  });
}

error(texto:string) {
  // this._gs.sonido('Error.mp3');
  Swal.fire({
    title: 'Atención',
    text:  texto,
    icon: 'warning',
    confirmButtonText: 'Ok'
  });
}
  



}
