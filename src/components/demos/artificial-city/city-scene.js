/**
 * Three.js city scene: procedural buildings, lit windows, agents,
 * day/night cycle, movement interpolation, click selection.
 */

import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import {
  createBuilding,
  setBuildingLights,
  setBuildingBankruptTint,
} from "./buildings.js";

/** Bump when building mesh layout changes so live clients rebuild groups. */
const BUILDING_MESH_VERSION = 6;

const AGENT_COLORS = {
  idle: 0xc8c8d2,
  moving: 0xffffff,
  working: 0xfac83c,
  shopping: 0x64dc96,
  resting: 0x64a0ff,
  relaxing: 0xff78b4,
};

/** Fallback ticks per day/night cycle if snapshot omits day_length. */
export const DEFAULT_DAY_LENGTH = 480;

export class CityScene {
  /**
   * @param {HTMLElement} container
   * @param {{ onSelectAgent?: (agent: object|null) => void }} [opts]
   */
  constructor(container, opts = {}) {
    this.container = container;
    this.onSelectAgent = opts.onSelectAgent || (() => {});
    this.gridSize = 50;
    this.dayLength = DEFAULT_DAY_LENGTH;
    this.buildings = new Map();
    this.agents = new Map();
    this.selectedAgentId = null;
    this._latestAgentsById = new Map();
    this._dayPhase = 0.25;
    this._nightFactor = 0;

    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.setSize(container.clientWidth, container.clientHeight);
    this.renderer.setClearColor(0x87a0c0, 1);
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.appendChild(this.renderer.domElement);

    this.scene = new THREE.Scene();
    this.scene.fog = new THREE.Fog(0x87a0c0, 80, 220);

    this.camera = new THREE.PerspectiveCamera(
      45,
      container.clientWidth / Math.max(container.clientHeight, 1),
      0.1,
      800,
    );

    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.08;
    this.controls.maxPolarAngle = Math.PI * 0.48;
    this.controls.minDistance = 8;
    this.controls.maxDistance = 220;

    this.raycaster = new THREE.Raycaster();
    this.pointer = new THREE.Vector2();

    this._addLights();
    this._addGround(this.gridSize);
    this._frameCamera(this.gridSize);
    this._addSelectionMarker();

    this._onPointerDownBound = (e) => this._onPointerDown(e);
    this._onResizeBound = () => this._onResize();
    this.renderer.domElement.addEventListener("pointerdown", this._onPointerDownBound);
    window.addEventListener("resize", this._onResizeBound);
  }

  _addLights() {
    this.hemi = new THREE.HemisphereLight(0xb8c8e8, 0x1a1e28, 0.9);
    this.scene.add(this.hemi);

    this.sun = new THREE.DirectionalLight(0xfff2dd, 1.2);
    this.sun.castShadow = true;
    this.sun.shadow.mapSize.set(2048, 2048);
    this.sun.shadow.camera.near = 1;
    this.sun.shadow.camera.far = 140;
    this.sun.shadow.camera.left = -45;
    this.sun.shadow.camera.right = 45;
    this.sun.shadow.camera.top = 45;
    this.sun.shadow.camera.bottom = -45;
    this.scene.add(this.sun);
    this.scene.add(this.sun.target);

    this.moon = new THREE.DirectionalLight(0x6a8cff, 0.15);
    this.moon.position.set(-30, 25, -20);
    this.scene.add(this.moon);

    this.ambientNight = new THREE.AmbientLight(0x1a2238, 0);
    this.scene.add(this.ambientNight);
  }

  _addSelectionMarker() {
    const ring = new THREE.Mesh(
      new THREE.RingGeometry(0.35, 0.48, 32),
      new THREE.MeshBasicMaterial({
        color: 0x6ec8ff,
        transparent: true,
        opacity: 0.9,
        side: THREE.DoubleSide,
        depthWrite: false,
      }),
    );
    ring.rotation.x = -Math.PI / 2;
    ring.visible = false;
    this.selectionMarker = ring;
    this.scene.add(ring);
  }

