import Joseki from './joseki';
import States from './States';

class Game extends Joseki.Game {
	constructor() {
		super('root', States, 60, 1216, 1344, 16);
		this.ignoreFocus = true;
	}
}

var game = new Game();
game.start('preload');