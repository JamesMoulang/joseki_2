import GridDweller from './GridDweller';
import Vector from '../joseki/Vector';
import Maths from '../joseki/Maths';
import TrailDust from './TrailDust';
import WrapRipple from './WrapRipple';
import _ from '../joseki/underscore';

class Mote extends GridDweller {
	constructor(main, canvas, position) {
		super(main, canvas, position);
		this.velocity = new Vector(0, 0);

		this.token = 'WHITE';

		this.energy = 12;
		this.size = 4;

		this.brownian = {
			stretch: 16,
			radius: 36,
			force: 0.001,
			max_speed: 0.1,
			angle: 0,
			angle_displace_min: -0.8,
			angle_displace_max: 0.8,
			displace_vector: this.getDisplaceVector(0),
		};

		this.maxConnectionForce = 3;
		this.frictionConst = 0.01;

		this.tint = this.game.textColor;

		this.distanceTravelled = 0;

		this.trailSpawnDistance = 16;
		this.trailEntities = [];
		this.trailBufferLength = 100;
		this.trailEntitiesIndex = -1;

		this.connectionTime = 50;

		this.isMote = true;
	}

	connect(s2) {
		super.connect(s2);
		this.masterConnector = true;
		this.selectable = false;
		s2.selectable = false;
		this.connection = s2;
		s2.connection = this;
		// this.connectTargetPoint = this.position.lerp(s2.position, 0.5);
	}

	getDisplaceVector(rad) {
		return new Vector(
			Math.cos(rad),
			Math.sin(rad)
		).normalised();
	}

	updateTrail() {
		if (this.distanceTravelled >= this.trailSpawnDistance) {
			this.distanceTravelled = 0;
			// get trail entity
			this.trailEntitiesIndex++;
			if (this.trailEntitiesIndex >= this.trailBufferLength) {
				this.trailEntitiesIndex = 0;
			}

			if (this.trailEntities[this.trailEntitiesIndex]) {
				this.trailEntities[this.trailEntitiesIndex].reset(this.position, this.size, this.tint);
			} else {
				this.trailEntities.push(new TrailDust(this.main, this.position, this.size, this.tint));
			}
		}
	}

