export default class Color {
    constructor(red, green, blue, brightness) {
        this.red = red || 0;
        this.green= green || 0;
        this.blue = blue || 0;
        this.brightness = brightness || 64;
    }
}
