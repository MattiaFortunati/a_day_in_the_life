/*
A DAY IN THE LIFE
by Mattia Fortunati

http://www.mattiafortunati.com
mattia@mattiafortunati.com

A DAY IN THE LIFE was developed for the 2017 js13kGames competition.
http://js13kgames.com/

-

Libs used: 
-Kontra (used for game loop and assets preloading) https://straker.github.io/kontra/
-TinyMusic (as is) https://github.com/kevincennis/TinyMusic
-Pixel Font (adapted) https://github.com/PaulBGD/PixelFont

also, the canvas setup is from xem's responsiveTouchGameFramework:
https://github.com/xem/responsiveTouchGameFramework/blob/gh-pages/mini.html

-

Note that the code is far, far away, from being optimized at best.
There are a lot of possible optimization to make it smaller, faster and improve overall performance.
But, this was really the best I could do with the short time I had for working on it!

Where code comments are not enough, I've left long and readable variable and function names.
I hope that you will find this source code useful somehow! :)

I hope that you'll like my game.
Thank you for playing!

*/



/* 
=======================================================
INIT KONTRA ENGINE
=======================================================
*/
kontra.init()



/* 
=======================================================
handle window lost focus
=======================================================
*/
blurred = false
window.onblur = function() {
    sequence1.gain.gain.value = 0
    sequence2.gain.gain.value = 0
    blurred = true
}



/* 
=======================================================
ONE TIME VAR INITIALIZATION
=======================================================
*/

x = kontra.canvas.getContext("2d");
x.imageSmoothingEnabled = false;
x.webkitImageSmoothingEnabled = false;
x.mozImageSmoothingEnabled = false;
x.msImageSmoothingEnabled = false;
x.oImageSmoothingEnabled = false;
imgPath = "img/"
OBU = imgPath + "obstacle.png"
namesList = []
namesList["p_djump"] = "DOUBLE JUMP"
namesList["p_dash"] = "DASH"
namesList["p_glide"] = "FLY"
namesList["p_focus"] = "FOCUS"
namesList["p_coins"] = "ATTRACT"
spacingList = []
spacingList["p_djump"] = -300
spacingList["p_dash"] = -200
spacingList["p_glide"] = -150
spacingList["p_focus"] = -250
spacingList["p_coins"] = -400
clTimeout = null
//colors
c1 = "#70c1b3"
c2 = "#ffe066"
c3 = "#f25f5c"
c4 = "#247ba0"
c5 = "#50514f"

//reset score testing purposes
//localStorage.setItem("RECORD", 0);

/* 
=======================================================
PRE-LOADING ASSETS
then start the game
=======================================================
*/
kontra.assets.load(imgPath + "pcoin.png", imgPath + "focus.png", imgPath + "glide.png", imgPath + "dash.png", imgPath + "djum.png", imgPath + "jump.png", imgPath + "test.png", imgPath + "test2.png", imgPath + "test3.png", OBU, imgPath + "coin.png", imgPath + "shield.png", imgPath + "house.png", imgPath + "moon.png")
    .then(function() {
        //load data
        startLoop()
        if (window.localStorage) {
            personalBest = parseInt(localStorage.getItem('RECORD')) || 0
        } else {
            // can't be used
        }
        pixels = []
        bgPixels = []
        create_pool()

        initVar()
        initializeGame()

        particleBg()
    }).catch(function(err) {
        // error loading an asset
    });


/* 
=======================================================
OBJECT POOL
=======================================================
*/


create_pool = function() {
    POOL = []
    for (var i = 0; i <= 300; i++) {
        var oo = new obj()
        oo.isActive = false
        oo.flaggedRemove = true
        POOL.push(oo)
    }
}

getFromPool = function() {
    for (var i = 0; i <= POOL.length - 1; i++) {
        if (POOL[i].isActive == false) {
            POOL[i].isActive = true
            POOL[i].flaggedRemove = false
            return POOL[i]
        }
    }
}


