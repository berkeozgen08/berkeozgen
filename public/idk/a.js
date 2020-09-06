function setup(){
    createCanvas(1024, 600);
}
function draw(){
    background(173, 216, 230);
    player();
    grass();
}

function player(){
    if(duck==true){
        strokeWeight(0);
        fill(0, 0, 0);
        rect(px, py, 30, -30);
    }
    else{
        strokeWeight(0);
        fill(0, 0, 0);
        rect(px, py, 30, -60);
    }
}

function grass(){
    strokeWeight(0);
    fill(80, 240, 100);
    rect(0, 450, 1024, 150);
}

document.addEventListener("keydown", keypress);
document.addEventListener("keyup", keyrelease);

duck=false;

px=180;
py=450;
xv=0;
yv=25;
xa=1;
ya=1;

function keypress(x){
    if(x.keyCode==37){//left
        left=true;
    }
    if(x.keyCode==38){//up
        up=true;
    }
    if(x.keyCode==39){//right
        right=true;
    }
    if(x.keyCode==40){//down
        duck=true;
        bb=5;
        if(xv>bb){
            xv=bb;
        }
        if(xv<0 && xv<-bb){
            xv=-bb;
        }
    }
}

function keyrelease(x){
    if(x.keyCode==37){//left
        left=false;
    }
    if(x.keyCode==39){//right
        right=false;
    }
    if(x.keyCode==40){//down
        duck=false;
        bb=10;
    }
}

bb=10;

var left;
var up;
var right;

setInterval(move, 30); 

function move(){
	if(py<450){
		py+=10;
	}
    if(px-xv<=0){
        if(left==true){
            px=0;
            xv=0;
		}
    }
    if(right==true){
        if(xv<bb){
            xv+=xa;
        }
        px+=xv;
    }
    else if(left==true){
        if(xv>-bb){
            xv-=xa;
        }
        px+=xv;
    }
    else{
        if(xv<0){
            xv+=xa;
        }
        if(xv>0){
            xv-=xa;
        }
        px+=xv;
    }
	if(up==true){
		if(py>275){
			if(yv>0){
				yv-=ya;
			}
            py-=yv;
            if(py==450){
                yv=25;
                up=false;
            }
        }
    }
}