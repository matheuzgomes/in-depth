"use client"

import { useEffect, useMemo, useRef } from "react"
import * as THREE from "three"

export type BookPaletteKey = "core" | "performance" | "async" | "production"
type ScenePhase = "closed" | "opening" | "open" | "closing"

interface BookAnimationSceneProps {
  className?: string
  phase: ScenePhase
  paletteKey: BookPaletteKey
  flipSignal?: number
  onOpened?: () => void
  onClosed?: () => void
  onFlipComplete?: () => void
}

const PAGE_PALETTES: Record<BookPaletteKey, [string, string, string]> = {
  core: ["#3a2d88", "#0d4f3c", "#5a3000"],
  performance: ["#5a2d00", "#3d1a00", "#2d0a40"],
  async: ["#0a2a50", "#0d3d50", "#1a0a50"],
  production: ["#3d0a0a", "#1a0a2a", "#0a2a1a"],
}

class Spring {
  stiffness: number
  damping: number
  position: number
  velocity: number
  target: number

  constructor(stiffness = 120, damping = 14) {
    this.stiffness = stiffness
    this.damping = damping
    this.position = 0
    this.velocity = 0
    this.target = 0
  }

  update(dt: number) {
    const f = -this.stiffness * (this.position - this.target)
    const fd = -this.damping * this.velocity
    this.velocity += (f + fd) * dt
    this.position += this.velocity * dt
    return this.position
  }
}

