import Entity from '../joseki/Entity';
import Maths from '../joseki/Maths';
import _ from '../joseki/underscore';

import Palettes from '../data/Palettes';

class PaletteSwapper extends Entity {
	constructor(game) {
		super(game, 'game');

		this.gameCanvas = this.game.getCanvas('game');
		this.paletteIndex = 0;
		this.palette = Palettes[this.paletteIndex];

		this.lerpSpeed = 0.0076;

		this.lerpT = 1;

		this.game.textColor =
			this.game.textColorTarget =
			this.palette.text;
		this.game.backColor = 
			this.gameCanvas.backgroundColor =
			this.game.backColorTarget =
			this.palette.back;
		this.game.highlightColor = this.palette.wrong;
		this.game.altHighlightColor = this.palette.right;
		this.game.textColorStatic = true;

		this.paletteTarget = Palettes[this.paletteIndex];

		this.backgroundFlashFactor = 0;
		this.backgroundFlashWrongFactor = 0;
	}

	changePalette(i, instant=false) {
		if (this.this.paletteIndex != i && i < Palettes.length) {
			this.this.paletteIndex = i;
			this.game.save.save();

			this.paletteTarget = Palettes[this.this.paletteIndex];
			this.lerpT = 0;
			this.game.textColorStatic = false;

			this.game.textColorTarget = this.paletteTarget.text;
			this.game.backColorTarget = this.paletteTarget.back;

			if (instant) {
				this.game.textColor = this.game.textColorTarget;
				this.game.backColor = this.game.backColorTarget;
				this.palette = this.paletteTarget;
				this.game.highlightColor = this.palette.wrong;
				this.game.altHighlightColor = this.palette.right;
				this.lerpT = 1;
				this.game.textColorStatic = true;
				this.game.backColor =
					this.gameCanvas.backgroundColor =
					this.palette.back;
			}
		}
	}

	invert() {
		this.paletteTarget = {
			name: this.paletteTarget.name,
			text: this.paletteTarget.back,
			back: this.paletteTarget.text,
			wrong: this.paletteTarget.wrong,
			right: this.paletteTarget.right,
		};

		this.lerpT = 0;
		this.game.textColorStatic = false;
		this.game.textColorTarget = this.paletteTarget.text;
		this.game.backColorTarget = this.paletteTarget.back;
	}

	flash() {
		this.backgroundFlashFactor = 0.1;
		this.backgroundFlashWrongFactor = 0;
	}

	flashWrong() {
		this.backgroundFlashWrongFactor = 0.15;
		this.backgroundFlashFactor = 0;
	}

	update() {
		this.backgroundFlashFactor = Maths.lerp(this.backgroundFlashFactor, 0, 0.05);
		this.backgroundFlashWrongFactor = Maths.lerp(this.backgroundFlashWrongFactor, 0, 0.05);

		if (this.lerpT < 1) {
			this.lerpT += this.game.delta * this.lerpSpeed;
			const t = Math.pow(Math.abs(Math.sin(Math.PI * this.lerpT * 0.5)), 3);

			if (this.lerpT >= 1) {
				// Done!
				this.lerpT = 1;
				this.game.textColorStatic = true;
				this.palette = this.paletteTarget;
				this.game.textColor = this.palette.text;
				this.game.backColor =
					this.gameCanvas.backgroundColor =
					this.palette.back;
				this.game.highlightColor = this.palette.wrong;
				this.game.altHighlightColor = this.palette.right;
			} else {
				this.game.textColor = Maths.lerpColor(this.palette.text, this.paletteTarget.text, t);
				this.game.backColor = 
					this.gameCanvas.backgroundColor =
					Maths.lerpColor(this.palette.back, this.paletteTarget.back, t);
				this.game.highlightColor = Maths.lerpColor(this.palette.wrong, this.paletteTarget.wrong, t);
				this.game.altHighlightColor = Maths.lerpColor(this.palette.wrong, this.paletteTarget.wrong, t);
			}
		}

		if (this.backgroundFlashFactor > 0) {
			this.gameCanvas.backgroundColor = Maths.lerpColor(this.game.backColor, this.game.altHighlightColor, this.backgroundFlashFactor);
		} else {
			this.gameCanvas.backgroundColor = Maths.lerpColor(this.game.backColor, this.game.highlightColor, this.backgroundFlashWrongFactor);
		}

		// this.game.debug(this.lerpT + ', ' + this.game.backgroundColor);
	}
}

export default PaletteSwapper;