/* 
=======================================================
MAIN GAME OBJECT
=======================================================
*/
obj = function() {
    this.create = function(x, y, spr, type) {
            if (spr != "") {
                this.image = kontra.assets.images[spr]
                //this.image.src = spr
            }

            this.x = x
            this.y = y
            this.spr = spr
            this.type = type
            this.angle = 0
            this.size = tlSz
            this.groundType = 0
            this.cnt = 0
            this.xSpeed = 0
            this.ySpeed = 0
            //player specific
            if (type == "player") {
                //this.shieldImage = new Image()
                //this.shieldImage.src = imgPath+"shield.png"
                this.shieldImage = kontra.assets.images[imgPath + "shield.png"]
                this.jumpPower = 0
                this.djumpPower = 0
                this.canJump = false
                this.canDJump = false
                this.glide = false
                this.isGliding = false
                this.hasDashed = false
                this.isDashing = false
                this.animCount = 0
                this.isAnimated = true
                this.frame = 0
            } else if (type == "obstacle" || type == "obstacle_falling" || type == "obstacle_horizontal") {
                this.interval = setInterval(function(me) {
                    me.angle = me.angle == 45 ? 0 : 45
                }, 1000, this)
                //
                if (type == "obstacle_horizontal") {
                    this.horMov = 0
                    this.horAdd = -2
                    this.interval2 = setInterval(function(me) {
                        me.horAdd = -me.horAdd
                    }, 1000, this)
                }

            } else if (type == "coin") {
                this.size = tlSz / 2
            } else if (type == "house") {
                this.size = tlSz * 2
            }

        },
        this.animate = function() {
            if (this.isAnimated == true) {
                this.animCount += 1
            }
            if (this.animCount >= (10 * (slowScrollingSpeed / scrollingSpeed)) && this.isAnimated == true) {
                if (this.frame == 0) {
                    //this.image.src = imgPath+"test2.png"
                    this.image = kontra.assets.images[imgPath + "test2.png"]
                    this.frame = 1
                } else {
                    //this.image.src = imgPath+"test.png"
                    this.image = kontra.assets.images[imgPath + "test.png"]
                    this.frame = 0
                }
                this.animCount = 0
            }
            if (this.y < groundY - tlSz) {
                this.isAnimated = false
                this.frame = 0
                if (this.jumpPower > 0 || this.djumpPower > 0 || this.glide == true || this.isDashing == true) {
                    //this.image.src = imgPath+"test3.png"
                    this.image = kontra.assets.images[imgPath + "test3.png"]
                } else {
                    //this.image.src = imgPath+"test.png"
                    this.image = kontra.assets.images[imgPath + "test.png"]
                }

            } else {
                this.isAnimated = true
            }
        },
        this.update = function() {
            if (this.flaggedRemove == false && this.isActive == true) {
                if (this.type == "ground") {
                    this.x -= scrollingSpeed
                    if (this.x < -tlSz) {
                        this.remove()
                    }
                } else if (this.type == "player") {
                    //

                    //jump
                    this.y -= this.jumpPower
                    if (this.jumpPower > 0) {
                        this.jumpPower -= 2
                    }
                    if (this.jumpPower < 0) {
                        this.jumpPower = 0
                    }
                    //double jump
                    this.y -= this.djumpPower
                    if (this.djumpPower > 0) {
                        this.djumpPower -= 2
                    }
                    if (this.djumpPower < 0) {
                        this.djumpPower = 0
                    }
                    //glide
                    if (this.glide == true) {
                        if (this.jumpPower < 2 && this.djumpPower < 2) {
                            this.y -= gravity
                            this.angle = 80
                            if (this.isDashing == false) {
                                this.cnt += 1
                                if (this.cnt == 4) {
                                    flyEffect()
                                    this.cnt = 0
                                }
                            }

                        }
                    }
                    //top border
                    if (this.y < tlSz) {
                        this.y = tlSz
                    }
                    //gravity
                    if (this.y < groundY - tlSz) {
                        this.y += gravity
                    } else {
                        this.y = groundY - tlSz
                        if (p_jump == true) this.canJump = true
                        if (p_djump == true) this.canDJump = true
                        this.angle = 0
                        this.hasDashed = false
                    }

                } else if (this.type == "obstacle") {
                    this.x -= scrollingSpeed
                    if (this.x < -tlSz) {
                        this.remove()
                    }
                    if (lineDistance({
                            x: this.x,
                            y: this.y
                        }, {
                            x: player.x,
                            y: player.y
                        }) < tlSz * 0.8) {
                        if (player.isDashing == false) {
                            death()
                        } else {
                            this.remove()
                            dieSound()
                            redExplosion()
                        }

                    }
                } else if (this.type == "ground2") {
                    this.x -= scrollingSpeed
                    if (this.x < -tlSz) {
                        this.remove()
                    }
                    if (lineDistance({
                            x: this.x,
                            y: this.y
                        }, {
                            x: player.x,
                            y: player.y
                        }) < tlSz * 1.2) {
                        if (player.isDashing == false) {
                            death()
                        } else {
                            this.remove()
                            dieSound()
                            redExplosion()
                        }
                    }
                } else if (this.type == "obstacle_falling") {
                    this.x -= scrollingSpeed
                    if (this.x < -tlSz) {
                        this.remove()
                    }
                    if (lineDistance({
                            x: this.x,
                            y: this.y
                        }, {
                            x: player.x,
                            y: player.y
                        }) < tlSz * 0.8) {
                        if (player.isDashing == false) {
                            death()
                        } else {
                            this.remove()
                            dieSound()
                            redExplosion()
                        }
                    }
                    if (this.x < tlSz * 7 && this.y < groundY - tlSz) {
                        this.y += 10
                    }
                } else if (this.type == "obstacle_horizontal") {
                    this.x -= scrollingSpeed
                    if (this.x < -tlSz) {
                        this.remove()
                    }
                    this.x += this.horAdd

                    if (lineDistance({
                            x: this.x,
                            y: this.y
                        }, {
                            x: player.x,
                            y: player.y
                        }) < tlSz * 0.8) {
                        if (player.isDashing == false) {
                            death()
                        } else {
                            this.remove()
                            dieSound()
                            redExplosion()
                        }
                    }
                } else if (this.type == "coin") {
                    this.x -= scrollingSpeed
                    if (this.x < -tlSz) {
                        this.remove()
                    }


                    if (p_coins == true) {
                        if (lineDistance({
                                x: this.x,
                                y: this.y
                            }, {
                                x: player.x,
                                y: player.y
                            }) < tlSz * 3) {
                            var spd = 3
                            if (this.y < player.y) {
                                this.y += spd * (scrollingSpeed / 8)
                            }
                            if (this.y > player.y) {
                                this.y -= spd * (scrollingSpeed / 8)
                            }
                            if (this.x < player.x) {
                                this.x += spd * (scrollingSpeed / 8)
                            }
                            if (this.x > player.x) {
                                this.x -= spd * (scrollingSpeed / 8)
                            }
                        }
                    }


                    if (lineDistance({
                            x: this.x,
                            y: this.y
                        }, {
                            x: player.x,
                            y: player.y
                        }) < tlSz) {
                        coins += 1
                        yellowExplosion()
                        coinSound()
                        TCTX.clearRect(0, 0, tlSz * 12, tlSz / 1.1)
                        TCTX.fillStyle = c1;
                        drawText("x " + coins, 1.5, {
                            x: tlSz,
                            y: tlSz / 4
                        })
                        this.remove()
                    }
                } else if (this.type == "pixel") {
                    TCTX.fillStyle = this.color;
                    this.x -= this.xSpeed
                    this.y -= this.ySpeed
                    this.cnt += 1
                    if (this.cnt == this.life) {
                        this.remove()
                    }
                } else if (this.type == "moon") {
                    this.angle += 0.005
                    this.x = tlSz * 5 + 600 * Math.cos(this.angle)
                    this.y = tlSz * 9 + 600 * Math.sin(this.angle)
                } else if (this.type == "pixel_bg") {
                    TCTX.fillStyle = this.color;
                    this.x -= this.xSpeed + scrollingSpeed
                    this.y -= this.ySpeed
                    this.cnt += 1
                    if (this.x <= -tlSz) {
                        var ranY = Math.floor(Math.random() * tlSz * 8)
                        if (gamePhase == 1 || gamePhase == 2 || gamePhase == 3) {
                            ranY = Math.floor(Math.random() * tlSz * 7) + tlSz * 1
                        }
                        this.x = tlSz * 11 + tlSz * Math.floor(Math.random() * 12)
                        this.y = ranY
                        this.xSpeed = Math.floor(Math.random() * 3) + (gamePhase == -1 ? 1 : 0)
                        this.ySpeed = 0
                        this.size = tlSz / (Math.floor(Math.random() * 8) + 2)
                        this.alpha = (Math.floor(Math.random() * 3) + 1) / 40
                        var colorArray = [c1, c2, c3, c4]
                        shuffleArray(colorArray)
                        this.color = colorArray[0]
                    }
                }
            }
        },
        this.draw = function() {
            //x.drawImage(this.image, this.x, this.y, tlSz, tlSz);
            if (this.flaggedRemove == false && this.isActive == true) {
                if (this.type == "ground") {
                    x.fillStyle = c1;
                    //this.groundType = 0
                    if (this.groundType == 0) {
                        x.fillRect(this.x + (tlSz / 8) * 0, 2 + this.y + (tlSz / 8) * -4, (tlSz / 8) * 2, (tlSz / 8) * 2);
                        x.fillRect(this.x + (tlSz / 8) * 1, 2 + this.y + (tlSz / 8) * -4, (tlSz / 8) * 1, (tlSz / 8) * 3);
                        x.fillRect(this.x + (tlSz / 8) * 5, 2 + this.y + (tlSz / 8) * -4, (tlSz / 8) * 1, (tlSz / 8) * 2);
                        x.fillRect(this.x + (tlSz / 8) * 5, 2 + this.y + (tlSz / 8) * 1, tlSz / 8, tlSz / 8);
                        x.fillRect(this.x + (tlSz / 8) * 3, 2 + this.y + (tlSz / 8) * 2, tlSz / 8, tlSz / 8);
                    } else if (this.groundType == 1) {
                        /*
                        x.fillRect(this.x+(tlSz/8)*0, 1+this.y+(tlSz/8)*-4, (tlSz/8)*1, (tlSz / 8)*2);
                        x.fillRect(this.x+(tlSz/8)*2, 1+this.y+(tlSz/8)*-4, (tlSz/8)*1, (tlSz / 8)*2);
                        x.fillRect(this.x+(tlSz/8)*1, 1+this.y+(tlSz/8)*-1, (tlSz/8)*1, (tlSz / 8));
                        x.fillRect(this.x+(tlSz/8)*4, 2+this.y+(tlSz/8)*-4, (tlSz/8)*2, (tlSz / 8)*2);
                        */
                        x.fillRect(this.x + (tlSz / 8) * 0, 2 + this.y + (tlSz / 8) * -4, (tlSz / 8) * 2, (tlSz / 8) * 2);
                        x.fillRect(this.x + (tlSz / 8) * 1, 2 + this.y + (tlSz / 8) * -4, (tlSz / 8) * 1, (tlSz / 8) * 3);
                        x.fillRect(this.x + (tlSz / 8) * 5, 2 + this.y + (tlSz / 8) * -4, (tlSz / 8) * 1, (tlSz / 8) * 2);
                        x.fillRect(this.x + (tlSz / 8) * 3, 2 + this.y + (tlSz / 8) * -5, tlSz / 8, tlSz / 8);

                    } else if (this.groundType == 2) {
                        /*
                        x.fillRect(this.x+(tlSz/8)*0, 1+this.y+(tlSz/8)*-2, (tlSz/8)*1, (tlSz / 8));
                        x.fillRect(this.x+(tlSz/8)*2, 1+this.y+(tlSz/8)*-2, (tlSz/8)*1, (tlSz / 8));
                        x.fillRect(this.x+(tlSz/8)*1, 1+this.y+(tlSz/8)*1, (tlSz/8)*1, (tlSz / 8)); 
                        */

                        x.fillRect(this.x + (tlSz / 8) * 0, 2 + this.y + (tlSz / 8) * -4, (tlSz / 8) * 2, (tlSz / 8) * 2);
                        x.fillRect(this.x + (tlSz / 8) * 0, 2 + this.y + (tlSz / 8) * -4, (tlSz / 8) * 1, (tlSz / 8) * 3);
                        x.fillRect(this.x + (tlSz / 8) * 5, 2 + this.y + (tlSz / 8) * -4, (tlSz / 8) * 1, (tlSz / 8) * 2);
                        x.fillRect(this.x + (tlSz / 8) * 5, 2 + this.y + (tlSz / 8) * 0, tlSz / 8, tlSz / 8);
                        x.fillRect(this.x + (tlSz / 8) * 3, 2 + this.y + (tlSz / 8) * 0, tlSz / 8, tlSz / 8);
                        //x.fillRect(this.x+(tlSz/8)*5, 2+this.y+(tlSz/8)*2, tlSz/8, tlSz / 8);
                        x.fillRect(this.x + (tlSz / 8) * 3, 2 + this.y + (tlSz / 8) * 2, tlSz / 8, tlSz / 8);
                    }



                } else if (this.type == "ground2") {
                    x.fillStyle = c3;
                    //x.clearRect(this.x, this.y, tlSz, tlSz)
                    x.fillRect(this.x + (tlSz / 8) * -2, this.y + (tlSz / 8) * -4, (tlSz / 8) * 6, tlSz / 8);
                    x.fillRect(this.x + (tlSz / 8) * -1, this.y + (tlSz / 8) * -4, (tlSz / 8) * 4, (tlSz / 8) * 2);
                    x.fillRect(this.x + (tlSz / 8) * -0, this.y + (tlSz / 8) * -3, (tlSz / 8) * 2, (tlSz / 8) * 2);
                    x.fillRect(this.x + (tlSz / 8) * 1, this.y + (tlSz / 8) * 0, tlSz / 8, tlSz / 8);
                    x.fillRect(this.x + (tlSz / 8) * 1, this.y + (tlSz / 8) * 2, tlSz / 8, tlSz / 8);
                } else if (this.type == "pixel") {
                    x.fillStyle = this.color
                    x.fillRect(this.x, this.y, this.size, this.size);
                } else if (this.type == "pixel_bg") {
                    x.fillStyle = this.color
                    x.globalAlpha = this.alpha
                    x.fillRect(this.x, this.y, this.size, this.size);
                    x.globalAlpha = 1
                } else {
                    rotateAndPaintImage(x, this.image, this.angle, this.x, this.y, this.size, this.size)
                }

                if (this.isDashing == true) {
                    x.drawImage(this.shieldImage, this.x - tlSz / 2, this.y - tlSz / 2 - 12, this.size * 1.5, this.size * 1.5);
                }
            }
        },
        this.remove = function() {
            this.flaggedRemove = true
            this.image = null
            this.shieldImage = null
            //this.isActive = false
            this.type = ""
            if (this.interval) {
                window.clearInterval(this.interval)
                this.interval = null
            }
            if (this.interval2) {
                window.clearInterval(this.interval2)
                this.interval2 = null
            }
        }
}