  _addGround(gridSize) {
    if (this._groundRoot) {
      this.scene.remove(this._groundRoot);
      this._groundRoot.traverse((obj) => {
        if (obj.geometry) obj.geometry.dispose();
        if (obj.material) {
          if (Array.isArray(obj.material)) obj.material.forEach((m) => m.dispose());
          else obj.material.dispose();
        }
      });
    }

    this._groundRoot = new THREE.Group();
    const half = gridSize / 2;

    this._floorMat = new THREE.MeshStandardMaterial({
      color: 0x2a3344,
      roughness: 0.95,
      metalness: 0.02,
    });
    const floor = new THREE.Mesh(new THREE.PlaneGeometry(gridSize, gridSize), this._floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.receiveShadow = true;
    this._groundRoot.add(floor);

    const grid = new THREE.GridHelper(gridSize, gridSize, 0x3a4558, 0x243040);
    grid.position.y = 0.01;
    this._groundRoot.add(grid);

    const edge = new THREE.LineLoop(
      new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(-half, 0.02, -half),
        new THREE.Vector3(half, 0.02, -half),
        new THREE.Vector3(half, 0.02, half),
        new THREE.Vector3(-half, 0.02, half),
      ]),
      new THREE.LineBasicMaterial({ color: 0x6ec8ff, transparent: true, opacity: 0.35 }),
    );
    this._groundRoot.add(edge);

