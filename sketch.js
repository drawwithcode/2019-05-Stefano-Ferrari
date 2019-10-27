var capture;
var myPlayerArray = [];
var myGhostSegs = [];
var mySkeletons = [];
var nerfX = 0.2;
var nerfY = 0.1;
var prevWhitePixels = 0;
var start = false;
var score;
var gameOver = false;

function preload() {
  spooky = loadSound('assets/Spooky Scary Skeletons.mp3');
  doot = loadImage('assets/doot.png');
  luce = loadImage('assets/luce.jpg');
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  rectMode(CENTER);
  capture = createCapture(VIDEO);
  capture.size(40, 30);
  capture.hide();
  frameRate(30);
  angleMode(DEGREES);


  var myPlayer = new Player();
  myPlayerArray.push(myPlayer);

  for (var i = 0; i < 5; i++) {
    var doot = new Skeletons();
    mySkeletons.push(doot);
  }


}

function draw() {

  var whitePixels = 0; //reset the whitePixels count
  var p = myPlayerArray[0];

  if (frameCount % 200 == 0) { //generate a new skeleton every 200 frame
    var doot = new Skeletons();
    mySkeletons.push(doot);
  }

  background(10);

  imageMode(CORNER);
  var myImage = capture.loadPixels(); //display a small webcam preview
  image(myImage, 0, 0);
  filter(THRESHOLD, 0.3); //filter to display only black or white pixels

  for (var i = 0; i < 40; i += 2) {
    for (var j = 0; j < 30; j += 2) {
      var thisX = i;
      var thisY = j;
      var col = get(thisX, thisY); //get the color of the (i,j) pixel
      if (col[0] == 255 && i > 19) {
        whitePixels--; //if the majority of white pixels are on the right side of the screen the counter will be negative...
      } else if (col[0] == 255 && i < 19) {
        whitePixels++; //...otherwise it will be positive.
      }
      fill(col);
      noStroke();
      rect(thisX, thisY, 2, 2);
    }
  }

  //Checks that the ghost don't starts to move before the webcam is ready
  if (frameCount > 1 && whitePixels != prevWhitePixels) {
    p.speedX = whitePixels * nerfX; //if the white pixels are on the left, the speed will be positive, since the webcam is mirrored.
                                    //so if you move to the right to ghost will move to the right too.
    prevWhitePixels = whitePixels;  //If the pixel count don't change the ghost don't move. (this is a bit redundant)
  } else {
    prevWhitePixels = whitePixels;
  }

  if(start == false){

  fill('white');
  textFont('Minecraft');
  textAlign(CENTER);
  textSize(25);
  text('We are going to play a game...', windowWidth/2, windowHeight/8);
  textSize(80);
  text('A spooky game!', windowWidth/2, 90+windowHeight/8);
  textSize(25);
  text('So, to set the mood, you must turn off the lights behind you', windowWidth/2, 160+windowHeight/8);
  image(luce,-150+windowWidth/2,220+windowHeight/8,300,200);
  text('Move your head to move your character left and right,',windowWidth/2,500+windowHeight/8);
  text('use the mouse to move it up and down. Run away from the skeletons!',windowWidth/2,530+windowHeight/8);
  textSize(50);
  text('Ready? Click to start!',windowWidth/2,600+windowHeight/8);

  textSize(10);
  text('<--- this is you!', 90,20);


}else {

  background(10);

  if (gameOver == false) {

    //player instructions
    p.move();
    p.display();

    //skeletons instructions
    for (var j = 0; j < mySkeletons.length; j++) {
      var s = mySkeletons[j];
      s.move();
      s.display();
      s.check();
    }

    score = Math.floor(frameCount / 15);

    fill('white');
    textFont('Minecraft');
    textSize(50);
    text(score, windowWidth-50, 50); //display the actual score
  } else {
    //Game over screen
    fill('white');
    textFont('Minecraft');
    textAlign(CENTER);
    textSize(50);
    text('Your Score is ' + score, windowWidth / 2, windowHeight / 4);
    textSize(100);
    text('Game Over', windowWidth / 2, windowHeight / 2);
    textSize(30);
    text('Click anywhere to restart', windowWidth / 2, windowHeight / 1.2);

    if (mouseIsPressed) {
      location.reload(); //restart the page
    }
  }

  }
}

