const canvasSketch = require('canvas-sketch');
const random = require('canvas-sketch-util/random');

const settings = {
    dimensions: [ 1080, 1080 ],
    animate: true
};

const particles = [];
const particleSize = 3.4;
const offset = 0.05;
const noiseScale = 0.003;
const speed = 2;

const sketch = ({ context, canvas, width, height }) => {
    const numParticles = 2000;

    for (let i = 0; i < numParticles; i++) {
        let x = random.range(width);
        let y = random.range(height);

        const color = random.value() > 0.5 ? 'hsla(195, 100%, 50%, 0.55)' : 'hsla(255, 100%, 50%, 0.55)';

        let particle = new Particle({ x, y, color, width, height });

        particles.push(particle);
    }

    context.fillStyle = 'black';
    context.fillRect(0, 0, width, height);

    return ({ context, width, height }) => {
        //every frame, 60fps

        context.fillStyle = 'rgba(0, 0, 0, 0.05)';
        context.fillRect(0, 0, width, height);

        particles.forEach(particle => {
            particle.update();
            particle.draw(context);
        })

    };
};

canvasSketch(sketch, settings);

const curl = ({ x, y }) => {
    //sample heights around (x, y)
    const up = random.noise2D(x, y + offset);
    const down = random.noise2D(x, y - offset);
    const right = random.noise2D(x + offset, y);
    const left = random.noise2D(x - offset, y);

    //finding slopes
    const dx = (up - down) / (2 * offset);

    //rotating gradient 90 deg
    //basically following contour of hill rather than going up/down it
    const dy = (left - right) / (2 * offset);

    //offset controls how far apart the samples are

    return { dx, dy }
};

class Particle {
    constructor({ x, y, color, width, height }) {
        this.x = x;
        this.y = y;
        
        this.color = color;

        this.width = width;
        this.height = height;
    }

    update() {
        const direction = curl({ x: this.x * noiseScale, y: this.y * noiseScale });

        const mag = Math.sqrt(direction.dx * direction.dx + direction.dy * direction.dy);

        //normalizing vector direction
        if (mag > 0) {
            direction.dx = direction.dx / mag;
            direction.dy = direction.dy / mag;
        }

        this.x += direction.dx * speed;
        this.y += direction.dy * speed;

        if (this.x < 0 || this.x > this.width || this.y < 0 || this.y > this.height) {
            this.reset()
        }
    }

    reset() {
        this.x = random.range(this.width);
        this.y = random.range(this.height);
    }

    draw(context) {
        context.save();
        context.translate(this.x, this.y);
        context.fillStyle = this.color;

        context.beginPath();
        context.fillRect(0, 0, particleSize, particleSize);

        context.restore();
    }
}