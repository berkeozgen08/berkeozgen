function setup(){
    fps=100/6;
    createCanvas(600, 600);
	frameRate(fps);
}
function draw(){
    background(0);
    Apple();
    Snake();
    drawtail();
    intercept();
    game();
}

playcount=1;

xv=0;
yv=30;
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
for(i=0;i<trail.length;i++){
    if(applex==trail[i].x && appley==trail[i].y){
        applex=Math.floor(Math.random()*20)*30;
        appley=Math.floor(Math.random()*20)*30;
    }
}

function drawtail(){
    for(i=0;i<trail.length;i++){
        fill(0,255,0, (255/trail.length)*(i+(trail.length*6/10)));
        rect(trail[i].x,trail[i].y,30,30);
    }
}

function game(){
    trail.push({x:snakex,y:snakey});
    if(trail.length>tail){
        trail.shift();
    }
    snakex+=xv;
    snakey+=yv;
    if(snakex==-30 || snakex==600 || snakey==-30 || snakey==600){
        lost();
    }
    if(snakex==applex && snakey==appley){
        tail++;
        applex=Math.floor(Math.random()*20)*30;
        appley=Math.floor(Math.random()*20)*30;
        for(i=0;i<trail.length;i++){
            if(applex==trail[i].x && appley==trail[i].y){
                applex=Math.floor(Math.random()*20)*30;
                appley=Math.floor(Math.random()*20)*30;
            }
        }
        score++;
        document.getElementById("score").textContent = score;
    }
    for(i=0;i<trail.length;i++){//< INSTEAD OF <= BECAUSE [0] IS THE FIRST ELEMENT NOT [1] 
        if(snakex==trail[i].x && snakey==trail[i].y){
            if(tail>5){
                if(score>document.getElementById("highest").textContent){
                    document.getElementById("highest").textContent = score;
                }
                lost();
            }
        }
    }
    ai();
}

function lost(){
    snakex=snakey=300;
    applex=Math.floor(Math.random()*20)*30;
    appley=Math.floor(Math.random()*20)*30;
    trail=[];
    tail=5;
    xv=0;
    yv=0;
    score=0;
    playcount++;
    document.getElementById("playcount").textContent = playcount;
}

function ai(){
    if(snakey>appley && trailintercept(0,-30) && yv!=30 && snakey!=0){//up
        xv=0;
        yv=-30;
    }
    else if(snakex<applex && trailintercept(30,0) && xv!=-30 && snakex!=570){//right
        xv=30;
        yv=0;
    }
    else if(snakey<appley && trailintercept(0,30) && yv!=-30 && snakey!=570){//down
        xv=0;
        yv=30;
    }
    else if(snakex>applex && trailintercept(-30,0) && xv!=30 && snakex!=0){//left
        xv=-30;
        yv=0;
    }
    else{
        if(trailintercept(-30,0) && xv!=30 && snakex!=0){//left
            xv=-30;
            yv=0;
        }
        else if(trailintercept(0,30) && yv!=-30 && snakey!=570){//down
            xv=0;
            yv=30;
        }
        else if(trailintercept(30,0) && xv!=-30 && snakex!=570){//right
            xv=30;
            yv=0;
        }
        else if(trailintercept(0,-30) && yv!=30 && snakey!=0){//up
            xv=0;
            yv=-30;
        }
    }
}

function trailintercept(a,b){//ELSE GİDİYOR HEP
	for(i=0;i<trail.length;i++){
		if(snakex+a==trail[i].x && snakey+b==trail[i].y){
			return false;
        }
        else if(i==trail.length-1){
            return true;
        }
        else{
            continue;
        }
	}
}

function increasefps(){
	fps*=2;
	frameRate(fps);
}

function lowerfps(){
	fps/=2;
	frameRate(fps);
}