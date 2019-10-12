import GridDweller from './GridDweller';
import Vector from '../joseki/Vector';
import Maths from '../joseki/Maths';
import Mote from './Mote';
import GreenMote from './GreenMote';
import RedMote from './RedMote';
import BlueMote from './BlueMote';
import BrownMote from './BrownMote';
import _ from '../joseki/underscore';

class Star extends GridDweller {
	constructor(main, canvas, position, catalyst1, catalyst2) {
		super(main, canvas, position);
		this.shrinkRadius = 16;
		this.shrinkSpeed = 0;
		this.shrinkSpeedAcceleration = 0.01;
		this.afterShrinkWaitTimer = 30;
		this.catalyst1 = catalyst1;
		this.catalyst2 = catalyst2;
		this.tint = Maths.lerpColor(
			this.catalyst1 ? this.catalyst1.tint : this.game.brown,
			this.catalyst2 ? this.catalyst2.tint : this.game.brown,
			0.5
		);

		this.size = this.catalyst1 ? 32 : 16;

		this.advanceFrames = false;
		this.frame = 0;
		this.frameCount = 3;
		this.frameAdvanceTime = 2;
		this.frameAdvanceTimer = 0;
		this.selectable = false;

		this.isStar = true;

		this.colors = [];
		_.loop(5, () => {this.colors.push('green')});
		_.loop(2, () => {this.colors.push('blue')});
		_.loop(1, () => {this.colors.push('red')});
	}

	ingredients(i1, i2) {
		if (
			(this.catalyst1.token == i1 && this.catalyst2.token == i2) ||
			(this.catalyst1.token == i2 && this.catalyst2.token == i1)
		) {
			return true;
		} else {
			return false;
		}
	}

	explosion() {
		if (!this.catalyst1 && !this.catalyst2) {
			const dweller = this.main.addDweller(new Mote(this.main, 'game', this.position));
			dweller.velocity = Vector.Random().times(1);
			this.main.playSound('BloopDelay1', 'sfx', 1, 0.5);
		} else if (this.ingredients('WHITE', 'WHITE')) {
			// Create 4 random motes
			_.loop(4, () => {
				let gm;
				let color = _.pick(this.colors);
				if (color == 'green') {
					gm = new GreenMote(this.main, 'game', this.position);
				} else if (color == 'blue') {
					gm = new BlueMote(this.main, 'game', this.position);
				} else if (color == 'red') {
					gm = new RedMote(this.main, 'game', this.position);
				}

				this.main.addDweller(gm);
			});
			this.main.playSound('Doob5', 'sfx', 1, 0.5);
		} else if (this.ingredients('BLUE', 'BLUE')) {
			// Create a puddle.
			this.cell.water = 6;
			// each square of water is worth 1 energy.
		} else if (this.ingredients('BLUE', 'WHITE')) {
			_.loop(3, () => {
				this.main.addDweller(new BlueMote(this.main, 'game', this.position));
			});
			_.loop(2, () => {
				this.main.addDweller(new BrownMote(this.main, 'game', this.position));
			});
		} else if (this.ingredients('GREEN', 'WHITE')) {
			_.loop(3, () => {
				this.main.addDweller(new GreenMote(this.main, 'game', this.position));
			});
			_.loop(2, () => {
				this.main.addDweller(new BrownMote(this.main, 'game', this.position));
			});
		} else if (this.ingredients('RED', 'WHITE')) {
			_.loop(3, () => {
				this.main.addDweller(new RedMote(this.main, 'game', this.position));
			});
			_.loop(2, () => {
				this.main.addDweller(new BrownMote(this.main, 'game', this.position));
			});
		} else if (this.ingredients('GREEN', 'GREEN')) {
			// Create a plant!
			this.main.createPlant(this.position);
		} else if (this.ingredients('RED', 'RED')) {
			this.main.createSun(this.position);
		} else {
			// Just spit out the original components.
			this.addDwellerFromToken(this.catalyst1.token);
			this.addDwellerFromToken(this.catalyst2.token);
		}
	}

	addDwellerFromToken(token) {
		let dweller;
		switch(token) {
			case 'BROWN':
				dweller = this.main.addDweller(new BrownMote(this.main, 'game', this.position));
				break;
			case 'BLUE':
				dweller = this.main.addDweller(new BlueMote(this.main, 'game', this.position));
				break;
			case 'RED':
				dweller = this.main.addDweller(new RedMote(this.main, 'game', this.position));
				break;
			case 'GREEN':
				dweller = this.main.addDweller(new GreenMote(this.main, 'game', this.position));
				break;
			case 'WHITE':
				dweller = this.main.addDweller(new Mote(this.main, 'game', this.position));
				dweller.velocity = Vector.Random().times(1);
				break;
			default:
				console.error('missing a case for', token);
		}

		if (dweller) {
			dweller.velocity = dweller.velocity.times(0.1);
		}
	}

	update() {
		if (this.advanceFrames) {
			this.frameAdvanceTimer += this.game.delta;
			if (this.frameAdvanceTimer >= this.frameAdvanceTime) {
				this.frame++;
				if (this.frame == 1) {
					this.explosion();
				}

				if (this.frame > this.frameCount - 1) {
					this.frame = this.frameCount - 1;
				}
			}
		} else {
			this.shrinkSpeed += this.shrinkSpeedAcceleration * this.game.delta;
			this.shrinkRadius -= this.shrinkSpeed * this.game.delta;
			if (this.shrinkRadius <= 0) {
				this.shrinkRadius = 0;
				this.afterShrinkWaitTimer -= this.game.delta;
				if (this.afterShrinkWaitTimer <= 0) this.advanceFrames = true;
			}
		}

		super.update();

		// this.game.debug(this.position.debugString());
	}

	render() {
		this.canvas.circle(
			this.position,
			this.shrinkRadius,
			{
				strokeColor: this.tint,
				fillColor: this.tint,
				fillAlpha: 0.4,
				strokeAlpha: 1,
			}
		);

		if (!this.advanceFrames) return;

		switch(this.frame) {
			case 0:
				// outer circle
				this.canvas.circle(
					this.position,
					this.size / 1.33,
					{
						strokeWidth: 4,
						strokeColor: this.tint,
						fillAlpha: 0,
						strokeAlpha: 1,
					}
				);
				// inner circle
				this.canvas.circle(
					this.position,
					this.size * 0.5,
					{
						strokeWidth: 4,
						fillColor: this.tint,
						fillAlpha: 1,
						strokeAlpha: 0,
					}
				);
				break;
			case 1:
				// outer circle
				this.canvas.circle(
					this.position,
					this.size,
					{
						strokeWidth: 2,
						strokeColor: this.tint,
						fillAlpha: 0,
						strokeAlpha: 0.5,
					}
				);
				break;
			default:

		}
	}
}

export default Star;