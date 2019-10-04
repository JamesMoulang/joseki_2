import Joseki from '../joseki';
import _ from 'underscore';

import Maths from '../joseki/Maths';
import Vector from '../joseki/Vector';
import Tweens from '../joseki/Tweens';
import Group from '../joseki/Entities/Group';
import HintHighlighter from '../entities/HintHighlighter';
import LoadingBar from '../entities/LoadingBar';
import PaletteSwapper from '../entities/PaletteSwapper';
import AudioManager from '../entities/AudioManager';

class Preload extends Joseki.State {
	constructor() {
		super('preload');
	}

	enter(game) {
		super.enter(game);

		this.game.createCanvas('game');
		const debug_canvas = this.game.createCanvas('debug_graphs');
		debug_canvas.transparent = true;

		this.game.hintCanvas = this.game.createCanvas('hint');
		this.game.hintCanvas.transparent = true;

		this.game.hintManager = new HintHighlighter(this.game, 'hint');
		this.game.addEntity(this.game.hintManager);

		this.loadingBars = [];
		this.loadingBars.push(new LoadingBar(
			this,
			'game',
			64,
			8,
			new Vector(this.game.width * 0.1, this.game.height * 0.5 - (64 + 32)),
			this.game.width * 0.8,
			() => {
				return 1 - (this.game.imagesLoading / this.game.totalImageCount)
			}
		));

		this.loadingBars.push(new LoadingBar(
			this,
			'game',
			64,
			8,
			new Vector(this.game.width * 0.1, this.game.height * 0.5 + (64 + 32)),
			this.game.width * 0.8,
			() => {
				return 1 - (this.game.audioLoadingCount / this.game.totalAudioCount)
			}
		));

		this.gameCanvas = this.game.getCanvas('game');

		this.game.paletteSwapper = new PaletteSwapper(this.game);
		this.game.addEntity(this.game.paletteSwapper);

		this.game.loadImage('cross', 'cross.png');
		this.game.loadImage('dot', 'dot.png');
		this.game.loadImage('dot_white', 'dot_white.png');
		this.game.loadImage('enter', 'enter.png');
		this.game.loadImage('heart_empty', 'heart_empty.png');
		this.game.loadImage('heart_full', 'heart_full.png');
		this.game.loadImage('heart_half', 'heart_half.png');
		this.game.loadImage('plus', 'plus.png');
		this.game.loadImage('pointer', 'pointer.png');
		this.game.loadImage('save_back', 'save_back.png');
		this.game.loadImage('save_front', 'save_front.png');
		this.game.loadImage('stripes', 'stripes.png');
		this.game.loadImage('tick', 'tick.png');
		this.game.loadImage('volume_off', 'volume_off.png');
		this.game.loadImage('volume_on', 'volume_on.png');

		this.game.loadAudio('click', 'audio/click.wav');

		// Load English
		this.game.validLetters = "!;';null;];[;a;b;c;d;e;f;g;h;i;j;k;l;m;n;o;p;q;r;s;t;u;v;w;x;y;z;,;.;/;%; ".split(';');
		this.game.letterSwaps = {
			'.': 'dot',
			'/': 'slash',
			'%': 'percent',
		};
		const dontLoad = [' '];

		_.each(_.difference(this.game.validLetters, dontLoad), (_l) => {
			const l = this.game.letterSwaps[_l] ? this.game.letterSwaps[_l] : _l;
			this.game.loadImage('letter_' + l, 'letters/' + l + '.png');
		});

		// Load numbers
		_.each('0,1,2,3,4,5,6,7,8,9,colon'.split(','), (n) => {	
			this.game.loadImage('letter_'+n, 'numbers/' + n + '.png');
		});

		this.game.initDebug('debug_graphs');
	}


	update() {
		super.update();

		if (this.game.jsonLoading === 0 && this.loadingBars[0].value === 1 && this.loadingBars[1].value === 1) {
			this.game.state.switchState('menu');
		}
	}

	exit() {
		this.game.audioManager = new AudioManager(this.game);
		this.game.addEntity(this.game.audioManager);

		_.each(this.loadingBars, (bar) => {
			bar.destroy();
		});

		// Create groups.
		this.game.groups = {};

		this.game.groups.backBackground = new Group(this.game, 'game');
		this.game.addEntity(this.game.groups.backBackground);

		this.game.groups.background = new Group(this.game, 'game');
		this.game.addEntity(this.game.groups.background);

		this.game.groups.foreground = new Group(this.game, 'game');
		this.game.addEntity(this.game.groups.foreground);

		this.game.groups.front = new Group(this.game, 'game');
		this.game.addEntity(this.game.groups.front);
	}

	render() {
		
	}
}

export default Preload;