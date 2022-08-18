// CANVAS
var canvas = document.getElementById("springmass-canvas");
canvas.width = canvas.clientWidth;
canvas.height = canvas.clientHeight;
var c = canvas.getContext("2d");
//Initialisation
var stop = true;
var sounds = false;
var firstmouseaction = false;
var fullscreentoggle = false;
var count = 0;
function soundToggle() {
  firstmouseaction = true;
  sounds = !sounds;
  if (sounds) {
    console.log("Sounds turned on");
  } else {
    console.log("Sounds turned off");
  }
}
function runToggle() {
  firstmouseaction = true;
  stop = !stop;
  if (stop) {
    console.log("stop ", stop);
    console.log("Run turned off");
  } else {
    console.log(stop);
    console.log("Run turned on");
  }
}

//  VARIABLES
var mouse = {
  x: undefined,
  y: undefined,
};
var mousedrop = {
  x: undefined,
  y: undefined,
};
var mouseclick = {
  x: undefined,
  y: undefined,
};
var r = 0.1 * canvas.width;
var dt = 0.1;
var meanposx = canvas.width / 2; 
var meanposy = canvas.height / 2; 
var zeta = 0.0;
const k = 4 * Math.PI ** 2;
const m = 1;
var omega_n = Math.sqrt(k / m);
var springWidth = r * 0.5;
var mouseInfluence = canvas.width; //1.5*r;
var firstmouseaction = false;

let drag = false; // true when mouse is kept pressed
let drop = false; // true when mouse is released

// ADDING EVENT LISTENERS
canvas.addEventListener("mousedown", (e) => {
  drag = false;
  drag = true;
  // mouseclick.x=e.x;
  // mouseclick.y=e.y;
  mouseclick.x = e.offsetX;
  mouseclick.y = e.offsetY;
});
canvas.addEventListener("touchstart", (e) => {
  e.preventDefault();
  drag = true;
  // mouseclick.x=e.touches[0].clientX;
  // mouseclick.y=e.touches[0].clientY;
  let box = canvas.getBoundingClientRect();
  mouseclick.x = e.touches[0].clientX - box.left;
  mouseclick.y = e.touches[0].clientY - box.top;
});
// RELEASE
canvas.addEventListener("mouseup", (e) => {
  drag = false;
  mousedrop.x = e.offsetX;
  mousedrop.y = e.offsetY;
});
canvas.addEventListener("touchend", (e) => {
  drag = false;
  e.preventDefault();
  mousedrop.x = mouse.x;
  mousedrop.y = mouse.y;
});

// MOUSE POSITION LISTENER
canvas.addEventListener("mousemove", (e) => {
  mouse.x = e.offsetX;
  mouse.y = e.offsetY;
});
canvas.addEventListener("touchmove", (e) => {
  e.preventDefault();
  let box = canvas.getBoundingClientRect();
  mouse.x = e.touches[0].clientX - box.left;
  mouse.y = e.touches[0].clientY - box.top;
});

// SOUND PLAYER FROM URL
function sound(url1) {
  if (sounds) {
    var audio1 = new Audio(url1);
    audio1.play();
  }
}

// SPRING sound url
const sound_url_spring =
  "http://codeskulptor-demos.commondatastorage.googleapis.com/pang/arrow.mp3";

