'use client'

import { useEffect, useRef, useState } from 'react'

export default function Home() {
  const [score, setScore] = useState(0)
  const [lives, setLives] = useState(3)
  const [maxLives, setMaxLives] = useState(5)
  const [gameOver, setGameOver] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [bgThemeIndex, setBgThemeIndex] = useState(0)

  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const animationRef = useRef<number | null>(null)

  const targetsRef = useRef<any[]>([])
  const potionsRef = useRef<any[]>([])
  const yellowPotionsRef = useRef<any[]>([])
  const particlesRef = useRef<any[]>([])
  const smokeParticlesRef = useRef<any[]>([])
  const fireParticlesRef = useRef<any[]>([])
  const fallingGhostsRef = useRef<any[]>([])
  const starParticlesRef = useRef<any[]>([])
  const batsRef = useRef<any[]>([])
  const flyingBatExplosionRef = useRef<any[]>([])
  const applesRef = useRef<any[]>([])
  
  const lightningTimerRef = useRef(0)
  const blackoutTimerRef = useRef(0)
  const randomEffectTimerRef = useRef(0)

  const imagesRef = useRef<{ name: string; img: HTMLImageElement }[]>([])
  
  const mousePosRef = useRef({ x: 0, y: 0 })
  const scoreRef = useRef(0)
  const livesRef = useRef(3)
  const gameOverRef = useRef(false)
  const isPausedRef = useRef(false)
  const spawnTimerRef = useRef(0)
  const spawnIntervalRef = useRef(90) 
  const bgOffsetRef = useRef(0)
  const bgThemeIndexRef = useRef(0)

  scoreRef.current = score
  livesRef.current = lives
  gameOverRef.current = gameOver
  isPausedRef.current = isPaused
  bgThemeIndexRef.current = bgThemeIndex

  useEffect(() => {
    const imageNames = [
      'diablo.png',
      'calabaza.png',
      'reina.png',
      'frankenstein.png',
      'vampiro.png',
      'mago.png',
      'princesa.png',
      'freddy.png'
    ]

    const loaded: { name: string; img: HTMLImageElement }[] = []
    imageNames.forEach((name) => {
      const img = new Image()
      img.src = `/${name}`
      img.onerror = () => console.error(`No se pudo cargar la imagen: /${name}`)
      loaded.push({ name, img })
    })
    imagesRef.current = loaded
  }, [])

  const restartGame = () => {
    setScore(0)
    setLives(3)
    setGameOver(false)
    setIsPaused(false)
    setBgThemeIndex(0)
    scoreRef.current = 0
    livesRef.current = 3
    gameOverRef.current = false
    isPausedRef.current = false
    bgThemeIndexRef.current = 0
    targetsRef.current = []
    potionsRef.current = []
    yellowPotionsRef.current = []
    particlesRef.current = []
    smokeParticlesRef.current = []
    fireParticlesRef.current = []
    fallingGhostsRef.current = []
    starParticlesRef.current = []
    batsRef.current = []
    flyingBatExplosionRef.current = []
    applesRef.current = []
    lightningTimerRef.current = 0
    blackoutTimerRef.current = 0
    randomEffectTimerRef.current = 0
    spawnIntervalRef.current = 90
    spawnTimerRef.current = 0
    bgOffsetRef.current = 0
  }

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const handleResize = () => {
      if (!canvasRef.current) return
      canvasRef.current.width = window.innerWidth
      canvasRef.current.height = window.innerHeight
    }
    handleResize()
    window.addEventListener('resize', handleResize)

    const handleMouseMove = (e: MouseEvent) => {
      if (!canvasRef.current) return
      const rect = canvasRef.current.getBoundingClientRect()
      mousePosRef.current = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      }
    }
    window.addEventListener('mousemove', handleMouseMove)

    class ExplodingBat {
      x: number
      y: number
      vx: number
      vy: number
      alpha: number = 1
      decay: number = Math.random() * 0.02 + 0.015
      angle: number

      constructor(x: number, y: number) {
        this.x = x
        this.y = y
        const angleRand = Math.random() * Math.PI * 2
        const speed = Math.random() * 8 + 4
        this.vx = Math.cos(angleRand) * speed
        this.vy = Math.sin(angleRand) * speed
        this.angle = angleRand
      }

      update() {
        this.x += this.vx
        this.y += this.vy
        this.alpha -= this.decay
      }

      draw() {
        const currentCtx = canvasRef.current?.getContext('2d')
        if (!currentCtx) return
        currentCtx.save()
        currentCtx.globalAlpha = Math.max(0, this.alpha)
        currentCtx.fillStyle = '#111'
        currentCtx.beginPath()
        currentCtx.ellipse(this.x, this.y, 14, 7, this.angle, 0, Math.PI * 2)
        currentCtx.fill()
        currentCtx.restore()
      }
    }

    class YellowPotion {
      size: number = 45
      x: number
      y: number
      speed: number

      constructor() {
        const currentCanvas = canvasRef.current!
        this.x = Math.random() * (currentCanvas.width - this.size * 2) + this.size
        this.y = -this.size
        this.speed = 3.5 + Math.random() * 2
      }

      update() {
        this.y += this.speed
      }

      draw() {
        const currentCtx = canvasRef.current?.getContext('2d')
        if (!currentCtx) return
        currentCtx.save()

        currentCtx.fillStyle = '#f1c40f'
        currentCtx.strokeStyle = '#2f3542'
        currentCtx.lineWidth = 3

        currentCtx.beginPath()
        currentCtx.arc(this.x, this.y + 5, 20, 0, Math.PI * 2)
        currentCtx.fill()
        currentCtx.stroke()

        currentCtx.fillStyle = '#747d8c'
        currentCtx.fillRect(this.x - 7, this.y - 16, 14, 11)

        currentCtx.fillStyle = '#ffffff'
        currentCtx.fillRect(this.x - 3, this.y - 2, 6, 2)
        currentCtx.fillRect(this.x - 1, this.y - 4, 2, 6)

        currentCtx.restore()
      }
    }

    class FallingGhost {
      x: number
      y: number
      size: number
      speedY: number
      alpha: number
      wobble: number
      wobbleSpeed: number

      constructor() {
        const currentCanvas = canvasRef.current!
        this.x = Math.random() * currentCanvas.width
        this.y = -40
        this.size = Math.random() * 15 + 25
        this.speedY = Math.random() * 1.5 + 1
        this.alpha = Math.random() * 0.25 + 0.15
        this.wobble = Math.random() * Math.PI * 2
        this.wobbleSpeed = 0.03
      }

      update() {
        this.y += this.speedY
        this.wobble += this.wobbleSpeed
        this.x += Math.sin(this.wobble) * 0.8
      }

      draw() {
        const currentCtx = canvasRef.current?.getContext('2d')
        if (!currentCtx) return
        currentCtx.save()
        currentCtx.globalAlpha = this.alpha
        currentCtx.fillStyle = '#e0e0e0'

        currentCtx.beginPath()
        currentCtx.arc(this.x, this.y, this.size * 0.5, Math.PI, 0, false)
        currentCtx.lineTo(this.x + this.size * 0.5, this.y + this.size)
        currentCtx.quadraticCurveTo(this.x + this.size * 0.25, this.y + this.size * 0.7, this.x, this.y + this.size)
        currentCtx.quadraticCurveTo(this.x - this.size * 0.25, this.y + this.size * 0.7, this.x - this.size * 0.5, this.y + this.size)
        currentCtx.closePath()
        currentCtx.fill()

        currentCtx.fillStyle = '#111'
        currentCtx.beginPath()
        currentCtx.arc(this.x - this.size * 0.15, this.y - this.size * 0.05, this.size * 0.08, 0, Math.PI * 2)
        currentCtx.arc(this.x + this.size * 0.15, this.y - this.size * 0.05, this.size * 0.08, 0, Math.PI * 2)
        currentCtx.fill()

        currentCtx.restore()
      }
    }

    class Target {
      size: number
      x: number
      y: number
      speed: number
      imageObj: { name: string; img: HTMLImageElement }
      
      alpha: number = 1
      fadeSpeed: number = 0.003 + Math.random() * 0.003
      fadingOut: boolean = true

      constructor() {
        this.size = Math.floor(Math.random() * 45) + 110
        const currentCanvas = canvasRef.current!
        this.x = Math.random() * (currentCanvas.width - this.size * 2) + this.size
        this.y = -this.size
        this.speed = 2.8 + Math.random() * 1.8 + scoreRef.current / 100
        
        const imgs = imagesRef.current
        this.imageObj = imgs[Math.floor(Math.random() * imgs.length)]

        if (this.imageObj.name === 'frankenstein.png' || Math.random() < 0.25) {
          lightningTimerRef.current = 35
        }
      }

      update() {
        this.y += this.speed

        if (this.fadingOut) {
          this.alpha -= this.fadeSpeed
          if (this.alpha <= 0.05) {
            this.alpha = 0.05
            this.fadingOut = false

            const currentCanvas = canvasRef.current!
            this.x = Math.random() * (currentCanvas.width - this.size * 2) + this.size
            this.y = Math.max(0, this.y - (Math.random() * 250 + 100))
          }
        } else {
          this.alpha += this.fadeSpeed
          if (this.alpha >= 1) {
            this.alpha = 1
            this.fadingOut = true
          }
        }
      }

      draw() {
        const currentCtx = canvasRef.current?.getContext('2d')
        if (!currentCtx) return
        currentCtx.save()
        
        currentCtx.globalAlpha = isPausedRef.current ? 1 : Math.max(0.05, this.alpha)

        if (this.imageObj && this.imageObj.img.complete) {
          currentCtx.drawImage(
            this.imageObj.img,
            this.x - this.size / 2,
            this.y - this.size / 2,
            this.size,
            this.size
          )
        }
        currentCtx.restore()
      }
    }

    class Potion {
      size: number = 45
      x: number
      y: number
      speed: number

      constructor() {
        const currentCanvas = canvasRef.current!
        this.x = Math.random() * (currentCanvas.width - this.size * 2) + this.size
        this.y = -this.size
        this.speed = 3.5 + Math.random() * 2
      }

      update() {
        this.y += this.speed
      }

      draw() {
        const currentCtx = canvasRef.current?.getContext('2d')
        if (!currentCtx) return
        currentCtx.save()

        currentCtx.fillStyle = '#2ed573'
        currentCtx.strokeStyle = '#2f3542'
        currentCtx.lineWidth = 3

        currentCtx.beginPath()
        currentCtx.arc(this.x, this.y + 5, 20, 0, Math.PI * 2)
        currentCtx.fill()
        currentCtx.stroke()

        currentCtx.fillStyle = '#747d8c'
        currentCtx.fillRect(this.x - 7, this.y - 16, 14, 11)

        currentCtx.fillStyle = '#ffffff'
        currentCtx.fillRect(this.x - 3, this.y - 2, 6, 2)
        currentCtx.fillRect(this.x - 1, this.y - 4, 2, 6)

        currentCtx.restore()
      }
    }

    class Particle {
      x: number
      y: number
      radius: number = Math.random() * 5 + 2
      color: string = `hsl(${Math.random() * 40 + 10}, 100%, 50%)`
      vx: number = (Math.random() - 0.5) * 8
      vy: number = (Math.random() - 0.5) * 8
      alpha: number = 1
      decay: number = Math.random() * 0.03 + 0.015

      constructor(x: number, y: number) {
        this.x = x
        this.y = y
      }

      update() {
        this.x += this.vx
        this.y += this.vy
        this.alpha -= this.decay
      }

      draw() {
        const currentCtx = canvasRef.current?.getContext('2d')
        if (!currentCtx) return
        currentCtx.save()
        currentCtx.globalAlpha = Math.max(0, this.alpha)
        currentCtx.beginPath()
        currentCtx.arc(this.x, this.y, this.radius, 0, Math.PI * 2)
        currentCtx.fillStyle = this.color
        currentCtx.fill()
        currentCtx.restore()
      }
    }

    class SmokeParticle {
      x: number
      y: number
      radius: number
      vx: number
      vy: number
      alpha: number
      decay: number

      constructor(x: number, y: number) {
        this.x = x
        this.y = y
        this.radius = Math.random() * 70 + 45
        this.vx = (Math.random() - 0.5) * 2
        this.vy = (Math.random() - 0.5) * 2
        this.alpha = 0.85
        this.decay = 0.008
      }

      update() {
        this.x += this.vx
        this.y += this.vy
        this.alpha -= this.decay
      }

      draw() {
        const currentCtx = canvasRef.current?.getContext('2d')
        if (!currentCtx) return
        currentCtx.save()
        currentCtx.globalAlpha = Math.max(0, this.alpha)
        currentCtx.beginPath()
        currentCtx.arc(this.x, this.y, this.radius, 0, Math.PI * 2)
        currentCtx.fillStyle = '#111'
        currentCtx.fill()
        currentCtx.restore()
      }
    }

    class FireParticle {
      x: number
      y: number
      size: number
      vx: number
      vy: number
      alpha: number
      decay: number
      color: string

      constructor(x: number, y: number) {
        this.x = x
        this.y = y
        this.size = Math.random() * 10 + 6
        this.vx = (Math.random() - 0.5) * 4
        this.vy = (Math.random() - 1) * 4 - 1
        this.alpha = 1
        this.decay = Math.random() * 0.035 + 0.015
        const colors = ['#ff2e00', '#ff6b00', '#ffa800', '#ffea00']
        this.color = colors[Math.floor(Math.random() * colors.length)]
      }

      update() {
        this.x += this.vx
        this.y += this.vy
        this.size *= 0.93
        this.alpha -= this.decay
      }

      draw() {
        const currentCtx = canvasRef.current?.getContext('2d')
        if (!currentCtx) return
        currentCtx.save()
        currentCtx.globalAlpha = Math.max(0, this.alpha)
        currentCtx.fillStyle = this.color

        const s = Math.max(2, this.size)
        currentCtx.beginPath()
        currentCtx.moveTo(this.x, this.y - s * 1.4)
        currentCtx.quadraticCurveTo(this.x + s, this.y, this.x + s * 0.6, this.y + s)
        currentCtx.quadraticCurveTo(this.x, this.y + s * 1.3, this.x - s * 0.6, this.y + s)
        currentCtx.quadraticCurveTo(this.x - s, this.y, this.x, this.y - s * 1.4)
        currentCtx.fill()

        currentCtx.restore()
      }
    }

    class StarParticle {
      x: number
      y: number
      radius: number
      vx: number
      vy: number
      alpha: number
      decay: number
      color: string

      constructor(x: number, y: number, isMagicPrincess: boolean = false) {
        this.x = x
        this.y = y
        this.radius = Math.random() * 8 + 4
        this.vx = (Math.random() - 0.5) * 7
        this.vy = (Math.random() - 0.5) * 7
        this.alpha = 1
        this.decay = Math.random() * 0.025 + 0.01
        this.color = isMagicPrincess ? '#ff69b4' : '#00ffff'
      }

      update() {
        this.x += this.vx
        this.y += this.vy
        this.alpha -= this.decay
      }

      draw() {
        const currentCtx = canvasRef.current?.getContext('2d')
        if (!currentCtx) return
        currentCtx.save()
        currentCtx.globalAlpha = Math.max(0, this.alpha)
        currentCtx.fillStyle = this.color
        currentCtx.beginPath()
        currentCtx.arc(this.x, this.y, this.radius, 0, Math.PI * 2)
        currentCtx.fill()
        currentCtx.restore()
      }
    }

    class Bat {
      x: number
      y: number
      angle: number
      distance: number
      speed: number
      centerX: number
      centerY: number

      constructor(centerX: number, centerY: number) {
        this.centerX = centerX
        this.centerY = centerY
        this.angle = Math.random() * Math.PI * 2
        this.distance = Math.random() * 55 + 45
        this.speed = 0.08
        this.x = this.centerX + Math.cos(this.angle) * this.distance
        this.y = this.centerY + Math.sin(this.angle) * this.distance
      }

      update(parentX: number, parentY: number) {
        this.centerX = parentX
        this.centerY = parentY
        this.angle += this.speed
        this.x = this.centerX + Math.cos(this.angle) * this.distance
        this.y = this.centerY + Math.sin(this.angle) * this.distance
      }

      draw(parentAlpha: number) {
        const currentCtx = canvasRef.current?.getContext('2d')
        if (!currentCtx) return
        currentCtx.save()
        currentCtx.globalAlpha = parentAlpha
        currentCtx.fillStyle = '#111'
        currentCtx.beginPath()
        currentCtx.ellipse(this.x, this.y, 12, 6, this.angle, 0, Math.PI * 2)
        currentCtx.fill()
        currentCtx.restore()
      }
    }

    class ShieldApple {
      x: number
      y: number
      angle: number
      distance: number
      speed: number
      centerX: number
      centerY: number
      size: number = 28

      constructor(centerX: number, centerY: number, index: number, total: number) {
        this.centerX = centerX
        this.centerY = centerY
        this.angle = (index / total) * Math.PI * 2
        this.distance = 80
        this.speed = 0.04
        this.x = this.centerX + Math.cos(this.angle) * this.distance
        this.y = this.centerY + Math.sin(this.angle) * this.distance
      }

      update(parentX: number, parentY: number) {
        this.centerX = parentX
        this.centerY = parentY
        this.angle += this.speed
        this.x = this.centerX + Math.cos(this.angle) * this.distance
        this.y = this.centerY + Math.sin(this.angle) * this.distance
      }

      draw(parentAlpha: number) {
        const currentCtx = canvasRef.current?.getContext('2d')
        if (!currentCtx) return
        currentCtx.save()
        currentCtx.globalAlpha = parentAlpha
        currentCtx.fillStyle = '#ff3838'
        currentCtx.beginPath()
        currentCtx.arc(this.x, this.y, this.size / 2, 0, Math.PI * 2)
        currentCtx.fill()
        currentCtx.strokeStyle = '#2f3640'
        currentCtx.lineWidth = 3
        currentCtx.beginPath()
        currentCtx.moveTo(this.x, this.y - this.size / 2)
        currentCtx.lineTo(this.x + 4, this.y - this.size / 2 - 6)
        currentCtx.stroke()
        currentCtx.restore()
      }
    }

    const createExplosion = (x: number, y: number) => {
      for (let i = 0; i < 25; i++) {
        particlesRef.current.push(new Particle(x, y))
      }
    }

    const createBatExplosion = (x: number, y: number) => {
      for (let i = 0; i < 20; i++) {
        flyingBatExplosionRef.current.push(new ExplodingBat(x, y))
      }
    }

    const createPotionEffect = (x: number, y: number) => {
      for (let i = 0; i < 30; i++) {
        particlesRef.current.push(new Particle(x, y))
      }
    }

    const createPumpkinSmoke = (x: number, y: number) => {
      for (let i = 0; i < 15; i++) {
        smokeParticlesRef.current.push(new SmokeParticle(x, y))
      }
    }

    const createFire = (x: number, y: number) => {
      for (let i = 0; i < 20; i++) {
        fireParticlesRef.current.push(new FireParticle(x, y))
      }
    }

    const createStars = (x: number, y: number, isPrincess: boolean) => {
      for (let i = 0; i < 20; i++) {
        starParticlesRef.current.push(new StarParticle(x, y, isPrincess))
      }
    }

    const themes = [
      { top: '#050205', mid: '#120404', bot: '#1b0000' },
      { top: '#02050f', mid: '#040b1a', bot: '#001429' },
      { top: '#060f05', mid: '#0a1c09', bot: '#0f2b0d' },
      { top: '#0d0212', mid: '#1a0424', bot: '#2b003b' }
    ]

    const drawHorrorBackground = () => {
      const w = canvas.width
      const h = canvas.height
      const currentTheme = themes[bgThemeIndexRef.current % themes.length]

      const bgGrad = ctx.createLinearGradient(0, 0, 0, h)
      bgGrad.addColorStop(0, currentTheme.top)
      bgGrad.addColorStop(0.5, currentTheme.mid)
      bgGrad.addColorStop(1, currentTheme.bot)
      ctx.fillStyle = bgGrad
      ctx.fillRect(0, 0, w, h)

      bgOffsetRef.current += 0.5
      ctx.fillStyle = 'rgba(50, 50, 50, 0.2)'
      for (let i = 0; i < 3; i++) {
        const fogX = (i * 400 - (bgOffsetRef.current % 400))
        ctx.beginPath()
        ctx.arc(fogX, h - 50, 180, 0, Math.PI * 2)
        ctx.arc(fogX + 250, h - 30, 220, 0, Math.PI * 2)
        ctx.fill()
      }
    }

    const drawSpookyPumpkinCrosshair = () => {
      const { x, y } = mousePosRef.current
      ctx.save()

      ctx.fillStyle = '#ff6b01'
      ctx.strokeStyle = '#7c2d12'
      ctx.lineWidth = 3

      ctx.beginPath()
      ctx.arc(x, y, 22, 0, Math.PI * 2)
      ctx.fill()
      ctx.stroke()

      ctx.fillStyle = '#27ae60'
      ctx.fillRect(x - 3, y - 28, 6, 8)

      ctx.fillStyle = '#f1c40f'
      ctx.beginPath()
      ctx.moveTo(x - 10, y - 6)
      ctx.lineTo(x - 4, y - 6)
      ctx.lineTo(x - 7, y - 12)
      ctx.closePath()
      ctx.fill()

      ctx.beginPath()
      ctx.moveTo(x + 4, y - 6)
      ctx.lineTo(x + 10, y - 6)
      ctx.lineTo(x + 7, y - 12)
      ctx.closePath()
      ctx.fill()

      ctx.strokeStyle = '#1a0000'
      ctx.lineWidth = 2.5
      ctx.beginPath()
      ctx.moveTo(x - 12, y + 4)
      ctx.lineTo(x - 6, y + 9)
      ctx.lineTo(x, y + 4)
      ctx.lineTo(x + 6, y + 9)
      ctx.lineTo(x + 12, y + 4)
      ctx.stroke()

      ctx.restore()
    }

    const handleMouseDown = () => {
      if (gameOverRef.current || isPausedRef.current) return

      const { x: mx, y: my } = mousePosRef.current

      const potions = potionsRef.current
      for (let i = potions.length - 1; i >= 0; i--) {
        const p = potions[i]
        if (
          mx >= p.x - p.size / 2 &&
          mx <= p.x + p.size / 2 &&
          my >= p.y - p.size / 2 &&
          my <= p.y + p.size / 2
        ) {
          createPotionEffect(p.x, p.y)
          potions.splice(i, 1)

          setLives(prev => Math.min(prev + 1, maxLives))
          if (spawnIntervalRef.current > 30) {
            spawnIntervalRef.current -= 8
          }
          return
        }
      }

      const yellowPotions = yellowPotionsRef.current
      for (let i = yellowPotions.length - 1; i >= 0; i--) {
        const yp = yellowPotions[i]
        if (
          mx >= yp.x - yp.size / 2 &&
          mx <= yp.x + yp.size / 2 &&
          my >= yp.y - yp.size / 2 &&
          my <= yp.y + yp.size / 2
        ) {
          createPotionEffect(yp.x, yp.y)
          yellowPotions.splice(i, 1)

          setBgThemeIndex(prev => prev + 1)
          return
        }
      }

      for (let i = applesRef.current.length - 1; i >= 0; i--) {
        const apple = applesRef.current[i]
        const dx = mx - apple.x
        const dy = my - apple.y
        if (Math.sqrt(dx * dx + dy * dy) < 16) {
          createExplosion(apple.x, apple.y)
          return
        }
      }

      const targets = targetsRef.current
      for (let i = targets.length - 1; i >= 0; i--) {
        const t = targets[i]
        
        if (t.y < canvas.height / 2 || t.alpha < 0.25) continue

        if (
          mx >= t.x - t.size / 2 &&
          mx <= t.x + t.size / 2 &&
          my >= t.y - t.size / 2 &&
          my <= t.y + t.size / 2
        ) {
          createExplosion(t.x, t.y)

          if (t.imageObj && t.imageObj.name === 'vampiro.png') {
            createBatExplosion(t.x, t.y)
          }
          if (t.imageObj && t.imageObj.name === 'calabaza.png') {
            createPumpkinSmoke(t.x, t.y)
          }
          if (t.imageObj && (t.imageObj.name === 'diablo.png' || t.imageObj.name === 'freddy.png')) {
            createFire(t.x, t.y)
          }
          if (t.imageObj && t.imageObj.name === 'mago.png') {
            createStars(t.x, t.y, false)
          }
          if (t.imageObj && t.imageObj.name === 'princesa.png') {
            createStars(t.x, t.y, true)
          }

          targets.splice(i, 1)
          setScore(prev => prev + 10)
          break
        }
      }
    }

    window.addEventListener('mousedown', handleMouseDown)

    const gameLoop = () => {
      if (!canvasRef.current) return

      if (!gameOverRef.current) {
        drawHorrorBackground()

        if (!isPausedRef.current) {
          randomEffectTimerRef.current++
          if (randomEffectTimerRef.current > 350) {
            const randChance = Math.random()
            if (randChance < 0.5) {
              lightningTimerRef.current = 25
            } else {
              blackoutTimerRef.current = 10 // 🌟 Apagón ultrarrápido de milisegundos (10 frames)
            }
            randomEffectTimerRef.current = 0
          }

          if (Math.random() < 0.04) {
            fallingGhostsRef.current.push(new FallingGhost())
          }

          for (let i = fallingGhostsRef.current.length - 1; i >= 0; i--) {
            const fg = fallingGhostsRef.current[i]
            fg.update()
            fg.draw()
            if (fg.y > canvasRef.current.height + 50) {
              fallingGhostsRef.current.splice(i, 1)
            }
          }

          if (lightningTimerRef.current > 0) {
            lightningTimerRef.current--
            ctx.save()
            ctx.fillStyle = Math.random() > 0.5 ? 'rgba(255, 255, 255, 0.85)' : 'rgba(100, 200, 255, 0.75)'
            ctx.fillRect(0, 0, canvasRef.current.width, canvasRef.current.height)
            ctx.strokeStyle = '#ffffff'
            ctx.lineWidth = 4
            ctx.beginPath()
            let rx = Math.random() * canvasRef.current.width
            ctx.moveTo(rx, 0)
            for (let ry = 50; ry < canvasRef.current.height; ry += 80) {
              rx += (Math.random() - 0.5) * 200
              ctx.lineTo(rx, ry)
            }
            ctx.stroke()
            ctx.restore()
          }

          // 🌟 Apagón limpio de milisegundos sin texto
          if (blackoutTimerRef.current > 0) {
            blackoutTimerRef.current--
            ctx.fillStyle = '#000000'
            ctx.fillRect(0, 0, canvasRef.current.width, canvasRef.current.height)
          }

          spawnTimerRef.current++
          if (spawnTimerRef.current >= spawnIntervalRef.current) {
            const rand = Math.random()
            if (rand < 0.08) {
              potionsRef.current.push(new Potion())
            } else if (rand < 0.16) {
              yellowPotionsRef.current.push(new YellowPotion())
            } else {
              targetsRef.current.push(new Target())
            }
            spawnTimerRef.current = 0
            if (spawnIntervalRef.current > 30) spawnIntervalRef.current -= 0.5
          }

          for (let i = potionsRef.current.length - 1; i >= 0; i--) {
            const p = potionsRef.current[i]
            p.update()
            p.draw()
            if (p.y > canvasRef.current.height + p.size) {
              potionsRef.current.splice(i, 1)
            }
          }

          for (let i = yellowPotionsRef.current.length - 1; i >= 0; i--) {
            const yp = yellowPotionsRef.current[i]
            yp.update()
            yp.draw()
            if (yp.y > canvasRef.current.height + yp.size) {
              yellowPotionsRef.current.splice(i, 1)
            }
          }

          for (let i = smokeParticlesRef.current.length - 1; i >= 0; i--) {
            const s = smokeParticlesRef.current[i]
            s.update()
            s.draw()
            if (s.alpha <= 0) smokeParticlesRef.current.splice(i, 1)
          }

          for (let i = fireParticlesRef.current.length - 1; i >= 0; i--) {
            const f = fireParticlesRef.current[i]
            f.update()
            f.draw()
            if (f.alpha <= 0) fireParticlesRef.current.splice(i, 1)
          }

          for (let i = starParticlesRef.current.length - 1; i >= 0; i--) {
            const st = starParticlesRef.current[i]
            st.update()
            st.draw()
            if (st.alpha <= 0) starParticlesRef.current.splice(i, 1)
          }

          for (let i = flyingBatExplosionRef.current.length - 1; i >= 0; i--) {
            const eb = flyingBatExplosionRef.current[i]
            eb.update()
            eb.draw()
            if (eb.alpha <= 0) flyingBatExplosionRef.current.splice(i, 1)
          }

          for (let i = targetsRef.current.length - 1; i >= 0; i--) {
            const t = targetsRef.current[i]
            t.update()
            t.draw()

            if (t.imageObj.name === 'vampiro.png') {
              const b1 = new Bat(t.x, t.y)
              const b2 = new Bat(t.x, t.y)
              b1.update(t.x, t.y)
              b2.update(t.x, t.y)
              b1.draw(t.alpha)
              b2.draw(t.alpha)
            }

            if (t.imageObj.name === 'reina.png') {
              for (let j = 0; j < 3; j++) {
                const apple = new ShieldApple(t.x, t.y, j, 3)
                apple.update(t.x, t.y)
                apple.draw(t.alpha)
                applesRef.current.push(apple)
              }
            }

            if (t.y > canvasRef.current.height + t.size) {
              targetsRef.current.splice(i, 1)
              setLives(prev => {
                const newLives = prev - 1
                if (newLives <= 0) {
                  setGameOver(true)
                }
                return newLives
              })
            }
          }

          for (let i = particlesRef.current.length - 1; i >= 0; i--) {
            const p = particlesRef.current[i]
            p.update()
            p.draw()
            if (p.alpha <= 0) particlesRef.current.splice(i, 1)
          }
        } else {
          targetsRef.current.forEach(t => t.draw())
          potionsRef.current.forEach(p => p.draw())
          yellowPotionsRef.current.forEach(yp => yp.draw())
        }

        drawSpookyPumpkinCrosshair()
      }

      animationRef.current = requestAnimationFrame(gameLoop)
    }

    animationRef.current = requestAnimationFrame(gameLoop)

    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current)
      window.removeEventListener('resize', handleResize)
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mousedown', handleMouseDown)
    }
  }, [])

  return (
    <main className="relative min-h-screen bg-[#050205] text-white overflow-hidden flex flex-col items-center justify-center select-none" style={{ cursor: 'none' }}>
      <div className="relative shadow-[0_0_25px_rgba(255,0,0,0.3)] border-4 border-[#331111] rounded-lg overflow-hidden">
        <canvas ref={canvasRef} className="block" />
        
        <div className="absolute top-4 left-4 right-4 flex justify-between items-center text-xl font-bold drop-shadow-[2px_2px_4px_rgba(0,0,0,0.9)] pointer-events-none">
          <div className="flex gap-6">
            <div>Puntos: <span id="score">{score}</span></div>
            <div>Vidas: <span id="lives">{'❤️'.repeat(Math.max(0, lives))}</span></div>
          </div>
          <button 
            onClick={() => setIsPaused(prev => !prev)}
            className="px-4 py-1.5 bg-[#4a1515] hover:bg-[#6b1d1d] text-white text-sm font-bold border border-[#ff4757] rounded cursor-pointer pointer-events-auto transition-transform hover:scale-105 shadow-[0_0_8px_rgba(255,0,0,0.5)]"
          >
            {isPaused ? 'Reanudar' : 'Pausa ⏸️'}
          </button>
        </div>

        {isPaused && !gameOver && (
          <div className="absolute inset-0 bg-transparent flex items-end justify-end p-6 z-40 pointer-events-none">
            <button 
              onClick={() => setIsPaused(false)}
              className="px-5 py-2.5 bg-[#2ed573] hover:bg-[#26af5f] text-white font-bold rounded-lg cursor-pointer pointer-events-auto transition-transform hover:scale-105 shadow-[0_0_15px_rgba(46,213,115,0.7)]"
            >
              ▶️ Continuar
            </button>
          </div>
        )}

        {gameOver && (
          <div className="absolute inset-0 bg-black/90 flex flex-col items-center justify-center gap-4 z-50 pointer-events-auto">
            <h1 className="text-[#ff4757] text-4xl font-bold m-0 drop-shadow-[0_0_10px_rgba(255,0,0,0.8)]">¡JUEGO TERMINADO!</h1>
            <p className="text-xl">Puntuación Final: <span>{score}</span></p>
            <button 
              onClick={restartGame}
              className="px-6 py-3 text-lg bg-[#2ed573] hover:bg-[#26af5f] text-white border-none rounded cursor-pointer transition-transform hover:scale-105 shadow-[0_0_10px_rgba(46,213,115,0.5)]"
            >
              Jugar de Nuevo
            </button>
          </div>
        )}
      </div>
    </main>
  )
}