	update() {
		if (this.showTrail) {
			this.updateTrail();
		}

		// brownian motion
		// circle pos
		this.brownian.angle += Maths.randomRange(
			this.brownian.angle_displace_min,
			this.brownian.angle_displace_max
		);
		if (this.brownian.angle < 0) this.brownian.angle += 2 * Math.PI;
		if (this.brownian.angle > 2 * Math.PI) this.brownian.angle -= 2 * Math.PI;

		this.circle_pos = this.position.add(this.velocity.normalised().times(this.brownian.stretch));
		this.circle_edge = this.circle_pos.add(this.getDisplaceVector(this.brownian.angle).times(this.brownian.radius));
		// towards vector
		this.towards = this.circle_edge.minus(this.position).normalised();

		if (this.towards) this.velocity = this.velocity.add(this.towards.times(this.brownian.force * this.game.delta));
		// if (this.velocity.magnitude() > this.brownian.max_speed) {
		// 	this.velocity = this.velocity.normalised().times(this.brownian.max_speed);
		// }

		if (this.connection) {
			const to_connection = this.connection.position.minus(this.position);
			const to_connection_dist = to_connection.magnitude();
			const to_connection_direction = to_connection.normalised();
			let force = Maths.clamp(this.maxConnectionForce / to_connection_dist, 0, 0.05);
			
			let force_vector = to_connection_direction.times(force);
			let perp = new Vector(-force_vector.y, force_vector.x).times(0.1);
			force_vector = force_vector.add(perp);

			this.velocity = this.velocity.add(force_vector.times(this.game.delta));
		}
		this.applyFriction();
		this.distanceTravelled += this.velocity.magnitude() * this.game.delta;
		if (!this.frozen) this.position = this.position.add(this.velocity.times(this.game.delta));

		if (this.connection && this.masterConnector) {
			if (this.connection.position.distance(this.position) < 16) {
				this.connectionTime -= this.game.delta;
				this.applyFriction();
				this.applyFriction();
				this.applyFriction();
				this.applyFriction();
				if (this.connectionTime < 0) {
					this.main.createStar(this.position.lerp(this.connection.position, 0.5), this, this.connection);
					this.main.removeDweller(this);
					this.main.removeDweller(this.connection);
				}
			}
		}
		
		super.update();

		// Wrap.

		if (this.cell == null) {
			// we just went off the edge!
			if (this.position.x < 0) {
				this.position.x += this.game.width;
				new WrapRipple(this.main, 'game', this.lastCell, 'left');
				const new_cell = this.main.grid.getCellFromWorldPosition(this.position);
				new WrapRipple(this.main, 'game', new_cell, 'right');
			}
			if (this.position.x > this.game.width) {
				this.position.x -= this.game.width;
				new WrapRipple(this.main, 'game', this.lastCell, 'right');
				const new_cell = this.main.grid.getCellFromWorldPosition(this.position);
				new WrapRipple(this.main, 'game', new_cell, 'left');
			}
			if (this.position.y < 0) {
				this.position.y += this.game.height;
				new WrapRipple(this.main, 'game', this.lastCell, 'down');
				const new_cell = this.main.grid.getCellFromWorldPosition(this.position);
				new WrapRipple(this.main, 'game', new_cell, 'up');
			}
			if (this.position.y > this.game.height) {
				this.position.y -= this.game.height;
				new WrapRipple(this.main, 'game', this.lastCell, 'up');
				const new_cell = this.main.grid.getCellFromWorldPosition(this.position);
				new WrapRipple(this.main, 'game', new_cell, 'down');
			}
		}

		let offsets = [];
		if (this.position.x + this.size > this.game.width) {
			offsets.push(new Vector(-this.game.width, 0));
		}
		if (this.position.x - this.size < 0) {
			offsets.push(new Vector(this.game.width, 0));
		}
		if (this.position.y + this.size > this.game.height) {
			offsets.push(new Vector(0, -this.game.height));
		}
		if (this.position.y - this.size < 0) {
			offsets.push(new Vector(0, this.game.height));
		}

		// this.frozen = offsets.length > 0;

		_.each(offsets, (offset) => {
			const cell = this.main.grid.getCellFromWorldPosition(this.position.add(offset));
			cell.ghosts.push({parent: this, offset});
		});
	}

	applyFriction() {
		this.velocity = this.velocity.towards(new Vector(0, 0), this.velocity.magnitude() * this.frictionConst);
	}

	draw(offset) {
		this.canvas.sprite(
			this.position.add(offset),
			'dot_white',
			{
				width: this.size,
				height: this.size,
				tint: this.tint,
				tintCache: true,
				alpha: this.alpha,
			}
		);

		if (this.highlighted || this.selected) {
			this.canvas.circle(this.position.add(offset), 16, {
				fillAlpha: 0.2,
				strokeAlpha: 1,
				fillColor: this.megaHighlighted ? this.game.altHighlightColor : this.tint,
				strokeColor: this.megaHighlighted ? this.game.altHighlightColor : this.tint,
			});
		}
	}

	render() {
		super.render();

		if (!this.debug) return;

		if (this.circle_pos) {
			this.canvas.circle(this.circle_pos, this.brownian.radius, {fillAlpha: 0, strokeAlpha: 1, strokeColor: '#ff0000'});
			this.canvas.drawLine(this.position.x, this.position.y, this.circle_pos.x, this.circle_pos.y, '#ff0000', 1, 2);
			this.canvas.drawLine(this.position.x, this.position.y, this.circle_edge.x, this.circle_edge.y, '#ff00ff', 1, 2);
		}
	}
}

export default Mote;