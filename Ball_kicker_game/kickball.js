//  object oriented animation of a circle


// This is a canvas tutorial

// ------ BASICS OF CANVAS
console.log('Hello player. Ready to kick some balls?')
// get the canvas by using query selector
var canvas =document.querySelector('canvas');
// changing the width and height of the canvas window
canvas.width= window.innerWidth;
canvas.height = window.innerHeight;
// console.log(canvas)
// getting the context of the canvas
var c=canvas.getContext('2d');
// c is going to be used so very often.


// GLOBAL VARIABLES
var mouse = {
    x: undefined,    y: undefined
}
var mouseInfluence=30;
var minLimit=4;
var maxLimit=50;
var kickPower=1;
var friction=0.01;
var x=window.innerWidth/2;
var y=window.innerHeight/2;
var r=30;
var dx=0;
var dy=0;


// ADDING EVENT LISTENERS
// This will be fired each time an event occurs
// An event may be a mouse 
// whenever there is a mouse move, this function is called
window.addEventListener('mousemove',
    function(event){
        //console.log(event)
        mouse.x=event.x;
        mouse.y=event.y;
    });
window.addEventListener('resize',
    function(event){
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    })



// Defining Circle object
function Circle(x,y,dx,dy,r){
    this.x=x; // position in x
    this.y=y; // position in y
    this.dx=dx; // velocity in x
    this.dy=dy; // velocity in y
    this.r=r; // radius of the circle
    // create a method inside the object
    // in this case an anonymous function without a name
    this.draw = function(){
        // console.log('draw operation')
        c.beginPath();

        c.arc(this.x,this.y,this.r, 0, Math.PI*2, false)

        c.strokeStyle = 'blue';
        c.stroke();
        c.fillStyle='rgba(255,0,0,0.8)' ;
        c.fill();
        // console.log('drawn')
    }
    this.update = function(){
                this.draw();
        this.x=this.x+this.dx;
        this.y=this.y+this.dy;
        // updating to next x position
        if (this.x+this.r>window.innerWidth ){
           this.dx=-this.dx;
           this.x=this.x-2*(this.x+this.r-window.innerWidth);
       }
       else if ( this.x-this.r<0){
            this.dx=-this.dx;
            this.x=this.x+2*(this.r-this.x);
        }
       // updating to next y position
       if (this.y-this.r<0 ) {
           this.dy=-this.dy;
           this.y=this.y+2*(this.r-this.y);
       }
       else if (this.y+this.r>window.innerHeight){
            this.dy=-this.dy;
           this.y=this.y-2*(this.y+this.r-window.innerHeight);
      
       }

       // updating the radius based on mouse location
       if ( ((this.x-mouse.x)**2+(this.y-mouse.y)**2) < mouseInfluence**2) {
            this.dx=this.dx+kickPower*(this.x-mouse.x);
            this.dy=this.dy+kickPower*(this.y-mouse.y);
        }
        
        // friction
        this.dx=this.dx*(1-friction);
        this.dy=this.dy*(1-friction);


    }

}





// Creating a new circle object
var ball = new Circle(x,y,dx,dy,r);


function animate(){  

 c.clearRect(0,0,window.innerWidth,window.innerHeight)
 ball.update();

     requestAnimationFrame(animate)
 }
// calling the animation
animate();









