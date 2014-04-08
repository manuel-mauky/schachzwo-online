//Created by s3erjaeh on 06.04.2014.

var pInf = Number.POSITIVE_INFINITY;
var nInf = Number.NEGATIVE_INFINITY;

var spielfeld = [[{color:'white',typ:'mann'},{color:'white',typ:'springer'},{color:'white',typ:'frau'},{color:'white',typ:'glaube'},{},{color:'white',typ:'wissen'},{color:'white',typ:'frau'},{color:'white',typ:'springer'},{color:'white',typ:'mann'}],[{color:'white',typ:'rocks'},{color:'white',typ:'rocks'},{color:'white',typ:'rocks'},{color:'white',typ:'rocks'},{color:'white',typ:'rocks'},{color:'white',typ:'rocks'},{color:'white',typ:'rocks'},{color:'white',typ:'rocks'},{color:'white',typ:'rocks'}],[{},{},{},{},{},{},{},{},{}],[{},{},{},{},{},{},{},{},{}],[{},{},{color:"black",typ:"rocks"},{},{},{},{},{},{}],[{},{},{},{},{},{},{},{},{}],[{},{},{},{},{},{},{},{},{}],[{color:'black',typ:'rocks'},{color:'black',typ:'rocks'},{color:'black',typ:'rocks'},{color:'black',typ:'rocks'},{color:'black',typ:'rocks'},{color:'black',typ:'rocks'},{color:'black',typ:'rocks'},{color:'black',typ:'rocks'},{color:'black',typ:'rocks'}],[{color:'black',typ:'mann'},{color:'black',typ:'springer'},{color:'black',typ:'frau'},{color:'black',typ:'glaube'},{},{color:'black',typ:'wissen'},{color:'black',typ:'frau'},{color:'black',typ:'springer'},{color:'black',typ:'mann'}]];
//var spielfeld = [[{color:'weiss',typ:'mann'},{color:'weiss',typ:'springer'},{color:'weiss',typ:'frau'},{color:'weiss',typ:'glaube'},{},{color:'weiss',typ:'wissen'},{color:'weiss',typ:'frau'},{color:'weiss',typ:'springer'},{color:'weiss',typ:'mann'}],[{color:'weiss',typ:'rocks'},{color:'weiss',typ:'rocks'},{color:'weiss',typ:'rocks'},{color:'weiss',typ:'rocks'},{color:'weiss',typ:'rocks'},{color:'weiss',typ:'rocks'},{color:'weiss',typ:'rocks'},{color:'weiss',typ:'rocks'},{color:'weiss',typ:'rocks'}],[{},{},{},{},{},{},{},{},{}],[{},{},{},{},{},{},{},{},{}],[{},{},{},{},{},{},{},{},{}],[{},{},{},{},{},{},{},{},{}],[{},{},{},{},{},{},{},{},{}],[{},{color:'schwarz',typ:'rocks'},{color:'schwarz',typ:'rocks'},{color:'schwarz',typ:'rocks'},{color:'schwarz',typ:'rocks'},{color:'schwarz',typ:'rocks'},{color:'schwarz',typ:'rocks'},{color:'schwarz',typ:'rocks'},{color:'schwarz',typ:'rocks'}],[{color:'schwarz',typ:'mann'},{color:'schwarz',typ:'springer'},{color:'schwarz',typ:'frau'},{color:'schwarz',typ:'glaube'},{},{color:'schwarz',typ:'wissen'},{color:'schwarz',typ:'frau'},{color:'schwarz',typ:'springer'},{color:'schwarz',typ:'mann'}]];

var gamesize = 9;

var FigurTyp = {
    ROCKS: "rocks",
    MANN:"mann",
    FRAU: "frau",
    SPRINGER: "springer",
    WISSEN:"wissen",
    GLAUBE: "glaube",
    ZENIT: "zenit"
};

var Color = {
    WHITE: "white",
    BLACK: "black"
};

var Zustand = {
    READY: "ready",
    PLAY: "play",
    PAUSE: "pause",
    FINISHED: "finished"
};

var Figur = function(typ,farbe){
    var figur = new Object();
    figur.farbe = farbe;
    figur.typ = typ;
    return figur;
};

var isHorizont = function(x,y){
    return ((gamesize == 9 && (x == 4 && y == 4)) ||  (gamesize == 7 && (x == 3 && y == 3)));
}

var getFeldInfo = function(x,y) {
    if (x < 0 || x > 8 || y < 0 || y > 8) return -1;
    return spielfeld[x][y];
}

var getInfDirPos = function(x,y,dir){
    var result = new Array();
    var current = getFeldInfo(x,y);
    for(d in dir) {
        var xi = x;
        var yi = y;
        for (i = 1; i < 9; i++) {
            xi = x + dir[d].x*i;
            yi = y + dir[d].y*i;
            if(isHorizont(xi,yi)) continue;
            var element = getFeldInfo(xi,yi);
            if(element == -1) break; //out of Spielfeld
            if(element.color && element.color == current.color) break;
            element.x = xi; element.y = yi;
            result.push(element);
            if(element.color && element.color != current.collor) break;
        }
    }
    return result;
}
var getFinDirPos = function(x,y,valid){
    var result = new Array();
    var current = getFeldInfo(x,y);
    for (p in valid){
        var xi = valid[p].x + x;
        var yi = valid[p].y + y;
        if(isHorizont(xi, yi)) continue;
        var element = getFeldInfo(xi, yi);
        if(element == -1) continue;
        if(element.color && element.color == current.color) continue;
        element.x = xi; element.y = yi;
        result.push(element);
    }
    return result;
}

