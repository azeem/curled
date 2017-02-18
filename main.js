import spi from 'spi';
import _isArray from 'lodash/isArray';
import shaderToySample from './shaderToySample.json';

const width = 52;
const height = 18;

const numPixels = width*height;
const bufferSize = (2 + numPixels)*4;
const buffer = new Buffer(bufferSize);
for (let i = 0; i < bufferSize; i++) {
    buffer[i] = 0x00;
};
const lastPos = (1+numPixels)*4;
buffer[lastPos] = 0xFF;
buffer[lastPos+1] = 0xFF;
buffer[lastPos+2] = 0xFF;
buffer[lastPos+3] = 0xFF;

function writeAPA102Frame(buffer, pos, color) {
    pos = (pos+1) * 4;
    const h = Math.floor(color.h*31);
    buffer[pos + 1] = color.b; // Blue
    buffer[pos + 2] = color.g; // Green
    buffer[pos + 3] = color.r; // Red
    buffer[pos + 0] = (0x7 << 5) | h;
}

function setPixel(x, y, color) {
    let pos = y*width;
    if (y%2 == 1) {
        pos += width - 1 - x;
    } else {
        pos += x;
    }
    writeAPA102Frame(buffer, pos, color);
}

function simpleWave(x, y, startTime) {
    const iGlobalTime = (Date.now() - startTime)/1000;
    x = x/width;
    y = y/height;
    x = -1 + 2 * x;
    y = -1 + 2 * y;
    const mov0 = x+y+Math.cos(Math.sin(iGlobalTime)*2.0)*100.+Math.sin(x/100.)*1000.;
    const mov1 = y / 0.9 +  iGlobalTime;
    const mov2 = x / 0.2;
    const c1 = Math.abs(Math.sin(mov1+iGlobalTime)/2.+mov2/2.-mov1-mov2+iGlobalTime);
    const c2 = Math.abs(Math.sin(c1+Math.sin(mov0/1000.+iGlobalTime)+Math.sin(y/40.+iGlobalTime)+Math.sin((x+y)/100.)*3.));
    const c3 = Math.abs(Math.sin(c2+Math.cos(mov1+mov2+c2)+Math.cos(mov2)+Math.sin(x/1000.)));
    return new Color(c1 * 256, c2 * 256, c3 * 256, 0.05);
}

function sendFrame(dev, startTime, frameCounter, frameCountStartTime) {
    for(let y = 0;y < height;y++) {
        for(let x = 0;x < width;x++) {
            const color = simpleWave(x, y, startTime);
            //const color = new Color(0, 0, 0, 0.05);
            // const color = new Color(0, 255, 0);
            setPixel(x, y, color);
        }
    }
    const currentTime = Date.now();
    const timeDelta = (currentTime - frameCountStartTime);
    if(timeDelta >= 1000) {
        const frameRate = frameCounter * 1000 / timeDelta;
        console.log('Frame Rate = ' + frameRate);
        frameCounter = 0;
        frameCountStartTime = currentTime;
    }
    dev.write(buffer, sendFrame.bind(null, dev, startTime, frameCounter + 1, frameCountStartTime));
}

new spi.Spi('/dev/spidev0.0', {maxSpeed: 12000000}, (dev) => {
    dev.open();
    sendFrame(dev, Date.now(), 0, Date.now());
});

// rpio.spiBegin();
// rpio.spiSetClockDivider(128);
// rpio.spiWrite(buffer, buffer.length);
// test