/* 
=======================================================
Mouse and touch handling
=======================================================
*/

//handle click
b.addEventListener("touchend", function(e) {
    e.preventDefault() //prevent double call of both click and touch
    unglide()
}, false);

//handle click
b.addEventListener("mouseup", function(e) {
    unglide()
}, false);

//handle click
b.addEventListener("touchstart", function(e) {
    e.preventDefault() //prevent double call of both click and touch
    glide()
    jump()
    click_start()
}, false);

//handle click
b.addEventListener("mousedown", function(e) {
    glide()
    jump()
    click_start()
}, false);


/* 
=======================================================
MISC functions
=======================================================
*/

//initialize variables
initVar = function(noGround) {
    if (!noGround) {
        noGround = false
    }
    lostList = ["p_djump", "p_dash", "p_glide", "p_focus", "p_coins"]
    changeTimeout = null
    tlSz = a.width / 10 //TileSize
    groundY = tlSz * 8.5
    objects = []
    if (noGround == false) {
        ground = []
    }
    //pixels = []
    jumpForce = 45
    slowScrollingSpeed = 8
    fastScrollingSpeed = 16
    dashSpeed = 30
    dashDuration = 200
    shieldDuration = 400
    gravity = 15
    groundDistance = tlSz
    currentGDistance = 0
    obj_distance = 500
    coinDistance = 100
    coinPause = true
    coins = 0
    flash = false
    powerCounter = 0
    newPowerIn = 800 //o meglio 1000?
    currentScrolling = slowScrollingSpeed
    scrollingSpeed = 0
    currentDistance = 0
    currentCoinDistance = 0
    coinPause = true
    coins = 0
    //
    //-1 = starting menu
    //0 = house
    //1 = game
    //2 = game over
    //3 = post game over
    //4 to 9 = endings
    gamePhase = -1
    //minimum
    p_jump = true
    //powers
    p_djump = true
    p_dash = true
    p_glide = true
    p_focus = true
    p_coins = true
    //optional
    p_multipleDash = true
    //
    isToChangePower = false

    //TESTING PUROPSES
    //lostList = ["p_focus"]
    //newPowerIn = 200
}


//change power functions
change = function() {
    if (gamePhase == 1) {
        //stop objects after 5 seconds
        changeTimeout = setTimeout(function() {
            if (gamePhase == 1) {
                isToChangePower = true
                //change power after 3 seconds
                changeTimeout = setTimeout(function() {
                    if (gamePhase == 1) {
                        changePower()
                        soundChange()
                        isToChangePower = false
                        changeTimeout = setTimeout(function() {
                            if (gamePhase == 1) {
                                change(), 2000, this
                            }
                        }, 3000, this)
                    }
                }, 3000, this)
            }

        }, newPowerIn, this)
    }
}

changePower = function() {
    if (lostList.length > 0) {
        powerCounter = 0
        shuffleArray(lostList)
        this[lostList[0]] = false
        player.jumpPower = 0
        player.djumpPower = 0
        player.glide = false
        if (p_focus == false) {
            currentScrolling = fastScrollingSpeed
            scrollingSpeed = currentScrolling
        }
        if (lostList[0] == "p_focus") {
            playAt(200)
        }
        for (var i = 0; i <= objects.length - 1; i++) {
            objects[i].remove()
        }
        objects.length = 0
        objects = []
        flash = true
        TCTX.fillStyle = c5;
        drawText("LOST", 6, {
            x: a.width / 2 - tlSz * 2,
            y: a.height / 2 - tlSz * 2
        })
        TCTX.fillStyle = c3;
        var scl = 6
        if (lostList[0] == "p_djump") {
            scl = 3
        }
        drawText(namesList[lostList[0]], scl, {
            x: a.width / 2 + spacingList[lostList[0]],
            y: a.height / 2
        })
        setTimeout(function() {
            if (gamePhase == 1) {
                TCTX.clearRect(0, a.height - tlSz * 0.8, tlSz * 12, tlSz * 3)
            }
        }, 5000, this)
        setTimeout(function() {
            flash = false
            powerCounter = 0
            currentDistance = 0
            currentGDistance = 0
            currentCoinDistance = 0
            TCTX.clearRect(0, a.height / 2 - tlSz * 2, tlSz * 12, tlSz * 5)


            TCTX.clearRect(0, a.height - tlSz * 0.8, tlSz * 12, tlSz * 3)
            TCTX.fillStyle = c1;
            drawText("YOU LOST THE POWER TO ", 1, {
                x: tlSz / 3,
                y: a.height - tlSz * 0.7
            })
            TCTX.fillStyle = c3;
            drawText(namesList[lostList[0]], 1.5, {
                x: tlSz * 5,
                y: a.height - tlSz * 0.8
            })
            TCTX.fillStyle = c1;
            removeFromArray(lostList, lostList[0])


        }, 500, this)
    } else {
        gamePhase = 4
        house.x = tlSz * 25
        flash = true
        p_jump = false
        TCTX.fillStyle = c5;
        drawText("LOST", 6, {
            x: a.width / 2 - tlSz * 2,
            y: a.height / 2 - tlSz * 2
        })
        TCTX.fillStyle = c3;
        drawText("JUMP", 6, {
            x: a.width / 2 - 250,
            y: a.height / 2
        })
        clTimeout = setTimeout(function() {
            TCTX.clearRect(0, a.height - tlSz * 0.8, tlSz * 12, tlSz * 3)
        }, 5000, this)
        setTimeout(function() {
            flash = false
            powerCounter = 0
            currentDistance = 0
            currentGDistance = 0
            currentCoinDistance = 0
            TCTX.clearRect(0, a.height / 2 - tlSz * 2, tlSz * 12, tlSz * 5)


            TCTX.clearRect(0, a.height - tlSz * 0.8, tlSz * 12, tlSz * 3)
            TCTX.fillStyle = c1;
            drawText("YOU LOST THE POWER TO ", 1, {
                x: tlSz / 3,
                y: a.height - tlSz * 0.7
            })
            TCTX.fillStyle = c3;
            drawText("JUMP", 1.5, {
                x: tlSz * 5,
                y: a.height - tlSz * 0.8
            })
            TCTX.fillStyle = c1;
            removeFromArray(lostList, lostList[0])

            this.player.y = groundY - tlSz
            this.player.angle = 0

        }, 500, this)
    }
}