var getSpringerRange = function(x,y){
    var valid = [{x:-1,y:-2},{x:1,y:-2},{x:-2,y:-1},{x:2,y:-1},{x:-2,y:1},{x:2,y:1},{x:-1,y:2},{x:1,y:2}];
    return getFinDirPos(x,y,valid);
}

var getFrauRange = function(x,y){
    var result = new Array();
    var valid = [{x:-1,y:0},{x:1,y:0},{x:0,y:-1},{x:0,y:1}];
    var dir = [{x:1,y:1},{x:1,y:-1},{x:-1,y:1},{x:-1,y:-1}];
    var current = getFeldInfo(x,y);
    //if(current == null || current == -1 || current.typ != FigurTyp.FRAU) throw new Error("Illegal Argument");
    result = getFinDirPos(x,y,valid);
    result = result.concat(getInfDirPos(x,y,dir));
    return result;
}

var getMannRange = function(x,y){
    var result = new Array();
    var valid = [{x:1,y:1},{x:1,y:-1},{x:-1,y:1},{x:-1,y:-1}];//<---
    var dir = [{x:1,y:0},{x:-1,y:0},{x:0,y:1},{x:0,y:-1}];
    var current = getFeldInfo(x,y);
    //if(current == null || current == -1 || current.typ != FigurTyp.MANN) throw new Error("Illegal Argument"); //<---
    result = getFinDirPos(x,y,valid);
    result = result.concat(getInfDirPos(x,y,dir));

    if(!current.moved){
        var check = [{x:-1,y:0}, {x:-1,y:0},{x:1,y:0},{x:1,y:0}, {x:0,y:1},{x:0,y:1} ,{x:0,y:-1},{x:0,y:-1},   {x:1,y:1},{x:-1,y:1},{x:1,y:-1},{x:-1,y:-1}];
        var valid = [{x:-2,y:-1},{x:-2,y:1},{x:2,y:1},{x:2,y:-1},{x:1,y:2},{x:-1,y:2},{x:1,y:-2},{x:-1,y:-2},  {x:2,y:2},{x:-2,y:2},{x:2,y:-2},{x:-2,y:-2}];
        for (i in check){
            var xc = check[i].x + x;
            var yc = check[i].y + y;
            var xv = check[i].x + x;
            var yv = check[i].y + y;
            var element = getFeldInfo(xc,yc);
            if(element == -1) break;
            if(element.typ) break; //checkfeld besetzt
            var element = getFeldInfo(xv,yv);
            if(element.color && element.color == current.color) break;
            element.x = xv; element.y = yv;
            result.push(element);
        }
    }
    return result;
}

var getGlaubeRange = function(x,y){
    var range = 2;
    var current = getFeldInfo(x,y);
    var queue = new Array();
    var result = new Array();
    queue.push({x:x,y:y,r:range});

    while(queue.length > 0) {
        var alreadyHandled = false;
        var e = queue.pop();
        var posIsCurPos = (e.x == x && e.y == y);
        var element = getFeldInfo(e.x, e.y);
        if (element == -1) continue;

        for(r in result){
            if (result[r].x == e.x && result[r].y == e.y) {
                result.splice(r,1);
                break;
            }
        }
        if(alreadyHandled) continue;
        var elementHasColor = (element.color && !posIsCurPos);
        if (elementHasColor  && element.color == current.color) continue;
        if(e.r > 0 && !elementHasColor) {
            //linear
            queue.push({x: e.x, y: e.y + 1, r: e.r - 1});
            queue.push({x: e.x, y: e.y - 1, r: e.r - 1});
            queue.push({x: e.x + 1, y: e.y, r: e.r - 1});
            queue.push({x: e.x - 1, y: e.y, r: e.r - 1});
            //diagonal
            queue.push({x: e.x + 1, y: e.y + 1, r: e.r - 1});
            queue.push({x: e.x + 1, y: e.y - 1, r: e.r - 1});
            queue.push({x: e.x - 1, y: e.y + 1, r: e.r - 1});
            queue.push({x: e.x - 1, y: e.y - 1, r: e.r - 1});
        }
        if(isHorizont(e.x, e.y)) continue;
        if(posIsCurPos) continue;
        element.x = e.x;
        element.y = e.y;
        result.push(element);
    }
    return result;
}

var getWissenRange = function(x,y){
    var dir = [{x:1,y:1},{x:1,y:-1},{x:-1,y:1},{x:-1,y:-1},{x:1,y:0},{x:-1,y:0},{x:0,y:1},{x:0,y:-1}];
    return getInfDirPos(x,y,dir);
}

var getRocksRange = function(x,y){
    var current = getFeldInfo(x,y);
    var result = new Array();
    var xi = x;
    var yi = y;
    if(current.color==Color.WHITE){
        xi = x+1;
        if(x == 1) result.push({x:xi+1,y:yi});
    }
    if(current.color==Color.BLACK){
        xi = x-1;
        if(x == 7) result.push({x:xi-1,y:yi});
    }
    var element = getFeldInfo(xi,yi);
    if(isHorizont(xi,yi)){
        result.push({x:xi,y:yi+1});
        result.push({x:xi,y:yi-1});
    }
    else if(!element.typ) result.push({x:xi,y:yi});
    var element = getFeldInfo(xi,yi+1);
    if(element.color && element.color != current.color) result.push({x:xi,y:yi+1});
    var element = getFeldInfo(xi,yi-1);
    if(element.color && element.color != current.color) result.push({x:xi,y:yi-1});
    return result;
}

var getZenitRange = function(x,y){
    //not implementet jet
}

var test = function(x,y){
    spielfeld[x][y]={color:'white',typ:'glaube',moved:true};
    var result = getWissenRange(x,y);
    spielfeld[x][y]={};
    return result;
}