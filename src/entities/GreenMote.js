import Mote from './Mote';
import Vector from '../joseki/Vector';

class GreenMote extends Mote {
	constructor(main, canvas, position) {
		super(main, canvas, position);
		this.token = 'GREEN';

		this.tint = this.game.green;
		this.energy = 3;
		this.velocity = Vector.Random().times(2);
		this.size *= 2;
		this.showTrail = true;
	}

	render() {
		super.render();
	}
}

export default GreenMote;