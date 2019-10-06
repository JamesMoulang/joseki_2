import GridDweller from './GridDweller';

class Sun extends GridDweller {
	constructor(main, canvas, position) {
		super(main, canvas, position);
		this.energy = 6;
		this.selectable = false;
		this.size = 64;
		this.aoe = 192;
	}

	update() {
		if (this.game.mousePos.distance(this.position) < this.aoe) {
			this.showingAOE = true;
			this.aoeAlpha = 0.25 + 0.75 * (1 - this.game.mousePos.distance(this.position) / this.aoe);
		} else {
			this.showingAOE = false;
		}
	}

	render() {
		super.render();
		this.canvas.sprite(
			this.position,
			'dot',
			{
				width: this.size,
				height: this.size,
				tintCache: true,
				tint: this.game.highlightColor,
				alpha: 1,
			}
		);
		
		if (this.showingAOE) {
			this.canvas.circle(this.position, this.aoe, {
				strokeColor: this.game.highlightColor,
				strokeAlpha: 1 * this.aoeAlpha,
				fillAlpha: 0.2 * this.aoeAlpha,
				fillColor: this.game.highlightColor,
			});
		}
	}
}

export default Sun;