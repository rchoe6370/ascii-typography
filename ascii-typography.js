const canvasSketch = require('canvas-sketch');
const random = require('canvas-sketch-util/random');
import { Pane } from './node_modules/tweakpane/dist/tweakpane.js';

const settings = {
  dimensions: [ 1080, 1080 ]
};

let manager;

const params = {
  text: 'A',
  fontSize: 60,
  fontFamily: 'serif',
  useGradient: false,
  gradientType: 'horizontal',
  textColor1: '#ff0000',
  textColor2:'#0000ff',
  showGrid: false,
  invertColors: false,
  glyphPreset: 'classic',
}

const glyphPresets = {
  classic: ' .-+_= /',
  blocks: ' ░▒▓█',
  binary: ' 01',
  music: ' ♩♪♫♬',
  math: ' -+⨯=∞√∑∫',
  arrows: ' ←→↑↓↙↖↗↘',
};


const typeCanvas = document.createElement('canvas');
const typeContext = typeCanvas.getContext('2d');

const createPane = () => {
  const pane = new Pane();
  let folder;

  folder = pane.addFolder({ title: 'Typography'});
  folder.addInput(params, 'text', { label: 'Text' });
  folder.addInput(params, 'fontFamily', { 
    options: { 
      'Serif': 'serif',
      'Arial': 'Arial, serif',
      'Courier': '"Courier New", monospace',
      'Impact': 'Impact, serif',

      'Apple System': '-apple-system, BlinkMacSystemFont, sans-serif',
      'Segoe UI': '"Segoe UI", Tahoma, serif',

      'Comic Sans': '"Comic Sans MS", cursive',
      'Copperplate': 'Copperplate, Fantasy',
      'Papyrus': 'Papyrus, Fantasy'
    },
    label: 'Font'
  });
  folder.addInput(params, 'fontSize', { min: 1, max: 800, label: 'Font Size' });

  folder = pane.addFolder({ title: 'Styles' });
  folder.addInput(params, 'useGradient', { label: 'Gradient' });
  folder.addInput(params, 'textColor1', { label: 'Base Color' });
  folder.addInput(params, 'showGrid', { label: 'Show Grid' });
  folder.addInput(params, 'invertColors', { label: 'Invert Colors' });
  folder.addInput(params, 'glyphPreset', {
    options: {
      'Classic': 'classic',
      'Blocks': 'blocks',
      'Binary': 'binary',
      'Music': 'music',
      'Math': 'math',
      'Arrows': 'arrows',
    },
    label: 'Glyph Preset'
  });

  folder = pane.addFolder({ title: 'Gradient' });
  folder.addInput(params, 'gradientType', {
    options: {
      'Horizontal': 'horizontal',
      'Vertical': 'vertical',
      'Diagonal': 'diagonal',
      'Radial': 'radial',
      'Perlin': 'perlin',
    },
    label: 'Gradient Type'
  });
  folder.addInput(params, 'textColor2', { label: 'End Color '});

  folder = pane.addFolder({ title: 'Actions' });
  const exportBtn = folder.addButton({ title: 'Export PNG' });
  exportBtn.on('click', () => {
    const canvases = document.querySelectorAll('canvas');
    const canvas = canvases[2];

    if(!canvas) return;

    const link = document.createElement('a');
    link.download = 'ascii-art.png';
    link.href = canvas.toDataURL('image/png');
    link.click();
  });

  pane.on('change', () => {
    if (manager) manager.render();
  });
};

createPane();

