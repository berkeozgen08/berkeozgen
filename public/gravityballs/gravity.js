var balls=[];
var gravity=0.15;
var r=30;
var strok=3;
var rs=r/2+strok;
class Ball{
	constructor(ax,ay){
		this.xy={x:ax,y:ay};
		this.falling=true;
		this.g=gravity;
		this.s=0;
		this.ne=0;
	}
	show(){
		strokeWeight(strok);
		ellipse(this.xy.x, this.xy.y, r);
	}
	gravity(){
		if(this.xy.y+this.s+this.g>=height-rs && this.xy.y!=height-rs){
			this.ne=height-rs-this.xy.y;
		}
		if(this.xy.y>=height-rs){
			this.xy.y-=this.ne;
			this.s=-this.s;
			this.s=round(this.s*1000)/1000;
		}
		else{
			this.s+=this.g;
			this.s=round(this.s*1000)/1000;
			this.xy.y+=this.s;
			this.xy.y=round(this.xy.y*1000)/1000;
		}	
		this.xy.y=constrain(this.xy.y, rs, height-rs);
	}
}

function setup(){
	width=1280;
	height=700;
	createCanvas(width, height);
	alp=255;
}
function draw(){
	stroke(51);
	strokeWeight(5);
	fill(255,255,255);
	rect(0,0,1280,700);
	drawballs();
	fill(0,0,255,alp);
	if(alp>0){
		alp-=1;
	}
	strokeWeight(0);
	textSize(90);
	textStyle(BOLD);
	if(alp!=0){
		text("PLAY WITH MY BALLS", 150, 150, 1280, 500);
	}
	if(balls.length>=lng){
		balls.shift();
	}
	if(mouseX<width && mouseX>0 && mouseY<height && mouseY>0 && yes==true){
		mouseClicked();
	}
}

function createball(x,y){
	a=constrain(x,rs,width-rs);
	b=constrain(y,rs,height-rs);
	balls.push(new Ball(a,b));
}

function drawballs(){
	for(i=0;i<balls.length;i++){
		balls[i].show();
		balls[i].gravity();
		balls[i].g=gravity;
	}
}

function mouseClicked() {
	if(mouseX<=width+5){
		createball(mouseX,mouseY);
	}
	else{	
		return false;
	}
}

function clearballs(){
	balls=[];
}

lng=50;

function increase(){
	lng+=50;
	if(lng<0){
		lng=0;
	}
	document.getElementById("a").textContent="BALL SACK: "+lng;
}
function decrease(){
	lng-=50;
	if(lng<0){
		lng=0;
	}
	document.getElementById("a").textContent="BALL SACK: "+lng;
}

yes=false;

function sickomode(){
	if(yes==false){
		yes=true;
		document.getElementById("b").style.color="#20C20E";
		document.getElementById("a").textContent="BALL SACK: "+lng;
	}
	else{
		yes=false;
		document.getElementById("b").style.color="red";
		document.getElementById("a").textContent="CLICK BOI";
	}
}

function changegravity(){
	if(gravity==0.15){
		gravity=0.6;
		document.getElementById("f").textContent="FAST";
	}
	else{
		gravity=0.15;
		document.getElementById("f").textContent="SLOW";
	}
}