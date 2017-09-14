/**
 * @module ./den.reel
 * @requires montage/ui/component
 */
var Component = require("montage/ui/component").Component;

/**
 * @class Den
 * @extends Component
 */
exports.CircularSliderDevice = Component.specialize(/** @lends Den# */ {

    _icon: {
        value: null
    },

    _needsUpdateIcon: {
        value: false
    },

    icon: {
        get: function () {
            return this._icon;
        },
        set: function (value) {
            switch (value) {
            case "am":
                this._icon = "ui/den.reel/day.png";
                break;
            case "pm":
                this._icon = "ui/den.reel/night.png";
                break;
            default:
                this._icon = null;
                break;
            }
            this._needsUpdateIcon = true;
            this.needsDraw = true;
        }
    },

    _value: {
        value: 0
    },

    value: {
        get: function () {
            if (this._value > this.max) {
                return this.max;
            } else if (this._value < this.min) {
                return this.min;
            }
            
            return this._value;
        },
        set: function (value) {
            if (! isNaN(value = parseFloat(value))) {
                if (value > this.max) {
                    value = this.max;
                } else if (value < this.min) {
                    value = this.min;
                }

                if (this._value !== value) {
                    this._value = value;
                    this.needsDraw = true;
                }
            }
        }
    },
    min: {
        value: 0
    },
    max: {
        value: 100
    },



    _progressValue: {
        value: undefined
    },

    progressValue: {
        get: function () {
            return this._progressValue;
        },
        set: function (value) {
            this._progressValue = value;
            this.needsDraw = true;
        }
    },

    temperatureDelta: {
        value: 0
    },

    _temperatureOffset: {
        value: 51
    },

    _previousTimestamp: {
        value: null
    },


    // The following enterDocument and handleTouchstart are a workaround for measurement
    // that should be removed after Afonso fixes loading css styles on time

    enterDocument: {
        value: function (firstTime) {
            if (firstTime) {
                this.activationArea.addEventListener("touchstart", this, false);
                this.activationArea.addEventListener("mousedown", this, false);
                if("webkitTransform" in this.element.style) {
                    this._transform = "webkitTransform";
                } else if("MozTransform" in this.element.style) {
                    this._transform = "MozTransform";
                } else if("msTransform" in this.element.style) {
                    this._transform = "msTransform";
                } else {
                    this._transform = "transform";
                }
            }
        }
    },

    handleTouchstart: {
        value: function () {
            var boundingRect = this.element.getBoundingClientRect(),
                center = {
                    pageX: (boundingRect.left + boundingRect.right) * .5,
                    pageY: boundingRect.top * .55 + boundingRect.bottom * .45
                };
            this._rotateComposer.center = center;
            this.activationArea.removeEventListener("touchstart", this, false);
        }
    },

    handleMousedown: {
        value: function () {
            var boundingRect = this.element.getBoundingClientRect(),
                center = {
                    pageX: (boundingRect.left + boundingRect.right) * .5,
                    pageY: boundingRect.top * .55 + boundingRect.bottom * .45
                };
            this._rotateComposer.center = center;
            this.activationArea.removeEventListener("mousedown", this, false);
        }
    },

    // End of workaround

    willDraw: {
        value: function() {
            var boundingRect = this.element.getBoundingClientRect(),
                center = {
                    pageX: (boundingRect.left + boundingRect.right) * .5,
                    pageY: boundingRect.top * .55 + boundingRect.bottom * .45
                };

            this._rotateComposer.center = center;

            if(this._progressValue == undefined) 
                this._progressValue = this._value;

        }
    },

    _isRotating: {
        value: false
    },

    handleRotate: {
        value: function(event) {
            this.value += event.deltaRotation / 6;
            if (this.value < this.min) {
                this.value = this.min;
            }
            if (this.value > this.max) {
                this.value = this.max;
            }
            this._isRotating = true;
            this.needsDraw = true;
        }
    },

    handleRotateEnd: {
        value: function(event) {
            this.value = Math.floor(this.value) + 0.5;
            this._isRotating = false;
            this.needsDraw = true;
        }
    },

    // heatingRate and coolingRate are in farenheight degrees per second
    heatingRate: {
        value: 1
    },

    coolingRate: {
        value: 1
    },

    handlePress: {
        value: function () {
            console.log("press!");
        }
    },

    draw: {
        value: function (timestamp) {
            var length,
                leftLength,
                rightLength,
                progressValue = (this.progressValue - this.min) | 0,
                //value = this.value - (((this.max - this.min)/2)+this.min) | 0,
                value = this.value - this.min | 0,
                time;
            this.temperatureDelta = (this.value - this.progressValue) / (this.max - this.min);
            this.rightDigit.style[this._transform] = "translate3d(" + (-50 * ((this.value | 0) % 10)) + "px, 0, 0)";
            this.leftDigit.style[this._transform] = "translate3d(" + (-50 * (this.value / 10 | 0)) + "px, 0, 0)";
            if (this._previousTimestamp === null) {
                this._previousTimestamp = timestamp;
            }
            time = timestamp - this._previousTimestamp;
            this._previousTimestamp = timestamp;
            this.whiteBar.style[this._transform] = "rotate3d(0, 0, 1, " + (value * 6 - 126) + "deg)";
            //console.log("this.value: ",this.value,"value: ",value, ", this.progressValue = ",this.progressValue, ", progressValue = ",progressValue, "this.temperatureDelta: ", this.temperatureDelta, " whiteBar: ",(value * 6 - 126)," deg");
            this.leftRedBar.style.opacity = 0;
            this.rightRedBar.style.opacity = 0;
            this.leftBlueBar.style.opacity = 0;
            this.rightBlueBar.style.opacity = 0;
            this.redFadingBar.style.opacity = 0;
            this.blueFadingBar.style.opacity = 0;
            this.blackBar.style.opacity = 0;
            if (progressValue < value) {
                length = value - progressValue - 1;
                if (length <= 30) {
                    this.leftRedBar.style.opacity = 1;
                    this.blackBar.style.opacity = 1;
                    this.leftRedBar.style[this._transform] = "rotate3d(0, 0, 1, " + ((1 + progressValue) * 6 - 39) + "deg)";
                    this.blackBar.style[this._transform] = "rotate3d(0, 0, 1, " + ((1 + progressValue + length) * 6 - 39) + "deg)";
                } else {
                    this.leftRedBar.style.opacity = 1;
                    this.rightRedBar.style.opacity = 1;
                    this.leftRedBar.style[this._transform] = "rotate3d(0, 0, 1, " + ((1 + progressValue) * 6 - 39) + "deg)";
                    this.rightRedBar.style[this._transform] = "rotate3d(0, 0, 1, " + ((1 + progressValue - (30 - length)) * 6 - 39) + "deg)";
                }
                this.redFadingBar.style.opacity = 1 - ((this.progressValue - this.min) - progressValue);
                this.redFadingBar.style[this._transform] = "rotate3d(0, 0, 1, " + (progressValue * 6 - 126) + "deg)";
            } else {
                if (progressValue > value) {
                    length = progressValue - value - 1;
                    if (length <= 30) {
                        this.leftBlueBar.style.opacity = 1;
                        this.blackBar.style.opacity = 1;
                        this.leftBlueBar.style[this._transform] = "rotate3d(0, 0, 1, " + ((1 + value) * 6 - 39) + "deg)";
                        this.blackBar.style[this._transform] = "rotate3d(0, 0, 1, " + ((1 + value + length) * 6 - 39) + "deg)";
                    } else {
                        this.leftBlueBar.style.opacity = 1;
                        this.rightBlueBar.style.opacity = 1;
                        this.leftBlueBar.style[this._transform] = "rotate3d(0, 0, 1, " + ((1 + value) * 6 - 39) + "deg)";
                        this.rightBlueBar.style[this._transform] = "rotate3d(0, 0, 1, " + ((1 + value - (30 - length)) * 6 - 39) + "deg)";
                    }
                    this.blueFadingBar.style.opacity = (this.progressValue - this.min) - progressValue;
                    this.blueFadingBar.style[this._transform] = "rotate3d(0, 0, 1, " + (progressValue * 6 - 126) + "deg)";
                }
            }
            if (!this._isRotating) {
                if (this.progressValue < this.value) {
                    this.progressValue += time * 0.001 * this.heatingRate;
                    if (this.progressValue > this.value) {
                        this.progressValue = this.value;
                    }
                    this.needsDraw = true;
                } else {
                    if (this.value < this.progressValue) {
                        this.progressValue -= time * 0.001 * this.coolingRate;
                        if (this.progressValue < this.value) {
                            this.progressValue = this.value;
                        }
                        this.needsDraw = true;
                    }
                    else {
                        this._progressValue = undefined;
                        this._previousTimestamp = null;
                        console.log("DONE!!");
                    }
                }
            }
            if (this._needsUpdateIcon) {
                this.iconElement.style.backgroundImage = "url(" + this._icon + ")";
                this._needsUpdateIcon = false;
            }
        }
    }

});
