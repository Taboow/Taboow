var Tesseract = require('./tesseract.js');
var RecordRTC = require('recordrtc');
var hark = require('hark');
var $ = require("jquery");
let resources = './extraResources/';
eval(require('fs').readFileSync(resources + 'worker.js') + '');

Tesseract.workerOptions.workerPath = './extraResources/tesseract.js/src/node/worker.js';
/*
    kyc.js v0.0.8
    A JavaScript library for verification processes.
*/
function KYC(options) {
    this.loading = options.loading;
    this.video = options.video;
    this.onFinish = options.onFinish;
    this.loading = options.loading;
    this.steps = options.steps;
    this.onStep = options.onStep;
    this.onRetry = options.onRetry;
    this.onSuccess = options.onSuccess;
    this.images = [];
    this.document = "";
    this.lastStep = null;
    this.nextStep = null;

    this.recorder = null;
    this.canvas = document.createElement('canvas');
};

KYC.prototype.init = function() {
    this.images = [];
    this._startRecording();
}

KYC.prototype.stop = function() {
    this._stopRecording();
}

KYC.prototype.runNextStepSubStep = function() {
    if (this.lastStep == null) {
        console.error('No step to run');
        return;
    }
    var shouldEnd = false;
    if (this.steps.length - 1 == this.lastStep) {
        shouldEnd = true;
    }
    this._backId(this.lastStep, this.steps[this.lastStep]);
    if (shouldEnd) {
        var that = this;
        this._stopRecording(function() {
            that.onFinish({
                images: that.images,
                video: that.finalVideo,
                document: that.document
            });
        });
    }
}

KYC.prototype.goToNextStep = function() {
    if (this.nextStep == null) {
        console.error('No step to run');
        return;
    }
    this._runStep(this.nextStep, false);
    this.nextStep = null;
}

KYC.prototype.runNextStep = function() {
    if (this.lastStep == null) {
        console.error('No step to run');
        return;
    }
    this._runStep(this.lastStep, true);
}

KYC.prototype._runStep = function(stepNumber, forceRun) {
    var step = this.steps[stepNumber];
    var that = this;
    if (!step) {
        this._stopRecording(function() {
            that.onFinish({
                images: that.images,
                video: that.finalVideo,
                document: that.document
            });
        });
        return;
    }
    var that = this;
    if (!forceRun) {
        that.onStep(stepNumber, step, 0);
    } else {
        this.lastStep = null;
    }
    if (!step.auto && !forceRun) {
        this.lastStep = stepNumber;
        return;
    }
    setTimeout(function() {
        if (step.validators.length > 0 || step.snapshot) {
            that._takePhoto(step, stepNumber, function(result) {

                var success = true;
                for (var key in result) {
                    if (result.hasOwnProperty(key)) {
                        if (!result[key]) {
                            success = false;
                        }

                    }
                }

                if (success) {
                    that.onSuccess(stepNumber, step);
                    console.log(step);
                    if (step.autoNext) {
                        that._runStep(stepNumber + 1, false);
                    } else {
                        that.nextStep = stepNumber + 1;
                    }
                } else {
                    that.onRetry(stepNumber, result);
                    that._runStep(stepNumber, false);
                }
            });
        } else {
            that.onSuccess(stepNumber, step);
            that._runStep(stepNumber + 1, false);
        }
    }, step.wait);
}

KYC.prototype._captureCamera = function(callback) {
    navigator.mediaDevices.getUserMedia({ audio: true, video: true }).then(function(camera) {
        callback(camera);
    }).catch(function(error) {
        alert('Unable to capture your camera. Please check console logs.');
        console.error(error);
    });
}

KYC.prototype._stopRecordingCallback = function() {
    this.video.src = this.video.srcObject = null;
    this.video.src = URL.createObjectURL(this.recorder.getBlob());
    this.video.play();
    this.recorder.camera.stop();
    this.recorder.destroy();
    this.recorder = null;
}

KYC.prototype._startRecording = function() {
    this.disabled = true;
    var that = this;
    this._captureCamera(function(camera) {
        that.video.src = URL.createObjectURL(camera);
        //setSrcObject(camera, that.video);
        that.video.play();
        that.video.volume = 0;
        that.video.removeAttribute('controls');

        that.recorder = RecordRTC(camera, {
            type: 'video'
        });

        that.recorder.startRecording();

        that.recorder.camera = camera;
        that._runStep(0);
    });
};

KYC.prototype._stopRecording = function(callback) {
    this.disabled = true;
    var that = this;
    this.recorder.stopRecording(function() {
        that.video.src = that.video.srcObject = null;
        var blob = that.recorder.getBlob();
        var fileName = that._generateRandomString() + '.webm';
        var file = new File([blob], fileName, {
            type: 'video/webm'
        });
        that.finalVideo = file;
        that.video.src = URL.createObjectURL(blob);
        that.video.play();
        that.recorder.camera.stop();
        that.recorder.destroy();
        that.recorder = null;
        callback();
    });
};

KYC.prototype._generateRandomString = function() {
    if (window.crypto) {
        var a = window.crypto.getRandomValues(new Uint32Array(3)),
            token = '';
        for (var i = 0, l = a.length; i < l; i++) token += a[i].toString(36);
        return token;
    } else {
        return (Math.random() * new Date().getTime()).toString(36).replace(/\./g, '');
    }
}

