class PointerParticle {
  constructor(spread, speed, component) {
    const { ctx, pointer, hue } = component;

    this.ctx = ctx;
    this.x = pointer.x;
    this.y = pointer.y;
    this.mx = pointer.mx * 0.1;
    this.my = pointer.my * 0.1;
    this.size = Math.random() * 5 + 1; // Tamanho aleatório
    this.decay = 0.01;
    this.speed = speed * 0.08;
    this.spread = spread * this.speed;
    this.spreadX = (Math.random() - 0.5) * this.spread - this.mx;
    this.spreadY = (Math.random() - 0.5) * this.spread - this.my;
    this.color = `hsl(${Math.random() * 360}, 90%, 60%)`; // Cor aleatória
  }

  draw() {
    this.ctx.fillStyle = this.color;
    this.ctx.beginPath();
    this.ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    this.ctx.fill();
  }

  collapse() {
    this.size -= this.decay;
  }

  trail() {
    this.x += this.spreadX * this.size;
    this.y += this.spreadY * this.size;
  }

  update() {
    this.draw();
    this.trail();
    this.collapse();
  }
}

class PointerParticles extends HTMLElement {
  static register(tag = "pointer-particles") {
    if ("customElements" in window) {
      customElements.define(tag, this);
    }
  }

  static css = `
    :host {
      display: grid;
      width: 100%;
      height: 100%;
      pointer-events: none;
      background: linear-gradient(135deg, #1a1a1a, #333); /* Fundo dinâmico */
      transition: background 0.5s; /* Transição suave para o fundo */
    }
  `;

  constructor() {
    super();

    this.canvas;
    this.ctx;
    this.fps = 60;
    this.msPerFrame = 1000 / this.fps;
    this.timePrevious;
    this.particles = [];
    this.pointer = {
      x: 0,
      y: 0,
      mx: 0,
      my: 0
    };
    this.hue = 0;

    // Adicionando um efeito sonoro
    this.sound = new Audio('path/to/your/sound.mp3'); // Substitua pelo caminho do seu arquivo de som
  }

  connectedCallback() {
    const canvas = document.createElement("canvas");
    const sheet = new CSSStyleSheet();

    this.shadowroot = this.attachShadow({ mode: "open" });

    sheet.replaceSync(PointerParticles.css);
    this.shadowroot.adoptedStyleSheets = [sheet];

    this.shadowroot.append(canvas);

    this.canvas = this.shadowroot.querySelector("canvas");
    this.ctx = this.canvas.getContext("2d");
    this.setCanvasDimensions();
    this.setupEvents();
    this.timePrevious = performance.now();
    this.animateParticles();
  }

  createParticles(event, { count, speed, spread }) {
    this.setPointerValues(event);

    // Reproduzindo o som ao criar partículas
    this.sound.currentTime = 0; // Reinicia o som
    this.sound.play();

    for (let i = 0; i < count; i++) {
      this.particles.push(new PointerParticle(spread, speed, this));
    }
  }

  setPointerValues(event) {
    this.pointer.x = event.x - this.offsetLeft;
    this.pointer.y = event.y - this.offsetTop;
    this.pointer.mx = event.movementX;
    this.pointer.my = event.movementY;
  }

  setupEvents() {
    const parent = this.parentNode;

    parent.addEventListener("click", (event) => {
      this.createParticles(event, {
        count: 300,
        speed: Math.random() + 1,
        spread: Math.random() + 50
      });
    });

    parent.addEventListener("pointermove", (event) => {
      this.createParticles(event, {
        count: 20,
        speed: this.getPointerVelocity(event),
        spread: 1
      });
    });

    window.addEventListener("resize", () => this.setCanvasDimensions());
  }

  getPointerVelocity(event) {
    const a = event.movementX;
    const b = event.movementY;
    const c = Math.floor(Math.sqrt(a * a + b * b));

    return c;
  }

  handleParticles() {
    for (let i = 0; i < this.particles.length; i++) {
      this.particles[i].update();

      if (this.particles[i].size <= 0.1) {
        this.particles.splice(i, 1);
        i--;
      }
    }
  }

  setCanvasDimensions() {
    const rect = this.parentNode.getBoundingClientRect();

    this.canvas.width = rect.width;
    this.canvas.height = rect.height;
  }

  animateParticles() {
    requestAnimationFrame(() => this.animateParticles());

    const timeNow = performance.now();
    const timePassed = timeNow - this.timePrevious;

    if (timePassed < this.msPerFrame) return;

    const excessTime = timePassed % this.msPerFrame;

    this.timePrevious = timeNow - excessTime;

    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.hue = this.hue > 360 ? 0 : (this.hue += 3);

    // Mudando o fundo dinamicamente
    this.shadowroot.host.style.background = `hsl(${this.hue}, 50%, 20%)`;

    this.handleParticles();
  }
}

// Registro do elemento customizado
PointerParticles.register();

// Contagem Regressiva para o Natal
function updateCountdown() {
  const now = new Date();
  const christmas = new Date(now.getFullYear(), 11, 25); // 25 de dezembro

  // Se já passou o Natal, conta para o próximo ano
  if (now > christmas) {
    christmas.setFullYear(christmas.getFullYear() + 1);
  }

  const timeDiff = christmas - now;

  const days = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((timeDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((timeDiff % (1000 * 60)) / 1000);

  // Atualiza o conteúdo do elemento
  document.getElementById("countdown").innerHTML = 
    `${days}d ${hours}h ${minutes}m ${seconds}s até o Natal!`;
}

// Atualiza a contagem a cada segundo
setInterval(updateCountdown, 1000);
updateCountdown(); // Chama a função uma vez para inicializar

// Função para arrastar e soltar os enfeites na árvore de Natal
const ornaments = document.querySelectorAll('.ornament');
const tree = document.getElementById('tree');

ornaments.forEach(ornament => {
  ornament.addEventListener('dragstart', (e) => {
    e.dataTransfer.setData('text/plain', e.target.style.backgroundColor);
  });
});

tree.addEventListener('dragover', (e) => {
  e.preventDefault(); // Permite o drop
});

tree.addEventListener('drop', (e) => {
  e.preventDefault();
  const color = e.dataTransfer.getData('text/plain');
  const newOrnament = document.createElement('div');
  newOrnament.className = 'ornament';
  newOrnament.style.backgroundColor = color;
  newOrnament.style.position = 'absolute';
  newOrnament.style.left = `${e.clientX - tree.getBoundingClientRect().left - 15}px`; // Ajuste para centralizar
  newOrnament.style.top = `${e.clientY - tree.getBoundingClientRect().top - 15}px`; // Ajuste para centralizar
  tree.appendChild(newOrnament);
});