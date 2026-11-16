'use client';

import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { paperAudio } from '@/lib/paperAudio';

gsap.registerPlugin(ScrollTrigger);

interface PaperTearScrollProps {
  containerRef: React.RefObject<HTMLDivElement | null>;
}

export default function PaperTearScrollScene({ containerRef }: PaperTearScrollProps) {
  const mountRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!mountRef.current || !containerRef.current) return;

    const width = window.innerWidth;
    const height = window.innerHeight;

    // 1. Scene, Camera, Renderer
    const scene = new THREE.Scene();
    scene.background = null; // transparent to show deep matte black background underneath

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, 0, 7.5);

    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      powerPreference: 'high-performance',
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFShadowMap;
    mountRef.current.appendChild(renderer.domElement);

    // 2. Lighting - Cinematic Warm Highlights & Deep Contact Shadows
    const ambientLight = new THREE.AmbientLight(0xfffae0, 1.2);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xfff1aa, 2.5);
    dirLight.position.set(5, 8, 6);
    dirLight.castShadow = true;
    dirLight.shadow.mapSize.width = 1024;
    dirLight.shadow.mapSize.height = 1024;
    dirLight.shadow.bias = -0.001;
    scene.add(dirLight);

    const rimLight = new THREE.DirectionalLight(0xc68a12, 1.6);
    rimLight.position.set(-6, -4, 4);
    scene.add(rimLight);

    // 3. Procedural Realistic Paper Texture (Fibers, Noise & Roughness)
    const textureCanvas = document.createElement('canvas');
    textureCanvas.width = 1024;
    textureCanvas.height = 1024;
    const ctx = textureCanvas.getContext('2d');
    if (ctx) {
      // Golden Ochre Base gradient
      const grad = ctx.createLinearGradient(0, 0, 1024, 1024);
      grad.addColorStop(0, '#e5a51c');
      grad.addColorStop(0.35, '#d49618');
      grad.addColorStop(0.7, '#c68913');
      grad.addColorStop(1, '#a66e0b');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 1024, 1024);

      // Paper fiber noise
      const imgData = ctx.getImageData(0, 0, 1024, 1024);
      const data = imgData.data;
      for (let i = 0; i < data.length; i += 4) {
        const noise = (Math.random() - 0.5) * 38;
        data[i] = Math.min(255, Math.max(0, data[i] + noise));
        data[i + 1] = Math.min(255, Math.max(0, data[i + 1] + noise * 0.9));
        data[i + 2] = Math.min(255, Math.max(0, data[i + 2] + noise * 0.5));
      }
      ctx.putImageData(imgData, 0, 0);

      // Fine fiber strands
      ctx.strokeStyle = 'rgba(255, 230, 150, 0.15)';
      ctx.lineWidth = 1;
      for (let f = 0; f < 300; f++) {
        ctx.beginPath();
        const sx = Math.random() * 1024;
        const sy = Math.random() * 1024;
        ctx.moveTo(sx, sy);
        ctx.lineTo(sx + (Math.random() - 0.5) * 20, sy + (Math.random() - 0.5) * 20);
        ctx.stroke();
      }
    }

    const paperTexture = new THREE.CanvasTexture(textureCanvas);
    paperTexture.wrapS = THREE.RepeatWrapping;
    paperTexture.wrapT = THREE.RepeatWrapping;
    paperTexture.repeat.set(2, 2);

    // 4. Mesh Creation: Two Subdivided Deformable Halves (Left & Right)
    // Extra tall (8.5 height) and wide (6.8 width) so it 100% covers viewport edges and top navbar
    const planeWidth = 6.8;
    const planeHeight = 8.8;
    const segmentsX = 64;
    const segmentsY = 72;

    const leftGeo = new THREE.PlaneGeometry(planeWidth, planeHeight, segmentsX, segmentsY);
    const rightGeo = new THREE.PlaneGeometry(planeWidth, planeHeight, segmentsX, segmentsY);

    // Generate Natural Jagged/Rough Torn Deckle Edge along center tear boundary
    const applyTornEdgeDisplacement = (geo: THREE.PlaneGeometry, isLeft: boolean) => {
      const pos = geo.attributes.position;
      for (let i = 0; i < pos.count; i++) {
        const x = pos.getX(i);
        const y = pos.getY(i);
        const u = isLeft ? (x + planeWidth / 2) / planeWidth : (planeWidth / 2 - x) / planeWidth;

        // Along the torn seam (where u is close to 1 for left half, or near left boundary for right half)
        const edgeFactor = isLeft ? Math.max(0, (x / (planeWidth / 2))) : Math.max(0, (-x / (planeWidth / 2)));
        
        // Multi-frequency noise for deckle paper tear
        const tearNoise =
          Math.sin(y * 4.5) * 0.14 +
          Math.sin(y * 11.2) * 0.07 +
          Math.cos(y * 24.0) * 0.035 +
          Math.sin(y * 42.0) * 0.015;

        // Fiber depth variations
        const fiberRoughness = (Math.random() - 0.5) * 0.025;

        if (isLeft) {
          pos.setX(i, x + tearNoise * Math.pow(edgeFactor, 2.5) + fiberRoughness);
        } else {
          pos.setX(i, x - tearNoise * Math.pow(edgeFactor, 2.5) + fiberRoughness);
        }

        // Slight paper warp
        pos.setZ(i, Math.sin(y * 2.0 + x * 2.0) * 0.02);
      }
      geo.computeVertexNormals();
    };

    applyTornEdgeDisplacement(leftGeo, true);
    applyTornEdgeDisplacement(rightGeo, false);

    // Store base positions for dynamic curl & bend deformation in vertex space
    const leftOrigPos = leftGeo.attributes.position.clone();
    const rightOrigPos = rightGeo.attributes.position.clone();

    // Material with Realistic Roughness, Paper Backside & DoubleSided lighting
    const paperMat = new THREE.MeshStandardMaterial({
      map: paperTexture,
      roughness: 0.82,
      metalness: 0.08,
      bumpMap: paperTexture,
      bumpScale: 0.03,
      side: THREE.DoubleSide,
    });

    const leftPaperMesh = new THREE.Mesh(leftGeo, paperMat);
    leftPaperMesh.position.set(-planeWidth / 2 + 0.15, 0, 0);
    leftPaperMesh.castShadow = true;
    leftPaperMesh.receiveShadow = true;
    scene.add(leftPaperMesh);

    const rightPaperMesh = new THREE.Mesh(rightGeo, paperMat);
    rightPaperMesh.position.set(planeWidth / 2 - 0.15, 0, 0.04); // subtle layer offset like reference
    rightPaperMesh.castShadow = true;
    rightPaperMesh.receiveShadow = true;
    scene.add(rightPaperMesh);

    // Secondary Underneath Golden Layer Piece (revealed in lower-right as in reference image)
    const underGeo = new THREE.PlaneGeometry(3.5, 4.5, 24, 24);
    const underMat = new THREE.MeshStandardMaterial({
      color: 0xd69614,
      roughness: 0.75,
      metalness: 0.1,
      side: THREE.DoubleSide,
    });
    const underMesh = new THREE.Mesh(underGeo, underMat);
    underMesh.position.set(2.0, -1.8, -0.15);
    underMesh.rotation.set(0.1, -0.2, 0.45);
    scene.add(underMesh);

    // 5. GSAP ScrollTrigger Physical Paper-Tear Animation Driver
    const tearProgress = { val: 0 };

    const updatePaperDeformation = (p: number) => {
      // 1. Mesh Positions and rotations
      // Outward separation
      leftPaperMesh.position.x = -planeWidth / 2 + 0.15 - p * 6.5;
      leftPaperMesh.position.z = p * 1.8;
      leftPaperMesh.rotation.y = p * 0.45;
      leftPaperMesh.rotation.z = p * 0.22;

      rightPaperMesh.position.x = planeWidth / 2 - 0.15 + p * 6.8;
      rightPaperMesh.position.z = p * 2.1;
      rightPaperMesh.rotation.y = -p * 0.52;
      rightPaperMesh.rotation.z = -p * 0.28;

      // Underneath layer moves away organically
      underMesh.position.x = 2.0 + p * 4.5;
      underMesh.position.y = -1.8 - p * 3.0;
      underMesh.rotation.z = 0.45 - p * 0.6;
      underMesh.scale.setScalar(1 - p * 0.5);

      // 2. Vertex-Level Dynamic Bending & Edge Curling
      const lPos = leftGeo.attributes.position;
      const rPos = rightGeo.attributes.position;

      for (let i = 0; i < lPos.count; i++) {
        const ox = leftOrigPos.getX(i);
        const oy = leftOrigPos.getY(i);
        // Distance toward torn edge (right side of left paper)
        const edgeDist = Math.max(0, (ox + planeWidth / 2) / planeWidth);
        const curlAmount = Math.pow(edgeDist, 2.2) * p * 1.6;
        
        // Curl outward toward camera and roll inward
        lPos.setZ(i, curlAmount * Math.cos(edgeDist * Math.PI));
        lPos.setX(i, ox - curlAmount * 0.45);
      }
      leftGeo.computeVertexNormals();
      lPos.needsUpdate = true;

      for (let i = 0; i < rPos.count; i++) {
        const ox = rightOrigPos.getX(i);
        const oy = rightOrigPos.getY(i);
        // Distance toward torn edge (left side of right paper)
        const edgeDist = Math.max(0, (planeWidth / 2 - ox) / planeWidth);
        const curlAmount = Math.pow(edgeDist, 2.2) * p * 1.8;

        rPos.setZ(i, curlAmount * Math.sin(edgeDist * Math.PI * 1.2));
        rPos.setX(i, ox + curlAmount * 0.5);
      }
      rightGeo.computeVertexNormals();
      rPos.needsUpdate = true;
    };

    // ScrollTrigger connects scroll directly to tearing progress + tearing sound
    let lastP = 0;
    const scrollTrigger = ScrollTrigger.create({
      trigger: containerRef.current,
      start: 'top top',
      end: '+=160%',
      pin: true,
      scrub: true,
      anticipatePin: 1,
      onUpdate: (self) => {
        tearProgress.val = self.progress;
        updatePaperDeformation(self.progress);

        // Calculate scroll delta velocity for audio crunch
        const delta = Math.abs(self.progress - lastP);
        if (delta > 0.0003 && self.progress < 0.98) {
          paperAudio.playTearGrain(Math.min(3.5, delta * 150));
        }
        lastP = self.progress;
      },
    });

    // 6. Continuous Gentle Organic Breeze Idling when near top (p < 0.15)
    let startTime = performance.now();
    let animId: number;

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const elapsed = (performance.now() - startTime) * 0.001;

      // Subtle breathing motion when resting
      if (tearProgress.val < 0.15) {
        const idleAmount = (1 - tearProgress.val / 0.15);
        leftPaperMesh.rotation.z = (Math.sin(elapsed * 0.8) * 0.012) * idleAmount;
        rightPaperMesh.rotation.z = (-0.02 + Math.cos(elapsed * 0.9) * 0.015) * idleAmount;
        dirLight.position.x = 5 + Math.sin(elapsed * 0.5) * 0.5;
      }

      renderer.render(scene, camera);
    };
    animate();

    // 7. Responsive Window Resize Handler
    const handleResize = () => {
      const newWidth = window.innerWidth;
      const newHeight = window.innerHeight;
      camera.aspect = newWidth / newHeight;
      // Responsive dynamic camera distance for Mobile, Tablet and Desktop
      // Closer camera ensures paper covers full edges up to top navbar
      if (newWidth < 640) {
        camera.position.z = 9.2;
      } else if (newWidth < 1024) {
        camera.position.z = 7.5;
      } else {
        camera.position.z = 6.2;
      }
      camera.updateProjectionMatrix();
      renderer.setSize(newWidth, newHeight);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    };

    window.addEventListener('resize', handleResize);
    handleResize();

    // Refresh ScrollTrigger to ensure correct pin coordinates on route change
    ScrollTrigger.refresh();

    // 8. Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animId);
      scrollTrigger.kill();
      renderer.dispose();
      leftGeo.dispose();
      rightGeo.dispose();
      underGeo.dispose();
      paperMat.dispose();
      underMat.dispose();
      paperTexture.dispose();
      if (mountRef.current && renderer.domElement) {
        mountRef.current.removeChild(renderer.domElement);
      }
    };
  }, [containerRef]);

  return (
    <div
      ref={mountRef}
      className="absolute inset-0 w-full h-full pointer-events-none z-30"
      aria-hidden="true"
    />
  );
}

