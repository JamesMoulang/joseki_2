import _ from 'underscore';
import uid from 'uid';
import howler from 'howler';
const Howl = howler.Howl;

import StateMachine from './StateMachine';
import Canvas from './Canvas';
import Vector from './Vector';
import Key from './Key';
import Maths from './Maths';

class Game {
	constructor(parentID, states, fps=120, width = 1024, height = 1024, gamePadding = 64) {
		document.getElementById('loading').style.display = 'none';
		document.getElementById('smile').style.display = 'none';

		window.josekiLoaded = true;

		window.clearAllCanvases = this.clearAllCanvases.bind(this);

		this.notLoaded = [];
		
		this.assetRoot = '$assets/';

		this.parentID = parentID;
		this.parent = document.getElementById(this.parentID);
		this.gamePadding = gamePadding;
		this.width = width;
		this.height = height;

		this.fps = fps;
		this.timeScaleFPS = 120;
		this.idealFrameTime = 1000 / this.timeScaleFPS;
		this.delta = 0;
		this.deltaNoTimescale = 0;

		this.backgroundColor = '#091431';
		this.justDestroyed = false;
		this.entities = [];
		// To be rendered on top of entities, for when you forget to manage layers well. Lol
		this.topEntities = [];
		this.lerps = [];
		this.globalFunctions = [];
		this.state = new StateMachine(states, this);
		this.canvases = [];
		this.canvasIndex = 0;
		this.mousePos = new Vector(0, 0);
		this.mousedown = false;
		this.mouseclicked = false;
		this.images = {};
		this.json = {};
		this.tintCache = {};
		this.widthCache = {};
		this.imagesLoading = 0;
		this.totalImageCount = 0;
		this.jsonLoading = 0;
		this.clearBorders = false;
		this.timescale = 1;
		this.focusTimeScale = 1;
		this.resizeListeners = [];

		this.defaultCursorStyle = 'default';

		this.volume = 0.2;
		this.muted = false;
		this.audioCache = {};
		this.audioLoadingCount = 0;

		this.OS = (navigator.appVersion.indexOf("Mac")!=-1) ? 'osx' : 'windows';

		this.mouseEventListeners = {};
		this.keyListeners = [];
		window.onresize = this._onresize.bind(this);
		document.onmouseover = this.onmousemove.bind(this);
		document.onmousemove = this.onmousemove.bind(this);
		document.onclick = this.onmouseclick.bind(this);
		document.onmousedown = this.onmousedown.bind(this);
		document.onmouseup = this.onmouseup.bind(this);
		document.ontouchstart = this.onmousedown.bind(this);

		this.mouseinput = {
			down: false,
			just_down: false,
			up: false,
			just_up: false,
			waiting_for_up: false,
		};

		this.onDropListeners = [];
		document.ondrop = this.ondrop.bind(this);
		this.onDragOverListeners = [];
		document.ondragover = this.ondragover.bind(this);
		this.onDragLeaveListeners = [];
		document.ondragleave = this.ondragleave.bind(this);

		this.focus = true;
		window.onfocus = this.onfocus.bind(this);
		window.onblur = this.onblur.bind(this);

		this.keys = [];
		this.trackingKeys = [];
		window.onkeydown = this.onkeydown.bind(this);
		window.onkeyup = this.onkeyup.bind(this);

		this.timeouts = [];

		this.logTags = [];
		this.tlogTag('answer_time', true);

		window.tlog = this.tlog.bind(this);

		this.clearIndex = -1;
	}

	tlogTag(tag, enabled) {
		if (enabled) {
			this.logTags.push(tag);
		} else {
			this.logTags = _.without(this.logTags, tag);
		}
	}

	tlog(tag) {
		if (this.logTags.indexOf(tag) > -1) {
			const a = [];
			_.each(arguments,(_a, i) => {
				if (i > 0) a.push(_a)
			});
			console.log(tag, a);
		}
	}

