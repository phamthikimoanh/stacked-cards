/*
* Stacked Cards v1.0
* Created: Dec 2016
* Author: Juned Chhipa
*/

(function(){
    bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; }

    this.stackedCards = (function() {
        stackedCards.prototype.defaults = {
            layout: 'slide',                     // slide, fanOut, coverflow
            onClick: undefined,                 // onclick event provided
            transformOrigin: "center",          // css transformOrigin
        };

        function stackedCards(options) {
            if (options == null) {
                options = {};
            }

            this.draw = bind(this.draw, this);
            this.config = this.extend(options, this.defaults);
        }

        stackedCards.prototype.init = function () {
            this.element = window.document.documentElement;
            if ((ref = document.readyState) === "interactive" || ref === "complete") {
                this.draw();
            } else {
                document.addEventListener('DOMContentLoaded', this.draw);
            }
        }

        stackedCards.prototype.draw = function () {

            var me = this;
            var animated = false;

            var selector = this.config.selector;

            var els = document.querySelectorAll(selector + " li");

            var getItemHeight = els[0].getBoundingClientRect().height;

            els[0].parentNode.style.height = parseInt(getItemHeight) + "px";

            var lenAdjust = (els.length%2==0 ? -2 : -1)

            var oneHalf = (els.length+lenAdjust)/2;

            var styles = me.calculateTransforms(els);

            els[oneHalf].classList.add("active");

            var activeTransform = styles.transform[oneHalf];
            var activeZIndex = styles.zIndex[oneHalf];  
            var activeRel = styles.rel[oneHalf];    


            Array.prototype.forEach.call(els, function(el) {

                el.style.transformOrigin = me.config.transformOrigin;

                el.addEventListener("click", function() {

                    if(el.classList.contains("active")) return false;
                    
                    var index = el.getAttribute("rel");
                    var sign = el.dataset.sign;

                    var activeEls = document.querySelectorAll(selector + " li.active");

                    Array.prototype.forEach.call(activeEls, function(aEl) {
                        aEl.setAttribute("rel", index)
                        aEl.style.transform = styles.transform[index];
                        aEl.style.zIndex = styles.zIndex[index];

                        aEl.classList.remove("pos");
                        aEl.classList.remove("neg");
                        aEl.classList.add(sign);
                        aEl.dataset.sign = sign;
                    });

                    me.loopNodeList(els, function(el) {
                        el.classList.remove("active");
                    })

                    el.classList.add("active");

                    el.style.transform = activeTransform;
                    el.style.zIndex = activeZIndex;
                    el.setAttribute("rel", activeRel);
                    el.classList.remove("pos");
                    el.classList.remove("neg");
                    el.dataset.sign = "";

                    if (me.config.onClick !== undefined) {
                         me.config.onClick(el);
                    }

                });
            });

            window.addEventListener("scroll", function() {
                /*if(self.scrolledIn(el,self.config.offset)) {
                    if(animated==false) {
                        // do the animation here
                        animated = true;
                    }
                }*/
            });                
        }

        stackedCards.prototype.calculateTransforms = function(els) {
            var z = 10;

            var lenAdjust = (els.length%2==0 ? -2 : -1)

            var oneHalf = (els.length+lenAdjust)/2;
            var scale = 0.5, translateX = 0, rotateVal=0, rotate="";
            var rotateNegStart = ((75 / els.length) * (oneHalf))*-1;

            var parent = els[0].parentNode;

            var transformArr = [];
            var zIndexArr = [];
            var relArr = [];

            var layout = this.config.layout;       

            for(var i=0; i<els.length; i++) {

                els[i].setAttribute("rel", i);

                relArr.push(i);
                
                var divisor = 100 / (els.length - 1);
                
                if(i<oneHalf) {
                    scale = scale + (100 / (els.length+1))/100;
                    if(layout=="fanOut") {
                        if(i>0) {
                            rotateNegStart = rotateNegStart + (75 / els.length);
                        }
                        rotateVal = rotateNegStart;
                    }
                    else if(layout=="coverflow") {
                        scale = 0.75;
                        rotateVal = 45;
                    }
                    z = z + 1;
                }
                else if(i==oneHalf) {
                    rotateVal = 0;
                    if(layout=="coverflow") {
                        // perspective was causing z-index problems, so a small hack to overcome it
                        scale = scale + (100 / (els.length+1))/100;
                        if(scale>1) scale = 1;
                    }
                    else {
                        scale = 1;
                    }
                    z = z + 1;
                }
                else {
                    scale = scale - (100 / (els.length+1))/100;
                    if(layout=="fanOut") {
                        rotateVal = rotateVal + (75 / els.length);
                    }
                    else if(layout=="coverflow") {
                        rotateVal = -45;
                        scale = 0.75;
                    }
                    z = z - 1;
                }

                switch(layout) {
                    case "slide":
                        translateX = (150 - ((divisor*2)*i)) * -1;
                        rotate = "rotate(0deg)";
                        els[i].classList.add("slide")
                        break;
                    case "coverflow":
                        parent.style.perspective = parseInt(parent.style.height)*3 + "px";
                        translateX = (150 - ((divisor*2)*i)) * -1;
                        rotate = "rotateY("+rotateVal+"deg)";

                        els[i].classList.add("coverflow");

                        if(i<oneHalf) {
                            els[i].dataset.sign = "pos";
                            els[i].classList.add("pos");
                        }
                        else if(i>oneHalf) {
                            els[i].dataset.sign = "neg";
                            els[i].classList.add("neg");
                        }

                        break;
                    case "fanOut":
                        translateX = (100 - (divisor*i)) * -1;
                        rotate = "rotate("+rotateVal+"deg)";
                        els[i].classList.add("fanOut")
                        break;
                    default:
                        translateX = (150 - ((divisor*2)*i)) * -1;
                        rotate = "rotate(0deg)";

                }
               


                var styleStr = "translate("+ translateX +"%, 0%)  scale("+scale+") " + rotate;

                transformArr.push(styleStr);
                zIndexArr.push(z);
                

                els[i].style.transform = styleStr;
                els[i].style.zIndex = z;
            

            }

            return {
                transform: transformArr,
                zIndex: zIndexArr,
                rel: relArr
            }
        }

        stackedCards.prototype.extend = function(custom, defaults) {
            var key, value;
            for (key in defaults) {
                value = defaults[key];
                if (custom[key] == null) {
                  custom[key] = value;
                }
            }
            return custom;
        }

        stackedCards.prototype.loopNodeList = function(els, callback, scope) {
            for (var i = 0; i < els.length; i++) {
                callback.call(scope, els[i])
            }
        }


        stackedCards.prototype.scrolledIn = function(el, offset) {
            if(typeof el == 'undefined') return;
  
            var elemTop = el.getBoundingClientRect().top;
            var elemBottom = el.getBoundingClientRect().bottom;

            var scrolledInEl = (elemTop >= 0) && (elemTop <= window.innerHeight);
            return scrolledInEl;

        }

        return stackedCards;

    })();
}).call(this);