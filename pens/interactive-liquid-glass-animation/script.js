const canvas = document.getElementById('c');
const gl = canvas.getContext('webgl');
if (!gl) {
  alert('WebGL not supported');
  throw new Error('WebGL not supported');
}

function resize() {
  const dpr = Math.max(1, Math.min(2, window.devicePixelRatio || 1));
  const w = Math.floor(innerWidth * dpr),
    h = Math.floor(innerHeight * dpr);
  if (canvas.width !== w || canvas.height !== h) {
    canvas.width = w;
    canvas.height = h;
    gl.viewport(0, 0, w, h);
  }
}
addEventListener('resize', resize);
resize();

const vertSrc = `
attribute vec2 aPos; varying vec2 vUV;
void main(){ vUV=0.5*(aPos+1.0); gl_Position=vec4(aPos,0.0,1.0); }
`;

const fragSrc = `
#ifdef GL_ES
precision mediump float;
#endif
#ifdef GL_OES_standard_derivatives
#extension GL_OES_standard_derivatives : enable
#endif
uniform vec2  iResolution;
uniform float iTime;
uniform vec2  iMouse;
uniform sampler2D iChannel0;

uniform float uCell, uAmp, uChrom, uSpeed, uAnimate;
uniform int   uShape; // 0..4
uniform vec2  uUVOffset;
uniform float uUVScale, uWireframe, uEnableRipple, uEnableParallax, uUseMouseLight;
uniform vec2  uRippleC;
uniform float uRippleT;

varying vec2 vUV;

float safeFwidth(float x){
  #ifdef GL_OES_standard_derivatives
  return fwidth(x);
  #else
  return 1.0;
  #endif
}

vec2 hex_pixel_to_axial(vec2 p, float s){
  float q = (1.7320508/3.0*p.x - 0.3333333*p.y)/s;
  float r = (0.6666667*p.y)/s;
  return vec2(q,r);
}
vec3 cube_round(vec3 c){
  float rx=floor(c.x+0.5), ry=floor(c.y+0.5), rz=floor(c.z+0.5);
  float dx=abs(rx-c.x), dy=abs(ry-c.y), dz=abs(rz-c.z);
  if(dx>dy && dx>dz) rx=-ry-rz; else if(dy>dz) ry=-rx-rz; else rz=-rx-ry;
  return vec3(rx,ry,rz);
}
vec2 hex_axial_round(vec2 qr){
  vec3 cube=vec3(qr.x, -qr.x-qr.y, qr.y);
  vec3 rc=cube_round(cube);
  return vec2(rc.x, rc.z);
}
vec2 hex_axial_to_pixel(vec2 qr, float s){
  float x=s*(1.7320508*qr.x + 0.8660254*qr.y);
  float y=s*(1.5*qr.y);
  return vec2(x,y);
}

float sdHex(vec2 p, float r){
  p=abs(p);
  return max(dot(p, normalize(vec2(1.0,1.7320508))) - r, p.x - r);
}
float sdBox(vec2 p, vec2 b){ vec2 d = abs(p)-b; return max(d.x,d.y); }
float sdCircle(vec2 p, float r){ return length(p)-r; }
float sdTriIso(vec2 p, float r){
  const float k = 1.7320508;
  p.x = abs(p.x) - r;
  p.y = p.y + r/k;
  if(p.x + k*p.y > 0.0){
    p = vec2(p.x - k*p.y, -k*p.x - p.y)/2.0;
  }
  p.x -= clamp(p.x, -2.0*r, 0.0);
  return -length(p)*sign(p.y);
}

void nearestCenter(int shape, vec2 p, float cell, out vec2 c, out vec2 lp){
  if(shape==0){
    vec2 qr  = hex_pixel_to_axial(p, cell);
    vec2 qrr = hex_axial_round(qr);
    c = hex_axial_to_pixel(qrr, cell);
    lp = p - c;
  } else if(shape==3){
    vec2 e1 = vec2(cell, 0.0);
    vec2 e2 = vec2(cell*0.5, cell*0.8660254);
    float det = e1.x*e2.y - e1.y*e2.x;
    vec2 k; 
    k.x = ( p.x*e2.y - p.y*e2.x) / det;
    k.y = (-p.x*e1.y + p.y*e1.x) / det;
    vec2 kR = floor(k + 0.5);
    c = e1*kR.x + e2*kR.y;
    lp = p - c;
  } else {
    vec2 g = floor(p/cell + 0.5);
    c = g * cell;
    lp = p - c;
  }
}

float shapeSDF(int shape, vec2 lp, float cell){
  if(shape==0){ return sdHex(lp, cell*0.95); }
  if(shape==1){ return sdBox(lp, vec2(cell*0.5)); }
  if(shape==2){
    float a = 0.78539816339; // 45°
    mat2 R = mat2(cos(a), -sin(a), sin(a), cos(a));
    return sdBox(R*lp, vec2(cell*0.5));
  }
  if(shape==3){ return sdTriIso(lp, cell*0.6); }
  return sdCircle(lp, cell*0.55);
}

vec3 sampleImage(vec2 uv){ return texture2D(iChannel0, uv).rgb; }

void main(){
  vec2 res=iResolution, frag=gl_FragCoord.xy, p=frag-0.5*res, uv=vUV;
  vec2 mouse=iMouse; bool hasMouse=(mouse.x>=0.0 && mouse.y>=0.0); vec2 mp=mouse-0.5*res;

  vec2 par=vec2(0.0);
  if(uEnableParallax>0.01 && hasMouse){ par=(mp/max(res.x,res.y))*0.05*uEnableParallax; }
  vec2 uvw=(uv-0.5)/max(1.0e-3,uUVScale) + uUVOffset + 0.5 + par;

  float cell=max(6.0,uCell);

  float t=iTime*uSpeed;
  float wave=(uAnimate>0.5)?(sin(p.x*0.01 + p.y*0.015 + t)*0.25):0.0;
  float localCell=cell*(1.0+wave*0.2);

  vec2 c, lp; nearestCenter(uShape, p, localCell, c, lp);
  float d = shapeSDF(uShape, lp, localCell);
  float inside = smoothstep(0.0, 1.5, -d);

  float rad = clamp(length(lp) / (localCell*0.95), 0.0, 1.0);
  vec2 n = normalize(lp + 1e-6);

  float ripple=0.0; vec2 rippleDir=vec2(0.0);
  if(uEnableRipple>0.5 && uRippleC.x>=0.0){
    vec2 cp=uRippleC-0.5*res; float R=length(p-cp); float dt=max(0.0,iTime-uRippleT);
    float env=exp(-R*0.006)*exp(-dt*1.0); ripple=sin(R*0.06 - dt*6.0)*env;
    rippleDir=normalize(p-cp+1e-6);
  }

  vec3 base=sampleImage(uvw);
  float strength=uAmp*(1.0-pow(rad,1.4))*0.07;
  vec2 refr=n*strength + rippleDir*(0.02*ripple);

  vec2 ca=refr*(0.25*uChrom); float ca2=0.6*uChrom;
  vec3 glass;
  glass.r=sampleImage(uvw+refr+ca).r;
  glass.g=sampleImage(uvw+refr).g;
  glass.b=sampleImage(uvw+refr-ca*ca2).b;

  vec2 L=(uUseMouseLight>0.01 && hasMouse)?normalize(mp):normalize(vec2(0.7,1.0));
  float spec=pow(max(0.0,dot(normalize(L),n)),14.0)*(1.0-rad);
  glass+=vec3(1.0,0.96,0.9)*spec*0.45;

  vec3 col=mix(base,glass,inside);
  if(uWireframe>0.5){
    float wf=smoothstep(1.5,0.0,abs(d));
    col=mix(col, vec3(1.0), wf*0.3);
  }

  float vign=smoothstep(1.2,0.2,length((frag-0.5*res)/res.y));
  col*=mix(0.9,1.0,vign);
  gl_FragColor=vec4(col,1.0);
}
`;

