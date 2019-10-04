class State {
	constructor(key) {
		this.key = key;
		this.game = null;
	}

	enter(game) {
		this.game = game;
		window.tlog('default', "entering state " + this.key);
	}

	_update() {
		if (this.game != null) {
			this.update();
		}
	}
	update() {
		
	}

	exit() {

	}

	_render() {
		if (this.game != null) {
			this.render();
		}
	}

	render() {

	}

	_postRender() {
		if (this.game != null) {
			this.postRender();
		}
	}

	postRender() {
		
	}
}

export default State;