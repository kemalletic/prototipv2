'use client';
import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';
import { track } from '@/lib/analytics';

/**
 * "Tkanina izbliza" — relight the fabric under your finger/cursor.
 * A ~2 KB WebGL fragment shader: per-fabric normal map + material map (brightness, weft mix), tinted with
 * the selected colourway. No Three.js. Lazy-initialised when visible; static macro image as fallback
 * (no WebGL, reduced motion still allowed but without idle animation).
 */
const MATERIAL: Record<string, { spec: number; gloss: number }> = {
  denim: { spec: 0.05, gloss: 10 }, chino: { spec: 0.05, gloss: 12 }, jersey: { spec: 0.03, gloss: 8 }, heavyjersey: { spec: 0.03, gloss: 8 },
  melange: { spec: 0.03, gloss: 8 }, fleece: { spec: 0.02, gloss: 6 }, rib: { spec: 0.03, gloss: 8 }, knit: { spec: 0.03, gloss: 7 },
  fineknit: { spec: 0.04, gloss: 9 }, nylon: { spec: 0.22, gloss: 24 }, puffer: { spec: 0.26, gloss: 26 }, wool: { spec: 0.02, gloss: 5 },
  cord: { spec: 0.1, gloss: 12 }, canvas: { spec: 0.04, gloss: 10 }, leather: { spec: 0.4, gloss: 30 }, webbing: { spec: 0.06, gloss: 12 },
};

const VERT = `attribute vec2 p; varying vec2 uv; void main(){ uv = p*0.5+0.5; uv.y = 1.0-uv.y; gl_Position = vec4(p,0.,1.); }`;
const FRAG = `precision mediump float;
varying vec2 uv;
uniform sampler2D nrm; uniform sampler2D mat;
uniform vec3 c1; uniform vec3 c2; uniform vec3 L; uniform float spec; uniform float gloss; uniform float zoom;
vec3 lin(vec3 c){ return pow(c, vec3(2.2)); }
void main(){
  vec2 t = (uv - 0.5) / zoom + 0.5;
  vec3 n = normalize(texture2D(nrm, t).xyz * 2.0 - 1.0);
  vec2 mw = texture2D(mat, t).rg;
  vec3 albedo = mix(lin(c1), lin(c2), mw.g) * mw.r * 1.25;
  vec3 pos = vec3(uv - 0.5, 0.0);
  vec3 l = normalize(L - pos);
  float lam = max(dot(n, l), 0.0);
  vec3 h = normalize(l + vec3(0.0, 0.0, 1.0));
  float s = spec * pow(max(dot(n, h), 0.0), gloss);
  float fall = 1.0 / (1.0 + 1.2 * dot(L.xy - pos.xy, L.xy - pos.xy));
  vec3 col = albedo * (0.22 + 1.05 * lam * fall) + s * fall;
  gl_FragColor = vec4(pow(col, vec3(1.0/2.2)), 1.0);
}`;

function hexToRgb(hex: string): [number, number, number] {
  const n = parseInt(hex.slice(1), 16);
  return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255];
}

