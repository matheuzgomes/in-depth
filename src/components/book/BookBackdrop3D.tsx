"use client"

import { useEffect, useRef } from "react"
import * as THREE from "three"

export function BookBackdrop3D() {
  const mountRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    const mount = mountRef.current
    if (!mount) return

    const scene = new THREE.Scene()
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1)
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.setSize(mount.clientWidth, mount.clientHeight)
    mount.appendChild(renderer.domElement)

    const uniforms = {
      uTime: { value: 0 },
      uPointer: { value: new THREE.Vector2(0.5, 0.5) },
      uResolution: { value: new THREE.Vector2(mount.clientWidth, mount.clientHeight) },
    }

    const material = new THREE.ShaderMaterial({
      transparent: true,
      uniforms,
      vertexShader: `
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        precision highp float;

        uniform float uTime;
        uniform vec2 uPointer;
        uniform vec2 uResolution;
        varying vec2 vUv;

        float hash(vec2 p) {
          return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
        }

        float noise(vec2 p) {
          vec2 i = floor(p);
          vec2 f = fract(p);
          float a = hash(i);
          float b = hash(i + vec2(1.0, 0.0));
          float c = hash(i + vec2(0.0, 1.0));
          float d = hash(i + vec2(1.0, 1.0));
          vec2 u = f * f * (3.0 - 2.0 * f);
          return mix(a, b, u.x) + (c - a) * u.y * (1.0 - u.x) + (d - b) * u.x * u.y;
        }

        void main() {
          vec2 uv = vUv;
          vec2 centered = uv - 0.5;
          float t = uTime * 0.035;

          float grain = noise(uv * 18.0 + t) * 0.035;
          float glowA = 0.18 / (1.0 + 18.0 * length(centered - vec2(-0.18, 0.14) - (uPointer - 0.5) * 0.06));
          float glowB = 0.12 / (1.0 + 22.0 * length(centered - vec2(0.24, -0.18) + (uPointer - 0.5) * 0.04));
          vec3 base = vec3(0.04, 0.04, 0.055);
          vec3 purple = vec3(0.66, 0.61, 0.96) * glowA;
          vec3 teal = vec3(0.37, 0.79, 0.63) * glowB;
          vec3 color = base + purple + teal + vec3(grain);
          float vignette = smoothstep(0.95, 0.25, length(centered));
          color *= mix(0.72, 1.0, vignette);
          gl_FragColor = vec4(color, 0.95);
        }
      `,
    })

    const mesh = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), material)
    scene.add(mesh)

    let frame = 0
    const clock = new THREE.Clock()

    const onMove = (event: PointerEvent) => {
      const rect = mount.getBoundingClientRect()
      const x = (event.clientX - rect.left) / rect.width
      const y = 1 - (event.clientY - rect.top) / rect.height
      uniforms.uPointer.value.set(x, y)
    }

    const onResize = () => {
      if (!mount) return
      renderer.setSize(mount.clientWidth, mount.clientHeight)
      uniforms.uResolution.value.set(mount.clientWidth, mount.clientHeight)
    }

    const render = () => {
      uniforms.uTime.value = clock.getElapsedTime()
      renderer.render(scene, camera)
      frame = requestAnimationFrame(render)
    }

    mount.addEventListener("pointermove", onMove)
    window.addEventListener("resize", onResize)
    render()

    return () => {
      cancelAnimationFrame(frame)
      mount.removeEventListener("pointermove", onMove)
      window.removeEventListener("resize", onResize)
      renderer.dispose()
      material.dispose()
      mesh.geometry.dispose()
      if (renderer.domElement.parentNode === mount) {
        mount.removeChild(renderer.domElement)
      }
    }
  }, [])

  return <div aria-hidden="true" className="book-backdrop-canvas" ref={mountRef} />
}
