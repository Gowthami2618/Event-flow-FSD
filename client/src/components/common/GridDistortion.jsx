import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

const vertexShader = `
uniform float time;
varying vec2 vUv;
varying vec3 vPosition;

void main() {
  vUv = uv;
  vPosition = position;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

const fragmentShader = `
uniform sampler2D uDataTexture;
uniform sampler2D uTexture;
uniform vec4 resolution;
varying vec2 vUv;

void main() {
  vec2 uv = vUv;
  vec4 offset = texture2D(uDataTexture, vUv);
  gl_FragColor = texture2D(uTexture, uv - 0.02 * offset.rg);
}
`;

const GridDistortion = ({
  grid = 10,
  mouse = 0.25,
  strength = 0.15,
  relaxation = 0.9,
  imageSrc = 'https://picsum.photos/1920/1080?grayscale',
  className = '',
  style = {},
}) => {
  const containerRef = useRef(null);
  const sceneRef = useRef(null);
  const rendererRef = useRef(null);
  const cameraRef = useRef(null);
  const meshRef = useRef(null);
  const aspectRef = useRef(1);
  const animationFrameRef = useRef(null);
  const resizeObserverRef = useRef(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const scene = new THREE.Scene();
    sceneRef.current = scene;

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance',
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0);
    rendererRef.current = renderer;

    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    const camera = new THREE.OrthographicCamera(0, 0, 0, 0, -1000, 1000);
    camera.position.z = 2;
    cameraRef.current = camera;

    const uniforms = {
      time: { value: 0 },
      resolution: { value: new THREE.Vector4() },
      uTexture: { value: null },
      uDataTexture: { value: null },
    };

    // Load Image Texture
    const loader = new THREE.TextureLoader();
    loader.setCrossOrigin('anonymous');
    loader.load(
      imageSrc,
      (texture) => {
        texture.minFilter = THREE.LinearFilter;
        texture.magFilter = THREE.LinearFilter;
        texture.wrapS = THREE.ClampToEdgeWrapping;
        texture.wrapT = THREE.ClampToEdgeWrapping;
        aspectRef.current = texture.image.width / texture.image.height;
        uniforms.uTexture.value = texture;
        handleResize();
      },
      undefined,
      () => {
        // Fallback procedural canvas texture if remote image fails
        const canvas = document.createElement('canvas');
        canvas.width = 1920;
        canvas.height = 1080;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          const grad = ctx.createLinearGradient(0, 0, 1920, 1080);
          grad.addColorStop(0, '#1c1817');
          grad.addColorStop(0.5, '#2e2625');
          grad.addColorStop(1, '#181413');
          ctx.fillStyle = grad;
          ctx.fillRect(0, 0, 1920, 1080);
          const fallbackTex = new THREE.CanvasTexture(canvas);
          uniforms.uTexture.value = fallbackTex;
          handleResize();
        }
      }
    );

    const size = grid;
    const data = new Float32Array(4 * size * size);
    for (let i = 0; i < size * size; i++) {
      data[i * 4] = Math.random() * 255 - 125;
      data[i * 4 + 1] = Math.random() * 255 - 125;
      data[i * 4 + 2] = 0;
      data[i * 4 + 3] = 1;
    }

    const dataTexture = new THREE.DataTexture(
      data,
      size,
      size,
      THREE.RGBAFormat,
      THREE.FloatType
    );
    dataTexture.needsUpdate = true;
    uniforms.uDataTexture.value = dataTexture;

    const material = new THREE.ShaderMaterial({
      side: THREE.DoubleSide,
      uniforms,
      vertexShader,
      fragmentShader,
      transparent: true,
    });

    const geometry = new THREE.PlaneGeometry(1, 1, size - 1, size - 1);
    const mesh = new THREE.Mesh(geometry, material);
    meshRef.current = mesh;
    scene.add(mesh);

    const handleResize = () => {
      if (!container || !renderer || !camera) return;
      const rect = container.getBoundingClientRect();
      const width = rect.width || window.innerWidth;
      const height = rect.height || window.innerHeight;
      if (width === 0 || height === 0) return;

      const aspect = width / height;
      renderer.setSize(width, height, false);

      if (mesh) {
        mesh.scale.set(aspect, 1, 1);
      }

      const frustumHeight = 1;
      const frustumWidth = frustumHeight * aspect;
      camera.left = -frustumWidth / 2;
      camera.right = frustumWidth / 2;
      camera.top = frustumHeight / 2;
      camera.bottom = -frustumHeight / 2;
      camera.updateProjectionMatrix();

      uniforms.resolution.value.set(width, height, 1, 1);
    };

    if (window.ResizeObserver) {
      const ro = new ResizeObserver(() => handleResize());
      ro.observe(container);
      resizeObserverRef.current = ro;
    } else {
      window.addEventListener('resize', handleResize);
    }

    const mouseState = {
      x: 0,
      y: 0,
      prevX: 0,
      prevY: 0,
      vX: 0,
      vY: 0,
    };

    const handleMouseMove = (e) => {
      const rect = container.getBoundingClientRect();
      const width = rect.width || window.innerWidth;
      const height = rect.height || window.innerHeight;
      const x = (e.clientX - rect.left) / width;
      const y = 1 - (e.clientY - rect.top) / height;

      mouseState.vX = x - mouseState.prevX;
      mouseState.vY = y - mouseState.prevY;
      Object.assign(mouseState, {
        x,
        y,
        prevX: x,
        prevY: y,
      });
    };

    const handleMouseLeave = () => {
      if (dataTexture) dataTexture.needsUpdate = true;
      Object.assign(mouseState, {
        x: 0,
        y: 0,
        prevX: 0,
        prevY: 0,
        vX: 0,
        vY: 0,
      });
    };

    container.addEventListener('mousemove', handleMouseMove);
    container.addEventListener('mouseleave', handleMouseLeave);
    window.addEventListener('mousemove', handleMouseMove, { passive: true });

    handleResize();

    const animate = () => {
      animationFrameRef.current = requestAnimationFrame(animate);
      if (!renderer || !scene || !camera) return;

      uniforms.time.value += 0.05;
      const d = dataTexture.image.data;

      for (let i = 0; i < size * size; i++) {
        d[i * 4] *= relaxation;
        d[i * 4 + 1] *= relaxation;
      }

      const gridX = size * mouseState.x;
      const gridY = size * mouseState.y;
      const radius = size * mouse;

      for (let r = 0; r < size; r++) {
        for (let m = 0; m < size; m++) {
          const distSq = Math.pow(gridX - r, 2) + Math.pow(gridY - m, 2);
          if (distSq < radius * radius) {
            const index = 4 * (r + size * m);
            const factor = Math.min(radius / Math.sqrt(distSq || 0.001), 10);
            d[index] += strength * 100 * mouseState.vX * factor;
            d[index + 1] -= strength * 100 * mouseState.vY * factor;
          }
        }
      }

      dataTexture.needsUpdate = true;
      renderer.render(scene, camera);
    };

    animate();

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      if (resizeObserverRef.current) {
        resizeObserverRef.current.disconnect();
      } else {
        window.removeEventListener('resize', handleResize);
      }

      container.removeEventListener('mousemove', handleMouseMove);
      container.removeEventListener('mouseleave', handleMouseLeave);
      window.removeEventListener('mousemove', handleMouseMove);

      if (renderer) {
        renderer.dispose();
        renderer.forceContextLoss();
        if (container.contains(renderer.domElement)) {
          container.removeChild(renderer.domElement);
        }
      }

      if (geometry) geometry.dispose();
      if (material) material.dispose();
      if (dataTexture) dataTexture.dispose();
      if (uniforms.uTexture.value) uniforms.uTexture.value.dispose();

      sceneRef.current = null;
      rendererRef.current = null;
      cameraRef.current = null;
      meshRef.current = null;
    };
  }, [grid, mouse, strength, relaxation, imageSrc]);

  return (
    <div
      ref={containerRef}
      className={`distortion-container ${className}`}
      style={{
        width: '100%',
        height: '100%',
        minWidth: 0,
        minHeight: 0,
        overflow: 'hidden',
        ...style,
      }}
    />
  );
};

export default GridDistortion;
