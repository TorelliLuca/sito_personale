/**
 * Procedural low-poly building factories.
 * Distinct silhouettes per type + emissive windows / point lights for occupancy.
 */

import * as THREE from "three";

const PALETTE = {
  home: { body: 0x5a7fc4, roof: 0x3a4a6e, trim: 0xd8dee9 },
  homeOwned: { body: 0xe8b84a, roof: 0x8a5a20, trim: 0xfff0c8 },
  workplace: { body: 0xc48a2e, roof: 0x2a2e38, trim: 0xf0d090 },
  supermarket: { body: 0x3a9e68, roof: 0x2a6e4a, trim: 0xe8f5ee },
  bankrupt: { body: 0x555860, roof: 0x3a3d45, trim: 0x777986 },
  windowOn: 0xffe08a,
  windowOff: 0x1a2030,
};

function enableShadows(root) {
  root.traverse((obj) => {
    if (obj.isMesh && !obj.userData.isWindow) {
      obj.castShadow = true;
      obj.receiveShadow = true;
    }
  });
}

function makeWindowMat(on) {
  return new THREE.MeshStandardMaterial({
    color: on ? PALETTE.windowOn : PALETTE.windowOff,
    emissive: on ? PALETTE.windowOn : 0x000000,
    emissiveIntensity: on ? 1.2 : 0,
    roughness: 0.35,
    metalness: 0.05,
  });
}

/**
 * Extruded window box so lights stay visible (planes were z-fighting on tall offices).
 */
function addWindow(parent, mats, x, y, z, w, h, rotY = 0) {
  const mat = makeWindowMat(false);
  mats.push(mat);
  const depth = 0.08;
  const mesh = new THREE.Mesh(new THREE.BoxGeometry(w, h, depth), mat);
  mesh.position.set(x, y, z);
  mesh.rotation.y = rotY;
  mesh.castShadow = false;
  mesh.receiveShadow = false;
  mesh.userData.isWindow = true;
  parent.add(mesh);
  return mesh;
}

function createHome(colors, size = 1, spanX = 1, spanZ = 1) {
  const g = new THREE.Group();
  const mats = [];
  const n = Math.max(1, Math.min(8, Number(size) || 1));
  const sx = Math.max(1, Number(spanX) || 1);
  const sz = Math.max(1, Number(spanZ) || 1);

  // size/span 1 → same silhouette as stock city homes
  const bodyW = sx <= 1 && sz <= 1 ? 0.9 : Math.max(0.9, sx * 0.92);
  const bodyD = sx <= 1 && sz <= 1 ? 0.8 : Math.max(0.8, sz * 0.92);
  const bodyH = 0.95 + 0.28 * Math.max(0, n - 1);

  const body = new THREE.Mesh(
    new THREE.BoxGeometry(bodyW, bodyH, bodyD),
    new THREE.MeshStandardMaterial({ color: colors.body, roughness: 0.85 }),
  );
  body.position.y = bodyH * 0.5;
  body.userData.isBody = true;
  g.add(body);

  const roofMat = new THREE.MeshStandardMaterial({ color: colors.roof, roughness: 0.9 });
  const roofW = bodyW + 0.15;
  const roofSlab = Math.max(0.55, bodyD * 0.55 + 0.08);
  const roofY = bodyH + 0.1;
  const roofL = new THREE.Mesh(new THREE.BoxGeometry(roofW, 0.08, roofSlab), roofMat);
  roofL.position.set(0, roofY, bodyD * 0.15);
  roofL.rotation.x = 0.55;
  g.add(roofL);
  const roofR = new THREE.Mesh(new THREE.BoxGeometry(roofW, 0.08, roofSlab), roofMat.clone());
  roofR.position.set(0, roofY, -bodyD * 0.15);
  roofR.rotation.x = -0.55;
  g.add(roofR);

  const chim = new THREE.Mesh(
    new THREE.BoxGeometry(0.14, 0.35 + 0.05 * n, 0.14),
    new THREE.MeshStandardMaterial({ color: colors.trim, roughness: 0.8 }),
  );
  chim.position.set(bodyW * 0.3, roofY + 0.2, -bodyD * 0.12);
  g.add(chim);

  const door = new THREE.Mesh(
    new THREE.BoxGeometry(0.22, 0.4, 0.04),
    new THREE.MeshStandardMaterial({ color: 0x2a2430, roughness: 0.7 }),
  );
  door.position.set(0, 0.2, bodyD * 0.5 + 0.02);
  g.add(door);

  const frontZ = bodyD * 0.5 + 0.01;
  const winY = Math.min(bodyH * 0.55, bodyH - 0.25);
  const winS = 0.22;
  addWindow(g, mats, -bodyW * 0.28, winY, frontZ, winS, winS);
  addWindow(g, mats, bodyW * 0.28, winY, frontZ, winS, winS);
  addWindow(g, mats, 0, winY, -frontZ, 0.28, winS, Math.PI);
  if (n >= 3) {
    addWindow(g, mats, 0, winY + 0.35, frontZ, winS, winS);
  }

  return {
    group: g,
    windowMats: mats,
    lightY: bodyH + 0.25,
    lightRange: 4.5 + Math.max(sx, sz) * 1.2,
  };
}