// DEFINING THE SPRING MASS OBJECT CLASS
class Mass {
  constructor(x, y, dy, mass, stiffness, zeta) {
    this.x = x; // horizontal location of the mass
    this.y = y; // displacement from mean position vertical
    this.dy = dy; // velocity in y
    this.m = mass;
    this.k = stiffness;
    this.zeta = zeta; // Damping Loss Factor
    this.omega_n = Math.sqrt(this.k / this.m); // Undamped natural frequency
    if (this.zeta < 1) {
      this.omega_d = this.omega_n * Math.sqrt(1 - this.zeta ** 2);
    } else if (this.zeta == 1) {
      this.omega_d = 0;
    } else if (this.zeta > 1) {
      this.omega_d = this.omega_n * Math.sqrt(this.zeta ** 2 - 1);
    }
    this.t = 0;
    this.X0 = this.y;
    this.V0 = this.dy;
    this.draw = function () {
      // Draws a spring
      c.beginPath();
      c.moveTo(this.x, meanposy + this.y + r / 2);
      for (var i = 0; i <= 100; i++) {
        c.lineTo(
          this.x + (springWidth / 2) * Math.sin((i / 100) * 10 * Math.PI),
          meanposy + this.y + r / 2 + (i / 100) * (meanposy - this.y - r / 2)
        );
      }
      c.strokeStyle = "blue";
      c.lineWidth = 5;
      c.stroke();

      // Fill a rectangle
      c.fillStyle = "rgba(255,50,50,0.8)";
      c.fillRect(this.x - r / 2, meanposy + this.y - r / 2, r, r);
    };
    this.update = function (dt) {
      if (
        drag &&
        (Math.abs(this.x - mouse.x) < mouseInfluence ||
          mouse.x > 0.9 * canvas.width ||
          mouse.x < 0.1 * canvas.width)
      ) {
        // WHEN MASSES ARE DRAGGED THEIR POSITION IS CHANGED TO MOUSE POSITION AND VELOCITY IS RESET
        this.y = mouse.y - meanposy;
        this.X0 = this.y;
        this.V0 = 0;
        this.t = 0;
        firstmouseaction = true;
      } else if (stop == false) {
        // WHEN NO MOUSE HOLD DETECTED, CONTINUE ANIMATION AS PER PHYSICS

        if (this.t == 0 && firstmouseaction == true) {
          sound(sound_url_spring);
        }
        this.t = this.t + dt;

        // UNDER DAMPED
        if (this.zeta < 1) {
          this.y =
            Math.exp(-this.zeta * this.omega_n * this.t) *
            (this.X0 * Math.cos(this.omega_d * this.t) +
              ((this.V0 + this.zeta * this.omega_n * this.X0) / this.omega_d) *
                Math.sin(this.omega_d * this.t));
        }

        // CRITICAL DAMPING
        if (this.zeta == 1) {
          this.y =
            Math.exp(-this.omega_n * this.t) *
            (this.X0 + this.t * (this.V0 + this.omega_n * this.X0));
        }

        // OVERDAMPED
        if (this.zeta > 1) {
          // Using an escape condition to prevent NaNs running only upto t=1000
          if (
            this.t < 1000 &&
            Math.abs(this.y) > 0.01 &&
            this.omega_n * this.t < 40
          ) {
            this.y =
              Math.exp(-this.zeta * this.omega_n * this.t) *
              (this.X0 * Math.cosh(this.omega_d * this.t) +
                ((this.V0 + this.zeta * this.omega_n * this.X0) /
                  this.omega_d) *
                  Math.sinh(this.omega_d * this.t));
          }
        }
      }
      this.draw();
    };
  }
}

// Creating a new mass object
// constructor Mass(x,y,dy,m,k,zeta)
var mass1 = new Mass(0.5 * canvas.width, -canvas.width / 2 + 2*r, 0, m, k, 0.02);

// Event listener for window resizing
canvas.addEventListener("resize", function () {
  updateMeanPositions();
});

// Event listener for fullscreen change resizing
document.addEventListener("fullscreenchange", function () {
  updateMeanPositions();
});

function updateMeanPositions() {
  console.log("updating mean positions");
  canvas.width = canvas.clientWidth;
  canvas.height = canvas.clientHeight;
  meanposx = canvas.width / 2; 
  meanposy = canvas.height / 2; 
  console.log(canvas.width + " " + canvas.height);
  r = 0.05 * canvas.width;
  mass1.update(0);
  c.clearRect(0, 0, canvas.width, canvas.height);
}
let previoustime = 0;

// DEFINING THE ANIMATION
function animate(timestamp) {
  let delta = timestamp - previoustime;
  previoustime = timestamp;
  dt = delta / 1000;
  c.clearRect(0, 0, canvas.width, canvas.height);
  mass1.update(dt);
  requestAnimationFrame(animate);
}
window.requestAnimationFrame(animate)
setTimeout(()=>{ runToggle()},2000);
