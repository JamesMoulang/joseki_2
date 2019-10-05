import GridDweller from './GridDweller';
import Vector from '../joseki/Vector';

class Mote extends GridDweller {
	constructor(main, canvas, position) {
		super(main, canvas, position);
		this.velocity = new Vector(0, 0);

		this.brownian = {
			stretch: 128,
			radius: 64,
			force: 0.0001,
			max_speed: 0.1,
		};
	}

	update() {
		// brownian motion
		// circle pos
		this.circle_pos = this.position.add(this.velocity.normalised().times(this.brownian.stretch));
		this.circle_edge = this.circle_pos.add(Vector.Random().times(this.brownian.radius));
		// towards vector
		this.towards = this.circle_edge.minus(this.position).normalised();
		this.velocity = this.velocity.add(this.towards.times(this.brownian.force * this.game.delta));
		if (this.velocity.magnitude() > this.brownian.max_speed) {
			this.velocity = this.velocity.normalised().times(this.brownian.max_speed);
		}
		this.position = this.position.add(this.velocity.times(this.game.delta));
		super.update();
		
	}



	render() {
		this.canvas.sprite(
			this.position,
			'dot_white',
			{
				width: 4,
				height: 4,
				tint: this.game.textColor
			}
		);
	}
}

export default Mote;