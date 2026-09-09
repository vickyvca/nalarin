let mountedHost = null;
let pendingHost = null;
let disposeMounted = null;

const prefersReducedMotion = () => window.matchMedia?.('(prefers-reduced-motion: reduce)').matches === true;

function material(THREE, color, options = {}) {
  return new THREE.MeshStandardMaterial({
    color,
    roughness: 0.78,
    metalness: 0,
    ...options,
  });
}

function sphere(THREE, radius, mat, scale = [1, 1, 1]) {
  const mesh = new THREE.Mesh(new THREE.SphereGeometry(radius, 18, 14), mat);
  mesh.scale.set(...scale);
  return mesh;
}

function limb(THREE, radius, length, mat) {
  return new THREE.Mesh(new THREE.CylinderGeometry(radius, radius * 1.04, length, 12), mat);
}

function createCharacter(THREE) {
  const skin = material(THREE, 0xffd6c2);
  const skinShadow = material(THREE, 0xf3b7a6);
  const navy = material(THREE, 0x202846);
  const navyLight = material(THREE, 0x4161f5);
  const coral = material(THREE, 0xff8f7d);
  const coralDark = material(THREE, 0xd96861);
  const cream = material(THREE, 0xfff8ed);
  const yellow = material(THREE, 0xf5cf55);
  const white = material(THREE, 0xffffff);
  const eye = material(THREE, 0x202846);

  const rig = new THREE.Group();
  rig.position.y = -0.35;
  rig.scale.setScalar(1.08);

  const shadow = new THREE.Mesh(
    new THREE.CircleGeometry(0.65, 32),
    material(THREE, 0x8c6d20, { transparent: true, opacity: 0.14 }),
  );
  shadow.rotation.x = -Math.PI / 2;
  shadow.position.set(0, -0.58, 0);
  rig.add(shadow);

  const legs = new THREE.Group();
  for (const x of [-0.17, 0.17]) {
    const leg = limb(THREE, 0.095, 0.42, skin);
    leg.position.set(x, -0.34, 0);
    legs.add(leg);
    const shoe = new THREE.Mesh(new THREE.SphereGeometry(0.16, 14, 10), navy);
    shoe.scale.set(1.25, 0.55, 1.55);
    shoe.position.set(x + (x < 0 ? -0.035 : 0.035), -0.58, 0.08);
    legs.add(shoe);
  }
  rig.add(legs);

  const skirt = new THREE.Mesh(new THREE.CylinderGeometry(0.47, 0.59, 0.34, 16), navyLight);
  skirt.position.y = -0.03;
  skirt.rotation.y = Math.PI / 16;
  rig.add(skirt);

  const torso = sphere(THREE, 0.56, cream, [0.84, 1.02, 0.68]);
  torso.position.y = 0.52;
  rig.add(torso);
  const jacket = sphere(THREE, 0.58, coral, [0.86, 0.84, 0.61]);
  jacket.position.set(0, 0.61, -0.04);
  rig.add(jacket);
  const shirt = new THREE.Mesh(new THREE.ConeGeometry(0.19, 0.45, 4), cream);
  shirt.position.set(0, 0.69, 0.48);
  shirt.rotation.y = Math.PI / 4;
  rig.add(shirt);
  const tie = new THREE.Mesh(new THREE.ConeGeometry(0.05, 0.18, 4), coralDark);
  tie.position.set(0, 0.55, 0.56);
  tie.rotation.x = Math.PI;
  rig.add(tie);

  const leftArm = new THREE.Group();
  leftArm.position.set(-0.45, 0.88, 0.02);
  const leftSleeve = limb(THREE, 0.16, 0.36, coral);
  leftSleeve.position.y = -0.16;
  leftSleeve.rotation.z = -0.18;
  leftArm.add(leftSleeve);
  const leftHand = sphere(THREE, 0.14, skin, [0.9, 1.08, 0.9]);
  leftHand.position.set(-0.07, -0.39, 0.01);
  leftArm.add(leftHand);
  rig.add(leftArm);

  const rightArm = new THREE.Group();
  rightArm.position.set(0.45, 0.9, 0.03);
  const rightSleeve = limb(THREE, 0.16, 0.36, coral);
  rightSleeve.position.y = -0.15;
  rightSleeve.rotation.z = 0.23;
  rightArm.add(rightSleeve);
  const rightHand = sphere(THREE, 0.14, skin, [0.9, 1.08, 0.9]);
  rightHand.position.set(0.08, -0.39, 0.03);
  rightArm.add(rightHand);
  rig.add(rightArm);

  const book = new THREE.Group();
  book.position.set(0.06, 0.47, 0.57);
  book.rotation.set(-0.18, 0.08, -0.14);
  const cover = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.07, 0.38), navyLight);
  book.add(cover);
  const pages = new THREE.Mesh(new THREE.BoxGeometry(0.48, 0.075, 0.31), white);
  pages.position.z = 0.018;
  book.add(pages);
  rig.add(book);

  const head = new THREE.Group();
  head.position.y = 1.37;
  rig.add(head);
  const hair = sphere(THREE, 0.51, navy, [1.02, 1.04, 0.86]);
  hair.position.z = -0.06;
  head.add(hair);
  const face = sphere(THREE, 0.45, skin, [0.92, 0.98, 0.73]);
  face.position.set(0, -0.02, 0.2);
  head.add(face);
  const fringe = new THREE.Mesh(new THREE.SphereGeometry(0.49, 18, 10, 0, Math.PI * 2, 0, Math.PI * 0.42), navy);
  fringe.position.set(0, 0.16, 0.18);
  fringe.scale.set(1.03, 0.95, 0.86);
  head.add(fringe);
  for (const x of [-0.42, 0.42]) {
    const lock = new THREE.Mesh(new THREE.SphereGeometry(0.18, 14, 10), navy);
    lock.scale.set(0.58, 1.42, 0.66);
    lock.position.set(x, -0.1, 0.06);
    head.add(lock);
  }
  const eyeL = sphere(THREE, 0.065, eye, [0.72, 1.35, 0.48]);
  eyeL.position.set(-0.16, -0.02, 0.57);
  const eyeR = eyeL.clone();
  eyeR.position.x = 0.16;
  head.add(eyeL, eyeR);
  const glintL = sphere(THREE, 0.018, white);
  glintL.position.set(-0.14, 0.01, 0.615);
  const glintR = glintL.clone();
  glintR.position.x = 0.18;
  head.add(glintL, glintR);
  const blushL = sphere(THREE, 0.055, coral, [1.5, 0.55, 0.25]);
  blushL.position.set(-0.28, -0.16, 0.57);
  const blushR = blushL.clone();
  blushR.position.x = 0.28;
  head.add(blushL, blushR);
  const mouth = sphere(THREE, 0.055, coralDark, [1.2, 0.35, 0.42]);
  mouth.position.set(0, -0.19, 0.59);
  head.add(mouth);
  const hairClip = new THREE.Mesh(new THREE.TorusGeometry(0.11, 0.035, 8, 16), yellow);
  hairClip.position.set(0.34, 0.32, 0.18);
  hairClip.rotation.z = -0.4;
  head.add(hairClip);

  return { rig, head, leftArm, rightArm, book, eyeL, eyeR, mouth };
}

