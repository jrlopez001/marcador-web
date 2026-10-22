'use client'

import { useEffect, useRef, useState } from 'react'

export default function Home() {
  const [score, setScore] = useState(0)
  const [lives, setLives] = useState(3)
  const [gameOver, setGameOver] = useState(false)

  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const animationRef = useRef<number | null>(null)

  const targetsRef = useRef<any[]>([])
  const particlesRef = useRef<any[]>([])
  const smokeParticlesRef = useRef<any[]>([])
  const fireParticlesRef = useRef<any[]>([])
  const starParticlesRef = useRef<any[]>([])
  const batsRef = useRef<any[]>([])
  const applesRef = useRef<any[]>([])
  const lightningTimerRef = useRef(0)
  const imagesRef = useRef<{ name: string; img: HTMLImageElement }[]>([])
  
  const mousePosRef = useRef({ x: 0, y: 0 })
  const scoreRef = useRef(0)
  const livesRef = useRef(3)
  const gameOverRef = useRef(false)
  const spawnTimerRef = useRef(0)
  const spawnIntervalRef = useRef(60)

  scoreRef.current = score
  livesRef.current = lives
  gameOverRef.current = gameOver

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
    scoreRef.current = 0
    livesRef.current = 3
    gameOverRef.current = false
    targetsRef.current = []
    particlesRef.current = []
    smokeParticlesRef.current = []
    fireParticlesRef.current = []
    starParticlesRef.current = []
    batsRef.current = []
    applesRef.current = []
    lightningTimerRef.current = 0
    spawnIntervalRef.current = 60
    spawnTimerRef.current = 0
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

    class Target {
      size: number
      x: number
      y: number
      speed: number
      imageObj: { name: string; img: HTMLImageElement }

      constructor() {
        this.size = Math.floor(Math.random() * 30) + 55
        const currentCanvas = canvasRef.current!
        this.x = Math.random() * (currentCanvas.width - this.size * 2) + this.size
        this.y = -this.size
        this.speed = 2.5 + Math.random() * 2.5 + scoreRef.current / 80
        
        const imgs = imagesRef.current
        this.imageObj = imgs[Math.floor(Math.random() * imgs.length)]

        if (this.imageObj.name === 'frankenstein.png') {
          lightningTimerRef.current = 40
        }
      }

      update() {
        this.y += this.speed
      }

      draw() {
        ctx.save()
        if (this.imageObj && this.imageObj.img.complete) {
          ctx.drawImage(
            this.imageObj.img,
            this.x - this.size / 2,
            this.y - this.size / 2,
            this.size,
            this.size
          )
        }
        ctx.restore()
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
        ctx.save()
        ctx.globalAlpha = Math.max(0, this.alpha)
        ctx.beginPath()
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2)
        ctx.fillStyle = this.color
        ctx.fill()
        ctx.restore()
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
        this.radius = Math.random() * 60 + 40
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
        ctx.save()
        ctx.globalAlpha = Math.max(0, this.alpha)
        ctx.beginPath()
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2)
        ctx.fillStyle = '#222'
        ctx.fill()
        ctx.restore()
      }
    }

    class FireParticle {
      x: number
      y: number
      radius: number
      vx: number
      vy: number
      alpha: number
      decay: number
      color: string

      constructor(x: number, y: number) {
        this.x = x
        this.y = y
        this.radius = Math.random() * 15 + 10
        this.vx = (Math.random() - 0.5) * 6
        this.vy = (Math.random() - 1) * 6 - 2
        this.alpha = 1
        this.decay = Math.random() * 0.04 + 0.02
        const colors = ['#ff2e00', '#ff6b00', '#ffa800', '#ffea00']
        this.color = colors[Math.floor(Math.random() * colors.length)]
      }

      update() {
        this.x += this.vx
        this.y += this.vy
        this.radius *= 0.95
        this.alpha -= this.decay
      }

      draw() {
        ctx.save()
        ctx.globalAlpha = Math.max(0, this.alpha)
        ctx.beginPath()
        ctx.arc(this.x, this.y, Math.max(1, this.radius), 0, Math.PI * 2)
        ctx.fillStyle = this.color
        ctx.fill()
        ctx.restore()
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
        ctx.save()
        ctx.globalAlpha = Math.max(0, this.alpha)
        ctx.fillStyle = this.color
        ctx.beginPath()
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2)
        ctx.fill()
        ctx.restore()
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
        this.distance = Math.random() * 40 + 30
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

      draw() {
        ctx.save()
        ctx.fillStyle = '#111'
        ctx.beginPath()
        ctx.ellipse(this.x, this.y, 10, 5, this.angle, 0, Math.PI * 2)
        ctx.fill()
        ctx.restore()
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
      size: number = 25

      constructor(centerX: number, centerY: number, index: number, total: number) {
        this.centerX = centerX
        this.centerY = centerY
        this.angle = (index / total) * Math.PI * 2
        this.distance = 55
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

      draw() {
        ctx.save()
        ctx.fillStyle = '#ff3838'
        ctx.beginPath()
        ctx.arc(this.x, this.y, this.size / 2, 0, Math.PI * 2)
        ctx.fill()
        ctx.strokeStyle = '#2f3640'
        ctx.lineWidth = 3
        ctx.beginPath()
        ctx.moveTo(this.x, this.y - this.size / 2)
        ctx.lineTo(this.x + 4, this.y - this.size / 2 - 6)
        ctx.stroke()
        ctx.restore()
      }
    }

    const createExplosion = (x: number, y: number) => {
      for (let i = 0; i < 25; i++) {
        particlesRef.current.push(new Particle(x, y))
      }
    }

    const createPumpkinSmoke = (x: number, y: number) => {
      for (let i = 0; i < 15; i++) {
        smokeParticlesRef.current.push(new SmokeParticle(x, y))
      }
    }

    const createFire = (x: number, y: number) => {
      for (let i = 0; i < 30; i++) {
        fireParticlesRef.current.push(new FireParticle(x, y))
      }
    }

    const createStars = (x: number, y: number, isPrincess: boolean) => {
      for (let i = 0; i < 20; i++) {
        starParticlesRef.current.push(new StarParticle(x, y, isPrincess))
      }
    }

    const drawCrosshair = () => {
      const { x, y } = mousePosRef.current
      ctx.save()
      ctx.strokeStyle = '#ff4757'
      ctx.lineWidth = 2

      ctx.beginPath()
      ctx.arc(x, y, 20, 0, Math.PI * 2)
      ctx.stroke()

      ctx.beginPath()
      ctx.arc(x, y, 4, 0, Math.PI * 2)
      ctx.fillStyle = '#ff4757'
      ctx.fill()

      ctx.beginPath()
      ctx.moveTo(x - 30, y); ctx.lineTo(x - 10, y)
      ctx.moveTo(x + 10, y); ctx.lineTo(x + 30, y)
      ctx.moveTo(x, y - 30); ctx.lineTo(x, y - 10)
      ctx.moveTo(x, y + 10); ctx.lineTo(x, y + 30)
      ctx.stroke()

      ctx.restore()
    }

    const handleMouseDown = () => {
      if (gameOverRef.current) return

      const { x: mx, y: my } = mousePosRef.current

      for (let i = applesRef.current.length - 1; i >= 0; i--) {
        const apple = applesRef.current[i]
        const dx = mx - apple.x
        const dy = my - apple.y
        if (Math.sqrt(dx * dx + dy * dy) < 15) {
          createExplosion(apple.x, apple.y)
          return
        }
      }

      const targets = targetsRef.current
      for (let i = targets.length - 1; i >= 0; i--) {
        const t = targets[i]
        if (
          mx >= t.x - t.size / 2 &&
          mx <= t.x + t.size / 2 &&
          my >= t.y - t.size / 2 &&
          my <= t.y + t.size / 2
        ) {
          createExplosion(t.x, t.y)

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
        ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height)

        if (lightningTimerRef.current > 0) {
          lightningTimerRef.current--
          if (Math.random() > 0.5) {
            ctx.fillStyle = 'rgba(255, 255, 255, 0.25)'
            ctx.fillRect(0, 0, canvasRef.current.width, canvasRef.current.height)
          }
        }

        spawnTimerRef.current++
        if (spawnTimerRef.current >= spawnIntervalRef.current) {
          targetsRef.current.push(new Target())
          spawnTimerRef.current = 0
          if (spawnIntervalRef.current > 15) spawnIntervalRef.current -= 0.8
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

        batsRef.current = []
        applesRef.current = []

        for (let i = targetsRef.current.length - 1; i >= 0; i--) {
          const t = targetsRef.current[i]
          t.update()
          t.draw()

          if (t.imageObj.name === 'vampiro.png') {
            const b1 = new Bat(t.x, t.y)
            const b2 = new Bat(t.x, t.y)
            b1.update(t.x, t.y)
            b2.update(t.x, t.y)
            b1.draw()
            b2.draw()
          }

          if (t.imageObj.name === 'reina.png') {
            for (let j = 0; j < 3; j++) {
              const apple = new ShieldApple(t.x, t.y, j, 3)
              apple.update(t.x, t.y)
              apple.draw()
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

        drawCrosshair()
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
    <main className="relative min-h-screen bg-[#1a1a1a] text-white overflow-hidden flex flex-col items-center justify-center select-none" style={{ cursor: 'none' }}>
      <div className="relative shadow-[0_0_20px_rgba(0,0,0,0.8)] border-4 border-[#333] rounded-lg overflow-hidden">
        <canvas ref={canvasRef} className="block bg-gradient-to-b from-[#0f2027] via-[#203a43] to-[#2c5364]" />
        
        <div className="absolute top-4 left-4 right-4 flex justify-between text-xl font-bold drop-shadow-[2px_2px_4px_rgba(0,0,0,0.8)] pointer-events-none">
          <div>Puntos: <span id="score">{score}</span></div>
          <div>Vidas: <span id="lives">{'❤️'.repeat(Math.max(0, lives))}</span></div>
        </div>

        {gameOver && (
          <div className="absolute inset-0 bg-black/85 flex flex-col items-center justify-center gap-4 z-50">
            <h1 className="text-[#ff4757] text-4xl font-bold m-0">¡JUEGO TERMINADO!</h1>
            <p className="text-xl">Puntuación Final: <span>{score}</span></p>
            <button 
              onClick={restartGame}
              className="px-6 py-3 text-lg bg-[#2ed573] hover:bg-[#26af5f] text-white border-none rounded cursor-pointer transition-transform hover:scale-105"
            >
              Jugar de Nuevo
            </button>
          </div>
        )}
      </div>
    </main>
  )
}