//initialization of title screen
initializeGame = function(noGround) {
    if (!noGround) {
        noGround = false
    }
    playAt(150)
    gamePhase = -1
    createTCVS()
    TCTX.fillStyle = c1;
    drawText("CLICK TO START", 2, {
        x: tlSz * 2.2,
        y: a.height - tlSz * 0.8
    })

    TCTX.fillStyle = c2;
    drawText("A Day in the Life", 2, {
        x: tlSz * 1.8,
        y: tlSz
    })

    if (personalBest != 0) {
        TCTX.fillStyle = c2;
        drawText("Personal Best: " + personalBest, 1, {
            x: tlSz * 5.5,
            y: tlSz * 6
        })
    }
    /*
    TCTX.fillStyle = c4;
    drawText("Survive the obstacles of life", 1, {
        x: tlSz * 2.1,
        y: tlSz * 2
    })
    drawText("while losing powers during the day", 1, {
        x: tlSz * 1.6,
        y: tlSz * 2.3
    })
    */
    TCTX.fillStyle = c1;
    drawText("CLICK to JUMP", 1.5, {
        x: tlSz * 2.9,
        y: tlSz * 3 * 0.9
    })
    drawText("CLICK to DOUBLE JUMP", 1.5, {
        x: tlSz * 2,
        y: tlSz * 3.5 * 0.9
    })
    drawText("CLICK to DASH", 1.5, {
        x: tlSz * 3,
        y: tlSz * 4 * 0.9
    })
    drawText("HOLD CLICK to FLY", 1.5, {
        x: tlSz * 2.4,
        y: tlSz * 4.5 * 0.9
    })
    TCTX.fillStyle = c4;
    drawText("press M to mute", 0.5, {
        x: tlSz * 4.1,
        y: tlSz * 5 * 0.9
    })
    TCTX.fillStyle = c4;
    drawText("a game by Mattia Fortunati - js13kgames 2017", 0.5, {
        x: tlSz * 0.1,
        y: tlSz * 0.1 * 0.9
    })






    if (noGround == false) {
        for (var i = 0; i <= 12; i++) {
            var u = getFromPool()
            u.create(i * tlSz, groundY, "", "ground")
            ground.push(u)
            u.groundType = Math.floor(Math.random() * 3)
        }
    }


    player = getFromPool()
    //*1
    player.create(tlSz * 7, groundY - tlSz, imgPath + "test.png", "player")

    house = getFromPool()
    house.create(tlSz * 2, groundY - tlSz * 2, imgPath + "house.png", "house")
    //objects.push(house)

    moon = getFromPool()
    moon.create(tlSz * 2, groundY - tlSz * 2, imgPath + "moon.png", "moon")
    moon.angle = 1.5





}

//start game callback
startGame = function() {
    gamePhase = 1
    scrollingSpeed = currentScrolling
    coinPause = false

    coinInterval = setInterval(function() {
        if (coinPause == true) {
            coinPause = false
        } else {
            coinPause = true
        }
    }, 1500, this)
}


death = function() {
    window.clearInterval(changeTimeout)
    changeTimeout = null
    if (clTimeout != null) {
        window.clearInterval(clTimeout)
        clTimeout = null
    }
    dieSound()
    startShake();
    animate()
    blueExplosion()
    //scrollingSpeed = 0
    //location.reload()
    scrollingSpeed = 0
    gamePhase = 2
    TCTX.clearRect(0, a.height - tlSz * 0.8, tlSz * 12, tlSz * 3)
    TCTX.fillStyle = c1;
    drawText("GAME OVER", 2, {
        x: tlSz * 3,
        y: a.height - tlSz * 0.8
    })
    if (coinInterval) {
        window.clearInterval(coinInterval)
        coinInterval = null
    }
    if (window.localStorage) {
        if (coins > personalBest) {
            personalBest = coins
            localStorage.setItem("RECORD", coins);
        }
    } else {
        // can't be used
    }
    setTimeout(function() {
        pixelExplosion()
        dieSound()
        player.y = 10000
    }, 800, this)
    setTimeout(function() {
        gamePhase = 3
        TCTX.clearRect(0, a.height - tlSz * 0.8, tlSz * 12, tlSz * 3)
        TCTX.fillStyle = c1;
        drawText("CLICK TO RETRY", 2, {
            x: tlSz * 2.2,
            y: a.height - tlSz * 0.8
        })
        TCTX.fillStyle = c1;
        TCTX.fillRect(tlSz * 2, tlSz * 3, tlSz * 6, tlSz * 3);
        TCTX.fillStyle = c2;
        drawText("COINS", 2.5, {
            x: tlSz * 3.7,
            y: tlSz * 3.5
        })

        var tow = "" + coins
        var xoff = tow.length * tlSz / 3
        drawText(tow, 3, {
            x: (tlSz * 5.2) - xoff,
            y: tlSz * 4.7
        })
        if (personalBest == coins) {
            TCTX.fillStyle = c3;
            drawText("NEW PERSONAL BEST!", 1, {
                x: tlSz * 3.3,
                y: tlSz * 5.7
            })
        }

    }, 1500, this)

}

jump = function() {
    if (gamePhase == 1) {
        if (player.canJump == true) {
            jumpEffect()
            jumpSound()
            player.jumpPower = jumpForce
            player.canJump = false
            player.angle = 30
        } else {
            if (player.canDJump == true && p_djump == true) {
                jumpSound()
                jumpEffect()
                player.djumpPower = jumpForce
                player.jumpPower = 0
                player.canDJump = false
            }
        }
    }

}

glide = function() {
    if (gamePhase == 1) {
        if (p_glide == true) {
            player.glide = true
        }

        if ((p_djump == true && player.canDJump == false) || (p_djump == false && player.canJump == false)) {


            //dash
            if (player.hasDashed == false && this.p_dash == true && player.isDashing == false) {
                dashSound()
                dashEffect()
                setTimeout(function() {
                    dashEffect()
                }, 50, this)
                setTimeout(function() {
                    dashEffect()
                }, 100, this)
                setTimeout(function() {
                    dashEffect()
                }, 150, this)
                setTimeout(function() {
                    dashEffect()
                }, 200, this)
                scrollingSpeed = dashSpeed
                player.angle = 80
                if (p_multipleDash == false) {
                    player.hasDashed = true
                }
                player.isDashing = true
                setTimeout(function() {
                    scrollingSpeed = currentScrolling
                }, dashDuration * (currentScrolling == slowScrollingSpeed ? 1 : 2), this)
                setTimeout(function() {
                    player.isDashing = false
                }, shieldDuration * (currentScrolling == slowScrollingSpeed ? 1 : 2), this)
            }
        }
    }
}

unglide = function() {
    if (player.glide == true && gamePhase == 1) {
        player.glide = false
        player.angle = 30
    }

}

