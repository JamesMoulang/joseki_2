import Maths from '../joseki/Maths';
import GridDweller from './GridDweller';
import _ from '../joseki/underscore';
import BrownMote from './BrownMote';

class Sun extends GridDweller {
	constructor(main, canvas, position) {
		super(main, canvas, position);
		this.energy = 6;
		this.selectable = false;
		this.size = 64;
		this.displaySize = 0;
		this.aoe = 192;
		this.health = 1;

		this.lifetime = 500;
	}

	update() {
		if (this.game.mousePos.distance(this.position) < this.aoe) {
			this.showingAOE = true;
			this.aoeAlpha = 0.25 + 0.75 * (1 - this.game.mousePos.distance(this.position) / this.aoe);
		} else {
			this.showingAOE = false;
		}

		this.main.grid.forEachDwellersFromWorldPosition(this.position, this.size, (dweller, dist) => {
			if (!dweller.isStar && dweller != this && dist < this.size * 0.45) {
				// Eat.
				this.main.removeDweller(dweller);
				if (!dweller.energy) {
					console.error('no energy!', dweller);
				}
				this.energy += dweller.energy;
				console.log("adding", dweller.energy, dweller);
				this.size += dweller.energy * 0.5;
				this.lifetime += dweller.energy * 25;
			}
		});

		this.game.debug(this.lifetime);

		this.lifetime -= this.game.delta;
		if (this.lifetime <= 0) {
			this.dying = true;
		}

		if (this.dying) {
			this.health = Maths.lerp(this.health, 0, 0.2, 0.01);
			this.game.debug(this.health);
			if (this.health == 0) {
				console.log("removing " + this.energy);

				const total_brown = Math.floor(this.energy / 3);

				_.loop(total_brown, () => {
					const dweller = this.main.addDweller(new BrownMote(this.main, 'game', this.position));
					dweller.velocity = dweller.velocity.times(1);
				});

				this.main.removeDweller(this);
			}
		}
	}

	render() {
		super.render();
		this.displaySize = Maths.lerp(this.displaySize, this.size, 0.33);
		this.canvas.sprite(
			this.position,
			'dot',
			{
				width: this.displaySize,
				height: this.displaySize,
				tintCache: true,
				tint: Maths.lerpColor(this.game.brown, this.game.highlightColor, this.health),
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