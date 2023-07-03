import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import * as pdfMake from 'pdfmake/build/pdfmake';

//Librerias para generar CSV o Excel
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';


//PDFMAKE fonts
import pdfFonts from "./../../assets/vfs_fonts.js"


@Component({
  selector: 'app-reporte-peliculas',
  templateUrl: './reporte-peliculas.component.html',
  styleUrls: ['./reporte-peliculas.component.css']
})


export class ReportePeliculasComponent implements OnInit {
  peliculas: any[] = [];

  constructor(private http: HttpClient) {
    (<any>pdfMake).vfs = pdfFonts.pdfMake.vfs;
  }

  ngOnInit() {
    this.http.get<any[]>('./assets/peliculas.json').subscribe(data => {
      this.peliculas = data;
    });
  }

  // Variables para los filtros
  filtroGenero: string = '';
  filtroAnio: number = 0;

  // Variable para almacenar las películas filtradas
  peliculasFiltradas: any[] = [];

  aplicarFiltros() {

    // Obtener los valores de los filtros seleccionados
    const genero = this.filtroGenero.toLowerCase();
    const anio = this.filtroAnio;

    // Filtrar las películas según los criterios seleccionados
    this.peliculasFiltradas = this.peliculas.filter(pelicula => {
      let cumpleGenero = true;
      let cumpleAnio = true;
  
      // Aplicar filtro de género
      if (genero !== '') {
        cumpleGenero = pelicula.genero.toLowerCase() === this.filtroGenero.toLowerCase();
      }
  
      // Aplicar filtro de año de lanzamiento
      if (anio !== 0) {
        cumpleAnio = pelicula.lanzamiento === this.filtroAnio;
      }
  
      // Devolver true si cumple ambos filtros
      return cumpleGenero && cumpleAnio;
    });
  }

  borrarFiltros(){
    this.filtroGenero = ''
    this.filtroAnio = 0
  }
  
  generarPDF() {

  // Aplicar los filtros a las películas
  this.aplicarFiltros();

    const contenido = [
      {
        columns: [
            { width: '*', text: '' },
            {
                width: 'auto',
                    text: 'Informe de Películas', style: 'header'
            },
            { width: '*', text: '' },
        ]
      }, 
      {
        table: {
          headerRows: 1,
          widths: ['*', '*', '*'],
          body: [
            [{ text: 'Título', style: 'celdaEncabezado' }, { text: 'Género', style: 'celdaEncabezado' }, { text: 'Año lanzamiento', style: 'celdaEncabezado' }],
            ...this.peliculasFiltradas.map(pelicula => [
              { text: pelicula.titulo, style: 'celdaContenido' },
              { text: pelicula.genero, style: 'celdaContenido' },
              { text: pelicula.lanzamiento.toString(), style: 'celdaContenido' }
            ])
          ]
        }
      }
    ];

    const estilos = {
      header: {
        fontSize: 50,
        color: 'black',
        marginBottom: 10,
        font: 'YsabeauInfant'
      },
      celdaEncabezado: {
        fontSize: 20,
        fillColor: 'grey',
        color: 'white',
        font: 'YsabeauInfant',
        bold: true
      },
      celdaContenido: {
        fontSize: 20,
        font:'YsabeauInfant',
        italics:true
      }
    };

    (<any>pdfMake).fonts = {
      Roboto: {
        normal: 'Roboto-Medium.ttf',
        bold:'Roboto-Regular.ttf',
        italics: 'Roboto-Italic.ttf',
      },
      YsabeauInfant: {
        normal: 'YsabeauInfant-Black.ttf',
        bold: 'YsabeauInfant-Bold.ttf',
        italics: 'YsabeauInfant-Italic.ttf'
      }
    };

    const documentDefinition = {
      content: contenido,
      styles: estilos
    };

    pdfMake.createPdf(documentDefinition).open();
  }

  

  exportToExcel(data: any[], filename: string, sheetname: string) {
    const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(data);
    const workbook: XLSX.WorkBook = { Sheets: { [sheetname]: worksheet }, SheetNames: [sheetname] };
    const excelBuffer: any = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const fileData: Blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8' });
    saveAs(fileData, filename + '.xlsx');
  }

  exportarCSV() {
    const data = this.peliculasFiltradas; // Obtén los datos que deseas exportar
    this.exportToExcel(data, 'peliculas', 'Peliculas');
  }
  

  
    
  
}