click_start = function() {
    //pixelExplosion()
    if (gamePhase == -1) {
        gamePhase = 0
        scrollingSpeed = currentScrolling
        TCTX.clearRect(0, 0, a.width, a.height)
        TCTX.fillStyle = c1;
        TCTX.fillRect(0, tlSz / 1.1, tlSz * 12, tlSz / 8);
        drawText("x " + coins, 1.5, {
            x: tlSz,
            y: tlSz / 4
        })
    } else if (gamePhase == 3 || gamePhase == 7) {
        restart()
    }

}

clearObjects = function(ending) {
    if (ending == null) {
        ending = false
    }

    for (var i = 0; i <= objects.length - 1; i++) {
        objects[i].isActive = false
        objects[i].remove()
    }
    objects.length = 0
    objects = []

    if (ending == false) {
        for (var i = 0; i <= ground.length - 1; i++) {
            ground[i].isActive = false
            ground[i].remove()
        }
        ground.length = 0
        ground = []
    }

    player.remove()
    player.isActive = false
    player = null
    house.remove()
    house.isActive = false
    house = null
    moon.remove()
    moon.isActive = false
    moon = null

}

restart = function() {
    x.clearRect(-100, 0, a.width + 200, a.height)
    TCTX.clearRect(-100, 0, a.width + 200, a.height)
    clearObjects()
    for (var i = 0; i <= lostList.length - 1; i++) {
        lostList[i] = null
    }
    initVar()
    initializeGame()
}

/* 
=======================================================
Object Creation
=======================================================
*/

createGround = function() {
    //var i = Math.floor(Math.random() * 8)
    //if (i<=6){
    var u = getFromPool()
    u.create(tlSz * 11, groundY, "", "ground")
    u.isActive = true
    u.flaggedRemove = false
    ground.push(u)
    u.groundType = Math.floor(Math.random() * 3)
    //}    
}


createObstacle = function() {
    var t = Math.floor(Math.random() * 8)
    //t = 3
    if (t == 0) {
        var obstacle = getFromPool()
        obstacle.create(tlSz * 12, groundY - tlSz, OBU, "obstacle")
        objects.push(obstacle)
        //
        if (currentScrolling == fastScrollingSpeed) {
            var obstacle = getFromPool()
            obstacle.create(tlSz * 13, groundY - tlSz, OBU, "obstacle")
            objects.push(obstacle)
        }

    } else if (t == 1) {
        var obstacle2 = getFromPool()
        obstacle2.create(tlSz * 12, groundY - tlSz * 2, OBU, "obstacle")
        objects.push(obstacle2)

        var obstacle2b = getFromPool()
        obstacle2b.create(tlSz * 12, groundY - tlSz * 3, OBU, "obstacle")
        objects.push(obstacle2b)

        var obstacle2c = getFromPool()
        obstacle2c.create(tlSz * 12, groundY - tlSz * 7, OBU, "obstacle")
        objects.push(obstacle2c)
    } else if (t == 2) {
        var obstacle3 = getFromPool()
        obstacle3.create(tlSz * 12, groundY - tlSz * 7, OBU, "obstacle_falling")
        objects.push(obstacle3)
    } else if (t == 3) {
        var ground2 = getFromPool()
        ground2.create(tlSz * 12, groundY, "", "ground2")
        objects.push(ground2)

        var obstacle4 = getFromPool()
        obstacle4.create(tlSz * 12, groundY - tlSz * 5, OBU, "obstacle")
        objects.push(obstacle4)
    } else if (t == 4) {
        var obstacle5 = getFromPool()
        obstacle5.create(tlSz * 12, groundY - tlSz * 1, OBU, "obstacle_horizontal")
        objects.push(obstacle5)
    } else if (t == 5) {
        if (p_djump == true) {
            var obstacle5 = getFromPool()
            obstacle5.create(tlSz * 12, groundY - tlSz * 1, OBU, "obstacle")
            objects.push(obstacle5)
            var obstacle5 = getFromPool()
            obstacle5.create(tlSz * 12, groundY - tlSz * 2, OBU, "obstacle")
            objects.push(obstacle5)
        } else {
            createObstacle()
        }

    } else if (t == 6) {
        if (p_djump == true || p_glide == true) {
            var obstacle5 = getFromPool()
            obstacle5.create(tlSz * 12, groundY - tlSz * 1, OBU, "obstacle")
            objects.push(obstacle5)
            var obstacle5 = getFromPool()
            obstacle5.create(tlSz * 13, groundY - tlSz * 1, OBU, "obstacle")
            objects.push(obstacle5)

            if (currentScrolling == fastScrollingSpeed && p_glide == true) {
                //var obstacle5 = new obj()
                //obstacle5.create(tlSz * 14, groundY - tlSz * 1, OBU, "obstacle")
                //objects.push(obstacle5)
                var obstacle5 = getFromPool()
                obstacle5.create(tlSz * 15, groundY - tlSz * 1, OBU, "obstacle")
                objects.push(obstacle5)
            }

        } else {
            createObstacle()
        }

    } else if (t == 7) {
        if (p_glide == true) {
            var obstacle5 = getFromPool()
            obstacle5.create(tlSz * 12, groundY - tlSz * 1, OBU, "obstacle")
            objects.push(obstacle5)
            //var obstacle5 = new obj()
            //obstacle5.create(tlSz * 13, groundY - tlSz * 1, OBU, "obstacle")
            //objects.push(obstacle5)
            var obstacle5 = getFromPool()
            obstacle5.create(tlSz * 12, groundY - tlSz * 2, OBU, "obstacle")
            objects.push(obstacle5)

            if (currentScrolling == fastScrollingSpeed) {
                var obstacle5 = getFromPool()
                obstacle5.create(tlSz * 14, groundY - tlSz * 1, OBU, "obstacle")
                objects.push(obstacle5)
                //var obstacle5 = new obj()
                //obstacle5.create(tlSz * 15, groundY - tlSz * 1, OBU, "obstacle")
                //objects.push(obstacle5)
                var obstacle5 = getFromPool()
                obstacle5.create(tlSz * 14, groundY - tlSz * 2, OBU, "obstacle")
                objects.push(obstacle5)
            }

        } else {
            createObstacle()
        }

    }

}



createCoin = function() {
    var coin = getFromPool()
    coin.create(tlSz * 12, groundY - tlSz * (Math.floor(Math.random() * 3) + 3), imgPath + "coin.png", "coin")
    objects.push(coin)

    for (var i = 0; i <= objects.length - 1; i++) {
        if (objects[i] != coin) {
            if (lineDistance({
                    x: coin.x,
                    y: coin.y
                }, {
                    x: objects[i].x,
                    y: objects[i].y
                }) < tlSz) {
                coin.remove()
            }
        }
    }
    var coin2 = getFromPool()
    coin2.create(tlSz * 12, coin.y - tlSz, imgPath + "coin.png", "coin")
    objects.push(coin2)

    for (var i = 0; i <= objects.length - 1; i++) {
        if (objects[i] != coin2) {
            if (lineDistance({
                    x: coin2.x,
                    y: coin2.y
                }, {
                    x: objects[i].x,
                    y: objects[i].y
                }) < tlSz) {
                coin2.remove()
            }
        }
    }
}








/* 
=======================================================
Top UI
=======================================================
*/

