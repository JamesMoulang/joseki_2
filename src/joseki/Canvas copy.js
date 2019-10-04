import Vector from './Vector';
import Maths from './Maths';
import Bezier from './Bezier';
import _  from './underscore';

import * as PIXI from 'pixi.js';

class Canvas {
	constructor(game, parent, zIndex, id, padding=32, gameWidth=1024, gameHeight=1024) {
		var div = document.getElementById(parent);
		this.game = game;
		this.scale = 1;
		this.padding = padding;
		this.gameWidth = gameWidth;
		this.gameHeight = gameHeight;
		this.topLeft = new Vector(0, 0);
		this.key = id;

		var canv = document.createElement('canvas');
		canv.id = 'canvas_' + id;
		canv.style.zIndex = zIndex;
		canv.style.position = 'absolute';
		div.appendChild(canv);

		this.fadeAlpha = 0;

		this.backgroundColor = '#ffffff';
		this.canvas = canv;
		this.ctx = canv.getContext('2d');
		this.transparent = false;
		this.shouldClearBorders = false;
		this.paused = false;
		this.shouldClear = true;

		this.resize();
	}

	resize() {
		const root = this.game.parent;
		this.canvas.width = root.clientWidth;
  		this.canvas.height = root.clientHeight;

		// Right.
		// padding is the actual screen padding. So how much space do we have to work with that isn't that?

		var actualPixelWidth = this.canvas.width - this.padding * 2;
		var actualPixelHeight = this.canvas.height - this.padding * 2;

		// So, what's the aspect ratio?
		var ratio = this.gameHeight / this.gameWidth;

		// Now set the scale so gameWidth fits into actualPixelWidth. Check height fits.
		this.scale = actualPixelWidth / this.gameWidth;
		var pixelGameWidth = this.gameWidth * this.scale;
		var pixelGameHeight = pixelGameWidth * ratio;
		if (pixelGameHeight > actualPixelHeight) {
			pixelGameHeight = actualPixelHeight;
			pixelGameWidth = pixelGameHeight / ratio;
			this.scale = pixelGameHeight / this.gameHeight;
		}

		var x = (root.clientWidth - pixelGameWidth) * 0.5;
		var y = (root.clientHeight - pixelGameHeight) * 0.5;

		this.topLeft = new Vector(x, y);

		this.screenWorldDimensions = this.screenToWorld(
			this.canvas.width,
			this.canvas.height
		);
	}

	clear() {
		if (this.transparent) {
			this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
		} else {
			this.ctx.fillStyle = this.backgroundColor;
			this.ctx.globalAlpha = 1;
			this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
		}
	}

	// tint,
	// strength,
	// cache,
	// __pos,
	// key,
	// width,
	// height,
	// _anchor=new Vector(0.5, 0.5),
	// alpha=1,
	// screenSpace=false
	drawSpriteTint(tint, strength, cache, __pos, key, width, height, _anchor=new Vector(0.5, 0.5), alpha=1, screenSpace=false) {
		const img = this.game.getImage(key);

		const tintKey = key+tint;

		if (this.game.tintCache[tintKey]) {
			this.drawSprite(__pos, key, width, height, _anchor, alpha, screenSpace, this.game.tintCache[tintKey]);
		} else {
			const buffer = document.createElement('canvas');
			buffer.width = img.width;
			buffer.height = img.height;

			const ctx = buffer.getContext('2d');

			ctx.fillStyle = tint;
			ctx.fillRect(0, 0, buffer.width, buffer.height);
			ctx.globalCompositeOperation = "destination-atop";
	        ctx.drawImage(img.img, img.x, img.y, img.width, img.height, 0, 0, img.width, img.height);

	        if (cache) {
	        	this.game.tintCache[tintKey] = buffer;
	        }

	        // this.drawSprite(__pos, key, width, height, _anchor, alpha, screenSpace);
	        this.drawSprite(__pos, key, width, height, _anchor, alpha, screenSpace, buffer);
		}
	}

	getTintedImage(key, tint, cache=false) {
		const img = this.game.getImage(key);

		const tintKey = key+tint;
		if (this.game.tintCache[tintKey]) {
			return this.game.tintCache[tintKey];
		} else {
			const buffer = this.getBuffer(img, tint);
			if (cache) {
		    	this.game.tintCache[tintKey] = buffer;
		    }
		    return buffer;
		}
	}

	getBuffer(img, tint) {
		const buffer = document.createElement('canvas');
		buffer.width = img.width;
		buffer.height = img.height;

		const ctx = buffer.getContext('2d');

		ctx.fillStyle = tint;
		ctx.fillRect(0, 0, buffer.width, buffer.height);
		ctx.globalCompositeOperation = "destination-atop";
        ctx.drawImage(img.img, img.x, img.y, img.width, img.height, 0, 0, img.width, img.height);

        return buffer;
	}

