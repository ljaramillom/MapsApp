import { Component, ElementRef, ViewChild, AfterViewInit } from '@angular/core';
import * as mapboxgl from 'mapbox-gl';

interface MarcadorColor {
  color: string;
  market?: mapboxgl.Marker;
  centro?: [number, number];
}

@Component({
  selector: 'app-marcadores',
  templateUrl: './marcadores.component.html',
  styles: [
    `
      .mapa-container {
        height: 100%;
        width: 100%;
      }
      .list-group {
        position: fixed;
        top: 20px;
        right: 20px;
        z-index: 99;
      }
      li {
        cursor: pointer;
      }
    `,
  ],
})
export class MarcadoresComponent implements AfterViewInit {
  @ViewChild('mapa') divMapa!: ElementRef;
  zoomLevel: number = 15;
  mapa!: mapboxgl.Map;
  center: [number, number] = [-75.59171742341803, 6.176537700413044];

  // array marcadores
  marcadores: MarcadorColor[] = [];

  constructor() {}

  ngAfterViewInit(): void {
    this.mapa = new mapboxgl.Map({
      container: this.divMapa.nativeElement,
      style: 'mapbox://styles/mapbox/streets-v11',
      center: [-75.59171742341803, 6.176537700413044],
      zoom: this.zoomLevel,
    });
    this.leerLocalStorage();
    // Ejemplo marcador de forma estática
    // const markerHTML: HTMLElement = document.createElement('div');
    // markerHTML.innerHTML = 'marker_test';
    // new mapboxgl.Marker({element: markerHTML}).setLngLat(this.center).addTo(this.mapa);
  }

  // Agregar marcador de forma dinámica
  agregarMarcador() {
    const color = "#xxxxxx".replace(/x/g, y=>(Math.random()*16|0).toString(16));
    const nuevoMarcador = new mapboxgl.Marker(
      {draggable: true, color}
    )
      .setLngLat(this.center)
      .addTo(this.mapa)
    
    this.marcadores.push({
      color,
      market: nuevoMarcador
    });
    this.guardarMarcadoresLocalStorage();
    nuevoMarcador.on('dragend', () => {
      this.guardarMarcadoresLocalStorage();
    })
  }

  irMarcador(marker: mapboxgl.Marker) {
    this.mapa.flyTo({
      center: marker.getLngLat()
    });
  }

  borrarMarcador(i: number) {
    this.marcadores[i].market?.remove();
    this.marcadores.splice(i, 1);
    this.guardarMarcadoresLocalStorage();
  }

  guardarMarcadoresLocalStorage() {
    const lngLatArray: MarcadorColor[] = [];
    this.marcadores.forEach( m => {
      const color = m.color;
      const { lng, lat } = m.market!.getLngLat();
      lngLatArray.push({
        color: color,
        centro: [lng, lat]
      });
    });
    localStorage.setItem('marcadores', JSON.stringify(lngLatArray));
  }

  leerLocalStorage() {
    if(!localStorage.getItem('marcadores')) {
      return;
    }
    const lgnLatArray: MarcadorColor[] = JSON.parse(localStorage.getItem('marcadores')!);

    lgnLatArray.forEach( m => {
      const newMarker = new mapboxgl.Marker({
        color: m.color,
        draggable: true
      }).setLngLat(m.centro!).addTo(this.mapa);

      this.marcadores.push({
        market: newMarker,
        color: m.color,
      });
      newMarker.on('dragend', () => {
        this.guardarMarcadoresLocalStorage();
      })
    });
  }
}
