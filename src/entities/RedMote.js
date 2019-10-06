import GreenMote from './GreenMote';
import Vector from '../joseki/Vector';

class RedMote extends GreenMote {
	constructor(main, canvas, position) {
		super(main, canvas, position);
		this.token = 'RED';
		this.tint = this.game.highlightColor;
		this.velocity = Vector.Random().times(4);

		this.brownian.force = 0.025;
		this.brownian.stretch = 0;
		this.brownian.angle_displace_min = -1.6;
		this.brownian.angle_displace_max = 1.6;
	}

	render() {
		super.render();
	}
}

export default RedMote;