---
marp: true
theme: gaia
class: invert
size: 16:9
paginate: true
backgroundColor: #000000
style: |
    section {
      font-family: 'Helvetica Neue', Arial, sans-serif;
      background-color: #000000;
    }
    h1 {
      font-size: 55px; /* Reducido para evitar cortes */
      color: #00ff9d; 
      text-shadow: 0 0 15px rgba(0, 255, 157, 0.4);
      text-transform: uppercase;
      margin-bottom: 10px;
    }
    h2 {
      font-size: 34px; /* Reducido para evitar cortes */
      color: #00d2ff; 
      border-bottom: 2px solid #00d2ff;
      padding-bottom: 5px;
      margin-bottom: 15px;
    }
    h3 {
      color: #ffffff;
      font-size: 26px;
    }
    p, li {
      font-size: 21px; /* Reducido para evitar cortes */
      color: #e0e0e0;
      line-height: 1.35;
    }
    strong {
      color: #00ff9d;
      font-weight: bold;
    }
    blockquote {
      background: transparent;
      border-left: 8px solid #00ff9d;
      padding: 10px 20px;
      border-radius: 8px;
      font-style: italic;
      margin-top: 5px;
    }
    blockquote::before, blockquote::after {
      content: none;
    }
    .split {
      display: grid;
      grid-template-columns: 1.2fr 0.8fr; /* Ajustado para dar más espacio al texto */
      gap: 30px;
      align-items: center;
    }
    img {
      border-radius: 12px;
      box-shadow: 0 10px 30px rgba(0,0,0,0.5);
      max-width: 100%;
    }
    .highlight-box {
      background: rgba(0, 210, 255, 0.08);
      border: 1px solid #00d2ff;
      padding: 15px;
      border-radius: 10px;
      margin-top: 10px;
    }
    /* Forzar número de página blanco */
    section::after {
      color: #ffffff !important;
      opacity: 1 !important;
    }
---

<!-- _class: lead -->

# LET'S PLAY API

### The Future of Amateur Sports Management