export function FabricViewer({ fabric, color, color2, fallback, label }: { fabric: string; color: string; color2: string; fallback: string; label: string }) {
  const wrap = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const [state, setState] = useState<'idle' | 'live' | 'fallback'>('idle');
  const colors = useRef({ c1: hexToRgb(color), c2: hexToRgb(color2) });
  colors.current = { c1: hexToRgb(color), c2: hexToRgb(color2) };
  const light = useRef({ x: 0.15, y: -0.2, tx: 0.15, ty: -0.2, user: false });

  useEffect(() => {
    const el = wrap.current;
    if (!el) return;
    let cleanup = () => {};
    const io = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return;
      io.disconnect();
      cleanup = start();
    }, { rootMargin: '200px' });
    io.observe(el);
    return () => { io.disconnect(); cleanup(); };

    function start() {
      const cv = canvas.current!;
      const gl = cv.getContext('webgl', { antialias: false, premultipliedAlpha: false });
      if (!gl) { setState('fallback'); return () => {}; }
      const sh = (type: number, src: string) => { const s = gl.createShader(type)!; gl.shaderSource(s, src); gl.compileShader(s); return s; };
      const prog = gl.createProgram()!;
      gl.attachShader(prog, sh(gl.VERTEX_SHADER, VERT));
      gl.attachShader(prog, sh(gl.FRAGMENT_SHADER, FRAG));
      gl.linkProgram(prog);
      if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) { setState('fallback'); return () => {}; }
      gl.useProgram(prog);
      const buf = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, buf);
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
      const loc = gl.getAttribLocation(prog, 'p');
      gl.enableVertexAttribArray(loc);
      gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
      const U = (n: string) => gl.getUniformLocation(prog, n);
      const m = MATERIAL[fabric] ?? MATERIAL.jersey;
      gl.uniform1f(U('spec'), m.spec);
      gl.uniform1f(U('gloss'), m.gloss);
      gl.uniform1f(U('zoom'), 1.0);

      let loaded = 0, raf = 0, alive = true;
      const tex = (unit: number, src: string, name: string) => {
        const t = gl.createTexture();
        const img = new window.Image();
        img.decoding = 'async';
        img.onload = () => {
          if (!alive) return;
          gl.activeTexture(gl.TEXTURE0 + unit);
          gl.bindTexture(gl.TEXTURE_2D, t);
          gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);
          gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
          gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
          gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
          gl.uniform1i(U(name), unit);
          if (++loaded === 2) { setState('live'); loop(); }
        };
        img.onerror = () => setState('fallback');
        img.src = src;
      };
      tex(0, `/media/fabric/${fabric}-normal.webp`, 'nrm');
      tex(1, `/media/fabric/${fabric}-albedo.webp`, 'mat');

      const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      let t0 = performance.now();
      const loop = () => {
        if (!alive) return;
        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        const w = Math.round(cv.clientWidth * dpr), h = Math.round(cv.clientHeight * dpr);
        if (cv.width !== w || cv.height !== h) { cv.width = w; cv.height = h; gl.viewport(0, 0, w, h); }
        const L = light.current;
        if (!L.user && !reduced) {
          const t = (performance.now() - t0) / 1000;
          L.tx = Math.cos(t * 0.45) * 0.38; L.ty = Math.sin(t * 0.6) * 0.3;
        }
        L.x += (L.tx - L.x) * 0.12; L.y += (L.ty - L.y) * 0.12;
        gl.uniform3f(U('L'), L.x, L.y, 0.55);
        gl.uniform3fv(U('c1'), colors.current.c1);
        gl.uniform3fv(U('c2'), colors.current.c2);
        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
        raf = requestAnimationFrame(loop);
      };
      // pause when off-screen
      const vis = new IntersectionObserver(([e]) => {
        if (e.isIntersecting && !raf) { t0 = performance.now(); loop(); }
        if (!e.isIntersecting && raf) { cancelAnimationFrame(raf); raf = 0; }
      });
      vis.observe(cv);
      return () => { alive = false; cancelAnimationFrame(raf); vis.disconnect(); };
    }
  }, [fabric]);

  const move = (e: React.PointerEvent) => {
    const r = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const L = light.current;
    if (!L.user) track('fabric_view', { fabric });
    L.user = true;
    L.tx = (e.clientX - r.left) / r.width - 0.5;
    L.ty = (e.clientY - r.top) / r.height - 0.5;
  };

  return (
    <div
      ref={wrap}
      className="relative aspect-square touch-none overflow-hidden bg-plaster-2"
      onPointerMove={move}
      onPointerDown={move}
      onPointerLeave={() => { light.current.user = false; }}
    >
      <Image src={fallback} alt={label} fill sizes="(min-width:1024px) 40vw, 92vw" className={`object-cover transition-opacity duration-700 ${state === 'live' ? 'opacity-0' : 'opacity-100'}`} />
      <canvas ref={canvas} aria-hidden className={`absolute inset-0 h-full w-full transition-opacity duration-700 ${state === 'live' ? 'opacity-100' : 'opacity-0'}`} />
      <p className="font-label pointer-events-none absolute bottom-3 left-3 bg-paper/85 px-2 py-1 text-ink-2">
        {state === 'live' ? 'Pomjerajte prst ili kursor: svjetlo prati' : state === 'fallback' ? 'Tkanina izbliza' : 'Učitavanje…'}
      </p>
    </div>
  );
}
