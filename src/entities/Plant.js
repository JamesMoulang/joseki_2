import GridDweller from './GridDweller';
import Vector from '../joseki/Vector';
import Maths from '../joseki/Maths';
import WaterDroplet from './WaterDroplet';
import BrownMote from './BrownMote';
import _ from '../joseki/underscore';

class Plant extends GridDweller {
	constructor(main, canvas, position) {
		super(main, canvas, position);
		this.energy = 6;
		this.waterCount = 0;
		this.roots = [];
		this.roots.push(new Vector(this.position.x, this.position.y));
		this.size = 1;
		this.bump = 1;
		this.selectable = false;
		this.aoe = 128;
		this.health = 1;
		this.totalWaterConsumed = 0;

		this.dying = false;
		this.alpha = 1;

		this.tint = Maths.colorLerp(this.game.green, this.game.backColor, 0.33);

		this.tickSubscribe(5, this.updateWater.bind(this));
	}

	update() {
		super.update();
		this.bump = Maths.lerp(this.bump, 1, 0.25);

		if (this.game.mousePos.distance(this.position) < this.aoe) {
			this.showingAOE = true;
			this.aoeAlpha = 0.25 + 0.75 * (1 - this.game.mousePos.distance(this.position) / this.aoe);
		} else {
			this.showingAOE = false;
		}

		if (this.dying) {
			this.alpha -= this.game.delta * 0.01;
			if (this.alpha <= 0) {
				this.alpha = 0;
				this.die();
			}
		}

		// How much water do I need?
		// How much water do I have access to?

		// If need > access, I need to grow my roots.
	}

	getWaterNeed() {
		return this.size;
	}

	getWaterUpperBound() {
		return this.size * 2;
	}

	updateWater() {
		if (this.dying) return;

		this.bump = 1.5;

		let need = this.getWaterNeed();
		let total_found = 0;
		let upper_bound = this.getWaterUpperBound();

		this.main.grid.forEachFromWorldPosition(this.position, this.aoe, (cell) => {
			if (cell.position.distance(this.position) < this.aoe && cell.water && total_found < upper_bound) {
				total_found++;
				need--;
				cell.water--;

				this.totalWaterConsumed++;
				
				const droplet = new WaterDroplet(this.main, 'game', cell.position.add(new Vector(cell.size * 0.5, cell.size * 0.5)), this);
				this.game.groups.foreground.push(droplet);
			}
		});

		if (need > 0) {
			// Lose health.
			this.health--;
		} else if (need < 0) {
			this.size -= need;
		}

		if (this.health <= 0) {
			// DIE
			this.dying = true;
		}
	}

	tick() {
		if (!this.dying) this.bump = 1.25;
		super.tick();
	}

	die() {
		const total_brown = Math.floor((this.energy + this.totalWaterConsumed) / 3);
		const remainder = (this.energy + this.totalWaterConsumed) - total_brown * 3;
		this.cell.water += remainder;

		console.log("DEAD", this.energy, total_brown);

		_.loop(total_brown, () => {
			const dweller = this.main.addDweller(new BrownMote(this.main, 'game', this.position));
		});

		this.main.removeDweller(this);
	}

	getRadius() {
		return (32 + this.size * 16) * this.bump;
	}

	render() {
		this.canvas.sprite(
			this.position,
			'dot',
			{
				width: this.getRadius(),
				height: this.getRadius(),
				tintCache: true,
				tint: Maths.colorLerp(this.tint, this.game.brown, 1-this.alpha),
			}
		);

		if (this.showingAOE) {
			this.canvas.circle(this.position, this.aoe, {
				strokeColor: this.tint,
				strokeAlpha: 1 * this.aoeAlpha * this.alpha,
				fillAlpha: 0.2 * this.aoeAlpha * this.alpha,
				fillColor: this.tint,
			});
		}
	}
}

export default Plant;