function mount(host, THREE) {
  const canvas = host.querySelector('.nara-3d-canvas');
  if (!canvas) return () => {};
  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true, powerPreference: 'low-power' });
  } catch {
    host.classList.add('is-fallback');
    return () => {};
  }
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(24, 1, 0.1, 100);
  camera.position.set(0, 1.05, 5.3);
  camera.lookAt(0, 0.65, 0);
  scene.add(new THREE.HemisphereLight(0xfff7d7, 0x7c8bd8, 2.1));
  const key = new THREE.DirectionalLight(0xffffff, 2.4);
  key.position.set(2.5, 4, 4);
  scene.add(key);
  const rim = new THREE.DirectionalLight(0xff9b83, 1.1);
  rim.position.set(-3, 2, -2);
  scene.add(rim);
  const character = createCharacter(THREE);
  scene.add(character.rig);
  host.classList.add('is-ready');

  let frame = 0;
  let active = true;
  let targetLook = 0;
  let look = 0;
  const resize = () => {
    const rect = host.getBoundingClientRect();
    const size = Math.max(1, Math.min(rect.width, rect.height));
    renderer.setSize(size, size, false);
    camera.aspect = 1;
    camera.updateProjectionMatrix();
  };
  const onPointerMove = (event) => {
    const rect = host.getBoundingClientRect();
    targetLook = Math.max(-1, Math.min(1, ((event.clientX - rect.left) / rect.width - 0.5) * 2));
  };
  const onPointerLeave = () => { targetLook = 0; };
  host.addEventListener('pointermove', onPointerMove, { passive: true });
  host.addEventListener('pointerleave', onPointerLeave, { passive: true });
  const observer = typeof ResizeObserver === 'function' ? new ResizeObserver(resize) : null;
  observer?.observe(host);
  resize();

  const renderFrame = (now) => {
    if (!active) return;
    const time = now * 0.001;
    look += (targetLook - look) * 0.06;
    character.head.rotation.y = look * 0.18;
    character.head.rotation.z = Math.sin(time * 0.8) * 0.018;
    character.rig.position.y = -0.35 + Math.sin(time * 1.45) * 0.035;
    character.rig.rotation.y = Math.sin(time * 0.55) * 0.055 + look * 0.04;
    character.book.rotation.z = -0.14 + Math.sin(time * 1.45) * 0.025;
    const gesture = Math.floor(time / 5.5) % 3;
    character.leftArm.rotation.z = gesture === 0 ? -0.08 + Math.sin(time * 1.4) * 0.025 : gesture === 1 ? -0.3 : -0.05;
    character.rightArm.rotation.z = gesture === 0 ? 0.23 : gesture === 1 ? 0.05 + Math.sin(time * 3.5) * 0.12 : 0.35;
    character.rightArm.rotation.x = gesture === 2 ? Math.sin(time * 1.4) * 0.07 : 0;
    const blinkPhase = time % 4.2;
    const blink = blinkPhase > 3.86 && blinkPhase < 4.04 ? 0.14 : 1;
    character.eyeL.scale.y = 1.35 * blink;
    character.eyeR.scale.y = 1.35 * blink;
    const talking = gesture === 1 && Math.sin(time * 5) > 0.2;
    character.mouth.scale.y = talking ? 0.8 : 0.35;
    renderer.render(scene, camera);
    frame = requestAnimationFrame(renderFrame);
  };
  if (prefersReducedMotion()) renderer.render(scene, camera);
  else frame = requestAnimationFrame(renderFrame);

  return () => {
    active = false;
    cancelAnimationFrame(frame);
    observer?.disconnect();
    host.removeEventListener('pointermove', onPointerMove);
    host.removeEventListener('pointerleave', onPointerLeave);
    scene.traverse((node) => {
      if (node.geometry) node.geometry.dispose();
      if (node.material) {
        const materials = Array.isArray(node.material) ? node.material : [node.material];
        materials.forEach((entry) => entry.dispose());
      }
    });
    renderer.dispose();
    renderer.forceContextLoss?.();
  };
}

export async function mountNara3d() {
  const host = document.querySelector('[data-nara-3d]');
  if (!host) {
    disposeMounted?.();
    disposeMounted = null;
    mountedHost = null;
    pendingHost = null;
    return;
  }
  if (host === mountedHost || host === pendingHost) return;
  disposeMounted?.();
  disposeMounted = null;
  mountedHost = null;
  pendingHost = host;
  try {
    const THREE = await import('three');
    if (!document.body.contains(host)) return;
    disposeMounted = mount(host, THREE);
    mountedHost = host;
  } catch {
    host.classList.add('is-fallback');
  } finally {
    if (pendingHost === host) pendingHost = null;
  }
}