drawUI = function() {
    x.drawImage(kontra.assets.images[imgPath + "coin.png"], tlSz / 3, tlSz / 6, tlSz / 2, tlSz / 2);
    if (p_jump == true) {
        x.globalAlpha = 1
    } else {
        x.globalAlpha = 0.2
    }
    x.drawImage(kontra.assets.images[imgPath + "jump.png"], tlSz * 4, tlSz / 6 - 5, tlSz / 1.5, tlSz / 1.5);
    if (p_djump == true) {
        x.globalAlpha = 1
    } else {
        x.globalAlpha = 0.2
    }
    x.drawImage(kontra.assets.images[imgPath + "djum.png"], tlSz * 5, tlSz / 6 - 5, tlSz / 1.5, tlSz / 1.5);
    if (p_dash == true) {
        x.globalAlpha = 1
    } else {
        x.globalAlpha = 0.2
    }
    x.drawImage(kontra.assets.images[imgPath + "dash.png"], tlSz * 6, tlSz / 6 - 5, tlSz / 1.5, tlSz / 1.5);
    if (p_glide == true) {
        x.globalAlpha = 1
    } else {
        x.globalAlpha = 0.2
    }
    x.drawImage(kontra.assets.images[imgPath + "glide.png"], tlSz * 7, tlSz / 6 - 5, tlSz / 1.5, tlSz / 1.5);
    if (p_focus == true) {
        x.globalAlpha = 1
    } else {
        x.globalAlpha = 0.2
    }
    x.drawImage(kontra.assets.images[imgPath + "focus.png"], tlSz * 8, tlSz / 6 - 5, tlSz / 1.5, tlSz / 1.5);
    if (p_coins == true) {
        x.globalAlpha = 1
    } else {
        x.globalAlpha = 0.2
    }
    x.drawImage(kontra.assets.images[imgPath + "pcoin.png"], tlSz * 9, tlSz / 6 - 5, tlSz / 1.5, tlSz / 1.5);
    x.globalAlpha = 1

}


/* 
=======================================================
GAME LOOP
=======================================================
*/

