import GreenMote from './GreenMote';
import Mote from './Mote';
import Vector from '../joseki/Vector';
import _ from '../joseki/underscore';

class BrownMote extends GreenMote {
	constructor(main, canvas, position) {
		super(main, canvas, position);
		this.token = 'BROWN';
		this.tint = this.game.brown;
		this.velocity = Vector.Random().times(1);
		this.brownian.force = 0.0001;
		this.selectable = false;
		this.isBrownMote = true;
		this.aoe = 512;
		this.gravity = 0.0001;
		this.alpha = 0.5;
		this.showTrail = false;
	}

	update() {
		super.update();
		// if (this.game.mousePos.distance(this.position) < this.aoe) {
		// 	this.showingAOE = true;
		// 	this.aoeAlpha = 0.25 + 0.75 * (1 - this.game.mousePos.distance(this.position) / this.aoe);
		// } else {
		// 	this.showingAOE = false;
		// }

		let close_set = [];
		let close_dist = 32;

		// Get nearby brown motes.
		this.main.grid.forEachDwellersFromWorldPosition(this.position, this.aoe, (dweller, dist) => {
			if (dweller.isBrownMote && !dweller.forming && dweller != this && dist < this.aoe) {
				const force = Math.pow(1 - (dist / this.aoe), 2);
				const towards = dweller.position.minus(this.position);
				this.velocity = this.velocity.add(towards.normalised().times(force * this.gravity * this.game.delta));

				if (dist < close_dist && close_set.length < 3) {
					close_set.push(dweller);
				}
			}
		});

		if (close_set.length == 3) {
			// Create a new white dweller.
			this.main.createStar(this.position);

			_.each(close_set, (dweller) => {
				this.main.removeDweller(dweller);
				dweller.forming = true;
			});
			this.forming = true;
			this.main.removeDweller(this);
		}
	}

	render() {
		super.render();
		if (this.showingAOE) {
			this.canvas.circle(this.position, this.aoe, {
				strokeColor: this.tint,
				strokeAlpha: 1 * this.aoeAlpha,
				fillAlpha: 0.01 * this.aoeAlpha,
				fillColor: this.tint,
			});
		}
	}
}

export default BrownMote;