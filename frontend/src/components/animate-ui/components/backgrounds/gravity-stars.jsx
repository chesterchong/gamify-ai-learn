import { useEffect, useRef } from 'react'

const clamp = (value, min, max) => Math.min(Math.max(value, min), max)

const randomInRange = (min, max) => Math.random() * (max - min) + min

function GravityStarsBackground({
  className = '',
  starsCount = 75,
  starsSize = 2,
  starsOpacity = 0.75,
  glowIntensity = 15,
  glowAnimation = 'ease',
  movementSpeed = 0.3,
  mouseInfluence = 100,
  mouseGravity = 'attract',
  gravityStrength = 75,
  starsInteraction = false,
  starsInteractionType = 'bounce',
  ...props
}) {
  const canvasRef = useRef(null)
  const animationRef = useRef(null)
  const starsRef = useRef([])
  const mouseRef = useRef({ x: 0, y: 0, active: false })

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) {
      return undefined
    }

    const ctx = canvas.getContext('2d')
    const dpr = window.devicePixelRatio || 1

    const resize = () => {
      const { width, height } = canvas.getBoundingClientRect()
      canvas.width = Math.max(1, Math.floor(width * dpr))
      canvas.height = Math.max(1, Math.floor(height * dpr))
      ctx.scale(dpr, dpr)
      starsRef.current = Array.from({ length: starsCount }, () => ({
        x: randomInRange(0, width),
        y: randomInRange(0, height),
        vx: randomInRange(-0.4, 0.4),
        vy: randomInRange(-0.4, 0.4),
        r: randomInRange(starsSize * 0.6, starsSize * 1.4),
        glow: randomInRange(0.6, 1.0),
      }))
    }

    resize()
    const resizeObserver = new ResizeObserver(resize)
    resizeObserver.observe(canvas)

    const handleMove = (event) => {
      const rect = canvas.getBoundingClientRect()
      mouseRef.current = {
        x: event.clientX - rect.left,
        y: event.clientY - rect.top,
        active: true,
      }
    }

    const handleLeave = () => {
      mouseRef.current.active = false
    }

    canvas.addEventListener('mousemove', handleMove)
    canvas.addEventListener('mouseleave', handleLeave)

    const animate = () => {
      const { width, height } = canvas.getBoundingClientRect()
      ctx.clearRect(0, 0, width, height)

      const mouse = mouseRef.current
      const baseGlow = clamp(glowIntensity, 0, 50)

      starsRef.current.forEach((star, index) => {
        const dx = mouse.x - star.x
        const dy = mouse.y - star.y
        const distance = Math.sqrt(dx * dx + dy * dy) || 1

        if (mouse.active) {
          const gravity = clamp((mouseInfluence / distance) * gravityStrength, 0, 5)
          const direction = mouseGravity === 'repel' ? -1 : 1
          star.vx += (dx / distance) * gravity * direction * 0.01
          star.vy += (dy / distance) * gravity * direction * 0.01
        }

        if (starsInteraction) {
          for (let j = index + 1; j < starsRef.current.length; j += 1) {
            const other = starsRef.current[j]
            const ox = other.x - star.x
            const oy = other.y - star.y
            const dist = Math.sqrt(ox * ox + oy * oy) || 1
            if (dist < starsSize * 4) {
              if (starsInteractionType === 'bounce') {
                const nx = ox / dist
                const ny = oy / dist
                star.vx -= nx * 0.02
                star.vy -= ny * 0.02
                other.vx += nx * 0.02
                other.vy += ny * 0.02
              } else if (starsInteractionType === 'merge') {
                star.vx += ox * 0.00005
                star.vy += oy * 0.00005
              }
            }
          }
        }

        star.x += star.vx * movementSpeed
        star.y += star.vy * movementSpeed

        if (star.x < -5) star.x = width + 5
        if (star.x > width + 5) star.x = -5
        if (star.y < -5) star.y = height + 5
        if (star.y > height + 5) star.y = -5

        const pulse =
          glowAnimation === 'instant'
            ? 1
            : glowAnimation === 'spring'
              ? 0.6 + Math.abs(Math.sin(Date.now() * 0.004 + index)) * 0.6
              : 0.8 + Math.abs(Math.sin(Date.now() * 0.002 + index)) * 0.4

        const alpha = clamp(star.glow * starsOpacity * pulse, 0, 1)

        ctx.beginPath()
        ctx.fillStyle = `rgba(202, 255, 43, ${alpha})`
        ctx.shadowColor = 'rgba(202, 255, 43, 0.6)'
        ctx.shadowBlur = baseGlow * pulse
        ctx.arc(star.x, star.y, star.r, 0, Math.PI * 2)
        ctx.fill()
      })

      animationRef.current = requestAnimationFrame(animate)
    }

    animationRef.current = requestAnimationFrame(animate)

    return () => {
      cancelAnimationFrame(animationRef.current)
      resizeObserver.disconnect()
      canvas.removeEventListener('mousemove', handleMove)
      canvas.removeEventListener('mouseleave', handleLeave)
    }
  }, [
    glowAnimation,
    glowIntensity,
    gravityStrength,
    mouseGravity,
    mouseInfluence,
    movementSpeed,
    starsCount,
    starsInteraction,
    starsInteractionType,
    starsOpacity,
    starsSize,
  ])

  return (
    <div className={className} {...props}>
      <canvas ref={canvasRef} className="h-full w-full" />
    </div>
  )
}

export { GravityStarsBackground }