	timeout(callback, time) {
		this.timeouts.push({
			id: uid(),
			time: this.lastTimestamp + time,
			callback: callback
		});
		return this.timeouts[this.timeouts.length - 1].id;
	}

	updateTimeouts() {
		for (var i = this.timeouts.length - 1; i >= 0; i--) {
			if (this.lastTimestamp >= this.timeouts[i].time) {
				this.timeouts[i].callback();
				this.timeouts.splice(i, 1);
			}
		}
	}

	clearTimeout(id) {
		for (var i = this.timeouts.length - 1; i >= 0; i--) {
			if (id == this.timeouts[i].id) this.timeouts.splice(i, 1);
		}
	}

	toggleMute() {
		this.muted = !this.muted;
	}

	ondrop(e) {
		e.preventDefault();

		var file = e.dataTransfer.files[0];
	    var reader = new FileReader();
	    reader.onload = (event) => {
			_.each(this.onDropListeners, (func) => {
				func(event.target.result);
			});
	    };
	    reader.readAsText(file);
	}

	ondragleave(e) {
		window.tlog('default', 'leave');
		_.each(this.onDragLeaveListeners, (func) => {
			func();
		});
		e.preventDefault();
	}

	ondragover(e) {
		e.dataTransfer.dropEffect = 'copy';
		_.each(this.onDragOverListeners, (func) => {
			func();
		});
		e.preventDefault();
	}

	onfocus() {
		if (this.ignoreFocus) return;
		this.lastTimestamp = this.timestamp();
		this.focus = true;
	}

	onblur() {
		if (this.ignoreFocus) return;
		this.focus = false;
	}

	// TODO: Pause, play, etc.
	// Lerps should probably extend these.
	addGlobalFunction(func) {
		this.globalFunctions.push(func);
	}

	addEntity(entity) {
		this.entities.push(entity);
		return entity;
	}

	getMid() {
		return new Vector(this.width * 0.5, this.height * 0.5);
	}

	_onresize() {
		this.resizeCanvases();
		_.each(this.resizeListeners, (func) => {
			func();
		});
	}

	addResizeListener(func) {
		this.resizeListeners.push(func);
	}

	loadJSON(key, src) {
		var xhr = new XMLHttpRequest();
		xhr.open('GET', this.assetRoot + src, true);
		xhr.responseType = 'json';
		xhr.onload = () => {
			var status = xhr.status;
			if (status === 200) {
				this.jsonLoading--;
				this.json[key] = xhr.response;
			}
		};
		xhr.send();
		this.jsonLoading++;
	}

	loadImage(key, src) {
		// window.tlog('default', 'loading src ' + src + ' into key ' + key);
		const img = new Image();
		img.joseki = {loaded: false, key};
		img.img = img;
		this.images[key] = img;
		this.imagesLoading++;
		this.totalImageCount++;
		this.notLoaded.push(key);
		img.onload = () => {
			this.images[key].joseki.loaded = true;
			this.notLoaded = _.without(this.notLoaded, key);
			// window.tlog('default', this.notLoaded);
			this.imagesLoading--;
		}
		// Start the load.
		img.src = this.assetRoot + src;
		return img;
	}

	loadSpriteSheet(key, src, keys) {
		const img = this.loadImage(key, src);
		_.each(keys, (k) => {
			this.images[key + '_' + k.key] = Object.assign(
				{},
				k,
				{
					spriteSheet: key,
					img: img,
					joseki: {
						loaded: true,
						key: key + '_' + k.key
					}
				}
			);

			// window.tlog('default', key + '_' + k.key);
			// window.tlog('default', this.images[key + '_' + k.key]);
		});
	}

	getWidthCacheKey(key, tint, width, height) {
		return key + '_' + (tint !== undefined ? tint : 'none') + '_' + width + '_' + height;
	}

