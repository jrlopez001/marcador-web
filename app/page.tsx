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
  const imagesRef = useRef<HTMLImageElement[]>([])
  
  const mousePosRef = useRef({ x: 0, y: 0 })
  const scoreRef = useRef(0)
  const gameOverRef = useRef(false)
  const spawnTimerRef = useRef(0)
  const spawnIntervalRef = useRef(70)

  scoreRef.current = score
  gameOverRef.current = gameOver

  // Cargar las 6 imágenes PNG desde la carpeta /public
  useEffect(() => {
    const imageNames = [
      'diablo.png',
      'calabaza.png',
      'reina.png',
      'frankenstein.png',
      'vampiro.png',
      'mago.png'
    ]

    const loaded: HTMLImageElement[] = []
    imageNames.forEach((name) => {
      const img = new Image()
      img.src = `/${name}`
      loaded.push(img)
    })
    imagesRef.current = loaded
  }, [])

  const restartGame = () => {
    setScore(0)
    setLives(3)
    setGameOver(false)
    scoreRef.current = 0
    gameOverRef.current = false
    targetsRef.current = []
    particlesRef.current = []
    spawnIntervalRef.current = 70
    spawnTimerRef.current = 0
  }

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    // Añadimos el signo '!' para asegurar a TypeScript que ctx no es nulo
    const ctx = canvas.getContext('2d')!
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
      image: HTMLImageElement

      constructor() {
        this.size = 70
        const currentCanvas = canvasRef.current!
        this.x = Math.random() * (currentCanvas.width - this.size * 2) + this.size
        this.y = -this.size
        this.speed = 1.5 + Math.random() * 2 + scoreRef.current / 150
        
        const imgs = imagesRef.current
        this.image = imgs[Math.floor(Math.random() * imgs.length)]
      }

      update() {
        this.y += this.speed
      }

      draw() {
        ctx.save()
        if (this.image && this.image.complete && this.image.naturalWidth !== 0) {
          ctx.drawImage(
            this.image,
            this.x - this.size / 2,
            this.y - this.size / 2,
            this.size,
            this.size
          )
        } else {
          ctx.beginPath()
          ctx.arc(this.x, this.y, this.size / 2, 0, Math.PI * 2)
          ctx.fillStyle = '#ffe0bd'
          ctx.fill()
          ctx.lineWidth = 2
          ctx.strokeStyle = '#d4a373'
          ctx.stroke()
        }
        ctx.restore()
      }
    }

    class Particle {
      x: number
      y: number
      radius: number
      color: string
      vx: number
      vy: number
      alpha: number
      decay: number

      constructor(x: number, y: number) {
        this.x = x
        this.y = y
        this.radius = Math.random() * 5 + 2
        this.color = `hsl(${Math.random() * 40 + 10}, 100%, 50%)`
        this.vx = (Math.random() - 0.5) * 8
        this.vy = (Math.random() - 0.5) * 8
        this.alpha = 1
        this.decay = Math.random() * 0.03 + 0.015
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

    const createExplosion = (x: number, y: number) => {
      for (let i = 0; i < 25; i++) {
        particlesRef.current.push(new Particle(x, y))
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
          targets.splice(i, 1)
          setScore(prev => prev + 10)
          break
        }
      }
    }

    window.addEventListener('mousedown', handleMouseDown)

    const gameLoop = () => {
      if (gameOverRef.current || !canvasRef.current) return

      ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height)

      spawnTimerRef.current++
      if (spawnTimerRef.current >= spawnIntervalRef.current) {
        targetsRef.current.push(new Target())
        spawnTimerRef.current = 0
        if (spawnIntervalRef.current > 30) spawnIntervalRef.current -= 0.5
      }

      for (let i = targetsRef.current.length - 1; i >= 0; i--) {
        const t = targetsRef.current[i]
        t.update()
        t.draw()

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
        if (p.alpha <= 0) {
          particlesRef.current.splice(i, 1)
        }
      }

      drawCrosshair()
      animationRef.current = requestAnimationFrame(gameLoop)
    }

    gameLoop()

    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current)
      window.removeEventListener('resize', handleResize)
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mousedown', handleMouseDown)
    }
  }, [gameOver])

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