function createWorkplace(colors) {
  const g = new THREE.Group();
  const mats = [];

  const body = new THREE.Mesh(
    new THREE.BoxGeometry(0.85, 2.6, 0.85),
    new THREE.MeshStandardMaterial({ color: colors.body, roughness: 0.65, metalness: 0.2 }),
  );
  body.position.y = 1.3;
  g.add(body);

  const roof = new THREE.Mesh(
    new THREE.BoxGeometry(0.95, 0.12, 0.95),
    new THREE.MeshStandardMaterial({ color: colors.roof, roughness: 0.5, metalness: 0.35 }),
  );
  roof.position.y = 2.66;
  g.add(roof);

  // Antenna
  const ant = new THREE.Mesh(
    new THREE.CylinderGeometry(0.02, 0.02, 0.55, 6),
    new THREE.MeshStandardMaterial({ color: colors.trim, metalness: 0.6 }),
  );
  ant.position.y = 3.0;
  g.add(ant);

  // Facade stripe
  const stripe = new THREE.Mesh(
    new THREE.BoxGeometry(0.88, 0.08, 0.02),
    new THREE.MeshStandardMaterial({ color: colors.trim, emissive: colors.trim, emissiveIntensity: 0.2 }),
  );
  stripe.position.set(0, 2.2, 0.44);
  g.add(stripe);

  for (let floor = 0; floor < 4; floor++) {
    const y = 0.45 + floor * 0.55;
    // Push past the 0.425 body face so emissive panes aren't buried
    addWindow(g, mats, -0.22, y, 0.48, 0.22, 0.3);
    addWindow(g, mats, 0.22, y, 0.48, 0.22, 0.3);
    addWindow(g, mats, -0.22, y, -0.48, 0.22, 0.3, Math.PI);
    addWindow(g, mats, 0.22, y, -0.48, 0.22, 0.3, Math.PI);
    addWindow(g, mats, 0.48, y, -0.22, 0.22, 0.3, Math.PI / 2);
    addWindow(g, mats, 0.48, y, 0.22, 0.22, 0.3, Math.PI / 2);
    addWindow(g, mats, -0.48, y, -0.22, 0.22, 0.3, -Math.PI / 2);
    addWindow(g, mats, -0.48, y, 0.22, 0.22, 0.3, -Math.PI / 2);
  }

  return { group: g, windowMats: mats, lightY: 1.6, lightRange: 7 };
}

function createSupermarket(colors) {
  const g = new THREE.Group();
  const mats = [];

  const body = new THREE.Mesh(
    new THREE.BoxGeometry(1.15, 1.15, 0.95),
    new THREE.MeshStandardMaterial({ color: colors.body, roughness: 0.75 }),
  );
  body.position.y = 0.575;
  g.add(body);

  // Flat roof overhang
  const roof = new THREE.Mesh(
    new THREE.BoxGeometry(1.35, 0.1, 1.1),
    new THREE.MeshStandardMaterial({ color: colors.roof, roughness: 0.7 }),
  );
  roof.position.y = 1.2;
  g.add(roof);

  // Awning
  const awning = new THREE.Mesh(
    new THREE.BoxGeometry(1.2, 0.06, 0.35),
    new THREE.MeshStandardMaterial({
      color: 0xffffff,
      emissive: colors.trim,
      emissiveIntensity: 0.15,
      roughness: 0.6,
    }),
  );
  awning.position.set(0, 0.95, 0.55);
  g.add(awning);

  // Sign board
  const sign = new THREE.Mesh(
    new THREE.BoxGeometry(0.7, 0.22, 0.05),
    new THREE.MeshStandardMaterial({
      color: 0xf5fff8,
      emissive: 0x3cbe78,
      emissiveIntensity: 0.35,
    }),
  );
  sign.position.set(0, 1.35, 0.52);
  g.add(sign);

  // Storefront glass (wide)
  addWindow(g, mats, -0.32, 0.45, 0.48, 0.4, 0.55);
  addWindow(g, mats, 0.32, 0.45, 0.48, 0.4, 0.55);
  addWindow(g, mats, 0, 0.55, -0.48, 0.7, 0.4, Math.PI);

  return { group: g, windowMats: mats, lightY: 1.4, lightRange: 5.5 };
}

