# Visor 3D — Silla de diseño

Visor interactivo con vistas predefinidas para el TP de diseño.  
Stack: **Next.js 16 · React Three Fiber v9 · @react-three/drei · Tailwind v4 · TypeScript**

## Estructura de archivos

```
app/
  silla/page.tsx          ← ruta principal; carga el visor con ssr:false
components/
  ChairViewer.tsx         ← Canvas + escena + estado global (bg, autorotate, vista)
  Chair.tsx               ← carga el .glb con useGLTF (suspende hasta que carga)
  ViewControls.tsx        ← botones de vista + toggles; exporta VIEW_PRESETS / ViewKey
public/
  silla.glb               ← ← ← COLOCAR AQUÍ EL MODELO
```

## Cómo correrlo

1. **Colocá el modelo** en `public/silla.glb`.
2. Instalá dependencias (ya deberían estar):
   ```bash
   npm install
   ```
3. Iniciá el servidor de desarrollo:
   ```bash
   npm run dev
   ```
4. Abrí [http://localhost:3000/silla](http://localhost:3000/silla).

## Cómo ajustar las vistas

Las posiciones de cámara y el target están en `components/ViewControls.tsx`,
en el objeto `VIEW_PRESETS`:

```ts
export const VIEW_PRESETS = {
  FRONTAL:   { position: [0,    0.45,  1.6],  target: [0, 0.42, 0] },
  LATERAL:   { position: [1.6,  0.45,  0],    target: [0, 0.42, 0] },
  POSTERIOR: { position: [0,    0.5,  -1.6],  target: [0, 0.42, 0] },
  SUPERIOR:  { position: [0,    1.8,   0.01], target: [0, 0.42, 0] },
  '3/4':     { position: [1.0,  0.8,   1.2],  target: [0, 0.42, 0] },
}
```

- `position` — dónde se ubica la cámara (metros, eje Y hacia arriba).
- `target` — punto al que mira la cámara (centro del asiento ≈ y 0.42 m).
- Cambiar los valores y guardar aplica los cambios al instante con HMR.

## Controles interactivos

| Acción | Resultado |
|--------|-----------|
| Botones de vista | Transición animada a FRONTAL / LATERAL / POSTERIOR / SUPERIOR / 3/4 |
| ▶ Auto / ⏸ Pausar | Activa/desactiva la rotación automática |
| ☾ Oscuro / ☀ Claro | Alterna el fondo de estudio claro a oscuro |
| Click + drag | Orbita libremente |
| Scroll | Zoom |
| Click derecho + drag | Paneo |
