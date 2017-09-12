//I'm drawing the texts using Pixel Font algorithm 
//adapted to have right alignment, and to work correctly with my game.
//
//It is drawing on a different canvas which is overlapping the main game canvas.
//This text canvas resizes and gets the same scale as the main canvas.
//Also, while drawing,canvas scale is considered.
//
//TCVS is the canvas for the texts
//TCTX is the context
var TCVS, TCTX

//init
function createTCVS() {
    TCVS = b
    //TCVS.style.backgroundColor = "";
    TCTX = TCVS.getContext("2d");
    document.body.appendChild(TCVS);
}




//draw text
//canvas is not cleared, and fillstyle not set!
function drawText(string, scl, pos, rAlign ) {
    if (!rAlign){
        var rAlign = false
    }
    var scl = scl
    var context = TCTX
    var canvas = TCVS
    var size = 5 * scl
    var TX = pos.x
    var TY = pos.y



    var needed = [];
    if (string) {
        string = string.toUpperCase();
        for (var i = 0; i < string.length; i++) {
            var letter = letters[string.charAt(i)];
            if (letter) {
                needed.push(letter);
            }
        }

        if (rAlign == false) {
            var currX = 0;
            for (i = 0; i < needed.length; i++) {
                letter = needed[i];
                var currY = 0;
                var addX = 0;
                for (var y = 0; y < letter.length; y++) {
                    var row = letter[y];
                    for (var x = 0; x < row.length; x++) {
                        if (row[x]) {
                            context.fillRect(currX + x * size + TX, currY + TY, size, size);
                        }
                    }
                    addX = Math.max(addX, row.length * size);
                    currY += size;
                }
                currX += size + addX;
            }
        }else{
            var currX = 0;
            for (i = 0; i < needed.length; i++) {
                letter = needed[needed.length-i-1];
                var currY = 0;
                var addX = 0;
                for (var y = 0; y < letter.length; y++) {
                    var row = letter[y];
                    for (var x = 0; x < row.length; x++) {
                        if (row[x]) {
                            context.fillRect(currX + x * size + TX, currY + TY, size, size);
                        }
                    }
                    addX = Math.max(addX, row.length * size);
                    currY += size;
                }
                currX -= size + addX;
            }
        }

    }
}