function compile(type, src) {
  const s = gl.createShader(type);
  gl.shaderSource(s, src);
  gl.compileShader(s);
  // FIX: COMPILE_STATUS (без лишней P)
  if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
    console.error(gl.getShaderInfoLog(s));
    throw new Error('Shader compile error');
  }
  return s;
}
const vs = compile(gl.VERTEX_SHADER, vertSrc);
const fs = compile(gl.FRAGMENT_SHADER, fragSrc);
const prog = gl.createProgram();
gl.attachShader(prog, vs);
gl.attachShader(prog, fs);
gl.linkProgram(prog);
if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
  console.error(gl.getProgramInfoLog(prog));
  throw new Error('Link error');
}
gl.useProgram(prog);

const buf = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, buf);
gl.bufferData(
  gl.ARRAY_BUFFER,
  new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]),
  gl.STATIC_DRAW
);
const aPos = gl.getAttribLocation(prog, 'aPos');
gl.enableVertexAttribArray(aPos);
gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);

const uRes = gl.getUniformLocation(prog, 'iResolution');
const uTime = gl.getUniformLocation(prog, 'iTime');
const uMouse = gl.getUniformLocation(prog, 'iMouse');
const uCell = gl.getUniformLocation(prog, 'uCell');
const uAmp = gl.getUniformLocation(prog, 'uAmp');
const uChrom = gl.getUniformLocation(prog, 'uChrom');
const uSpeed = gl.getUniformLocation(prog, 'uSpeed');
const uAnim = gl.getUniformLocation(prog, 'uAnimate');