KYC.prototype._validatePassport = function(data, step, stepNumber, callback) {
    var that = this;
    
    var bin = data.replace(/^data:image\/\w+;base64,/, "");
    var file = new Buffer(bin, 'base64');

    Tesseract.recognize(file, {
            lang: 'OCRB',
            tessedit_char_whitelist: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789<'
        })
        .progress(function(p) {
            if (p.status == 'recognizing text') {
                that.loading(p.progress * 100);
            }

        })
        .then(function(result) {
            console.log('result', result);

            //PASSPORT
            passportDetector = result.lines.filter(function(line) {
                return (/P<\w/.test(line.text.trim()));
            });

            console.log("PASSPORT DETECTOR", passportDetector);

            if (passportDetector.length > 0) {
                passportLines = result.lines.filter(function(line) {
                    return line.confidence > 30 && line.text.trim().length > 36 && /</.test(line.text.trim());
                });

                console.log('PASSPORT LINES', passportLines);

                if (passportLines.length > 1) {
                    // Until validate
                    that.document = "PASSPORT";
                    that.images.push(data);
                    callback(true);
                    return;

                    that._validateFace(data, function(success) {
                        console.log("------>" + success);
                        if (success) {
                            that.document = "PASSPORT";
                            that.images.push(data);
                        }
                        callback(success);
                    });
                    return;
                }
            }

            // ID
            // https://en.wikipedia.org/wiki/Identity_document
            idDetector = result.lines.filter(function(line) {
                return (/(ID\w*<)|(I<\w*)/.test(line.text.trim()));
            });

            console.log("ID DETECTOR", idDetector);

            if (idDetector.length > 0) {
                idLines = result.lines.filter(function(line) {
                    return line.confidence > 40 && line.text.trim().length > 25 && /</.test(line.text.trim());
                });

                console.log("ID LINES", idLines);

                if (idLines.length > 1) {
                    that.images.push(data);
                    that._backId(stepNumber, step, false);
                    return;
                }
            }

            callback(false);
        });
}

KYC.prototype._backId = function(stepNumber, step, forceRun) {
    var that = this;
    if (!forceRun) {
        that.onStep(stepNumber, step, 1);
    }
    if (!step.auto && !forceRun) {
        this.lastStep = stepNumber;
        return;
    }
    if (!step.auto && !forceRun) {
        return;
    }
    setTimeout(function() {
        that.document = "ID";
        that.images.push(that._getCurrentPhoto());
        callback(true);
    }, step.wait);
}

KYC.prototype._validateFace = function(data, callback) {
    var that = this;
    $(this.canvas).faceDetection({
        complete: function(faces) {
            if (faces.length > 0) {
                that.images.push(data);
            }
            callback(faces.length > 0);
        }
    });
}
KYC.prototype._validateVoice = function(data, step, stepNumber, callback) {
    var that = this;

    var speaking_millis = 500;
    var silence_millis = 3000;
    var done = false;
    var speechEvents = hark(that.recorder.camera, {});

    silence_timeout = setTimeout(function() {
        done = true;
        callback(false);
    }, silence_millis);

    speechEvents.on('speaking', function() {
        if (!done) {
            console.log("speaking");
            clearTimeout(silence_timeout);

            speaking_timeout = setTimeout(function() {
                done = true;
                callback(true);
            }, speaking_millis);
        }
    });
    speechEvents.on('stopped_speaking', function() {
        if (!done) {
            console.log("stopped_speaking");
            clearTimeout(speaking_timeout);

            silence_timeout = setTimeout(function() {
                done = true;
                callback(false);
            }, silence_millis);
        }
    });
}

KYC.prototype._validate = function(validators, index, callback, result, data, step, stepNumber) {
    var that = this;
    if (index == validators.length) {
        callback(result);
        return;
    }
    if (validators[index] == 'PASSPORT/ID') {
        this._validatePassport(data, step, stepNumber, function(success) {
            result[validators[index]] = success;
            that._validate(validators, index + 1, callback, result, step, stepNumber);
        });
    } else if (validators[index] == 'FACE') {
        this._validateFace(data, function(success) {
            result[validators[index]] = success;
            that._validate(validators, index + 1, callback, result, step, stepNumber);
        });
    } else if (validators[index] == 'VOICE') {
        this._validateVoice(data, step, stepNumber, function(success) {
            result[validators[index]] = success;
            that._validate(validators, index + 1, callback, result, step, stepNumber);
        });
    } else {
        console.error('Validator ' + validators[index] + ' not found');
        this._validate(validators, index + 1, callback, result, step, stepNumber);
    }
}

KYC.prototype._getCurrentPhoto = function() {
    width = this.video.videoWidth;
    height = this.video.videoHeight;
    this.canvas.width = width;
    this.canvas.height = height;
    var ctx = this.canvas.getContext('2d');
    ctx.drawImage(this.video, 0, 0, width, height);
    return this.canvas.toDataURL('image/png');
}

KYC.prototype._takePhoto = function(step, stepNumber, callback) {
    var data = this._getCurrentPhoto();

    if (step.validators.length == 0) {
        this.images.push(data);
        callback({});
        return;
    }
    this._validate(step.validators, 0, callback, {}, data, step, stepNumber);
}

module.exports = KYC;