startLoop = function() {
    var loop = kontra.gameLoop({
        update: function() {
            //UPDATE THINGS AND REMOVE IF NEEDED
            //EFFECTS

            /*
            var stt = 0
            for (var i = 0; i <= POOL.length - 1; i++) {
                if (POOL[i].isActive == false) {
                    stt++
                }
            }
            console.log(POOL.length, stt)
            */


            //move/refresh/remove/create ground when needed
            if (gamePhase == 1 || gamePhase == 0 || gamePhase == 4) {
                for (var i = 0; i <= ground.length - 1; i++) {
                    ground[i].update()
                }
                for (var i = 0; i <= ground.length - 1; i++) {
                    if (ground[i].flaggedRemove == true) {
                        ground[i].isActive = false
                        removeFromArray(ground, ground[i])
                        //ground[i] = null
                    }
                }
                currentGDistance += scrollingSpeed
                var distance = groundDistance
                if (scrollingSpeed == fastScrollingSpeed) {
                    distance = distance * 1
                }
                if (currentGDistance >= distance) {
                    currentGDistance = 0
                    createGround()
                }
            }

            /*
            for (var i = 0; i <= POOL.length - 1; i++) {
                if (POOL[i].isActive == true){
                POOL[i].update()    
                }
                
            }
            */

            for (var i = 0; i <= pixels.length - 1; i++) {
                pixels[i].update()
            }

            for (var i = 0; i <= pixels.length - 1; i++) {
                if (pixels[i].flaggedRemove == true) {
                    pixels[i].isActive = false
                    removeFromArray(pixels, pixels[i])
                    //pixels[i] = null
                }
            }

            for (var i = 0; i <= bgPixels.length - 1; i++) {
                bgPixels[i].update()
            }

            /*
            for (var i = 0; i <= bgPixels.length - 1; i++) {
                if (bgPixels[i].flaggedRemove == true) {
                    bgPixels[i].isActive = false
                    removeFromArray(bgPixels, bgPixels[i])
                    //bgPixels[i] = null
                }
            }
            */

            //check if screen is blurred, to restart sounds if needed
            if (blurred == true) {
                if (isMuted == false) {
                    sequence1.gain.gain.value = 0.1
                    sequence2.gain.gain.value = 0.05
                }
            }
            //animate player when needed
            if (gamePhase == 1 || gamePhase == 4 || gamePhase == 5 || gamePhase == 9) {
                player.animate()
            }

            //
            /*
            bgCnt += 1
            if (bgCnt == 50) {
                particleBg()
                bgCnt = 0
            }
            */
            //checks for phases
            if (gamePhase == 1) {

                powerCounter += 1
                if (powerCounter >= newPowerIn - 100) {
                    isToChangePower = true
                }
                if (powerCounter >= newPowerIn) {
                    isToChangePower = true
                    changePower()
                    soundChange()
                    isToChangePower = false
                    powerCounter = 0
                }
                /*
                bgCnt += 1
                if (bgCnt == 10) {
                    particleBg()
                    bgCnt = 0
                }
                */

                player.update()
                house.update()

                for (var i = 0; i <= objects.length - 1; i++) {
                    objects[i].update()
                }
                //

                //
                for (var i = 0; i <= objects.length - 1; i++) {
                    if (objects[i].flaggedRemove == true) {
                        objects[i].isActive = false
                        removeFromArray(objects, objects[i])
                        //objects[i] = null
                    }
                }
                //



                if (isToChangePower == false) {

                    //
                    currentDistance += scrollingSpeed
                    var distance = obj_distance
                    if (scrollingSpeed == fastScrollingSpeed) {
                        distance = distance * 2
                    }
                    if (currentDistance >= distance) {
                        currentDistance = 0
                        createObstacle()
                    }

                    //
                    currentCoinDistance += scrollingSpeed
                    var distance = coinDistance
                    if (scrollingSpeed == fastScrollingSpeed) {
                        distance = distance * 1.5
                    }
                    if (currentCoinDistance >= distance) {
                        currentCoinDistance = 0
                        if (coinPause == false) {
                            createCoin()
                        }
                    }
                }

                if (house.x > -tlSz * 4) {
                    house.x -= scrollingSpeed
                }
            } else if (gamePhase == 0) {
                if (player.x > tlSz) {
                    player.x -= scrollingSpeed
                }
                if (player.x <= tlSz) {
                    player.x = tlSz
                    startGame()
                    TCTX.clearRect(0, a.height - tlSz * 0.8, tlSz * 12, tlSz * 3)
                }
                if (house.x > -tlSz * 4) {
                    house.x -= scrollingSpeed
                }

            } else if (gamePhase == 4) {
                if (house.x > tlSz * 2) {
                    if (scrollingSpeed > 2) {
                        scrollingSpeed -= 0.08
                    }
                    house.x -= scrollingSpeed
                } else {
                    gamePhase = 5
                }
                if (house.x < tlSz * 10) {
                    if (sequence1.tempo == 200) {
                        playAt(150)
                    }
                }
                if (house.x < tlSz * 6) {
                    if (sequence1.tempo == 150) {
                        playAt(120)
                    }
                    player.angle = 45
                    player.y = groundY - tlSz * 0.8
                }
                if (house.x < tlSz * 3) {
                    if (sequence1.tempo == 120) {
                        playAt(100)
                    }
                    player.angle = 90
                    player.y = groundY - tlSz * 0.8
                }
            } else if (gamePhase == 9) {
                if (player.x < tlSz * 7) {
                    player.x += 2
                } else {
                    player.x = tlSz * 7
                    TCTX.clearRect(0, 0, tlSz * 12, tlSz * 12);
                    x.clearRect(-100, 0, a.width + 200, a.height)
                    TCTX.clearRect(-100, 0, a.width + 200, a.height)
                    clearObjects(true)
                    for (var i = 0; i <= lostList.length - 1; i++) {
                        lostList[i] = null
                    }
                    initVar(true)
                    initializeGame(true)
                    gamePhase = 0
                    TCTX.clearRect(0, 0, a.width, a.height)
                    TCTX.fillStyle = c1;
                    TCTX.fillRect(0, tlSz / 1.1, tlSz * 12, tlSz / 8);
                    drawText("x " + coins, 1.5, {
                        x: tlSz,
                        y: tlSz / 4
                    })
                    scrollingSpeed = slowScrollingSpeed
                }
            } else if (gamePhase == 8) {
                moon.update()
            } else if (gamePhase == 5) {
                if (player.x < tlSz * 2.5) {
                    player.x += 1
                } else {
                    gamePhase = 6
                    player.frame = 0
                    player.image.scr = imgPath + "test.png"
                    //
                    TCTX.fillStyle = c1;
                    TCTX.fillRect(tlSz * 2.5, tlSz * 1.5, tlSz * 5, tlSz * 5);
                    TCTX.fillStyle = c2;
                    drawText("COINS", 1, {
                        x: tlSz * 3.4,
                        y: tlSz * 2
                    })
                    drawText("" + coins, 1, {
                        x: tlSz * 6.4,
                        y: tlSz * 2
                    }, true)

                    setTimeout(function() {
                        TCTX.fillStyle = c2;
                        drawText("RENT", 1, {
                            x: tlSz * 3.4,
                            y: tlSz * 2.5
                        })
                        drawText("-50", 1, {
                            x: tlSz * 6.4,
                            y: tlSz * 2.5
                        }, true)
                    }, 1000, this)
                    setTimeout(function() {
                        TCTX.fillStyle = c2;
                        drawText("TAXES", 1, {
                            x: tlSz * 3.4,
                            y: tlSz * 3
                        })
                        drawText("-30", 1, {
                            x: tlSz * 6.4,
                            y: tlSz * 3
                        }, true)
                    }, 1500, this)
                    setTimeout(function() {
                        TCTX.fillStyle = c2;
                        drawText("FOOD", 1, {
                            x: tlSz * 3.4,
                            y: tlSz * 3.5
                        })
                        drawText("-20", 1, {
                            x: tlSz * 6.4,
                            y: tlSz * 3.5
                        }, true)
                    }, 2000, this)


                    TCTX.fillStyle = c3;
                    TCTX.fillRect(tlSz * 3, tlSz * 4, tlSz * 4, tlSz / 16);

                    var coinsToWin = 100 //100

                    setTimeout(function() {
                        TCTX.fillStyle = c2;
                        drawText("TOTAL", 1, {
                            x: tlSz * 3.4,
                            y: tlSz * 4.5
                        })
                        drawText("" + (coins - coinsToWin), 1, {
                            x: tlSz * 6.4,
                            y: tlSz * 4.5
                        }, true)
                    }, 2500, this)

                    if (coins - coinsToWin <= 0) {
                        setTimeout(function() {
                            TCTX.fillStyle = c3;
                            drawText("NOT ENOUGH!", 1.5, {
                                x: tlSz * 3.4,
                                y: tlSz * 5.5
                            })
                        }, 3000, this)

                        setTimeout(function() {
                            pixelExplosion()
                            dieSound()
                            player.y = 10000
                        }, 4000, this)

                        setTimeout(function() {
                            if (coins > personalBest) {
                                TCTX.fillStyle = c3;
                                drawText("NEW PERSONAL BEST!", 0.5, {
                                    x: tlSz * 4.2,
                                    y: tlSz * 6.1
                                })
                            }
                            gamePhase = 7
                            TCTX.clearRect(0, a.height - tlSz * 0.8, tlSz * 12, tlSz * 3)
                            TCTX.fillStyle = c1;
                            drawText("CLICK TO RETRY", 2, {
                                x: tlSz * 2.2,
                                y: a.height - tlSz * 0.8
                            })
                        }, 4500, this)
                    } else {
                        setTimeout(function() {
                            playAt(150)
                            TCTX.fillStyle = c3;
                            drawText("WELL DONE!", 1.5, {
                                x: tlSz * 3.6,
                                y: tlSz * 5.5
                            })
                        }, 3000, this)

                        setTimeout(function() {
                            if (coins > personalBest) {
                                TCTX.fillStyle = c3;
                                drawText("NEW PERSONAL BEST!", 0.5, {
                                    x: tlSz * 4.2,
                                    y: tlSz * 6.1
                                })
                            }

                        }, 4000, this)


                        setTimeout(function() {
                            gamePhase = 8
                            moon.x = tlSz * 2
                            moon.y = groundY - tlSz * 2
                            moon.angle = 1.5
                            TCTX.clearRect(0, 0, tlSz * 12, tlSz * 12);
                        }, 5500, this)

                        setTimeout(function() {
                            player.angle = 45
                            player.y = groundY - tlSz * 0.8
                        }, 6000, this)

                        setTimeout(function() {
                            player.angle = 0
                            player.y = groundY - tlSz
                        }, 6500, this)

                        setTimeout(function() {
                            player.y = 10000
                            TCTX.fillStyle = c2;
                            drawText("Congratulations!", 2, {
                                x: tlSz * 1.8,
                                y: tlSz
                            })
                            drawText("You won the day!", 2, {
                                x: tlSz * 1.9,
                                y: tlSz * 1.8
                            })
                        }, 7000, this)

                        /*
                        setTimeout(function() {
                            
                            TCTX.fillStyle = c2;
                            drawText("THANKS FOR PLAYING!", 1.5, {
                                x: tlSz * 2.1,
                                y: tlSz * 3.5
                            })
                        
                            
                            //TCTX.clearRect(0, 0, tlSz * 12, tlSz * 12);
                            //TCTX.fillStyle = c2;
                            //drawText("THANKS FOR PLAYING!", 2, {
                            //   x: tlSz * 1.4,
                            //    y: tlSz
                            //})
                        }, 8000, this)
                        */

                        setTimeout(function() {
                            TCTX.clearRect(0, 0, tlSz * 12, tlSz * 12);
                            TCTX.fillStyle = c2;
                            drawText("A DAY IN THE LIFE", 2, {
                                x: tlSz * 1.8,
                                y: tlSz
                            })
                        }, 10000, this)

                        setTimeout(function() {
                            TCTX.fillStyle = c2;
                            drawText("a game by Mattia Fortunati", 1, {
                                x: tlSz * 1.8,
                                y: tlSz * 1.8
                            })
                        }, 12000, this)

                        setTimeout(function() {
                            TCTX.fillStyle = c3;
                            drawText("Thank you for playing!", 1, {
                                x: tlSz * 2.8,
                                y: tlSz * 4
                            })
                        }, 14000, this)

                        setTimeout(function() {
                            TCTX.clearRect(0, 0, tlSz * 12, tlSz * 12);
                            TCTX.clearRect(0, a.height - tlSz * 0.8, tlSz * 12, tlSz * 3)
                        }, 20000, this)

                        setTimeout(function() {
                            TCTX.clearRect(0, 0, tlSz * 12, tlSz * 12);
                            TCTX.fillStyle = c2;
                            drawText("BUT", 2, {
                                x: tlSz * 1.8,
                                y: tlSz
                            })
                        }, 21000, this)

                        setTimeout(function() {
                            TCTX.clearRect(0, 0, tlSz * 12, tlSz * 12);
                            TCTX.fillStyle = c2;
                            drawText("CAN YOU SURVIVE", 2, {
                                x: tlSz * 1.8,
                                y: tlSz
                            })

                        }, 22000, this)

                        setTimeout(function() {
                            TCTX.fillStyle = c3;
                            drawText("TOMORROW?", 2, {
                                x: tlSz * 1.8,
                                y: tlSz * 1.8
                            })
                        }, 23000, this)
                        setTimeout(function() {
                            TCTX.fillStyle = c3;
                            drawText("AND TOMORROW", 2, {
                                x: tlSz * 1.8,
                                y: tlSz * 2.5
                            })
                        }, 24000, this)
                        setTimeout(function() {
                            TCTX.fillStyle = c3;
                            drawText("AND TOMORROW", 2, {
                                x: tlSz * 1.8,
                                y: tlSz * 3.2
                            })
                        }, 25000, this)
                        setTimeout(function() {
                            TCTX.fillStyle = c3;
                            drawText("AND TOMORROW?", 2, {
                                x: tlSz * 1.8,
                                y: tlSz * 3.9
                            })
                        }, 26000, this)

                        setTimeout(function() {
                            gamePhase = 9
                            this.player.y = groundY - tlSz
                        }, 25000, this)


                    }



                }
            }

        },
        render: function() {
            x.fillStyle = c1;
            x.fillRect(0, groundY - tlSz / 2, tlSz * 12, tlSz / 8);

            for (var i = 0; i <= bgPixels.length - 1; i++) {
                bgPixels[i].draw()
            }

            for (var i = 0; i <= ground.length - 1; i++) {
                ground[i].draw()
            }
            for (var i = 0; i <= objects.length - 1; i++) {
                objects[i].draw()
            }



            house.draw()
            player.draw()

            if (gamePhase == 8) {
                moon.draw()
            }

            for (var i = 0; i <= pixels.length - 1; i++) {
                pixels[i].draw()
            }

            if (gamePhase == 1 || gamePhase == 2 || gamePhase == 0 || gamePhase == 3 || gamePhase == 4 || gamePhase == 5 || gamePhase == 6 || gamePhase == 7) {
                drawUI()

            }

            if (flash == true) {
                x.fillStyle = c1
                x.fillRect(0, 0, a.width, a.height)
            }
        }
    });

    loop.start();
}