const uUVOffset = gl.getUniformLocation(prog, 'uUVOffset');
const uUVScale = gl.getUniformLocation(prog, 'uUVScale');
const uWireframe = gl.getUniformLocation(prog, 'uWireframe');
const uEnableRipple = gl.getUniformLocation(prog, 'uEnableRipple');
const uEnableParallax = gl.getUniformLocation(prog, 'uEnableParallax');
const uUseMouseLight = gl.getUniformLocation(prog, 'uUseMouseLight');
const uRippleC = gl.getUniformLocation(prog, 'uRippleC');
const uRippleT = gl.getUniformLocation(prog, 'uRippleT');
const uShapeLoc = gl.getUniformLocation(prog, 'uShape');
const uTex0 = gl.getUniformLocation(prog, 'iChannel0');
gl.uniform1i(uTex0, 0);

let tex0 = gl.createTexture();
gl.activeTexture(gl.TEXTURE0);
gl.bindTexture(gl.TEXTURE_2D, tex0);
gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
gl.texImage2D(
  gl.TEXTURE_2D,
  0,
  gl.RGBA,
  1,
  1,
  0,
  gl.RGBA,
  gl.UNSIGNED_BYTE,
  new Uint8Array([0, 0, 0, 255])
);

const DEFAULT_VIDEO = 'https://img.blacklead.work/blacklead-fish.mp4';

let mediaMode = 'image';
let videoEl = null,
  videoReady = false;

function uploadImage(src) {
  const im = new Image();
  im.crossOrigin = 'anonymous';
  im.onload = () => {
    gl.bindTexture(gl.TEXTURE_2D, tex0);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, im);
  };
  im.onerror = () => alert('Failed to load image (CORS?)');
  im.src = src;
}

function setupVideo(src) {
  if (videoEl) {
    try { videoEl.pause(); } catch (_) {}
  }
  videoEl = document.createElement('video');
  videoEl.crossOrigin = 'anonymous';
  videoEl.src = src;
  videoEl.muted = true;
  videoEl.loop = true;
  videoEl.playsInline = true;
  videoEl.autoplay = true;

  videoEl.addEventListener('canplay', () => {
    videoReady = true;
    videoEl.play().catch(() => {});
  });
  videoEl.addEventListener('error', () =>
    alert('Failed to load video (CORS/format?)')
  );

  videoEl.addEventListener('ended', () => {
    if (!videoEl.loop) {
      playPause.textContent = 'Play';
    }
  });
  videoEl.addEventListener('play', () => {
    playPause.textContent = 'Pause';
  });
  videoEl.addEventListener('pause', () => {
    if (!videoEl.loop || videoEl.paused) {
      playPause.textContent = 'Play';
    }
  });
}