	storeWidthCache(key, tint, width, height, img) {
		// if (!this.widthCacheBuffer) {
		// 	this.widthCacheBuffer = document.createElement('canvas');
		// 	this.widthCacheBufferContext = this.widthCacheBuffer.getContext('2d');

		// 	var div = document.getElementById(this.parentID);
		// 	this.widthCacheBuffer.style.zIndex = 1;
		// 	this.widthCacheBuffer.style.position = 'absolute';
		// 	div.appendChild(this.widthCacheBuffer);

		// 	this.widthCacheBuffer.width = width;
		// 	this.widthCacheBuffer.height = height;
		// } else {
		// 	if (this.widthCacheBuffer.height < height) {
		// 		this.widthCacheBuffer.height = height;
		// 	}

		// 	this.widthCacheBuffer.width = this.widthCacheBuffer.width + width;

		// 	window.tlog('default', width, height, this.widthCacheBuffer.width, this.widthCacheBuffer.height);
		// }

		// this.widthCacheBufferContext.drawImage(
		// 	img,
		// 	img.x,
		// 	img.y,
		// 	img.width,
		// 	img.height,
		// 	this.widthCacheBuffer.width - width,
		// 	0,
		// 	width,
		// 	height
		// );

		// this.widthCache[this.getWidthCacheKey(key, tint, width, height)] = {
		// 	x: this.widthCacheBuffer.width - width,
		// 	y: 0,
		// 	width,
		// 	height
		// };

		// return this.widthCache[this.getWidthCacheKey(key, tint, width, height)];

		const buffer = document.createElement('canvas');
		buffer.width = width;
		buffer.height = height;

		const ctx = buffer.getContext('2d');
		try {
			ctx.drawImage(img.img ? img.img : img , img.x, img.y, img.width, img.height, 0, 0, width, height);
		} catch (e) {
			window.tlog('default', key, tint, width, height, img);
			console.error(e);
		}

        this.widthCache[this.getWidthCacheKey(key, tint, width, height)] = buffer;
        this.cacheCount = this.cacheCount ? (this.cacheCount + 1) : 1;

        return buffer;
	}

	getWidthCache(key, tint, width, height) {
		return this.widthCache[this.getWidthCacheKey(key, tint, width, height)];
	}

	getImage(key) {
		return this.images[key];
	}

	// Audio
	loadAudio(key, urls) {
		this.audioLoading = true;
		this.audioLoadingCount++;
		this.totalAudioCount = (this.totalAudioCount + 1) || 1;

		if (typeof(urls) === "string") {
			urls = [urls];
		}

		urls = _.map(urls, (url) => {
			return this.assetRoot + url;
		});

		var sound = new Howl({
		  	src: urls,
		  	onloaderror: function(err) {
				this.audioCache[key] = null;
				console.warn("Couldn't put sound with url " + urls[0] + " and key " + key);
				this.audioLoadingCount--;
			}.bind(this),
			onload: function() {
				this.audioLoadingCount--;
			}.bind(this)
		});

		if (this.audioCache[key] != null) {
			console.warn("Already cached a sound with key " + key);
		} else {
			this.audioCache[key] = sound;
		}
	}

	createAudio(key, options) {
		if (this.audioCache[key] == null) {
			console.warn("No cached sounds with key " + key);
			return null;
		} else {
			return new Howl(Object.assign(options, {src: [this.audioCache[key]._src]}));
		}
	}

	hasLoadedAudio() {
		return this.audioLoadingCount == 0 && this.audioLoading;
	}

	playAudio(key, volume=1, callback) {
		if (this.audioCache[key] == null) {
			console.warn("Can't find a sound with key " + key);
		} else {
			this.audioCache[key].volume(volume * this.volume * (this.muted ? 0 : 1));
			this.audioCache[key].play();
			if (callback) {
				this.audioCache[key].on('end', callback);
				window.tlog('default', 'AUDIO CACHE', this.audioCache);
			}
		}
	}

	getAudio(key) {
		return this.audioCache[key];
	}

	addAudioCallback(key, callback) {
		this.getAudio(key)._onend.push(callback);
	}

	getAudioTime(key) {
		if (this.audioCache[key] == null) {
			console.warn("Can't find a sound with key " + key);
		} else {
			return this.audioCache[key];
		}
	}