/* 
=======================================================
pixel explosions and effects
=======================================================
*/

function pixelExplosion() {
    for (var i = 0; i <= 20; i++) {
        var pxl = getFromPool()
        pxl.create(player.x, player.y, "", "pixel")
        pxl.xSpeed = Math.floor(Math.random() * 20) - 10
        pxl.ySpeed = Math.floor(Math.random() * 20) - 10
        pxl.size = tlSz / (Math.floor(Math.random() * 8) + 2)
        var colorArray = [c1, c2, c3, c4]
        shuffleArray(colorArray)
        pxl.color = colorArray[0]
        pxl.life = 50
        pixels.push(pxl)
    }
}

function redExplosion() {
    for (var i = 0; i <= 20; i++) {
        var pxl = getFromPool()
        pxl.create(player.x, player.y, "", "pixel")
        pxl.xSpeed = Math.floor(Math.random() * 20) - 10
        pxl.ySpeed = Math.floor(Math.random() * 20) - 10
        pxl.size = tlSz / (Math.floor(Math.random() * 6) + 8)
        pxl.color = TCTX.fillStyle = c3;
        pxl.life = 30
        pixels.push(pxl)
    }
}

function particleBg() {
    for (var i = 0; i <= 50; i++) {
        var pxl = getFromPool()
        var ranY = Math.floor(Math.random() * tlSz * 8)
        if (gamePhase == 1 || gamePhase == 2 || gamePhase == 3) {
            ranY = Math.floor(Math.random() * tlSz * 7) + tlSz * 1
        }
        pxl.create(tlSz * 11 + tlSz * Math.floor(Math.random() * 12), ranY, "", "pixel_bg")
        pxl.xSpeed = Math.floor(Math.random() * 3) + (gamePhase == -1 ? 1 : 0)
        pxl.ySpeed = 0
        pxl.size = tlSz / (Math.floor(Math.random() * 8) + 2)
        pxl.alpha = (Math.floor(Math.random() * 3) + 1) / 40
        var colorArray = [c1, c2, c3, c4]
        shuffleArray(colorArray)
        pxl.color = colorArray[0]
        bgPixels.push(pxl)
    }
}

function yellowExplosion() {
    for (var i = 0; i <= 5; i++) {
        var pxl = getFromPool()
        pxl.create(player.x, player.y, "", "pixel")
        pxl.xSpeed = Math.floor(Math.random() * 20) - 10
        pxl.ySpeed = Math.floor(Math.random() * 20) - 10
        pxl.size = tlSz / (Math.floor(Math.random() * 8) + 10)
        pxl.color = c2;
        pxl.life = 10
        pixels.push(pxl)
    }
}

function blueExplosion() {
    for (var i = 0; i <= 20; i++) {
        var pxl = getFromPool()
        pxl.create(player.x, player.y, "", "pixel")
        pxl.xSpeed = Math.floor(Math.random() * 20) - 10
        pxl.ySpeed = Math.floor(Math.random() * 20) - 10
        pxl.size = tlSz / (Math.floor(Math.random() * 8) + 10)
        pxl.color = c4;
        pxl.life = 30
        pixels.push(pxl)
    }
}

function jumpEffect() {
    for (var i = 0; i <= 5; i++) {
        var pxl = getFromPool()
        pxl.create(player.x, player.y, "", "pixel")
        pxl.xSpeed = -Math.floor(Math.random() * 5) + 5
        pxl.ySpeed = -Math.floor(Math.random() * 5)
        pxl.size = tlSz / (Math.floor(Math.random() * 6) + 8)
        pxl.color = c4
        pxl.life = 20
        pixels.push(pxl)
    }
}

function dashEffect() {
    for (var i = 0; i <= 5; i++) {
        var pxl = getFromPool()
        pxl.create(player.x + tlSz + Math.floor(Math.random() * 20) - 10, player.y + Math.floor(Math.random() * tlSz) - tlSz / 2, "", "pixel")
        pxl.xSpeed = Math.floor(Math.random() * 15) + 10
        pxl.ySpeed = 0
        pxl.size = tlSz / (Math.floor(Math.random() * 6) + 8)
        pxl.color = c2
        pxl.life = 30
        pixels.push(pxl)
    }
}

function flyEffect() {
    var pxl = getFromPool()
    pxl.create(player.x + tlSz / 3 + Math.floor(Math.random() * 10) - 5, player.y + Math.floor(Math.random() * (tlSz / 3) * 2) - tlSz / 3, "", "pixel")
    pxl.xSpeed = Math.floor(Math.random() * 15) + 10
    pxl.ySpeed = 0
    pxl.size = tlSz / (Math.floor(Math.random() * 6) + 8)
    pxl.color = c4
    pxl.life = 10
    pixels.push(pxl)
}


/* 
=======================================================
utils
taken from the internet :) and re-adapted where needed
=======================================================
*/

lineDistance = function(point1, point2) {
    var xs = 0;
    var ys = 0;

    xs = point2.x - point1.x;
    xs = xs * xs;

    ys = point2.y - point1.y;
    ys = ys * ys;

    return Math.sqrt(xs + ys);
}

removeFromArray = function(arr, what) {
    var found = arr.indexOf(what);

    while (found !== -1) {
        arr.splice(found, 1);
        found = arr.indexOf(what);
    }
}

rotateAndPaintImage = function(context, image, angleInDegrees, positionX, positionY, sizeX, sizeY) {
    context.translate(positionX, positionY);
    context.rotate(Math.radians(angleInDegrees));
    //2nd and 3rd parameter are anchor
    context.drawImage(image, -tlSz / 2, -tlSz / 2, sizeX, sizeY);
    context.rotate(-Math.radians(angleInDegrees));
    context.translate(-positionX, -positionY);
}

// Converts from degrees to radians.
Math.radians = function(degrees) {
    return degrees * Math.PI / 180;
};

// Converts from radians to degrees.
Math.degrees = function(radians) {
    return radians * 180 / Math.PI;
};

function shuffleArray(array) {
    for (var i = array.length - 1; i > 0; i--) {
        var j = Math.floor(Math.random() * (i + 1));
        var temp = array[i];
        array[i] = array[j];
        array[j] = temp;
    }
    return array;
}

/* 
=======================================================
shaking handling, taken from internet and adapted
=======================================================
*/

ctx = x
cv = x

sdu = 200; //shake duration
sst = -1; //shake start time

function preShake() {
    if (sst == -1) return;
    var dt = Date.now() - sst;
    if (dt > sdu) {
        sst = -1;
        return;
    }
    var easingCoef = dt / sdu;
    var easing = Math.pow(easingCoef - 1, 3) + 1;
    ctx.save();
    var dx = easing * (Math.cos(dt * 0.1) + Math.cos(dt * 0.3115)) * 5;
    var dy = easing * (Math.sin(dt * 0.05) + Math.sin(dt * 0.057113)) * 5;
    ctx.translate(dx, dy);
}

function postShake() {
    if (sst == -1) return;
    ctx.restore();
}

function startShake() {
    sst = Date.now();
}

function animate() {
    // keep animation alive
    requestAnimationFrame(animate);
    // erase
    ctx.clearRect(0, 0, cv.width, cv.height);
    //
    preShake();
    //
    //drawThings();
    //
    //postShake();
    setTimeout(function() {
        ctx.restore()
    }, sdu, this)
}



/* 
=======================================================
Handling mute sound on desktop
=======================================================
*/
document.onkeypress = function(evt) {
    evt = evt || window.event;
    var charCode = evt.keyCode || evt.which;
    var charStr = String.fromCharCode(charCode);
    if (charStr == "m" || charStr == "M") {
        muteMusic()
    }
};