const sketch = ({ context, width, height, frame }) => {
  //const cell = 20;
  const cell = params.fontSize / 3;
  const cols = Math.floor(width / cell);
  const rows = Math.floor(height / cell);
  const numCells = cols * rows;

  typeCanvas.width = cols;
  typeCanvas.height = rows;

  return ({ context, width, height }) => {
    typeContext.fillStyle = 'black';
    typeContext.fillRect(0, 0, cols, rows);

    //params.fontSize = cols * 1.2;
    
    typeContext.fillStyle = 'white';
    //typeContext.font = fontSize + 'px ' + fontFamily;
    typeContext.font = `${params.fontSize}px ${params.fontFamily}`;
    typeContext.textBaseline = 'top';
    // typeContext.textAlign = 'center';

    const metrics = typeContext.measureText(params.text);
    const mx = metrics.actualBoundingBoxLeft * -1;
    const my = metrics.actualBoundingBoxAscent * -1;
    const mw = metrics.actualBoundingBoxLeft + metrics.actualBoundingBoxRight;
    const mh = metrics.actualBoundingBoxAscent + metrics.actualBoundingBoxDescent;

    const tx = (cols - mw) * 0.5 - mx;
    const ty = (rows - mh) * 0.5 - my;

    typeContext.save();
    typeContext.translate(tx, ty);

    typeContext.beginPath();
    typeContext.rect(mx, my, mw, mh);
    typeContext.stroke();

    typeContext.fillText(params.text, 0, 0);
    typeContext.restore();

    const typeData = typeContext.getImageData(0, 0, cols, rows).data;
    //console.log(typeData);

    
    context.fillStyle = 'black';
    context.fillRect(0, 0, width, height);

    context.textBaseline = 'middle';
    context.textAlign = 'center';
    
    // context.drawImage(typeCanvas, 0, 0);

    for (let i = 0; i < numCells; i++) {
      const col = i % cols;
      const row = Math.floor(i / cols);

      const x = col * cell;
      const y = row * cell;

      const r = typeData[i * 4 + 0];
      const g = typeData[i * 4 + 1];
      const b = typeData[i * 4 + 2];
      const a = typeData[i * 4 + 3];

      const glyph = getGlyph(r);
      //const glyph = '@';

      context.font = `${cell * 2}px ${params.fontFamily}`;
      if (Math.random() < 0.1) context.font = `${cell * 6}px ${params.fontFamily}`;


      if (params.useGradient) {
        let t;

        switch (params.gradientType) {
          case 'horizontal':
            t = col / cols;
            break;
          
          case 'vertical':
            t = row / rows;
            break;
          
          case 'diagonal':
            t = (col / cols + row / rows) / 2;
            break;
          
          case 'radial':
            const dx = col - cols / 2;
            const dy = row - rows / 2;

            const distance = Math.sqrt(dx * dx + dy * dy);

            const maxDist = Math.sqrt(Math.pow(cols / 2, 2) + Math.pow(rows / 2, 2));

            t = distance / maxDist;
            break;
          
          case 'perlin':
            t = (random.noise2D(col * 0.05, row * 0.05) + 1) / 2;
            break;

        }

        const c1 = hexToRgb(params.textColor1);
        const c2 = hexToRgb(params.textColor2);

        const rr = Math.floor(c1.r * (1 - t) + c2.r * t);
        const gg = Math.floor(c1.g * (1 - t) + c2.g * t);
        const bb = Math.floor(c1.b * (1 - t) + c2.b * t);

        context.fillStyle = `rgb(${rr}, ${gg}, ${bb})`;
      } else {
        context.fillStyle = params.textColor1;
      }

      context.save();
      context.translate(x, y);
      context.translate(cell * 0.5, cell * 0.5);

      //context.fillRect(-5, -5, 10, 10);

      context.fillText(glyph, 0, 0);

      context.restore();
    }

    //if showGrid is toggled true
    if (params.showGrid) {
      context.strokeStyle = '#ccc';
      context.lineWidth = 0.25;

      for (let i = 0; i < width; i += rows) {
        context.beginPath();
        context.moveTo(i, 0);
        context.lineTo(i, height);
        context.stroke();
      }

      for (let j = 0; j < height; j += cols) {
        context.beginPath();
        context.moveTo(0, j);
        context.lineTo(width, j);
        context.stroke();
      }
    }

    

    if (params.invertColors) {
      context.save();
      context.globalCompositeOperation = 'difference';
      context.fillStyle = 'white';
      context.fillRect(0, 0, width, height);
      context.restore();
    }
  };
};

const getGlyph = (v) => {
  
  const glyphs = glyphPresets[params.glyphPreset];

  const index = Math.floor( (v / 255) * (glyphs.length - 1));

  return glyphs[index];
}

function hexToRgb(hex) {
  if (!hex) return { r: 255, g: 255, b: 255 };

  const clean = hex.replace('#', '');

  return {
    r: parseInt(clean.substring(0, 2), 16),
    g: parseInt(clean.substring(2, 4), 16),
    b: parseInt(clean.substring(4, 6), 16),
  };
}

// const onKeyUp = (e) => {
//   params.text = e.key.toUpperCase();
//   manager.render();
// }

// document.addEventListener('keyup', onKeyUp);

const start = async () => {
  //canvasSketch is an asynchronous function
  manager = await canvasSketch(sketch, settings);
};

start();


/*
const url = 'https://picsum.photos/200';

const loadMeSomeImage = (url) => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject();
    img.src = url;
  });
};

const start = async () => {
  //await - basically running asynchronous tasks synchronously
  const img = await loadMeSomeImage(url);
  console.log('image width', img.width);
  console.log('this line');
};

// const start = () => {
//   //asynchronous function
//   loadMeSomeImage(url).then(img => {
//     console.log('image width', img.width);
//   });
//   //synchronous function
//   console.log('this line');
// };

start();
*/