	sprite(__pos, key, options={}) {
		let img = this.game.getImage(key);
		if (options.overwriteImage) {
			img.x = 0;
			img.y = 0;
		}

		if (options.tint) {
			img = this.getTintedImage(key, options.tint, options.tintCache);
			img.x = 0;
			img.y = 0;
		}

		let width = options.width || img.width;
		let height = options.height || img.height;

		if (options.width && !options.height) {
			const ratio = img.height / img.width;
			height = width * ratio;
		}

		if (options.height && !options.width) {
			const ratio = img.width / img.height;
			width = height * ratio;
		}

		const anchor = options.anchor || new Vector(0.5, 0.5);
		anchor.x *= width;
		anchor.y *= height;

		const _pos = __pos.minus(anchor);
		const pos = options.screenSpace ? _pos : this.topLeft.add(_pos.times(this.scale));

		const x = (options.angle || options.radians) ? (-anchor.x * this.scale) : pos.x;
		const y = (options.angle || options.radians) ? (-anchor.y * this.scale) : pos.y;

		if ((options.angle || options.radians)) {
			this.ctx.translate(pos.x + anchor.x * this.scale, pos.y + anchor.y * this.scale);
			const rotation = options.angle ? Maths.deg2Rad(options.angle) : options.radians;
			this.ctx.rotate(rotation);
		}

		this.ctx.globalAlpha = options.alpha !== undefined ? options.alpha : 1;
		this.ctx.drawImage(
			options.tint ? img : img.img,
			img.x,
			img.y,
			img.width,
			img.height,
			x,
			y,
			width * this.scale,
			height * this.scale
		);

		if ((options.angle || options.radians)) {
			const rotation = options.angle ? Maths.deg2Rad(options.angle) : options.radians;
			this.ctx.rotate(-rotation);
			this.ctx.translate(-(pos.x + anchor.x * this.scale), -(pos.y + anchor.y * this.scale));
		}
	}

	drawSprite(__pos, key, width, height, _anchor=new Vector(0.5, 0.5), alpha=1, screenSpace=false, overwriteImage) {
		var anchor = new Vector(
			_anchor.x * width,
			_anchor.y * height
		);

		var _pos = __pos.minus(anchor);
		var pos = this.topLeft.add(_pos.times(this.scale));

		if (screenSpace) {
			pos = __pos;
		}

		const img = overwriteImage ? overwriteImage : this.game.getImage(key);
		if (overwriteImage) {
			img.x = 0;
			img.y = 0;
		}

		this.ctx.globalAlpha = alpha;

		if (this.game.debugMode) {
			try {
				this.ctx.drawImage(
					overwriteImage ? overwriteImage : img.img,
					img.x,
					img.y,
					img.width,
					img.height,
					pos.x,
					pos.y,
					(width ? width : img.width) * this.scale,
					(height ? height : img.height) * this.scale
				);
			}
			catch(e) {
				console.log(e);
				console.log('key: ' + key);
			}
		} else {
			const w = (width ? width : img.width);
			const h = (height ? height : img.height);

			this.ctx.drawImage(
				overwriteImage ? overwriteImage : img.img,
				img.x,
				img.y,
				img.width,
				img.height,
				pos.x,
				pos.y,
				w * this.scale,
				h * this.scale
			);
		}
	}

	// _pos,
	// radius,
	// fillStyle,
	// strokeStyle,
	// fillAlpha,
	// strokeAlpha,
	// startArc,
	// endArc,
	// anticlockwise
	// strokeWidth
	// strokeCap
	drawCircle(
		_pos,
		radius=128,
		fillStyle,
		strokeStyle,
		fillAlpha=1,
		strokeAlpha=1,
		startArc=0,
		endArc=2*Math.PI,
		anticlockwise=false,
		strokeWidth,
		strokeCap='butt'
	) {
		var pos = this.topLeft.add(_pos.times(this.scale));
		this.ctx.beginPath();
		this.ctx.arc(pos.x, pos.y, radius*this.scale, startArc, endArc, anticlockwise);

		if (typeof(fillStyle) !== 'undefined') {
			this.ctx.fillStyle = fillStyle;
			this.ctx.globalAlpha = fillAlpha;
			this.ctx.fill();
		}

		if (typeof(strokeStyle) !== 'undefined') {
			this.ctx.lineCap = strokeCap;
			this.ctx.strokeStyle = strokeStyle;
			this.ctx.globalAlpha = strokeAlpha;
			if (strokeWidth !== undefined) {
				this.ctx.lineWidth = this.game.OS === 'osx' ? (strokeWidth * 0.5) : strokeWidth;
			}
			this.ctx.stroke();
		}
	}

