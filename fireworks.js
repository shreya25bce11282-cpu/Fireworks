const canvas = document.getElementById('fireworks'); //You grab the HTML element <canvas> with the ID "fireworks".
const ctx = canvas.getContext('2d'); //ctx is the context for drawing 2D graphics on the canvas — think of it as your paintbrush and palette

//This function sets the canvas size to exactly match the browser window's width and height
//Canvas defaults to a fixed size if you don’t adjust it, so resizing helps the animation fill the screen.

function resize() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
window.addEventListener('resize', resize); //The event listener makes sure the canvas resizes automatically if the user changes the window size.
resize(); // Calling resize() once ensures the canvas is set correctly when the page loads.

//Uses HSL (Hue, Saturation, Lightness) color model.
function randomColor() {
  const h = Math.floor(Math.random() * 360); //Picks a random hue between 0 and 359 degrees to get varying colors
  return `hsl(${h}, 100%, 60%)`; 
  /*In the HSL color model, the values in hsl(${h}, 100%, 60%) represent:

100% (Saturation): This means the color is fully saturated, with no gray mixed in. At 100%, you get the purest, most intense version of the color. If you lower this value, the color becomes more washed out or grayish. At 0%, the color is completely gray, with no hue visible.​
60% (Lightness): This controls how light or dark the color is. At 0%, the color is black; at 100%, it's white. 50% is the "normal" color, neither too dark nor too light. 60% means the color is slightly lighter than the middle, so it appears brighter but not white.​
So, hsl(${h}, 100%, 60%) gives you a bright, fully saturated color with a lightness that makes it pop on a dark background.*/
}

class Particle {
  constructor(x, y, color, velocity, size = 2) {
    this.x = x;
    this.y = y;
    this.color = color;
    this.velocity = velocity; // {x: ..., y: ...}
    this.size = size;
    this.alpha = 1; // opacity
    this.gravity = 0.02; // gravity pulls particles down
    this.friction = 0.98; // slows them down over time
  }

  update() {
    this.velocity.x *= this.friction; // friction slows horizontal speed  
    //In your code, this.velocity.x *= this.friction; means the velocity is reduced a little every frame (like slowing down due to air resistance or friction). Multiplying by a number less than 1 (like 0.98) makes the value smaller each time, so the particle slows down gradually. 
    this.velocity.y *= this.friction; // friction slows vertical speed
    //In your code, this.velocity.y += this.gravity; means gravity is pulling the particle down, so its vertical speed increases a little every frame. Adding a small number each time makes the particle fall faster and faster, just like real gravity.
    this.velocity.y += this.gravity; // gravity pulls particle down
    this.x += this.velocity.x; // move particle horizontally
    this.y += this.velocity.y; // move particle vertically
    this.alpha -= 0.014; // fade particle gradually
  }

  draw(ctx) {
    ctx.save();
    ctx.globalAlpha = this.alpha; // sets transparency
    ctx.beginPath(); //This tells the canvas to start a new drawing path. It's like saying "I'm about to draw something new, so don't connect it to what I drew before.
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2); // This draws a circle (or arc) on the canvas
    /* this.x, this.y: The center of the circle (where the particle is).
    this.size: The radius of the circle (how big the particle is)
    0: The starting angle (in radians). 0 means the right side of the circle
    Math.PI * 2: The ending angle (in radians). This is a full circle (360°), because 2π radians = 360 degrees*/
    ctx.fillStyle = this.color; //Sets the color that will be used to fill the circle. Each particle can have its own color.
    ctx.fill(); //Fills the inside of the path (the circle) with the color you just set.
    ctx.restore(); //Restores the canvas to its previous state. This is used because you might have changed things like transparency (globalAlpha) before drawing, and you want to reset those changes for the next drawing.
  }
}

//An array to store all active particles so we can update & draw them every frame.
let particles = [];