	start(key) {
		this.state.switchState(key);
		this.paused = false;
		this.lastTimestamp = 0;
		this.loop(16);
	}

	timestamp() {
		return performance.now();
	}

	clearEntities() {
		_.each(this.entities, (e) => {
			e.destroy();
		})
	}

	loop(time) {
		this.setCursorStyle(this.defaultCursorStyle);

		var lastFrameTimeElapsed = time - this.lastTimestamp;

		// this.debug(Math.round(1000 / lastFrameTimeElapsed) + ' fps');

		this.elapsedTime = lastFrameTimeElapsed;
		this.delta = lastFrameTimeElapsed / this.idealFrameTime;
		if (this.delta < 0) this.delta = 0;
		this.deltaNoTimescale = lastFrameTimeElapsed / this.idealFrameTime;
		this.focusTimeScale = Maths.lerp(this.focusTimeScale, (this.focus ? 1 : 0), 1);
		this.delta *= this.timescale * this.focusTimeScale;
		this.delta *= 0.5;
		this.lastTimestamp = time;
		this.updateTimeouts();
		this.update();
		this.clearInput();
		this.render();
		window.requestAnimationFrame(this.loop.bind(this));
	}

	getCanvas(key) {
		var canvas = _.findWhere(this.canvases, {key});
		if (typeof(canvas) !== 'undefined') {
			return canvas;
		} else {
			console.warn('No canvas with key ' + key);
			return null;
		}
	}

	update() {
		// this.debug(this.cacheCount);
		this.state.update();
		_.each(this.entities, (e) => {
			e._update();
		});
		_.each(this.topEntities, (e) => {e._update();});
		_.each(this.globalFunctions, (gf) => {
			gf();
		});
		if (this.justDestroyed) {
			this.entities = _.filter(this.entities, (e) => {
				return e.alive
			});
			this.justDestroyed = false;
		}

		this.mouseinput.just_down = false;
		this.mouseinput.just_up = false;
	}

	clearInput() {
		this.mouseclicked = false;
		_.each(this.trackingKeys, (key) => {
			this.keys[key].pressed = false;
		});
	}

	setBackgroundColor(color) {
		this.backgroundColor = color;
		_.each(this.canvases, (c) => {
			c.backgroundColor = this.backgroundColor;
		});
	}

	clearAllCanvases() {
		_.each(this.canvases, (canvas) => {
			if (canvas.shouldClear) {
				canvas.clear();
			}
		});
	}

	render() {
		this.clearAllCanvases();
		this.state.render();
		_.each(this.entities, (e) => {
			e._render();
		});
		_.each(this.topEntities, (e) => {
			e._render();
		});
		this.state.postRender();

		this.renderDebug();

		_.each(this.entities, (e) => {
			e._postRender();
		});
		_.each(this.canvases, (canvas) => {
			canvas.clearBorders();
		});
		_.each(this.canvases, (canvas) => {
			canvas.fade();
		});
		_.each(this.canvases, (canvas) => {
			if (this.renderGameBox) {
				canvas.renderBox();
			}
		});
	}

	createCanvas(key) {
		var canvas = new Canvas(this, this.parentID, this.canvasIndex, key, this.gamePadding, this.width, this.height);
		canvas.backgroundColor = this.backgroundColor;
		this.canvasIndex++;
		this.canvases.push(canvas);
		return canvas;
	}

	resizeCanvases() {
		_.each(this.canvases, function(c) {
			c.resize();
		});
		this.render();
	}

	// Keyboard input
	trackKey(key) {
		this.trackingKeys.push(key);
		this.keys[key] = new Key();
	}

	trackKeyFromString(str) {
		this.trackKeys(str.split(','));
	}

	trackKeys(keys) {
		_.each(keys, this.trackKey.bind(this));
	}

	addKeyEventListener(callback) {
		const listener = {
			id: uid(),
			callback
		}
		this.keyListeners.push(listener);
		return listener.id;
	}

	revokeKeyListener(id) {
		this.keyListeners = _.filter(this.keyListeners, (listener) => {
			return listener.id != id;
		});
	}