export function BookAnimationScene({
  className,
  phase,
  paletteKey,
  flipSignal = 0,
  onOpened,
  onClosed,
  onFlipComplete,
}: BookAnimationSceneProps) {
  const mountRef = useRef<HTMLDivElement | null>(null)
  const runtimeRef = useRef<{
    mixer: THREE.AnimationMixer
    openClip: THREE.AnimationClip
    openAction: THREE.AnimationAction
    closeAction: THREE.AnimationAction
    flipAction: THREE.AnimationAction
    idleAction: THREE.AnimationAction
    pageMat: THREE.ShaderMaterial
    pageLeft: THREE.Mesh
    pageRight: THREE.Mesh
    cover: THREE.Mesh
    back: THREE.Mesh
    clock: THREE.Clock
    renderer: THREE.WebGLRenderer
    scene: THREE.Scene
    camera: THREE.PerspectiveCamera
    frame: number
    settleSpring: Spring | null
    settleTime: number
    setPageVisibility: (visible: boolean) => void
    applyPalette: (key: BookPaletteKey) => void
    runOpen: () => void
    runClose: () => void
    runFlip: () => void
  } | null>(null)

  const callbacksRef = useRef({ onOpened, onClosed, onFlipComplete })
  useEffect(() => {
    callbacksRef.current = { onOpened, onClosed, onFlipComplete }
  }, [onOpened, onClosed, onFlipComplete])

  const mobile = useMemo(() => {
    if (typeof window === "undefined") return false
    return window.innerWidth < 768
  }, [])

  useEffect(() => {
    const mount = mountRef.current
    if (!mount) return

    const isMobile = mobile
    const clock = new THREE.Clock()
    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(45, mount.clientWidth / mount.clientHeight, 0.1, 100)
    camera.position.set(0, 0, 5)

    const renderer = new THREE.WebGLRenderer({ antialias: !isMobile, alpha: true, powerPreference: "high-performance" })
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, isMobile ? 1.1 : 1.5))
    renderer.outputColorSpace = THREE.SRGBColorSpace
    renderer.setSize(mount.clientWidth, mount.clientHeight)
    mount.appendChild(renderer.domElement)

    const bookGroup = new THREE.Group()
    bookGroup.name = "bookGroup"
    scene.add(bookGroup)

    const coverGeo = new THREE.PlaneGeometry(2.4, 3.2)
    coverGeo.translate(1.2, 0, 0)

    const pageRightGeo = new THREE.PlaneGeometry(2.35, 3.15)
    pageRightGeo.translate(1.175, 0, 0)

    const pageLeftGeo = new THREE.PlaneGeometry(2.35, 3.15)
    const backGeo = new THREE.PlaneGeometry(2.4, 3.2)

    const coverMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color("#17151f"),
      roughness: 0.9,
      metalness: 0.05,
      side: THREE.DoubleSide,
    })

    const fbmOctaves = isMobile ? 3 : 5
    const pageMat = new THREE.ShaderMaterial({
      uniforms: {
        uTime: { value: 0 },
        uResolution: { value: new THREE.Vector2(mount.clientWidth, mount.clientHeight) },
        uColor1: { value: new THREE.Color(PAGE_PALETTES.core[0]) },
        uColor2: { value: new THREE.Color(PAGE_PALETTES.core[1]) },
        uColor3: { value: new THREE.Color(PAGE_PALETTES.core[2]) },
        uSpeed: { value: isMobile ? 0.14 : 0.22 },
        uIntensity: { value: 0.30 },
        uFoldShadow: { value: 0 },
      },
      defines: {
        FBM_OCTAVES: fbmOctaves,
      },
      vertexShader: `
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform float  uTime;
        uniform vec2   uResolution;
        uniform vec3   uColor1;
        uniform vec3   uColor2;
        uniform vec3   uColor3;
        uniform float  uSpeed;
        uniform float  uIntensity;
        uniform float  uFoldShadow;
        varying vec2 vUv;

        vec2 hash(vec2 p) {
          p = vec2(dot(p, vec2(127.1, 311.7)),
                   dot(p, vec2(269.5, 183.3)));
          return -1.0 + 2.0 * fract(sin(p) * 43758.5453123);
        }
        float noise(vec2 p) {
          vec2 i = floor(p);
          vec2 f = fract(p);
          vec2 u = f * f * (3.0 - 2.0 * f);
          return mix(
            mix(dot(hash(i + vec2(0,0)), f - vec2(0,0)),
                dot(hash(i + vec2(1,0)), f - vec2(1,0)), u.x),
            mix(dot(hash(i + vec2(0,1)), f - vec2(0,1)),
                dot(hash(i + vec2(1,1)), f - vec2(1,1)), u.x), u.y);
        }
        float fbm(vec2 p) {
          float v = 0.0, a = 0.5;
          mat2 rot = mat2(cos(0.5), sin(0.5), -sin(0.5), cos(0.5));
          for (int i = 0; i < FBM_OCTAVES; i++) {
            v += a * noise(p);
            p  = rot * p * 2.0 + vec2(0.3, 0.7);
            a *= 0.5;
          }
          return v;
        }
        void main() {
          vec2 uv = vUv;
          float t = uTime * uSpeed;
          vec2 q = vec2(fbm(uv + t), fbm(uv + vec2(1.0)));
          vec2 r = vec2(fbm(uv + 4.0 * q + vec2(1.7, 9.2) + 0.15 * t),
                        fbm(uv + 4.0 * q + vec2(8.3, 2.8) + 0.126 * t));
          float n = fbm(uv + 4.0 * r);
          vec3 col = mix(uColor1, uColor2, clamp(n * 2.0, 0.0, 1.0));
          col = mix(col, uColor3, clamp((n - 0.5) * 2.0, 0.0, 1.0));
          col *= uIntensity;
          float vig = 1.0 - smoothstep(0.4, 0.9, length(uv - 0.5) * 1.6);
          col *= vig;
          float shadow = 1.0 - uFoldShadow * smoothstep(0.4, 1.0, vUv.x);
          col *= shadow;
          gl_FragColor = vec4(col, 1.0);
        }
      `,
      side: THREE.DoubleSide,
    })

    const back = new THREE.Mesh(backGeo, coverMat)
    back.name = "back"
    back.position.z = -0.03

    const pageLeft = new THREE.Mesh(pageLeftGeo, pageMat)
    pageLeft.name = "pageLeft"
    pageLeft.position.x = -1.18
    pageLeft.position.z = -0.01

    const pageRight = new THREE.Mesh(pageRightGeo, pageMat)
    pageRight.name = "pageRight"
    pageRight.position.x = 0.0
    pageRight.position.z = -0.01

    const cover = new THREE.Mesh(coverGeo, coverMat)
    cover.name = "cover"
    cover.position.x = -1.2
    cover.position.z = 0.02

    back.visible = false
    pageLeft.visible = false
    pageRight.visible = false

    bookGroup.add(back, pageLeft, pageRight, cover)

    const keyLight = new THREE.DirectionalLight(0xffffff, 0.95)
    keyLight.position.set(1.5, 2.2, 2.5)
    scene.add(keyLight)
    const fillLight = new THREE.DirectionalLight(0x9f8cff, 0.45)
    fillLight.position.set(-2.2, -0.6, 2.0)
    scene.add(fillLight)
    scene.add(new THREE.AmbientLight(0xffffff, 0.22))

    const mixer = new THREE.AnimationMixer(bookGroup)

    const qClosed = new THREE.Quaternion().setFromEuler(new THREE.Euler(0, 0, 0))
    const qOpen = new THREE.Quaternion().setFromEuler(new THREE.Euler(0, -Math.PI, 0))

    const rotationTrack = new THREE.QuaternionKeyframeTrack("cover.quaternion", [0, 0.2, 0.8, 1.0], [
      ...qClosed.toArray(),
      ...qClosed.toArray(),
      ...qOpen.toArray(),
      ...qOpen.toArray(),
    ])

    const liftTrack = new THREE.VectorKeyframeTrack("bookGroup.position", [0, 0.15, 0.3, 1.0], [
      0, 0, 0,
      0, 0, 0.4,
      0, 0, 0.4,
      0, 0, 0,
    ])
    liftTrack.setInterpolation(THREE.InterpolateSmooth)

    const scaleTrack = new THREE.VectorKeyframeTrack("bookGroup.scale", [0, 0.1, 0.25, 1.0], [
      1, 1, 1,
      1.04, 1.04, 1.04,
      1.04, 1.04, 1.04,
      1, 1, 1,
    ])
    scaleTrack.setInterpolation(THREE.InterpolateSmooth)

    const openClip = new THREE.AnimationClip("book-open", 1.2, [rotationTrack, liftTrack, scaleTrack])
    openClip.optimize()
    const openAction = mixer.clipAction(openClip)
    const closeAction = mixer.clipAction(openClip)

    const qPageFlat = new THREE.Quaternion().setFromEuler(new THREE.Euler(0, 0, 0))
    const qPageOver = new THREE.Quaternion().setFromEuler(new THREE.Euler(0, -Math.PI + 0.02, 0))
    const pageFlipTrack = new THREE.QuaternionKeyframeTrack("pageRight.quaternion", [0, 0.05, 0.45, 0.5], [
      ...qPageFlat.toArray(),
      ...qPageFlat.toArray(),
      ...qPageOver.toArray(),
      ...qPageOver.toArray(),
    ])
    const flipClip = new THREE.AnimationClip("page-flip", 0.5, [pageFlipTrack])
    flipClip.optimize()
    const flipAction = mixer.clipAction(flipClip)

    const idleScaleTrack = new THREE.VectorKeyframeTrack("bookGroup.scale", [0, 2], [
      1, 1, 1,
      1.005, 1.005, 1.005,
    ])
    idleScaleTrack.setInterpolation(THREE.InterpolateSmooth)
    const idleClip = new THREE.AnimationClip("idle-breathe", 2, [idleScaleTrack])
    idleClip.optimize()
    const idleAction = mixer.clipAction(idleClip)
    idleAction.loop = THREE.LoopPingPong
    idleAction.play()

    function setPageVisibility(visible: boolean) {
      back.visible = visible
      pageLeft.visible = visible
      pageRight.visible = visible
    }

    function applyPalette(key: BookPaletteKey) {
      const [c1, c2, c3] = PAGE_PALETTES[key]
      pageMat.uniforms.uColor1.value.set(c1)
      pageMat.uniforms.uColor2.value.set(c2)
      pageMat.uniforms.uColor3.value.set(c3)
    }

    function runOpen() {
      idleAction.fadeOut(0.2)
      idleAction.paused = true
      back.visible = true
      setPageVisibility(false)
      openAction.reset()
      openAction.timeScale = 1
      openAction.loop = THREE.LoopOnce
      openAction.clampWhenFinished = true
      openAction.fadeIn(0.2).play()
    }

    function runClose() {
      setPageVisibility(false)
      closeAction.reset()
      closeAction.timeScale = -1
      closeAction.loop = THREE.LoopOnce
      closeAction.clampWhenFinished = true
      closeAction.time = openClip.duration
      closeAction.play()
    }

    let flipShadowTime: number | null = null

    function runFlip() {
      if (!pageRight.visible) {
        setPageVisibility(true)
      }
      flipShadowTime = 0
      flipAction.reset()
      flipAction.timeScale = 1
      flipAction.loop = THREE.LoopOnce
      flipAction.clampWhenFinished = true
      flipAction.play()
    }

    let settleSpring: Spring | null = null
    let settleTime = 0

    const onFinished = (event: THREE.Event & { action: THREE.AnimationAction }) => {
      const clipName = event.action.getClip().name
      if (clipName === "book-open") {
        if (event.action.timeScale > 0) {
          pageLeft.visible = true
          pageRight.visible = true
          settleSpring = new Spring(120, 14)
          settleSpring.position = -0.2
          settleSpring.target = 0
          settleTime = 0
        } else {
          setPageVisibility(false)
          idleAction.reset()
          idleAction.paused = false
          idleAction.fadeIn(0.3).play()
          callbacksRef.current.onClosed?.()
        }
      }
      if (clipName === "page-flip") {
        flipShadowTime = null
        pageMat.uniforms.uFoldShadow.value = 0
        pageRight.quaternion.copy(qPageFlat)
        callbacksRef.current.onFlipComplete?.()
      }
    }
    mixer.addEventListener("finished", onFinished)

    const onResize = () => {
      if (!mount) return
      const w = mount.clientWidth
      const h = mount.clientHeight
      camera.aspect = w / h
      camera.updateProjectionMatrix()
      renderer.setSize(w, h)
      pageMat.uniforms.uResolution.value.set(w, h)
    }

    const tick = () => {
      const delta = clock.getDelta()
      const elapsed = clock.getElapsedTime()
      pageMat.uniforms.uTime.value = elapsed
      mixer.update(delta)

      if (settleSpring) {
        settleTime += delta
        const leftX = settleSpring.update(delta)
        pageLeft.position.x = leftX - 1.18
        pageRight.position.x = -leftX
        if (settleTime > 0.6) {
          pageLeft.position.x = -1.18
          pageRight.position.x = 0
          settleSpring = null
          callbacksRef.current.onOpened?.()
        }
      }

      if (flipShadowTime !== null) {
        flipShadowTime += delta
        const half = 0.25
        const progress = Math.min(flipShadowTime / half, 2)
        pageMat.uniforms.uFoldShadow.value = progress <= 1 ? progress * 0.85 : (2 - progress) * 0.85
      }

      renderer.render(scene, camera)
      runtime.frame = requestAnimationFrame(tick)
    }

    const runtime = {
      mixer,
      openClip,
      openAction,
      closeAction,
      flipAction,
      idleAction,
      pageMat,
      pageLeft,
      pageRight,
      cover,
      back,
      clock,
      renderer,
      scene,
      camera,
      frame: 0,
      settleSpring: null as Spring | null,
      settleTime: 0,
      setPageVisibility,
      applyPalette,
      runOpen,
      runClose,
      runFlip,
    }
    runtimeRef.current = runtime
    onResize()
    tick()
    window.addEventListener("resize", onResize)

    return () => {
      cancelAnimationFrame(runtime.frame)
      window.removeEventListener("resize", onResize)
      mixer.removeEventListener("finished", onFinished)
      renderer.dispose()
      coverGeo.dispose()
      pageRightGeo.dispose()
      pageLeftGeo.dispose()
      backGeo.dispose()
      coverMat.dispose()
      pageMat.dispose()
      if (renderer.domElement.parentNode === mount) {
        mount.removeChild(renderer.domElement)
      }
      runtimeRef.current = null
    }
  }, [mobile])

  const prevPhaseRef = useRef<ScenePhase>("closed")
  useEffect(() => {
    const runtime = runtimeRef.current
    if (!runtime) return
    runtime.applyPalette(paletteKey)
  }, [paletteKey])

  useEffect(() => {
    const runtime = runtimeRef.current
    if (!runtime) return
    const prev = prevPhaseRef.current
    prevPhaseRef.current = phase
    if (phase === prev) return

    if (phase === "opening") runtime.runOpen()
    if (phase === "closing") runtime.runClose()
    if (phase === "closed") {
      runtime.setPageVisibility(false)
      runtime.back.visible = false
      runtime.cover.quaternion.set(0, 0, 0, 1)
    }
    if (phase === "open") {
      runtime.back.visible = true
      runtime.setPageVisibility(true)
      runtime.cover.quaternion.setFromEuler(new THREE.Euler(0, -Math.PI, 0))
      runtime.idleAction.stop()
      runtime.idleAction.paused = true
    }
  }, [phase])

  const prevFlipRef = useRef(flipSignal)
  useEffect(() => {
    const runtime = runtimeRef.current
    if (!runtime) return
    if (flipSignal === prevFlipRef.current) return
    prevFlipRef.current = flipSignal
    runtime.runFlip()
  }, [flipSignal])

  return <div className={className} ref={mountRef} />
}