function createFirework(x, y) {  //When a firework explodes at position (x, y), it creates many Particle instances.
  const n = 32 + Math.random() * 16; // This picks a random number of particles between 32 and about 48, so each firework looks a bit different.
  const color = randomColor(); //Chooses a random bright color for all particles in this firework
  for (let i = 0; i < n; i++) {
    const angle = (Math.PI * 2 / n) * i; /*Divides the full circle (360° or 2π radians) evenly among all particles.
This means particles spread out evenly in a circle around the explosion point spread particles evenly in circle*/
    const speed = Math.random() * 4 + 2; // Gives each particle a random speed between 2 and 6 units.

    /*Creates a new particle at (x, y) with:
The chosen color
Velocity calculated using trigonometry:
Horizontal speed: Math.cos(angle) * speed
Vertical speed: Math.sin(angle) * speed
A random size between 1 and 3
*/ 
    particles.push(new Particle(
      x,
      y,
      color,
      {
        /*Each particle is given a velocity pointing outward in a circle. We use trigonometry:
Math.cos(angle) and Math.sin(angle) give x and y directions for velocities.
speed varies to make the motion more natural*/
        x: Math.cos(angle) * speed, // horizontal velocity component
        y: Math.sin(angle) * speed // vertical velocity component
      },
      Math.random() * 2 + 1 // random size
    ));
  }
}

//When you click (pointerdown), a firework explodes where you clicked
canvas.addEventListener('pointerdown', e => {
  createFirework(e.clientX, e.clientY); /*The line createFirework(e.clientX, e.clientY); calls the createFirework function and passes in the x and y coordinates of where you clicked (or touched) on the canvas.
e.clientX is the horizontal position of your mouse or finger on the screen.
e.clientY is the vertical position.
What does this do?
It tells your code to create a firework explosion exactly at the spot where you clicked.
The function then generates lots of particles at that position, making it look like a firework going off right under your cursor.
In simple terms:
Whenever you click on the canvas, a firework appears at that spot.
*/ 
});

/*This sets up a listener for the mousemove event on your canvas. Whenever you move your mouse over the canvas, this function runs.​
The e is the event object, which contains info about the mouse position and more*/
canvas.addEventListener('mousemove', e => {
  if (Math.random() < 0.04) {  /*Math.random() gives a random number between 0 and 1.
This line means: "Only do the next step about 4% of the time when the mouse moves." This keeps fireworks from happening too often and makes the effect look more natural.*/
    createFirework(e.clientX, e.clientY); /*This calls your function to create a firework at the current mouse position.
e.clientX and e.clientY are the x and y coordinates of your mouse pointer, relative to the top-left corner of the browser window.​
So, as you move your mouse, sometimes a firework will explode right under your cursor.
*/
  }
});

function animate() {
  ctx.fillStyle = 'rgba(0,0,0,0.15)'; /*Sets the color for filling the canvas. Here, it's black (0,0,0) with a little transparency (0.15).
This means when you paint over the canvas, it doesn't fully cover what's already there, so old particles fade out smoothly instead of disappearing instantly.
*/
  ctx.fillRect(0, 0, canvas.width, canvas.height); /*Draws a rectangle that covers the whole canvas with the color you just set.
This is how you "fade out" the previous frame, creating a trailing effect for the particles.*/

/*Goes through every particle in your particles array.
For each particle:
p.update(); moves the particle and fades it a bit (updates its position and transparency).
p.draw(ctx); draws the particle as a colored circle on the canvas.
if (p.alpha <= 0) particles.splice(i, 1); removes the particle from the array if it has faded away (so your program doesn't waste time on invisible particles).
*/
  particles.forEach((p, i) => {
    p.update();
    p.draw(ctx);
    if (p.alpha <= 0) particles.splice(i, 1); // remove faded particles
  });

  requestAnimationFrame(animate); /*Tells the browser to run the animate function again before the next screen refresh (usually about 60 times per second).
This creates a smooth, continuous animation loop*/ 
}
animate(); //Starts the animation loop for the first time.