	keyIsTracked(key) {
		return _.contains(this.trackingKeys, key);
	}

	onkeydown(event) {
		// window.tlog('default', 'down', event);
		_.each(this.keyListeners, (k) => {
			k.callback({event, type: 'down'});
		});

		if([32, 37, 38, 39, 40].indexOf(event.keyCode) > -1) {
	        event.preventDefault();
	    }
		
		const key = event.key;
		if (this.keyIsTracked(key)) {
			if (!this.keys[key].down) {
				this.keys[key].pressed = true;
			}
			this.keys[key].down = true;
		}
	}

	onkeyup(event) {
		// window.tlog('default', 'up', event);
		_.each(this.keyListeners, (k) => {
			k.callback({event, type: 'up'});
		});

		const key = event.key;
		if (this.keyIsTracked(key)) {
			this.keys[key].down = false;
		}
	}

	getKeyDown(key) {
		if (this.keyIsTracked(key)) {
			return this.keys[key].down;
		}
	}

	getKeyPressed(key) {
		return this.keys[key].pressed;
	}

	// Mouse input
	onmousemove(event) {
		var rect = this.parent.getBoundingClientRect();
		if (event.touches) {
			this.mousePos = this.getCanvas('game').screenToWorld(
				event.touches[0].clientX - rect.left,
				event.touches[0].clientY - rect.top
			);
		} else {
			this.mousePos = this.getCanvas('game').screenToWorld(
				event.clientX - rect.left,
				event.clientY - rect.top
			);
		}
		this.mouseEvent('move', event);
	}
	onmouseclick(event) {
		this.mouseclicked = true;
		this.mouseEvent('click', event);
	}
	onmousedown(event) {
		this.mousedown = true;
		this.mouseEvent('down', event);

		this.mouseinput = {
			down: false,
			just_down: false,
			up: false,
			just_up: false,
			waiting_for_up: false,
		};

		if (!this.mouseinput.waiting_for_up) {
			if (!this.mouseinput.down) this.mouseinput.just_down = true;
			this.mouseinput.down = true;
			this.mouseinput.up = false;
			this.mouseinput.just_up = false;
		}
	}
	onmouseup() {
		this.mousedown = false;
		this.mouseEvent('up', event);

		if (!this.mouseinput.up) this.mouseinput.just_up = true;
		this.mouseinput.up = true;
		this.mouseinput.down = false;
		this.mouseinput.just_down = false;

		if (this.mouseinput.waiting_for_up) this.mouseinput.waiting_for_up = false;
	}

	addMouseEventListener(type, callback) {
		if (!this.mouseEventListeners[type]) {
			this.mouseEventListeners[type] = [callback];
		} else {
			this.mouseEventListeners[type].push(callback);
		}
	}
	mouseEvent(type, event) {
		if (this.mouseEventListeners[type]) {
			_.each(this.mouseEventListeners[type], (callback) => {
				callback();
			});
		}
	}

	setCursorStyle(style) {
		this.currentMouseStyle = style;
		_.each(this.canvases, (c) => {
			c.canvas.style.cursor = style;
		});
	}

	// Debug
	initDebug(canvas) {
		this.debugging = true;
		this.debugCanvas = this.getCanvas(canvas);
		this.debugQueue = [];
		this.debugY = 0;
	}

	debug(text, pos, color, size) {
		if (!pos) {
			this.debugQueue.push({text, pos: new Vector(this.width * 0.5, this.debugY), color, size});
			this.debugY += 32;
		} else if (pos.position) {
			this.debugQueue.push({text, pos: pos.position, color, size});
		} else {
			this.debugQueue.push({text, pos, color, size});
		}
	}

	renderDebug() {
		_.each(this.debugQueue, (debug) => {
			this.debugCanvas.fillText(debug.pos, debug.text, debug.color, debug.size, 'Noto Sans JP');
		});

		this.debugQueue = [];
		this.debugY = 0;
	}
}

export default Game;