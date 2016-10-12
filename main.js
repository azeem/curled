import spi from 'spi';
import _isArray from 'lodash/isArray';

const numPixels = 52*7;
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

const width = 52;
const height = 7;

class Color {
    constructor(r, g, b, h) {
        this.r = r || 0;
        this.g = g || 0;
        this.b = b || 0;
        this.h = h || 0.25;
    }
}

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

for(let y = 0;y < height;y++) {
    for(let x = 0;x < width;x++) {
        const color = x%3 == 0?new Color(0, 0, 0, 0.05):new Color();
        // const color = new Color(0, 255, 0);
        setPixel(x, y, color);
    }
}

//writeAPA102Frame(buffer, 10, new Color(0, 255, 255, 0.05));

console.log('writing frame');

new spi.Spi('/dev/spidev0.0', {}, (dev) => {
    dev.open();
    dev.write(buffer, () => {
        console.log('finished writing');
    });
});

// rpio.spiBegin();
// rpio.spiSetClockDivider(128);
// rpio.spiWrite(buffer, buffer.length);
