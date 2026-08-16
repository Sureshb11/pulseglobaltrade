/**
 * Trade-route WebGL backdrop for the home hero.
 *
 * It is decorative, so it opts out rather than degrades: skipped entirely on
 * small screens, when the user prefers reduced motion, or when WebGL is
 * unavailable. It also stops rendering while scrolled out of view, so it costs
 * nothing on the rest of the page. A CSS gradient sits underneath either way.
 */

const VERT = `
attribute vec2 a_position;
varying vec2 v_uv;
void main() {
  v_uv = a_position * 0.5 + 0.5;
  gl_Position = vec4(a_position, 0.0, 1.0);
}`;

const FRAG = `
precision mediump float;
uniform float u_time;
varying vec2 v_uv;

float line(vec2 p, vec2 a, vec2 b, float width) {
  vec2 pa = p - a, ba = b - a;
  float h = clamp(dot(pa, ba) / dot(ba, ba), 0.0, 1.0);
  return smoothstep(width, 0.0, length(pa - ba * h));
}

void main() {
  vec2 uv = v_uv;
  vec3 color = vec3(0.04, 0.10, 0.18);

  vec2 india = vec2(0.60, 0.45);
  vec2 markets[6];
  markets[0] = vec2(0.40, 0.50);
  markets[1] = vec2(0.30, 0.70);
  markets[2] = vec2(0.40, 0.30);
  markets[3] = vec2(0.80, 0.40);
  markets[4] = vec2(0.20, 0.60);
  markets[5] = vec2(0.70, 0.60);

  float glow = 0.0;
  for (int i = 0; i < 6; i++) {
    float l = line(uv, india, markets[i], 0.002);
    float pulse = 0.5 + 0.5 * sin(u_time * 2.0 + float(i));
    glow += l * pulse;
    glow += smoothstep(0.015, 0.0, length(uv - markets[i])) * pulse * 0.5;
  }

  glow += smoothstep(0.02, 0.0, length(uv - india)) * (0.8 + 0.2 * sin(u_time * 3.0));

  vec2 grid = fract(uv * 40.0) - 0.5;
  color += smoothstep(0.1, 0.0, length(grid)) * 0.1;
  color += glow * vec3(0.0, 0.5, 0.5);
  color += glow * 0.2 * vec3(0.77, 0.63, 0.35);

  gl_FragColor = vec4(color, 1.0);
}`;

export function initHeroShader() {
  const canvas = document.getElementById('hero-shader');
  if (!canvas) return;

  // Bail out of the work, but leave the host in the DOM: it is `hidden md:block`,
  // so a viewport that later grows past md still gets the styled slot rather than
  // a hole where an element used to be.
  const tooSmall = window.matchMedia('(max-width: 767px)').matches;
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (tooSmall || reducedMotion) return;

  const gl = canvas.getContext('webgl', { antialias: false, alpha: false, depth: false });
  if (!gl) return;

  const compile = (type, src) => {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, src);
    gl.compileShader(shader);
    return gl.getShaderParameter(shader, gl.COMPILE_STATUS) ? shader : null;
  };

  const vs = compile(gl.VERTEX_SHADER, VERT);
  const fs = compile(gl.FRAGMENT_SHADER, FRAG);
  if (!vs || !fs) return;

  const program = gl.createProgram();
  gl.attachShader(program, vs);
  gl.attachShader(program, fs);
  gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) return;
  gl.useProgram(program);

  const buffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
  const position = gl.getAttribLocation(program, 'a_position');
  gl.enableVertexAttribArray(position);
  gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);
  const uTime = gl.getUniformLocation(program, 'u_time');

  // The effect is diffuse; half-resolution is indistinguishable and much cheaper.
  const syncSize = () => {
    const w = Math.max(1, Math.round(canvas.clientWidth * 0.5));
    const h = Math.max(1, Math.round(canvas.clientHeight * 0.5));
    if (canvas.width !== w || canvas.height !== h) {
      canvas.width = w;
      canvas.height = h;
      gl.viewport(0, 0, w, h);
    }
  };
  new ResizeObserver(syncSize).observe(canvas);
  syncSize();

  let running = true;
  let frame = 0;

  const render = (t) => {
    if (!running) return;
    gl.uniform1f(uTime, t * 0.001);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    frame = requestAnimationFrame(render);
  };

  const setRunning = (next) => {
    if (next === running) return;
    running = next;
    if (running) frame = requestAnimationFrame(render);
    else cancelAnimationFrame(frame);
  };

  new IntersectionObserver(([entry]) => setRunning(entry.isIntersecting)).observe(canvas);
  document.addEventListener('visibilitychange', () => setRunning(!document.hidden));

  frame = requestAnimationFrame(render);
}