	circle(_pos, radius, options) {
		const anticlockwise = options.anticlockwise || false;
		const startArc = options.startArc || 0;
		const endArc = options.endArc || 2 * Math.PI;

		var pos = this.topLeft.add(_pos.times(this.scale));

		this.ctx.beginPath();
		this.ctx.arc(
			pos.x,
			pos.y,
			radius*this.scale,
			startArc,
			endArc,
			anticlockwise
		);

		this.optionsFill(options);
		this.optionsStroke(options);
	}

	fade() {
		if (this.fadeAlpha > 0) {
			this.ctx.fillStyle = '#000000';
			this.ctx.globalAlpha = this.fadeAlpha;
			this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
		}
	}

	clearBorders(color = '#000000') {
		if (this.shouldClearBorders) {
			this.ctx.fillStyle = color;
			this.ctx.globalAlpha = 1;
			this.ctx.fillRect(0, 0, this.topLeft.x, this.canvas.height);
			this.ctx.fillRect(this.canvas.width - this.topLeft.x, 0, this.topLeft.x, this.canvas.height);
			this.ctx.fillRect(0, 0, this.canvas.width, this.topLeft.y);
			this.ctx.fillRect(0, this.canvas.height - this.topLeft.y, this.canvas.width, this.topLeft.y);
		}
	}

	screenToWorld(x, y) {
		return (new Vector(x, y).minus(this.topLeft)).times(1/this.scale);
	}

	getPos(_pos) {
		var pos = this.topLeft.add(_pos.times(this.scale));
		return pos;
	}

	drawEllipse(_pos, radiusX, radiusY, fillStyle, strokeStyle, fillAlpha=1, strokeAlpha=1, lineWidth=1) {
		var pos = this.getPos(_pos);
		this.ctx.beginPath();
		this.ctx.ellipse(
			pos.x, 
			pos.y, 
			radiusX*this.scale, 
			radiusY*this.scale, 
			0, 
			0, 
			2*Math.PI, 
			false
		);

		if (typeof(fillStyle) !== 'undefined') {
			this.ctx.fillStyle = fillStyle;
			this.ctx.globalAlpha = fillAlpha;
			this.ctx.fill();
		}

		if (typeof(strokeStyle) !== 'undefined') {
			this.ctx.lineWidth = lineWidth * this.scale;
			this.ctx.strokeStyle = strokeStyle;
			this.ctx.globalAlpha = strokeAlpha;
			this.ctx.stroke();
		}
	}

	clearRect(_x=0, _y=0, _width=128, _height=128) {
		var x = this.topLeft.x + _x * this.scale;
		var y = this.topLeft.y + _y * this.scale;
		var width = _width * this.scale;
		var height = _height * this.scale;

		this.ctx.clearRect(x, y, width, height);
	}

	renderBox() {
		this.drawRect(0, 0, this.game.width, this.game.height, {
			strokeColor: '#ff0000',
			strokeAlpha: 1,
			fillAlpha: 0
		});
	}

	fillRect(_x=0, _y=0, _width=128, _height=128, color='#ffffff', alpha=1) {
		var x = this.topLeft.x + _x * this.scale;
		var y = this.topLeft.y + _y * this.scale;
		var width = _width * this.scale;
		var height = _height * this.scale;

		this.ctx.fillStyle = color;
		this.ctx.globalAlpha = alpha;
		this.ctx.fillRect(x, y, width, height);
	}

	optionsFill(options) {
		const fillColor = (options.fillColor !== undefined) ? options.fillColor : '#ffffff';
		const fillAlpha = (options.fillAlpha !== undefined) ? options.fillAlpha : 1;

		if (fillAlpha > 0) {
			this.ctx.fillStyle = fillColor;
			this.ctx.globalAlpha = fillAlpha;
			this.ctx.fill();
		}
	}

	optionsStroke(options) {
		const strokeColor = (options.strokeColor !== undefined) ? options.strokeColor : '#ffffff';
		const strokeAlpha = (options.strokeAlpha !== undefined) ? options.strokeAlpha : 1;
		const strokeWidth = (options.strokeWidth !== undefined) ? options.strokeWidth : 1;
		const strokeCap = (options.strokeCap !== undefined) ? options.strokeCap : 'butt';

		if (strokeAlpha > 0) {
			this.ctx.lineCap = strokeCap;
			this.ctx.strokeStyle = strokeColor
			this.ctx.lineWidth = strokeWidth * this.scale;
			this.ctx.globalAlpha = strokeAlpha;
			this.ctx.stroke();
			this.ctx.lineCap = 'butt';
		}
	}

