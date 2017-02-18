import Color from 'Color';

export default class FrameBuffer {
    constructor(width, height) {
        this.width = width;
        this.height = height;
        this.buffer = new Uint8ClampedArray(w*h*4);
    }

    setPixel(x, y, color) {
        const pos = (y * this.width + x) * 4;
        this.buffer[pos++] = color.red;
        this.buffer[pos++] = color.green;
        this.buffer[pos++] = color.blue;
        this.buffer[pos]   = color.brightness;
    }

    getPixel(x, y) {
        const pos = (y * this.width + x) * 4;
        return new Color(
            this.buffer[pos++],
            this.buffer[pos++],
            this.buffer[pos++],
            this.buffer[pos]
        );
    }
}
