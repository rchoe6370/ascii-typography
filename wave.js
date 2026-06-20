const canvasSketch = require('canvas-sketch');
const random = require('canvas-sketch-util/random');

const settings = {
  dimensions: [ 1080, 1080 ],
  animate: true
};

const particles = [];
const numParticles = 120;

const sketch = ({ context, width, height }) => {  
  
  for (let i = 0; i < numParticles; i++) {


      let x = random.range(width);
      let y = random.range(height);

      let type = Math.random() < 0.1 ? 'heavy' : 'normal';

      let particle = new Particle({ x, y, type, width, height });

      particles.push(particle);    
  }

  
  return ({ context, width, height }) => {
    context.fillStyle = 'black';
    context.fillRect(0, 0, width, height);

    particles.forEach(particle => {
      particle.update();
      particle.draw(context);
    });

    connect(context);
  };
};

const connect = (context) => {
  for (let i = 0; i < numParticles; i++) {
    for (let j = i + 1; j < numParticles; j++) {
      let ax = particles[i].x;
      let ay = particles[i].y;
      let bx = particles[j].x;
      let by = particles[j].y;

      let dx = ax - bx;
      let dy = ay - by;
      let dd = Math.sqrt(dx * dx + dy * dy)
      let maxdd = 100;
      let maxddd = 200;

      //reduces fps drops lol
      if (Math.abs(dx) > maxdd || Math.abs(dy) > maxdd) continue;


      if (dd < maxddd) {
        context.save()
        context.strokeStyle = 'white';
        context.lineWidth = 2;

        context.beginPath();
        context.moveTo(ax, ay);
        context.lineTo(bx, by);
        context.stroke();
        context.restore();
      }
    }
  }
}

canvasSketch(sketch, settings);

class Particle {
  constructor({ x, y, type = 'normal', width, height }) {
    this.x = x;
    this.y = y;
    this.type = type;

    this.radius = this.type === 'heavy' ? 15 : 8;
    this.color = this.type === 'heavy'? '#ff0000' : '#ffffff';

    this.width = width;
    this.height = height;

    this.vx = (Math.random() * 5) - 2.5;
    this.vy = (Math.random() * 5) - 2.5;
  }

  update() {

    this.x += this.vx;
    this.y += this.vy;

    if (this.x < 0 || this.x > this.width) {
      this.vx *= -1;
    }

    if (this.y < 0 || this.y > this.height) {
      this.vy *= -1;
    }
  }

  draw(context) {
    context.save();
    context.translate(this.x, this.y);
    context.fillStyle = this.color;

    context.beginPath();
    context.arc(0, 0, this.radius, 0, Math.PI * 2);
    context.fill();

    context.restore();
  }
}

