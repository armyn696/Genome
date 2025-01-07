import { useEffect, useRef } from 'react';
import p5 from 'p5';

const Background = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const sketch = (p: p5) => {
      let particles: { x: number; y: number; speed: number }[] = [];
      let mouseX = p.windowWidth / 2;
      let mouseY = p.windowHeight / 2;

      p.setup = () => {
        const canvas = p.createCanvas(window.innerWidth, window.innerHeight);
        canvas.position(0, 0);
        canvas.style('z-index', '-1');

        for (let i = 0; i < 50; i++) {
          particles.push({
            x: p.random(p.width),
            y: p.random(p.height),
            speed: p.random(0.25, 1) // Reduced speed range from (0.5, 2) to (0.25, 1)
          });
        }
      };

      p.draw = () => {
        p.clear();
        p.background(7, 6, 9, 220);

        // Smooth mouse tracking
        mouseX = p.lerp(mouseX, p.mouseX, 0.1);
        mouseY = p.lerp(mouseY, p.mouseY, 0.1);

        particles.forEach((particle, i) => {
          // Basic particle movement
          particle.y += particle.speed;
          if (particle.y > p.height) {
            particle.y = 0;
            particle.x = p.random(p.width);
          }

          // Enhanced mouse interaction
          const distToMouse = p.dist(particle.x, particle.y, mouseX, mouseY);
          if (distToMouse < 150) {
            const angle = p.atan2(particle.y - mouseY, particle.x - mouseX);
            const force = p.map(distToMouse, 0, 150, 4, 0);
            particle.x += p.cos(angle) * force;
            particle.y += p.sin(angle) * force;
          }

          // Draw particle
          p.noStroke();
          p.fill(155, 135, 245, 100);
          p.ellipse(particle.x, particle.y, 4, 4);

          // Draw connections
          particles.forEach((other, j) => {
            if (i !== j) {
              const d = p.dist(particle.x, particle.y, other.x, other.y);
              if (d < 100) {
                p.stroke(155, 135, 245, 50);
                p.line(particle.x, particle.y, other.x, other.y);
              }
            }
          });
        });
      };

      p.windowResized = () => {
        p.resizeCanvas(window.innerWidth, window.innerHeight);
      };
    };

    new p5(sketch, containerRef.current);
  }, []);

  return <div ref={containerRef} className="fixed inset-0" />;
};

export default Background;