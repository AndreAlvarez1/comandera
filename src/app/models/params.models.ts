export class paramsModel {
    node        = {     
                        url: 'http://localhost',
                        puerto: 3060,
                        version: 0,
                        conectado: false
                    }
                
    user        = {
                    nombre:'',
                    codigo: ''
                   }

    tiposComanda = [
                        {codigo: 0, descripcion: 'Todos', checked:  true},
                        {codigo: 1, descripcion: 'Salon', checked: true},
                        {codigo: 2, descripcion: 'VTARAPIDA',checked: true},
                        {codigo: 3, descripcion: 'Despacho',checked: true}, 
                        {codigo: 4, descripcion: 'Retiro',checked: true},
                        {codigo: 5, descripcion: 'Local',checked: true}
                    ];

    impresoras = [{CODIGO: 0, DESCRIPCIO: "TODAS", IMPRECOD: "Todas", PORSECTOR: false, checked: true}]
   
    estados    = [
                    {codigo: 0, descripcion: 'Todos', checked: false},
                    {codigo: 1, descripcion: 'Por Tomar',checked: true},
                    {codigo: 2, descripcion: 'Preparando',checked: false},
                    {codigo: 3, descripcion: 'Terminada',checked:false},
                    {codigo: 4, descripcion: 'Entregada',checked: false},
                    {codigo: 5, descripcion: 'Anulada',checked: false}
                ];
    config = {
                warning: 10,
                danger: 20,
                autoAceptar: false
    }
            
 
    constructor() {

   


    }
}