/**
 * @param {string} type home | workplace | supermarket
 * @param {{ size?: number, spanX?: number, spanZ?: number, owned?: boolean }} [opts]
 * @returns {THREE.Group}
 */
export function createBuilding(type, opts = {}) {
  const t = (type || "home").toLowerCase();
  const owned = !!opts.owned && t === "home";
  const colors = owned ? PALETTE.homeOwned : (PALETTE[t] || PALETTE.home);
  const size = Math.max(1, Number(opts.size) || 1);
  const spanX = Math.max(1, Number(opts.spanX) || 1);
  const spanZ = Math.max(1, Number(opts.spanZ) || 1);
  let built;
  if (t === "workplace") built = createWorkplace(colors);
  else if (t === "supermarket") built = createSupermarket(colors);
  else built = createHome(colors, size, spanX, spanZ);

  const { group, windowMats, lightY, lightRange } = built;
  enableShadows(group);

  // Beacon so owned/constructed homes are unmistakable from afar
  if (owned) {
    const pole = new THREE.Mesh(
      new THREE.CylinderGeometry(0.04, 0.04, 2.2, 6),
      new THREE.MeshStandardMaterial({
        color: 0xffdd55,
        emissive: 0xffaa00,
        emissiveIntensity: 0.8,
      }),
    );
    pole.position.set(bodyBeaconX(spanX), 1.1, 0);
    gSafeAdd(group, pole);
    const ball = new THREE.Mesh(
      new THREE.SphereGeometry(0.16, 10, 10),
      new THREE.MeshStandardMaterial({
        color: 0xffee88,
        emissive: 0xffcc33,
        emissiveIntensity: 1.2,
      }),
    );
    ball.position.set(bodyBeaconX(spanX), 2.3, 0);
    gSafeAdd(group, ball);
  }

  const glow = new THREE.PointLight(owned ? 0xffcc66 : PALETTE.windowOn, 0, lightRange || 4.5, 2);
  glow.position.set(0, lightY, 0);
  group.add(glow);

  group.userData = {
    kind: "building",
    buildingType: t,
    owned,
    homeSize: t === "home" ? size : 1,
    spanX: t === "home" ? spanX : 1,
    spanZ: t === "home" ? spanZ : 1,
    windowMats,
    glow,
    baseColors: { ...colors },
  };

  return group;
}

function bodyBeaconX(spanX) {
  return Math.max(0.35, (Number(spanX) || 1) * 0.35);
}

function gSafeAdd(group, obj) {
  group.add(obj);
}

/**
 * Toggle interior lights (windows + point glow).
 * @param {THREE.Group} group
 * @param {boolean} occupied
 * @param {boolean} bankrupt
 * @param {number} nightFactor 0 day … 1 night (glow stronger at night)
 */
export function setBuildingLights(group, occupied, bankrupt, nightFactor = 0.5) {
  const on = occupied && !bankrupt;
  const isOffice = group.userData.buildingType === "workplace";
  // Offices need a stronger base glow — tall facades wash out under daylight
  const baseIntensity = isOffice ? 1.15 : 0.55;
  const baseEmis = isOffice ? 1.6 : 0.85;
  const intensity = on ? baseIntensity + nightFactor * 1.2 : 0;
  const emis = on ? baseEmis + nightFactor * 1.0 : 0;

  for (const mat of group.userData.windowMats || []) {
    if (on) {
      mat.color.setHex(PALETTE.windowOn);
      mat.emissive.setHex(PALETTE.windowOn);
      mat.emissiveIntensity = emis;
    } else {
      mat.color.setHex(PALETTE.windowOff);
      mat.emissive.setHex(0x000000);
      mat.emissiveIntensity = 0;
    }
    mat.needsUpdate = true;
  }

  if (group.userData.glow) {
    group.userData.glow.intensity = intensity;
    group.userData.glow.visible = on;
  }
}

export function setBuildingBankruptTint(group, bankrupt) {
  const type = group.userData.buildingType || "home";
  const owned = !!group.userData.owned;
  const colors = bankrupt
    ? PALETTE.bankrupt
    : (owned ? PALETTE.homeOwned : (PALETTE[type] || PALETTE.home));
  if (!group.userData.bodyMat) {
    const first = group.children.find((c) => c.isMesh && c.userData?.isBody);
    const fallback = group.children.find((c) => c.isMesh && c.geometry?.type === "BoxGeometry");
    if (first || fallback) group.userData.bodyMat = (first || fallback).material;
  }
  if (group.userData.bodyMat) {
    group.userData.bodyMat.color.setHex(colors.body);
  }
}