function Player() {
  this.x = windowWidth / 2;
  this.y = windowHeight / 2;
  this.diameter = 70;
  this.speedX = 0;
  this.speedY = 0;
  this.dist = 5;
  this.dx = 0;
  this.dy = 0;

  //Things starts to get complicated from here, probably i could have found a better solution but it was a kind of trial and error.

  for (var i = 0; i < 10; i++) {
    var gs = new GhostSeg();
    myGhostSegs.push(gs); //Create the segments of the body of the ghost as objects.
  }

  this.move = function() {
    if (this.x >= 0 && this.x <= windowWidth) {
      this.x += this.speedX;
    } else if (this.x < 0) {
      this.x = 0; //check that the ghost doesn't go off screen.
    } else if (this.x > windowWidth) {
      this.x = windowWidth;
    }

    this.speedY = ((windowHeight / 2) - mouseY) * nerfY; //if the mouse is on the lower part of the screen the Y speed is negative.

    if (this.y >= 0 && this.y <= windowHeight) {
      this.y += this.speedY;
    } else if (this.y < 0) {
      this.y = 0; //check that the ghost doesn't go off screen.
    } else if (this.y > windowHeight) {
      this.y = windowHeight;
    }

  }

  this.display = function() {
    fill(255);
    // ellipse(this.x, this.y, this.diameter);

    for (var i = 0; i < 10; i++) {
      if (i == 0) { //first segment (ghost's head)
        myGhostSegs[i].x = this.x;
        myGhostSegs[i].y = this.y;
        ellipse(this.x, this.y, this.diameter);
      } else { //define the position of the other segment (i've seen similar code used for snakes and similar thing from other students)
        this.dx = myGhostSegs[i - 1].x - myGhostSegs[i].x;
        this.dy = myGhostSegs[i - 1].y - myGhostSegs[i].y;
        var angle = atan2(this.dy, this.dx);
        myGhostSegs[i].x = myGhostSegs[i - 1].x - cos(angle) * this.dist;
        myGhostSegs[i].y = myGhostSegs[i - 1].y - sin(angle) * this.dist;
        ellipse(myGhostSegs[i].x, myGhostSegs[i].y, this.diameter);
      }

    }

    //Ghost face
    fill(0);
    ellipse(this.x + 10, this.y - 2, 12);
    ellipse(this.x - 10, this.y - 2, 12);
    arc(this.x, this.y + 18, 15, 15, 180, 0);

  }
}

function GhostSeg() { //helps me handle the x and y position of the ghost's segments
  this.x = windowWidth / 2;
  this.y = windowHeight / 2;

}

function Skeletons() {
  this.x = random(windowWidth);
  this.y = random(windowHeight);
  this.speedX = 5;
  this.speedY = 5;

  this.move = function() {
    //Skeletons bounce on the screen edge

    if (this.x < 0) {
      this.speedX = 5
    } else if (this.x > windowWidth) {
      this.speedX = -5
    }

    if (this.y < 0) {
      this.speedY = 5
    } else if (this.y > windowHeight) {
      this.speedY = -5
    }

    this.x += this.speedX;
    this.y += this.speedY;
  }

  this.display = function() {
    imageMode(CENTER);
    image(doot, this.x, this.y, 120, 120);
  }

  this.check = function() { //if the ghost goes near a skeletons it's game over
    p = myPlayerArray[0];
    var d = dist(p.x,p.y,this.x,this.y)

    if(d<100 && score > 2){
      gameOver = true;
    }
  }

}

function mouseClicked() {
  if (start == false) {
    spooky.loop();
    start = true;
  }
}