    this.scene.add(this._groundRoot);
  }

  _frameCamera(gridSize) {
    const dist = gridSize * 1.15;
    this.camera.position.set(dist * 0.55, dist * 0.55, dist * 0.7);
    this.controls.target.set(0, 0, 0);
    this.controls.update();
  }

  _simToWorld(x, y) {
    const half = this.gridSize / 2;
    return {
      x: x - half + 0.5,
      z: y - half + 0.5,
    };
  }

  /**
   * Apply a new simulation snapshot (buildings/agents targets + day phase).
   * @param {object} snapshot
   */
  applySnapshot(snapshot) {
    const gridSize = snapshot.grid_size || 50;
    if (gridSize !== this.gridSize) {
      this.gridSize = gridSize;
      this._addGround(gridSize);
      this._frameCamera(gridSize);
      if (this.scene.fog) {
        this.scene.fog.near = gridSize * 1.0;
        this.scene.fog.far = gridSize * 3.0;
      }
      this.controls.maxDistance = Math.max(140, gridSize * 2.8);
      this.camera.far = Math.max(500, gridSize * 8);
      this.camera.updateProjectionMatrix();
    }

    const tick = snapshot.tick || 0;
    const dayLen = Number(snapshot.day_length) || DEFAULT_DAY_LENGTH;
    this.dayLength = dayLen > 0 ? dayLen : DEFAULT_DAY_LENGTH;
    this._dayPhase = (tick % this.dayLength) / this.dayLength;
    this._updateDayNight();

    this._syncBuildings(snapshot.buildings || [], snapshot.agents || []);
    this._syncAgents(snapshot.agents || []);
  }

  _updateDayNight() {
    // 0 = midnight, 0.25 = sunrise, 0.5 = noon, 0.75 = sunset
    const phase = this._dayPhase;
    const sunAngle = phase * Math.PI * 2 - Math.PI / 2;
    const elev = Math.sin(sunAngle);
    const azim = Math.cos(sunAngle);

    const half = this.gridSize * 0.6;
    this.sun.position.set(azim * half, Math.max(elev, 0.05) * half * 1.2, azim * half * 0.35);
    this.sun.target.position.set(0, 0, 0);

    const dayAmount = Math.max(0, elev);
    this._nightFactor = 1 - dayAmount;

    this.sun.intensity = 0.15 + dayAmount * 1.25;
    this.sun.color.setRGB(1, 0.92 + dayAmount * 0.05, 0.75 + dayAmount * 0.2);
    this.hemi.intensity = 0.25 + dayAmount * 0.75;
    this.moon.intensity = 0.05 + this._nightFactor * 0.35;
    this.ambientNight.intensity = this._nightFactor * 0.35;

    const dayFog = new THREE.Color(0x9eb6d4);
    const nightFog = new THREE.Color(0x0c0e18);
    const fog = dayFog.clone().lerp(nightFog, this._nightFactor);
    this.scene.fog.color.copy(fog);
    this.renderer.setClearColor(fog, 1);

    if (this._floorMat) {
      const dayFloor = new THREE.Color(0x3a4a3a);
      const nightFloor = new THREE.Color(0x151922);
      this._floorMat.color.copy(dayFloor.lerp(nightFloor, this._nightFactor * 0.85));
    }
  }

  /** 0..1 day phase for HUD */
  getDayPhase() {
    return this._dayPhase;
  }

  getNightFactor() {
    return this._nightFactor;
  }

  _syncBuildings(buildings, agents = []) {
    const ACTIVE = new Set(["working", "shopping", "resting", "relaxing"]);
    const occupiedByAgents = new Set();
    const cellToBuilding = new Map();
    for (const b of buildings) {
      const tiles = Array.isArray(b.tiles) && b.tiles.length ? b.tiles : [[b.x, b.y]];
      for (const t of tiles) {
        cellToBuilding.set(`${t[0]},${t[1]}`, Number(b.id));
      }
    }
    for (const a of agents) {
      const bid = cellToBuilding.get(`${a.x},${a.y}`);
      if (bid == null) continue;
      if (ACTIVE.has(String(a.action || "").toLowerCase())) occupiedByAgents.add(bid);
    }

    const seen = new Set();
    for (const b of buildings) {
      const id = Number(b.id);
      if (!Number.isFinite(id)) continue;
      seen.add(id);

      const type = String(b.type || "home").toLowerCase();
      const tiles = Array.isArray(b.tiles) && b.tiles.length ? b.tiles : [[b.x, b.y]];
      const xs = tiles.map((t) => Number(t[0]));
      const ys = tiles.map((t) => Number(t[1]));
      const minX = Math.min(...xs);
      const maxX = Math.max(...xs);
      const minY = Math.min(...ys);
      const maxY = Math.max(...ys);
      const spanX = Math.max(1, maxX - minX + 1);
      const spanZ = Math.max(1, maxY - minY + 1);
      const homeSize = type === "home" ? Math.max(1, Number(b.size) || tiles.length || 1) : 1;
      const owned = type === "home" && Number(b.owner_id ?? -1) >= 0;
      // Signature: any change → dispose old mesh, create a brand new one
      const sig = `${type}|${homeSize}|${spanX}x${spanZ}|owned:${owned ? 1 : 0}|v${BUILDING_MESH_VERSION}`;

      let group = this.buildings.get(id);
      if (!group || group.userData.sig !== sig) {
        if (group) {
          this.scene.remove(group);
          this._disposeObject(group);
          this.buildings.delete(id);
        }
        group = createBuilding(type, { size: homeSize, spanX, spanZ, owned });
        group.userData.sig = sig;
        group.userData.buildingId = id;
        group.userData.meshVersion = BUILDING_MESH_VERSION;
        group.scale.set(1, 1, 1);
        group.visible = true;
        this.scene.add(group);
        this.buildings.set(id, group);
      }

      const cx = Number.isFinite(Number(b.cx)) ? Number(b.cx) : (minX + maxX) / 2;
      const cy = Number.isFinite(Number(b.cy)) ? Number(b.cy) : (minY + maxY) / 2;
      const { x, z } = this._simToWorld(cx, cy);
      group.position.set(x, 0, z);
      group.scale.set(1, 1, 1);
      group.visible = true;

      const occupied = (b.occupants || 0) > 0 || occupiedByAgents.has(id);
      setBuildingBankruptTint(group, !!b.bankrupt);
      setBuildingLights(group, occupied, !!b.bankrupt, this._nightFactor);
      group.userData.occupied = occupied;
      group.userData.meta = b;
      group.userData.ownerId = b.owner_id ?? -1;
    }

    for (const [id, group] of this.buildings) {
      if (!seen.has(id)) {
        this.scene.remove(group);
        this._disposeObject(group);
        this.buildings.delete(id);
      }
    }
  }

  _syncAgents(agents) {
    const seen = new Set();
    this._latestAgentsById.clear();

    for (const a of agents) {
      seen.add(a.id);
      this._latestAgentsById.set(a.id, a);
      let entry = this.agents.get(a.id);
      const action = (a.action || "idle").toLowerCase();
      const color = AGENT_COLORS[action] || AGENT_COLORS.idle;
      const { x, z } = this._simToWorld(a.x, a.y);
      const hungerFactor = Math.min(1, Math.max(0, (a.hunger || 0) / 100));
      const scale = 0.85 + hungerFactor * 0.2;

      if (!entry) {
        const geo = new THREE.CapsuleGeometry(0.22, 0.35, 4, 8);
        const mat = new THREE.MeshStandardMaterial({
          color,
          roughness: 0.45,
          metalness: 0.2,
          emissive: color,
          emissiveIntensity: 0.18,
        });
        const mesh = new THREE.Mesh(geo, mat);
        mesh.castShadow = true;
        mesh.userData = { kind: "agent", agentId: a.id };
        mesh.position.set(x, 0.45 * scale, z);
        this.scene.add(mesh);
        entry = {
          mesh,
          target: new THREE.Vector3(x, 0.45 * scale, z),
          scale,
        };
        this.agents.set(a.id, entry);
      }

      entry.target.set(x, 0.45 * entry.scale, z);
      entry.scale = scale;
      entry.mesh.material.color.setHex(color);
      entry.mesh.material.emissive.setHex(color);
      entry.mesh.material.emissiveIntensity = a.id === this.selectedAgentId ? 0.55 : 0.18;
      entry.mesh.userData.agent = a;
    }

    for (const [id, entry] of this.agents) {
      if (!seen.has(id)) {
        this.scene.remove(entry.mesh);
        entry.mesh.geometry.dispose();
        entry.mesh.material.dispose();
        this.agents.delete(id);
        if (this.selectedAgentId === id) {
          this.selectedAgentId = null;
          this.onSelectAgent(null);
        }
      }
    }

    if (this.selectedAgentId != null) {
      const a = this._latestAgentsById.get(this.selectedAgentId) || null;
      this.onSelectAgent(a);
    }
  }

  /**
   * Smoothly move agents toward targets; call each frame.
   * @param {number} dt seconds
   */
  update(dt) {
    const alpha = 1 - Math.exp(-12 * dt);
    for (const entry of this.agents.values()) {
      entry.mesh.position.lerp(entry.target, alpha);
      const s = entry.mesh.scale.x + (entry.scale - entry.mesh.scale.x) * alpha;
      entry.mesh.scale.setScalar(s);
      entry.mesh.position.y = 0.45 * s;
    }

    if (this.selectedAgentId != null && this.agents.has(this.selectedAgentId)) {
      const mesh = this.agents.get(this.selectedAgentId).mesh;
      this.selectionMarker.visible = true;
      this.selectionMarker.position.set(mesh.position.x, 0.05, mesh.position.z);
      this.selectionMarker.rotation.z += dt * 1.5;
    } else {
      this.selectionMarker.visible = false;
    }
  }

  _onPointerDown(event) {
    if (event.button !== 0) return;
    const rect = this.renderer.domElement.getBoundingClientRect();
    this.pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    this.pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
    this.raycaster.setFromCamera(this.pointer, this.camera);

    const meshes = [...this.agents.values()].map((e) => e.mesh);
    const hits = this.raycaster.intersectObjects(meshes, false);
    if (hits.length > 0) {
      const id = hits[0].object.userData.agentId;
      this.selectAgent(id);
      event.stopPropagation();
    } else {
      this.selectAgent(null);
    }
  }

  selectAgent(id) {
    this.selectedAgentId = id;
    for (const [aid, entry] of this.agents) {
      entry.mesh.material.emissiveIntensity = aid === id ? 0.55 : 0.18;
    }
    const agent = id != null ? this._latestAgentsById.get(id) || null : null;
    this.onSelectAgent(agent);
  }

  _disposeObject(root) {
    root.traverse((obj) => {
      if (obj.geometry) obj.geometry.dispose();
      if (obj.material) {
        if (Array.isArray(obj.material)) obj.material.forEach((m) => m.dispose());
        else obj.material.dispose();
      }
    });
  }

  _onResize() {
    const w = this.container.clientWidth;
    const h = Math.max(this.container.clientHeight, 1);
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(w, h);
  }

  render() {
    this.controls.update();
    this.renderer.render(this.scene, this.camera);
  }

  dispose() {
    window.removeEventListener("resize", this._onResizeBound);
    this.renderer.domElement.removeEventListener(
      "pointerdown",
      this._onPointerDownBound,
    );
    for (const entry of this.agents.values()) {
      this.scene.remove(entry.mesh);
      entry.mesh.geometry.dispose();
      entry.mesh.material.dispose();
    }
    this.agents.clear();
    for (const group of this.buildings.values()) {
      this.scene.remove(group);
      this._disposeObject(group);
    }
    this.buildings.clear();
    if (this._groundRoot) {
      this.scene.remove(this._groundRoot);
      this._disposeObject(this._groundRoot);
      this._groundRoot = null;
    }
    if (this.selectionMarker) {
      this.scene.remove(this.selectionMarker);
      this._disposeObject(this.selectionMarker);
    }
    this.controls.dispose();
    this.renderer.dispose();
    if (this.renderer.domElement.parentNode) {
      this.renderer.domElement.parentNode.removeChild(this.renderer.domElement);
    }
  }
}
