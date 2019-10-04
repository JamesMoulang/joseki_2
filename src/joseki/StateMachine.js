import _ from 'underscore';

class StateMachine {
	constructor(states, game) {
		this.currentState = null;
		this.states = states;
		this.game = game;
	}

	update() {
		if (this.currentState != null) {
			this.currentState._update();
		}
	}

	render() {
		if (this.currentState != null) {
			this.currentState._render();
		}
	}

	postRender() {
		if (this.currentState != null) {
			this.currentState._postRender();
		}
	}

	addState(newstate) {
		var matchingKeys = _.filter(this.states, (state) => {
			return state.key == newstate.key;
		});

		if (matchingKeys.length > 0) {
			console.warn("Already have a state with key " +newstate.key);
		} else {
			this.states.push(newstate);
		}
	}

	switchState(key, clear) {
		if (typeof(clear) !== 'undefined' && clear) {
			this.game.clearEntities();
		}

		var nextState = _.findWhere(this.states, {key});
		if (nextState !== undefined) {
			if (this.currentState !== null) {
				this.currentState.exit();
			}

			this.currentState = nextState;
			this.currentState.enter(this.game);
			this.game.mouseinput.waiting_for_up = true;
		} else {
			console.warn("No state with key " + key);
		}
	}
}

export default StateMachine;