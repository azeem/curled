import rpio from 'rpio';
import { clamp } from 'lodash';

export class APA102Driver {
    constructor({ width, height, brightness = 0.25, clockDivider = 128 }) {
        this.width = width;
        this.height = height;
        this.brightness = brightness;

        // initialize APA102 data frame buffer
        const numPixels = width * height;
        this.endFrameSize = Math.ceil(numPixels/16);
        const bufferSize = (1 + endFrameSize + numPixels)*4;
        this.buffer = Buffer.alloc(bufferSize);
        this._clearBuffer();

        this.animateCallbacks = [];

    }

    _clearBuffer() {
        this.buffer.fill(0);
        this.buffer.fill(0xFF, this.buffer.length - this.endFrameSize);
    }

    setPixel(x, y, r, g, b) {
        let pos = y*this.width;
        if (y%2 == 1) {
            pos += this.width - 1 - x;
        } else {
            pos += x;
        }
        pos = (pos+1) * 4;
        r = Math.floor(clamp(r, 0, 1) * 256);
        g = Math.floor(clamp(g, 0, 1) * 256);
        b = Math.floor(clamp(b, 0, 1) * 256);
        const h = Math.floor(clamp(this.brightness, 0, 1) * 31);
        this.buffer[pos + 1] = b;
        this.buffer[pos + 2] = g;
        this.buffer[pos + 3] = r;
        this.buffer[pos + 0] = (0x7 << 5) | h;
    }
    
    requestAnimationFrame(callback) {
        this.animateCallbacks.push(callback);
    }

    start() {
        rpio.spiBegin();
        rpio.spiSetClockDivider(128);
        
        this.isRunning = true;
        const writeFrame = () => {
            if(!this.isRunning) {
                rpio.spiEnd();
                return;
            }
            this.animateCallbacks.forEach((callback) => {
                callback(this);
            });
            rpio.spiWrite(this.buffer, this.buffer.length);
            setTimeout(writeFrame, 0);
        };
        writeFrame();
    }

    stop() {
        this.isRunning = false;
    }
}