const ampInp = document.getElementById('amp'),
  ampVal = document.getElementById('ampVal');
const chromInp = document.getElementById('chrom'),
  chromVal = document.getElementById('chromVal');
const speedInp = document.getElementById('speed'),
  speedVal = document.getElementById('speedVal');
const animateChk = document.getElementById('animate');
const cellInp = document.getElementById('cell');

const tabImg = document.getElementById('tabImg'),
  tabVid = document.getElementById('tabVid');
const imgPane = document.getElementById('imgPane'),
  vidPane = document.getElementById('vidPane');
const loadImg = document.getElementById('loadImg'),
  imgUrl = document.getElementById('imgUrl');
const loadVid = document.getElementById('loadVid'),
  vidUrl = document.getElementById('vidUrl');
const playPause = document.getElementById('playPause'),
  loopChk = document.getElementById('loop'),
  muteChk = document.getElementById('mute');

const segBtns = Array.from(document.querySelectorAll('.shape-switch .seg-btn'));
let shapeIndex = 0;
if (segBtns.length) {
  segBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      segBtns.forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');
      shapeIndex = parseInt(btn.dataset.shape, 10) || 0;
    });
  });
}

function syncVals() {
  ampVal.textContent = Number(ampInp.value).toFixed(2);
  chromVal.textContent = Number(chromInp.value).toFixed(2);
  speedVal.textContent = Number(speedInp.value).toFixed(2);
}
['input', 'change'].forEach((evt) => {
  ampInp.addEventListener(evt, syncVals);
  chromInp.addEventListener(evt, syncVals);
  speedInp.addEventListener(evt, syncVals);
});
syncVals();

tabImg.addEventListener('click', () => {
  mediaMode = 'image';
  tabImg.classList.add('active');
  tabVid.classList.remove('active');
  imgPane.style.display = 'block';
  vidPane.style.display = 'none';
});
tabVid.addEventListener('click', () => {
  mediaMode = 'video';
  tabVid.classList.add('active');
  tabImg.classList.remove('active');
  imgPane.style.display = 'none';
  vidPane.style.display = 'block';
});

loadImg.addEventListener('click', () => {
  if (!imgUrl.value.trim()) return;
  mediaMode = 'image';
  uploadImage(imgUrl.value.trim());
  tabImg.click();
});
loadVid.addEventListener('click', () => {
  if (!vidUrl.value.trim()) return;
  mediaMode = 'video';
  setupVideo(vidUrl.value.trim());
  tabVid.click();
});

playPause.addEventListener('click', () => {
  if (!videoEl) return;
  if (videoEl.paused) {
    videoEl.play();
  } else {
    videoEl.pause();
  }
});
loopChk.addEventListener('change', () => {
  if (videoEl) videoEl.loop = loopChk.checked;
});
muteChk.addEventListener('change', () => {
  if (videoEl) videoEl.muted = muteChk.checked;
});

mediaMode = 'video';
setupVideo(DEFAULT_VIDEO);
tabVid.classList.add('active');
tabImg.classList.remove('active');
imgPane.style.display = 'none';
vidPane.style.display = 'block';
vidUrl.value = DEFAULT_VIDEO;
if (videoEl) {
  videoEl.muted = true;
  videoEl.loop = true;
  videoEl
    .play()
    .then(() => {
      playPause.textContent = 'Pause';
    })
    .catch(() => {
      playPause.textContent = 'Play';
    });
}

let mouseTarget = [-1, -1];
let mouseSm = [-1, -1];
let mouseFactor = 0;
let mouseFactorTarget = 0;

let uvOffset = { x: 0, y: 0 },
  uvScale = 1.0,
  dragging = false,
  last = null;
let wireframe = 0.0,
  rippleC = [-1, -1],
  rippleT = 0;

function clientToGL(e) {
  const r = canvas.getBoundingClientRect();
  const x = (e.clientX - r.left) * (canvas.width / r.width);
  const y = (e.clientY - r.top) * (canvas.height / r.height);
  return [x, canvas.height - y];
}

