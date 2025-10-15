// /* Minimal WebGL shader to render the procedural orb
//    This uses a small helper to compile shaders and render a single quad.
// */
// (function () {
//     // only run on orb page
//     if (!document.querySelector('.orb-ui')) return;

//     // create container
//     const container = document.createElement('div');
//     container.className = 'orb-container';
//     document.body.appendChild(container);

//     const canvas = document.createElement('canvas');
//     canvas.className = 'orb-canvas';
//     container.appendChild(canvas);

//     const gl = canvas.getContext('webgl', { alpha: true });
//     if (!gl) return;

//     function compile(type, src) {
//         const s = gl.createShader(type);
//         gl.shaderSource(s, src);
//         gl.compileShader(s);
//         if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
//             console.error(gl.getShaderInfoLog(s));
//             gl.deleteShader(s);
//             return null;
//         }
//         return s;
//     }

//     // vertex shader: pass through positions/uv
//     const vert = `attribute vec2 position; varying vec2 vUv; void main(){ vUv = position * 0.5 + 0.5; gl_Position = vec4(position,0.0,1.0); }`;

//     // fragment: adapted from user's GLSL. Some utility functions moved inline.
//     const frag = `precision mediump float; varying vec2 vUv; uniform float iTime; uniform vec3 iResolution; uniform float hue; uniform float hover; uniform float rot; uniform float hoverIntensity;

//   // helper functions (hash, noise, color) adapted for webgl1
//   vec3 rgb2yiq(vec3 c){ float y = dot(c, vec3(0.299,0.587,0.114)); float i = dot(c, vec3(0.596,-0.274,-0.322)); float q = dot(c, vec3(0.211,-0.523,0.312)); return vec3(y,i,q); }
//   vec3 yiq2rgb(vec3 c){ float r = c.x + 0.956*c.y + 0.621*c.z; float g = c.x - 0.272*c.y - 0.647*c.z; float b = c.x - 1.106*c.y + 1.703*c.z; return vec3(r,g,b); }
//   vec3 adjustHue(vec3 color, float hueDeg){ float hueRad = hueDeg * 3.14159265 / 180.0; vec3 yiq = rgb2yiq(color); float cosA = cos(hueRad); float sinA = sin(hueRad); float ii = yiq.y * cosA - yiq.z * sinA; float qq = yiq.y * sinA + yiq.z * cosA; yiq.y = ii; yiq.z = qq; return yiq2rgb(yiq); }

//   vec3 hash33(vec3 p3){ p3 = fract(p3 * vec3(0.1031,0.11369,0.13787)); p3 += dot(p3, p3.yxz + 19.19); return -1.0 + 2.0 * fract(vec3(p3.x + p3.y, p3.x + p3.z, p3.y + p3.z) * p3.zyx); }

//   float snoise3(vec3 p){ const float K1 = 0.333333333; const float K2 = 0.166666667; vec3 i = floor(p + (p.x + p.y + p.z) * K1); vec3 d0 = p - (i - (i.x + i.y + i.z) * K2); vec3 e = step(vec3(0.0), d0 - d0.yzx); vec3 i1 = e * (1.0 - e.zxy); vec3 i2 = 1.0 - e.zxy * (1.0 - e); vec3 d1 = d0 - (i1 - K2); vec3 d2 = d0 - (i2 - K1); vec3 d3 = d0 - 0.5; vec4 h = max(0.6 - vec4(dot(d0,d0), dot(d1,d1), dot(d2,d2), dot(d3,d3)), 0.0); vec4 n = h * h * h * h * vec4(dot(d0, hash33(i)), dot(d1, hash33(i + i1)), dot(d2, hash33(i + i2)), dot(d3, hash33(i + 1.0))); return dot(vec4(31.316), n); }

//   vec4 extractAlpha(vec3 colorIn){ float a = max(max(colorIn.r, colorIn.g), colorIn.b); return vec4(colorIn.rgb / (a + 1e-5), a); }

//   const vec3 baseColor1 = vec3(0.611765,0.262745,0.996078);
//   const vec3 baseColor2 = vec3(0.298039,0.760784,0.913725);
//   const vec3 baseColor3 = vec3(0.062745,0.078431,0.600000);
//   const float innerRadius = 0.6;
//   const float noiseScale = 0.65;

//   float light1(float intensity, float attenuation, float dist){ return intensity / (1.0 + dist * attenuation); }
//   float light2(float intensity, float attenuation, float dist){ return intensity / (1.0 + dist * dist * attenuation); }

