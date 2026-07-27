"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";

export function Atmosphere() {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      55,
      mount.clientWidth / mount.clientHeight,
      0.1,
      100,
    );
    camera.position.z = 4.2;

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(mount.clientWidth, mount.clientHeight);
    mount.appendChild(renderer.domElement);

    const count = 120;
    const positions = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 8;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 5;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 3;
    }
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    const material = new THREE.PointsMaterial({
      color: new THREE.Color("#b8956a"),
      size: 0.025,
      transparent: true,
      opacity: 0.55,
      depthWrite: false,
    });
    const points = new THREE.Points(geometry, material);
    scene.add(points);

    const soft = new THREE.Mesh(
      new THREE.SphereGeometry(1.6, 48, 48),
      new THREE.MeshBasicMaterial({
        color: new THREE.Color("#d4b896"),
        transparent: true,
        opacity: 0.06,
      }),
    );
    soft.position.set(1.4, 0.2, -1);
    scene.add(soft);

    let frame = 0;
    let raf = 0;
    const animate = () => {
      frame += 0.003;
      points.rotation.y = frame * 0.35;
      points.rotation.x = Math.sin(frame) * 0.08;
      soft.position.y = Math.sin(frame * 0.8) * 0.15;
      renderer.render(scene, camera);
      raf = requestAnimationFrame(animate);
    };
    animate();

    const onResize = () => {
      if (!mount) return;
      camera.aspect = mount.clientWidth / mount.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(mount.clientWidth, mount.clientHeight);
    };
    window.addEventListener("resize", onResize);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", onResize);
      geometry.dispose();
      material.dispose();
      soft.geometry.dispose();
      (soft.material as THREE.Material).dispose();
      renderer.dispose();
      if (renderer.domElement.parentNode === mount) {
        mount.removeChild(renderer.domElement);
      }
    };
  }, []);

  return (
    <div
      ref={mountRef}
      className="pointer-events-none absolute inset-0 opacity-70"
      aria-hidden
    />
  );
}
