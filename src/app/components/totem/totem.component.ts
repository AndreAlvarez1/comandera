import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { interval } from 'rxjs';
import { paramsModel } from 'src/app/models/params.models';
import { ConectorService } from 'src/app/services/conector.service';
import Swal from 'sweetalert2';


@Component({
  selector: 'app-totem',
  templateUrl: './totem.component.html',
  styleUrls: ['./totem.component.css']
})
export class TotemComponent implements OnInit {

  loading                     = true;
  loadingComandas             = true;

  params: paramsModel         = new paramsModel();
  modalComanda                = false;
  modalTiempos                = false;
 
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
  ciclo                       = interval(8000);
  tiempo:any;
  tipoVista                   = 'cliente';
  primeraCarga                = true;

  
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

  getImpresoras(){


    this.conex.traeDatos('/impresoras').subscribe( (resp:any) => { 
              for (let imp of resp['datos']){
                // reviso si la impresora ya existe en los params.
                let existe = this.params.impresoras.find( (p:any) =>  p.CODIGO ==  imp.CODIGO );
                
                // si no existe reviso si el TODAS está activado para agregarla "seleccionada";
                if (!existe){
                    imp.checked = false;
                    if (this.params.impresoras[0].checked){
                      imp.checked = true;
                    }
                 this.params.impresoras.push(imp);
               
                } else {
                  // console.log('ya existe impreso', existe);
                }


              }

              // console.log('gruposImpresion', this.params.impresoras);
              localStorage.setItem('paramsComandera', JSON.stringify(this.params));
              this.loading = false;


              this.checkTodo();

              // this.tiempo = this.ciclo.subscribe( (n) => {
              //   this.filtrar();
              // });
          
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




 filtrar(){
 const impresoras =  this.ValidarCheck('impresoras');
 const tipoComanda =  this.ValidarCheck('tiposComanda');
 const estados =  this.ValidarCheck('estados');

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


comparar(all:any){
  console.log('comparar');
 const temp:any [] = [];

 for (let c of all){
   console.log('c acá',c);
   c.ESTADO = Number(c.ESTADO);
   
      let existe;

      if (c.ESTADO > 2){
        existe = this.listos.find( (com:any) => com.ncomanda === c.NUMERO);
      } else {
        existe = this.pendientes.find( (com:any) => com.ncomanda === c.NUMERO);
      }
   
      console.log('existe', existe);
    let nuevo = true;


    
    // const existe = this.comandas.find( (com:any) => com.id === c.IDIMP);
    if (existe){
      console.log('compara a ver si existe', existe);
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
              console.log('mensajeee');
            }


            repetidoTemp.minutos = this.calcularTiempos(c.FECHA, c.HORAREAL);
          } else {
            c.MENSAJE = !Number.isInteger(c.NUMEL);
            c.ESTADO  = Number(c.ESTADO)
                                  
            if ( c.CANTIDAD == 0){
              c.MENSAJE = true;
              console.log('mensajeee');
            }
    
            
            existeTemp.detalle.push(c);
          }
      } else {
        console.log('no existe en temp')
        c.MENSAJE = !Number.isInteger(c.NUMEL);
                                  
        if ( c.CANTIDAD == 0){
          c.MENSAJE = true;
          console.log('mensajeee');
        }
    


        const producto =  { 
                            id: c.IDIMP,
                            detalle: [c],
                            new: nuevo,
                            minutos: this.calcularTiempos(c.FECHA, c.HORAREAL)
                          }
        console.log('pusheo', producto);
        temp.push(producto);  
        
        if (producto.new){
          this.conex.sonido('bing.mp3')        
        }
      }
    
   
  }

  for (let c of temp){
    console.log('tempo',c)
  }
  this.comandas = temp;
  this.comandas.sort((a, b) => (a.id < b.id ? -1 : 1));
 
  console.log('this.comandas actualizado', this.comandas);

  this.cambio = false;
  this.loadingComandas = false;
 
}

  verDetalle(c:any){
    console.log('ver detalle', c)
    this.modalComanda = true;
    this.comanda = c;

  }



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
