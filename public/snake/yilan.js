function setup(){
    createCanvas(600, 600);
}
function draw(){
    background(0);
    if(state=="lost"){
        textSize(50);
        text("You lost", 212, 210, 600, 450);
        text("Score: "+score, 212, 260, 600, 450);
        text("Press enter to play again", 22, 310, 600, 450);
    }
    else{
        Apple();
        Snake();
        drawtail();
        intercept();
    }
}

document.addEventListener("keydown",keypress);

cokmantikli=true;

playcount=1;

var state;

let paused = false;
let interval = setInterval(game, 60);

xv=yv=0;
snakex=snakey=300;
applex=Math.floor(Math.random()*20)*30;
appley=Math.floor(Math.random()*20)*30;

function Apple(){
    strokeWeight(0);
    fill(255, 0, 0);
    rect(applex, appley, 30, 30);
}

function Snake(){
    strokeWeight(0);
    fill(0,255,0);
    rect(snakex,snakey,30,30);
}   

function intercept(){
    for(i=0;i<trail.length;i++){
        if(trail[i].x==applex && trail[i].y==appley){
            fill(255,255,0);
            rect(applex, appley, 30, 30);
        }
    }
}

score=0;
tail=5;
trail=[];

function drawtail(){
    for(i=0;i<trail.length;i++){
        fill(0,255,0);
        rect(trail[i].x,trail[i].y,30,30);
    }
}

function game(){
    if(state=="lost"){
        xv=yv=0;
    }
    trail.push({x:snakex,y:snakey});
    while(trail.length>tail){
        trail.shift();
    }
    if(snakex==applex && snakey==appley){
        tail++;
        applex=Math.floor(Math.random()*20)*30;
        appley=Math.floor(Math.random()*20)*30;
        score++;
        document.getElementById("score").textContent = score;
    }
    snakex+=xv;
    snakey+=yv;
    cokmantikli=true;
    if(snakex==-30){
        snakex=570;
    }
    if(snakex==600){
        snakex=0;
    }
    if(snakey==-30){
        snakey=570;
    }
    if(snakey==600){
        snakey=0;
    }
    for(i=0;i<trail.length;i++){
        if(snakex==trail[i].x && snakey==trail[i].y){   
			if(score==1){
				alert("nasıl becerdin çöp");
				state="";
			}
            else if(tail>5){
                state="lost";
                if(score>document.getElementById("highest").textContent){
                    document.getElementById("highest").textContent = score;
					sendData();
					getData();
				}
				tail = 0;
            }
        }
    }
}

var lastx;

function keypress(x){
	if (x.keyCode == 80) {
		if (paused) {
			interval = setInterval(game, 60);
			paused = false;
		} else {
			clearInterval(interval);
			paused = true;
		}
	}
    if(x.keyCode==13){
        snakex=snakey=300;
        applex=Math.floor(Math.random()*20)*30;
        appley=Math.floor(Math.random()*20)*30;
        trail=[];
        tail=5;
        xv=0;
        yv=0;
        score=0;
        state="";
        lastx=x.keyCode;
        playcount++;
        document.getElementById("playcount").textContent = playcount;
    }
    if(x.keyCode==37 && lastx!=39 && lastx!=37 && cokmantikli==true){
        xv-=30;
        yv=0;
        lastx=x.keyCode;
        cokmantikli=false;
    }
    if(x.keyCode==38 && lastx!=40 && lastx!=38 && cokmantikli==true){
        xv=0;
        yv-=30;
        lastx=x.keyCode;
        cokmantikli=false;
    }
    if(x.keyCode==39 && lastx!=37 && lastx!=39 && cokmantikli==true){
        xv+=30;
        yv=0;
        lastx=x.keyCode;
        cokmantikli=false;
    }
    if(x.keyCode==40 && lastx!=38 && lastx!=40 && cokmantikli==true){
        xv=0;
        yv+=30;
        lastx=x.keyCode;
        cokmantikli=false;
    }
}