![bg right:40% brightness:0.7](https://images.unsplash.com/photo-1510172951991-856a654063f9?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80)

**Trabajo de Fin de Máster**
Daniel Mendoza Lara
_2026_

---

# El Problema

## "El Caos del Grupo de WhatsApp"

<div class="split">
  <div>
    <ul style="margin-bottom: 25px;">
      <li>❌ <strong>Listas</strong> copiadas a mano.</li>
      <li>❌ <strong>Cancelaciones</strong> sin aviso.</li>
      <li>❌ <strong>Falta</strong> de compromiso real.</li>
      <li>❌ <strong>Gestión</strong> imposible de aforo.</li>
    </ul>
    <blockquote style="font-size: 19px; padding: 8px 15px; border-left-color: #ff4d4d;">
      Organizar un partido hoy es un trabajo ingrato.
    </blockquote>
  </div>
  <div style="text-align: right;">
    <img src="https://images.unsplash.com/photo-1632667226262-3f341ec5afff?auto=format&fit=crop&w=800&q=80" alt="Messy Desk" style="width: 90%; border: 2px solid #ff4d4d; box-shadow: 0 0 20px rgba(255, 77, 77, 0.4);">
  </div>
</div>

---

# La Solución

## Automatización + Gamificación = Compromiso

<div class="split">
  <div>
    <ul style="margin-bottom: 25px;">
      <li>✅ <strong>Gestión</strong> de listas automática.</li>
      <li>✅ <strong>Méritos</strong> que premian el juego.</li>
      <li>✅ <strong>Seguridad</strong> y roles definidos.</li>
      <li>✅ <strong>Escalabilidad</strong> cloud-native.</li>
    </ul>
    <blockquote style="font-size: 19px; padding: 8px 15px;">
      La inteligencia al servicio del deporte amateur.
    </blockquote>
  </div>
  <div style="text-align: right;">
    <img src="https://images.unsplash.com/photo-1661701958241-b0f896ea87f6?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80" alt="Futuristic Ball" style="width: 90%; border: 2px solid #00ff9d; box-shadow: 0 0 20px rgba(0, 255, 157, 0.4);">
  </div>
</div>

---

# Core Feature: Sistema de Méritos

## Gamificando la Responsabilidad

<div class="split">
  <div>
    <ul style="margin-bottom: 25px;">
      <li>🟢 <strong>+3 Puntos</strong>: Jugar partido.</li>
      <li>🟡 <strong>+1 Punto</strong>: Estar en reserva.</li>
      <li>🔴 <strong>-5 Puntos</strong>: No-Show (Inasistencia).</li>
      <li>💀 <strong>Late Cancel</strong>: Penalización <12h.</li>
    </ul>
    <blockquote style="font-size: 19px; padding: 8px 15px; border-left-color: #00d2ff;">
      Un sistema justo que premia el compromiso.
    </blockquote>
  </div>
  <div style="text-align: right;">
    <img src="https://images.unsplash.com/photo-1461896836934-ffe607ba8211?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=80" alt="Winning" style="width: 90%; border: 2px solid #00d2ff; box-shadow: 0 0 20px rgba(0, 210, 255, 0.3);">
  </div>
</div>

---

# Ciclo de Vida Inteligente

## Del Caos al Orden

<div class="split">
  <div>
    <ul style="margin-bottom: 25px;">
      <li>📋 <strong>Planning</strong>: Inscripción y aforo controlado.</li>
      <li>⚡ <strong>Real-time</strong>: Detección de fugas tardías.</li>
      <li>📊 <strong>Evaluación</strong>: Puntaje de actitud post-match.</li>
      <li>🔒 <strong>Locking</strong>: Bloqueo de actas e integridad.</li>
    </ul>
    <blockquote style="font-size: 19px; padding: 8px 15px; border-left-color: #ffd700;">
      La integridad de los datos es la clave del sistema.
    </blockquote>
  </div>
  <div style="text-align: right;">
    <img src="https://images.unsplash.com/photo-1552664730-d307ca884978?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80" alt="Agile Planning" style="width: 90%; border: 2px solid #ffd700; box-shadow: 0 0 20px rgba(255, 215, 0, 0.3);">
  </div>
</div>

---

# Ingeniería de Alto Nivel

## Construido para Escalar

Software Engineering profesional en cada capa.

<div class="split">
  <div>
    <ul>
      <li>🚀 <strong>TypeScript & Node.js 24+</strong></li>
      <li>🏗 <strong>Clean Architecture</strong> (DDD)</li>
      <li>🐳 <strong>Docker Native</strong></li>
      <li>🛡 <strong>Seguridad</strong>: JWT, Bcrypt y RBAC.</li>
      <li>💾 <strong>Dual Persistence</strong>: SQL + In-Memory.</li>
    </ul>
  </div>
  <div>
    <img src="https://images.unsplash.com/photo-1555066931-4365d14bab8c?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=80" alt="Coding">
  </div>
</div>

---

# Roadmap & Futuro

## ¿Hacia dónde vamos?

<div style="display: flex; flex-direction: column; gap: 15px;">
  <div class="highlight-box" style="border-color: #00ff9d; margin: 0;">
    <h3 style="margin: 0; font-size: 22px;">Q2 2026: Portal Web PWA</h3>
    <p style="margin: 5px 0 0 0; font-size: 18px;">Dashboard universal para gestión de estadísticas y partidos.</p>
  </div>
  <div class="highlight-box" style="border-color: #d200ff; margin: 0;">
    <h3 style="margin: 0; font-size: 22px;">Q3 2026: Mobile App</h3>
    <p style="margin: 5px 0 0 0; font-size: 18px;">App nativa Android/iOS usando <strong>Compose Multiplatform</strong>.</p>
  </div>
  <div class="highlight-box" style="border-color: #ffd700; margin: 0;">
    <h3 style="margin: 0; font-size: 22px;">Q4 2026: Monetización</h3>
    <p style="margin: 5px 0 0 0; font-size: 18px;">Modelo Freemium y suscripciones para clubes profesionales.</p>
  </div>
</div>

---

<!-- _class: lead -->
<!-- _backgroundColor: #000 -->

# ¿Jugamos?

## Let's Play API

### Ready for Investment

<br>

**Daniel Mendoza Lara**
_TFM 2026_