canvas.addEventListener('mouseenter', () => {
  mouseFactorTarget = 1;
});
canvas.addEventListener('mousemove', (e) => {
  mouseTarget = clientToGL(e);
  mouseFactorTarget = 1;
  if (dragging) {
    const r = canvas.getBoundingClientRect();
    const dx = (e.clientX - (last?.x || e.clientX)) / r.width;
    const dy = (e.clientY - (last?.y || e.clientY)) / r.height;
    uvOffset.x -= dx * uvScale;
    uvOffset.y += dy * uvScale;
    last = { x: e.clientX, y: e.clientY };
  }
});
canvas.addEventListener('mouseleave', () => {
  mouseFactorTarget = 0;
});

canvas.addEventListener('mousedown', (e) => {
  if (e.button === 0) {
    dragging = true;
    last = { x: e.clientX, y: e.clientY };
  }
});
window.addEventListener('mouseup', () => (dragging = false));

canvas.addEventListener(
  'wheel',
  (e) => {
    e.preventDefault();
    if (e.ctrlKey) {
      const k = Math.exp((e.deltaY > 0 ? 1 : -1) * 0.06);
      uvScale = Math.max(0.25, Math.min(6.0, uvScale * k));
    } else {
      const cur = parseFloat(cellInp.value);
      const step = (e.shiftKey ? 6 : 12) * (e.deltaY > 0 ? 1 : -1);
      cellInp.value = String(Math.max(8, Math.min(200, cur + step)));
    }
  },
  { passive: false }
);

canvas.addEventListener('click', (e) => {
  if (dragging) return;
  rippleC = clientToGL(e);
  rippleT = performance.now() * 0.001;
});
canvas.addEventListener('dblclick', () => {
  wireframe = wireframe > 0.5 ? 0.0 : 1.0;
});

function draw(tms) {
  resize();
  const t = tms * 0.001;

  if (
    mediaMode === 'video' &&
    videoEl &&
    videoReady &&
    !videoEl.paused &&
    videoEl.readyState >= 2
  ) {
    gl.bindTexture(gl.TEXTURE_2D, tex0);
    gl.texImage2D(
      gl.TEXTURE_2D,
      0,
      gl.RGBA,
      gl.RGBA,
      gl.UNSIGNED_BYTE,
      videoEl
    );
  }

  const k = 1.0 - Math.exp(-0.25);
  if (mouseSm[0] < 0 || mouseSm[1] < 0) {
    mouseSm = mouseTarget.slice();
  }
  mouseSm[0] += (mouseTarget[0] - mouseSm[0]) * k;
  mouseSm[1] += (mouseTarget[1] - mouseSm[1]) * k;
  mouseFactor += (mouseFactorTarget - mouseFactor) * k;

  gl.useProgram(prog);
  gl.uniform2f(uRes, canvas.width, canvas.height);
  gl.uniform1f(uTime, t);
  gl.uniform2f(uMouse, mouseSm[0], mouseSm[1]);

  gl.uniform1f(uCell, parseFloat(cellInp.value));
  gl.uniform1f(uAmp, parseFloat(ampInp.value));
  gl.uniform1f(uChrom, parseFloat(chromInp.value));
  gl.uniform1f(uSpeed, parseFloat(speedInp.value));
  gl.uniform1f(uAnim, animateChk.checked ? 1.0 : 0.0);

  gl.uniform2f(uUVOffset, uvOffset.x, uvOffset.y);
  gl.uniform1f(uUVScale, uvScale);

  gl.uniform1f(uWireframe, wireframe);
  gl.uniform1f(uEnableRipple, 1.0);
  gl.uniform1f(uEnableParallax, 0.0);
  gl.uniform1f(uUseMouseLight, mouseFactor);

  gl.uniform2f(uRippleC, rippleC[0], rippleC[1]);
  gl.uniform1f(uRippleT, rippleT);

  gl.uniform1i(uShapeLoc, shapeIndex);

  gl.drawArrays(gl.TRIANGLES, 0, 6);
  requestAnimationFrame(draw);
}
requestAnimationFrame(draw);
