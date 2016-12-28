const twgl = require('twgl.js');

const Skin = require('./Skin');
const SvgRenderer = require('./svg-quirks-mode/svg-renderer');

class SVGSkin extends Skin {
    constructor (id, renderer) {
        super(id);

        /** @type {RenderWebGL} */
        this._renderer = renderer;

        /** @type {SvgRenderer} */
        this._svgRenderer = new SvgRenderer();

        /** @type {WebGLTexture} */
        this._texture = null;
    }

    dispose () {
        if (this._texture) {
            this._renderer.gl.deleteTexture(this._texture);
            this._texture = null;
        }
        super.dispose();
    }

    /**
     * @return {[number,number]} the "native" size, in texels, of this skin.
     */
    get size () {
        return [this._svgRenderer.canvas.width, this._svgRenderer.canvas.height];
    }

    /**
     * @param {[number,number]} scale - The scaling factors to be used.
     * @return {WebGLTexture} The GL texture representation of this skin when drawing at the given size.
     */
    // eslint-disable-next-line no-unused-vars
    getTexture (scale) {
        // TODO: re-render a scaled version if the requested scale is significantly larger than the current render
        return this._texture;
    }

    /**
     * Set the contents of this skin to a snapshot of the provided SVG data.
     * @param {string} svgData - new SVG to use.
     */
    setSVG (svgData) {
        this._svgRenderer.fromString(svgData, () => {
            const gl = this._renderer.gl;
            if (this._texture) {
                gl.bindTexture(gl.TEXTURE_2D, this._texture);
                gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, this._svgRenderer.canvas);
            } else {
                const textureOptions = {
                    auto: true,
                    mag: gl.NEAREST,
                    min: gl.NEAREST, // TODO: mipmaps, linear (except pixelate)
                    wrap: gl.CLAMP_TO_EDGE,
                    src: this._svgRenderer.canvas
                };

                this._texture = twgl.createTexture(gl, textureOptions);
            }
        });
    }
}

module.exports = SVGSkin;