	drawBezierCurve(p1, p2, p3, p4, options) {
		const points = Bezier.GetPointsCubic(p1, p2, p3, p4, options.steps, options.start, options.end);
		this.ctx.beginPath();
		_.each(points, (point, i) => {
			var x = this.topLeft.x + point.x * this.scale;
			var y = this.topLeft.y + point.y * this.scale;

			if (i == 0) {
				this.ctx.moveTo(x, y);
			} else {
				this.ctx.lineTo(x, y);
			}
		});

		this.optionsFill(options);
		this.optionsStroke(options);
	}

	drawBezierCurveClassic(p1, p2, p3, p4, options) {
		this.ctx.beginPath();

		// Move to start point.
		this.ctx.moveTo(
			this.topLeft.x + p1.x * this.scale,
			this.topLeft.y + p1.y * this.scale
		);

		// Draw the rest of the owl
		this.ctx.bezierCurveTo(
			this.topLeft.x + p2.x * this.scale,
			this.topLeft.y + p2.y * this.scale,
			this.topLeft.x + p3.x * this.scale,
			this.topLeft.y + p3.y * this.scale,
			this.topLeft.x + p4.x * this.scale,
			this.topLeft.y + p4.y * this.scale,
		);

		this.optionsFill(options);
		this.optionsStroke(options);
	}

	drawRect(_x=0, _y=0, _width=128, _height=128, options) {
		const fillColor = (options.fillColor !== undefined) ? options.fillColor : '#ffffff';
		const fillAlpha = (options.fillAlpha !== undefined) ? options.fillAlpha : 1;
		const strokeColor = (options.strokeColor !== undefined) ? options.strokeColor : '#ffffff';
		const strokeAlpha = (options.strokeAlpha !== undefined) ? options.strokeAlpha : 1;
		const strokeWidth = (options.strokeWidth !== undefined) ? options.strokeWidth : 1;
		const worldSpace = (options.worldSpace !== undefined) ? options.worldSpace : true;

		var x = worldSpace ? (this.topLeft.x + _x * this.scale) : _x;
		var y = worldSpace ? (this.topLeft.y + _y * this.scale) : _y;
		var width = worldSpace ? (_width * this.scale) : _width;
		var height = worldSpace ? (_height * this.scale) : _height;

		if (fillAlpha > 0) {
			this.ctx.fillStyle = fillColor;
			this.ctx.globalAlpha = fillAlpha;
			this.ctx.fillRect(x, y, width, height);
		}

		this.ctx.strokeStyle = strokeColor
		this.ctx.lineWidth = strokeWidth;
		this.ctx.globalAlpha = strokeAlpha;
		this.ctx.strokeRect(x, y, width, height);
	}
	
	drawPolyLine(points, color, alpha=1, lineWidth=8, fillColor='#ffffff', fillAlpha=0, closePath=false) {
		this.ctx.beginPath();

		_.each(points, (point, i) => {
			var x = this.topLeft.x + point.x * this.scale;
			var y = this.topLeft.y + point.y * this.scale;

			if (i == 0) {
				this.ctx.moveTo(x, y);
			} else {
				this.ctx.lineTo(x, y);
			}
		});

		if (closePath) {
			this.ctx.closePath();
		}

		if (fillAlpha > 0) {
			this.ctx.fillStyle = fillColor
			this.ctx.globalAlpha = fillAlpha;
			this.ctx.fill();
		}
		
		this.ctx.strokeStyle = color;
		this.ctx.globalAlpha = alpha;
		this.ctx.lineWidth = lineWidth * this.scale;
		this.ctx.stroke();
	}

	drawLine(_x1=0, _y1=0, _x2=128, _y2=128, color='#ffffff', alpha=1, lineWidth=8) {
		var x1 = this.topLeft.x + _x1 * this.scale;
		var y1 = this.topLeft.y + _y1 * this.scale;
		var x2 = this.topLeft.x + _x2 * this.scale;
		var y2 = this.topLeft.y + _y2 * this.scale;

		this.ctx.strokeStyle = color;
		this.ctx.globalAlpha = alpha;
		this.ctx.lineWidth = lineWidth * this.scale;
		this.ctx.beginPath();
		this.ctx.moveTo(x1,y1);
		this.ctx.lineTo(x2,y2);
		this.ctx.stroke();
	}

	fillText(__pos = new Vector(0, 0), text, color = '#ff0000', size = 32, font = 'Arial', textAlign = 'start', vertical = 0){
		const _pos = __pos.add(new Vector(0, size*vertical))
		const pos = this.getPos(_pos);

		this.ctx.globalAlpha = 1;
		this.ctx.textAlign = textAlign;
		this.ctx.strokeStyle = this.ctx.fillStyle = color;
		this.ctx.font = (size * this.scale).toString() + 'px ' + font;
		this.ctx.fillText(text, pos.x, pos.y);
	}
}

export default Canvas;