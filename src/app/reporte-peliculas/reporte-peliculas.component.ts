import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import * as pdfMake from 'pdfmake/build/pdfmake';

import pdfFonts from './../../assets/vfs_fonts.js';

//PDFMAKE fonts


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

  generarPDF() {
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
            [{ text: 'Título', style: 'celdaEncabezado' }, { text: 'Género', style: 'celdaEncabezado' }, { text: 'Año de lanzamiento', style: 'celdaEncabezado' }],
            ...this.peliculas.map(pelicula => [
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
        fontSize: 30,
        bold: true,
        color: 'black',
        marginBottom: 10
      },
      celdaEncabezado: {
        fontSize: 18,
        bold: true,
        fillColor: 'grey',
        color: 'white',
      },
      celdaContenido: {
        fontSize: 12,
      }
    };

    (<any>pdfMake).fonts = {
      YsabeauInfant: {
        normal: 'YsabeauInfant-Black.ttf',
        bold:'YsabeauInfant-Italic.ttf',
        italics: 'YsabeauInfant-Bold.ttf',
        bolditalics: 'YsabeauInfant-Bold.ttf'
      },
      Roboto: {
        normal: 'Roboto-Black.ttf',
        bold:'Roboto-Bold.ttf',
        italics: 'Roboto-Italic.ttf',
        bolditalics: 'Roboto-Bold.ttf'
      }
    };

    const documentDefinition = {
      content: contenido,
      styles: estilos,
      defaultStyle: {
        font: 'Roboto' // Nombre de la fuente personalizada
      }
    };

    pdfMake.createPdf(documentDefinition).open();
  }
}
