export class ShaderToyApplet {
    constructor() {
    }

    renderFrame(api) {
        const time = Date.now();
        const red = (Math.sin(time) + 1) / 2;
        for(let y = 0;y < api.height;y++) {
            for(let x = 0;x < api.width;x++) {
                api.setPixel(x, y, red, 0, 0);
            }
        }
    }
}