//I use Pixel Font letters, but I also added some additional letters that I needed
var letters = {
    'A': [
        [, 1],
        [1, , 1],
        [1, , 1],
        [1, 1, 1],
        [1, , 1]
    ],
    'B': [
        [1, 1],
        [1, , 1],
        [1, 1, 1],
        [1, , 1],
        [1, 1]
    ],
    'C': [
        [1, 1, 1],
        [1],
        [1],
        [1],
        [1, 1, 1]
    ],
    'D': [
        [1, 1],
        [1, , 1],
        [1, , 1],
        [1, , 1],
        [1, 1]
    ],
    'E': [
        [1, 1, 1],
        [1],
        [1, 1, 1],
        [1],
        [1, 1, 1]
    ],
    'F': [
        [1, 1, 1],
        [1],
        [1, 1],
        [1],
        [1]
    ],
    'G': [
        [, 1, 1],
        [1],
        [1, , 1, 1],
        [1, , , 1],
        [, 1, 1]
    ],
    'H': [
        [1, , 1],
        [1, , 1],
        [1, 1, 1],
        [1, , 1],
        [1, , 1]
    ],
    'I': [
        [1, 1, 1],
        [, 1],
        [, 1],
        [, 1],
        [1, 1, 1]
    ],
    'J': [
        [1, 1, 1],
        [, , 1],
        [, , 1],
        [1, , 1],
        [1, 1, 1]
    ],
    'K': [
        [1, , , 1],
        [1, , 1],
        [1, 1],
        [1, , 1],
        [1, , , 1]
    ],
    'L': [
        [1],
        [1],
        [1],
        [1],
        [1, 1, 1]
    ],
    'M': [
        [1, 1, 1, 1, 1],
        [1, , 1, , 1],
        [1, , 1, , 1],
        [1, , , , 1],
        [1, , , , 1]
    ],
    'N': [
        [1, , , 1],
        [1, 1, , 1],
        [1, , 1, 1],
        [1, , , 1],
        [1, , , 1]
    ],
    'O': [
        [1, 1, 1],
        [1, , 1],
        [1, , 1],
        [1, , 1],
        [1, 1, 1]
    ],
    'P': [
        [1, 1, 1],
        [1, , 1],
        [1, 1, 1],
        [1],
        [1]
    ],
    'Q': [
        [, 1, 1],
        [1, , , 1],
        [1, , , 1],
        [1, , 1, 1],
        [1, 1, 1, 1]
    ],
    'R': [
        [1, 1],
        [1, , 1],
        [1, , 1],
        [1, 1],
        [1, , 1]
    ],
    'S': [
        [1, 1, 1],
        [1],
        [1, 1, 1],
        [, , 1],
        [1, 1, 1]
    ],
    'T': [
        [1, 1, 1],
        [, 1],
        [, 1],
        [, 1],
        [, 1]
    ],
    'U': [
        [1, , 1],
        [1, , 1],
        [1, , 1],
        [1, , 1],
        [1, 1, 1]
    ],
    'V': [
        [1, , , , 1],
        [1, , , , 1],
        [, 1, , 1],
        [, 1, , 1],
        [, , 1]
    ],
    'W': [
        [1, , , , 1],
        [1, , , , 1],
        [1, , , , 1],
        [1, , 1, , 1],
        [1, 1, 1, 1, 1]
    ],
    'X': [
        [1, , , , 1],
        [, 1, , 1],
        [, , 1],
        [, 1, , 1],
        [1, , , , 1]
    ],
    'Y': [
        [1, , 1],
        [1, , 1],
        [, 1],
        [, 1],
        [, 1]
    ],
    'Z': [
        [1, 1, 1, 1, 1],
        [, , , 1],
        [, , 1],
        [, 1],
        [1, 1, 1, 1, 1]
    ],
    ':': [
        [, , ],
        [1, , ],
        [, , , ],
        [1, , ],
        [, , ]
    ],
    '0': [
        [1, 1, 1],
        [1, , 1],
        [1, , 1],
        [1, , 1],
        [1, 1, 1]
    ],
    '1': [
        [, 1],
        [, 1],
        [, 1],
        [, 1],
        [, 1]
    ],
    '2': [
        [1, 1, 1],
        [, , 1],
        [1, 1, 1],
        [1, , ],
        [1, 1, 1]
    ],
    '3': [
        [1, 1, 1],
        [, , 1],
        [1, 1, 1],
        [, , 1],
        [1, 1, 1]
    ],
    '4': [
        [1, , 1],
        [1, , 1],
        [1, 1, 1],
        [, , 1],
        [, , 1]
    ],
    '5': [
        [1, 1, 1],
        [1, , ],
        [1, 1, 1],
        [, , 1],
        [1, 1, 1]
    ],
    '6': [
        [1, 1, 1],
        [1, , ],
        [1, 1, 1],
        [1, , 1],
        [1, 1, 1]
    ],
    '7': [
        [1, 1, 1],
        [, , 1],
        [, , 1],
        [, , 1],
        [, , 1]
    ],
    '8': [
        [1, 1, 1],
        [1, , 1],
        [1, 1, 1],
        [1, , 1],
        [1, 1, 1]
    ],
    '9': [
        [1, 1, 1],
        [1, , 1],
        [1, 1, 1],
        [, , 1],
        [1, 1, 1]
    ],
    ' ': [
        [, , ],
        [, , ],
        [, , ],
        [, , ],
        [, , ]
    ],
    '-': [
        [, , ],
        [, , ],
        [1, 1, 1],
        [, , ],
        [, , ]
    ],
    '!': [
        [, 1, ],
        [, 1, ],
        [, 1, ],
        [, , ],
        [, 1, ]
    ],
    '?': [
        [, 1, 1, 1],
        [, , , 1],
        [, , 1],
        [, , ],
        [, , 1]
    ],
};