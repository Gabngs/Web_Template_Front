import { Component } from '@angular/core';

// Animación reutilizable: anillos concéntricos girando en 3D con el borde
// recorriendo un ciclo rgba. La usa el overlay global de carga y la página
// 404. El tamaño se controla con la custom prop --anillos-tamano desde el
// componente que la monta.
@Component({
  selector: 'app-anillos-loader',
  imports: [],
  templateUrl: './anillos-loader.html',
  styleUrl: './anillos-loader.scss',
})
export class AnillosLoader {
  readonly anillos = Array.from({ length: 8 });
}
