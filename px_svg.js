//example of SVG path from Autodesk Graphic
//this code is optimized for the SVG output of Graphic. Since syntax varies between apps, supporting
//other apps like Illustrator might require some changes to the regex and likely some extra case handling
//Graphic outputs some very easy-to-parse SVG code, so would recommend the very reasonably priced app.

autowatch = 1;
//preloaded with an example SVG path
var mypath = "M132.5,264.5 L192.5,144.5 C192.5,144.5 204.5,108.5 228.5,108.5 C252.5,108.5 264.5,144.5 264.5,144.5 C264.5,144.5 348.5,348.5 348.5,396.5 C348.5,444.5 336.5,468.5 312.5,468.5 C288.5,468.5 300.5,348.5 276.5,348.5 C252.5,348.5 264.5,396.5 240.5,396.5 C216.5,396.5 180.5,300.5 204.5,276.5 C228.5,252.5 276.5,264.5 264.5,240.5 C252.5,216.5 216.5,216.5 216.5,228.5 C216.5,240.5 204.5,264.5 192.5,264.5 C180.5,264.5 168.5,276.5 180.5,324.5 C192.5,372.5 264.5,480.5 276.5,444.5 C288.5,408.5 288.5,456.5 288.5,456.5 C288.5,456.5 288.5,552.5 264.5,528.5 C240.5,504.5 192.5,348.5 180.5,360.5 C168.5,372.5 156.5,456.5 132.5,444.5 C108.5,432.5 120.5,365.471 120.5,348.5 C120.5,324.5 132.5,264.5 132.5,264.5 z";
var origin;
var curvematch;
var curves;

//initialize the working curve array
var pp0 = new Array();

//initialize the output pairs array
var pp1 = new Array();

//initialize the curve origin
var storex = 0;
var storey = 0;

function loadbang(){
	preppath();
	doCurve();
	bang();
}

function preppath(){
	//capture the origin of the path
	origin =mypath.match(/M\d+(\.\d+)?,\d+(\.\d+)?/)[0].slice(1).split(",");

	//get an array of curve commands
	curvematch = /[CL]\d+(\.\d+)?,\d+(\.\d+)?( \d+(\.\d+)?,\d+(\.\d+)? \d+(\.\d+)?,\d+(\.\d+)?)?/gi;
	curves = mypath.match(curvematch);

	//break out each curve command into component xy pairs 
	for (var j=0; j<curves.length; j++){
  		curves[j] = curves[j].slice(1).split(' ');
  		curves[j][0] = curves[j][0].split(",");
 		if(curves[j].length>1){
  			curves[j][1] = curves[j][1].split(",");
  			curves[j][2] = curves[j][2].split(",");
		}
	}

	//convert the xy pairs to float numbers
	for (j = 0; j<curves.length;j++){
  		for(var k = 0;k<3;k++){
			if(curves[j][k]!=null){
    			curves[j][k][0] = parseFloat(curves[j][k][0]);
    			curves[j][k][1] = parseFloat(curves[j][k][1]);
			}
  		}
	}
	
	pp1 = new Array();

	//initialize the curve origin
	storex = parseFloat(origin[0]);
	storey = parseFloat(origin[1]);
}

function doCurve(){
	//render curve points for each curve
	for(var g = 0;g<curves.length;g++){
  		pp0[0] = [storex,storey];
  		pp0[1] = curves[g][0];
  		pp0[2] = curves[g][1];
  		pp0[3] = curves[g][2];
		if(curves[g].length>1){
  			for(b=0; b <11; b++){
      			pp1[g*11+b] = makePoint(b/10);
  			}
		}
		else {
  			for(b=0; b <11; b++){
      			pp1[g*11+b] = makePointLine(b/10);
  			}
		}
  		//saves the current destination point as next starting point
		if(curves[g].length>1){
  			storex = pp0[3][0];
  			storey = pp0[3][1];
		}
		else {
			storex = pp0[1][0];
  			storey = pp0[1][1];
		}
	}
}

function bang(){
	preppath();
	doCurve();
	sendmatrix();
}

//function to calculate points on a bezier curve.
//assumes global array of curve points
function makePoint (t){
  var u = 1-t;
  var tt = t*t;
  var uu = u*u;
  var uuu = uu * u;
  var ttt = tt * t;
  var p = new Array();
  for(i=0;i<2;i++){
    p[i] = uuu * pp0[0][i]; //first term
    p[i] += 3 * uu * t * pp0[1][i]; //second term
    p[i] += 3 * u * tt * pp0[2][i]; //third term
    p[i] += ttt * pp0[3][i]; //fourth term
  }
  return p;
}

function makePointLine (t){
  var u = 1-t;
  var p = new Array();
  for(i=0;i<2;i++){
    p[i] = pp0[0][i]*u; //first term
    p[i] += pp0[1][i]*t; //second term
  }
  return p;
}

function sendmatrix(){
	var tmp = new JitterMatrix(2,"float32",pp1.length);
	for(i=0;i<pp1.length;i++){
		var b = pp1[i];
		tmp.setcell1d(i,b[0],b[1]);
	}
	outlet(0,"jit_matrix",tmp.name);
}

//will only read the first path element in the svg document, so best to export single shape
function readsvg(filepath){
	var svgfile = new File(filepath, "read", "svg");
	var pth;
	var patt = new RegExp("path");
	while(svgfile.position < svgfile.eof) {
		var thisline = svgfile.readline(100000);
		if(patt.test(thisline)){
			pth = thisline;
		}
	}
	mypath = pth.split('<path d="')[1].split('"')[0];
	preppath();
	doCurve();
	bang();
}