//   vec4 draw(vec2 uv){ vec3 color1 = adjustHue(baseColor1, hue); vec3 color2 = adjustHue(baseColor2, hue); vec3 color3 = adjustHue(baseColor3, hue); float ang = atan(uv.y, uv.x); float len = length(uv); float invLen = len > 0.0 ? 1.0 / len : 0.0; float n0 = snoise3(vec3(uv * noiseScale, iTime * 0.5)) * 0.5 + 0.5; float r0 = mix(mix(innerRadius, 1.0, 0.4), mix(innerRadius, 1.0, 0.6), n0); float d0 = distance(uv, (r0 * invLen) * uv);
//     // soften the rim lighting contribution so it doesn't create a harsh diamond pattern
//     float v0 = light1(0.65, 12.0, d0);
//     v0 *= smoothstep(r0 * 1.06, r0, len);
//     // low-frequency color variation (avoid high-frequency cosine that made angular lobes)
//     float cl = 0.5 + 0.5 * cos(ang + iTime * 1.2);
//     // remove strong moving point spotlight; replace with a softer, broader glow
//     float a = iTime * -0.6;
//     vec2 pos = vec2(cos(a), sin(a)) * r0 * 0.6;
//     float d = distance(uv, pos);
//     float v1 = light2(0.9, 8.0, d);
//     v1 *= light1(0.6, 40.0, d0);
//     float v2 = smoothstep(1.0, mix(innerRadius, 1.0, n0 * 0.5), len);
//     float v3 = smoothstep(innerRadius, mix(innerRadius, 1.0, 0.5), len);
//         vec3 col = mix(color1, color2, cl);
//         col = mix(color3, col, v0);
//         col = (col + v1) * v2 * v3;
//         col = clamp(col, 0.0, 1.0);
//         // soft circular mask (1 inside, 0 outside) to ensure clean orb silhouette
//         float mask = smoothstep(1.05, 0.95, len);
//         // subtle outer rim near the edge to preserve the visible circle
//         float rim = clamp(smoothstep(0.98, 0.995, len) - smoothstep(1.005, 1.02, len), 0.0, 1.0);
//         vec3 rimCol = vec3(0.85, 0.92, 1.0);
//         vec4 out = extractAlpha(col);
//         out.rgb += rimCol * rim * 0.28 * mask;
//         out.rgb *= mask;
//         out.a *= mask;
//         return out;
//   }

//     vec4 mainImage(vec2 fragCoord){ vec2 center = iResolution.xy * 0.5; float size = min(iResolution.x, iResolution.y); vec2 uv = (fragCoord - center) / size * 2.0; float angle = rot; float s = sin(angle); float c = cos(angle); uv = vec2(c * uv.x - s * uv.y, s * uv.x + c * uv.y);
//         // remove high-frequency sin-based jitter which produced square/diamond artifacts
//         // keep subtle hover-driven offsets applied more smoothly inside draw() if needed
//         return draw(uv);
//     }

//   void main(){ vec2 fragCoord = vUv * iResolution.xy; vec4 col = mainImage(fragCoord); gl_FragColor = vec4(col.rgb * col.a, col.a); }
// `;

//     const v = compile(gl.VERTEX_SHADER, vert);
//     const f = compile(gl.FRAGMENT_SHADER, frag);
//     if (!v || !f) return;
//     const prog = gl.createProgram();
//     gl.attachShader(prog, v); gl.attachShader(prog, f); gl.linkProgram(prog);
//     if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) { console.error(gl.getProgramInfoLog(prog)); return; }

//     // create a full-screen triangle
//     const quad = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, quad);
//     const verts = new Float32Array([-1, -1, 3, -1, -1, 3]); gl.bufferData(gl.ARRAY_BUFFER, verts, gl.STATIC_DRAW);

//     gl.useProgram(prog);
//     const posLoc = gl.getAttribLocation(prog, 'position');
//     gl.enableVertexAttribArray(posLoc); gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, 0, 0);

//     const uTime = gl.getUniformLocation(prog, 'iTime');
//     const uRes = gl.getUniformLocation(prog, 'iResolution');
//     const uHue = gl.getUniformLocation(prog, 'hue');
//     const uHover = gl.getUniformLocation(prog, 'hover');
//     const uRot = gl.getUniformLocation(prog, 'rot');
//     const uHoverInt = gl.getUniformLocation(prog, 'hoverIntensity');

//     let start = performance.now();
//     let hover = 0; let rot = 0; let targetHover = 0;

//     function resize() {
//         const dpr = window.devicePixelRatio || 1;
//         const w = canvas.clientWidth * dpr; const h = canvas.clientHeight * dpr;
//         canvas.width = w; canvas.height = h; gl.viewport(0, 0, w, h);
//         gl.uniform3f(uRes, w, h, w / h);
//     }
//     window.addEventListener('resize', resize); resize();

//     container.addEventListener('mousemove', e => {
//         const r = container.getBoundingClientRect(); const x = e.clientX - r.left; const y = e.clientY - r.top; const cx = r.width / 2; const cy = r.height / 2; const size = Math.min(r.width, r.height); const uvx = ((x - cx) / size) * 2.0; const uvy = ((y - cy) / size) * 2.0; targetHover = (Math.sqrt(uvx * uvx + uvy * uvy) < 0.8) ? 1 : 0;
//     });
//     container.addEventListener('mouseleave', () => targetHover = 0);

//     let last = performance.now();
//     function frame(t) {
//         const dt = (t - last) * 0.001; last = t; const it = (t - start) * 0.001;
//         hover += (targetHover - hover) * 0.12;
//         rot += dt * 0.2 * (hover > 0.5 ? 1.0 : 0.1);
//         gl.uniform1f(uTime, it);
//         gl.uniform1f(uHue, 0.0);
//         gl.uniform1f(uHover, hover);
//         gl.uniform1f(uRot, rot);
//         gl.uniform1f(uHoverInt, 0.5);
//         gl.drawArrays(gl.TRIANGLES, 0, 3);
//         requestAnimationFrame(frame);
//     }
//     requestAnimationFrame(frame);

// })();
