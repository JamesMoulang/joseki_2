import Entity from '../joseki/Entity';
import Maths from '../joseki/Maths';
import _ from '../joseki/underscore';

import AudioObject from './AudioObject';
import AudioLayer from './AudioLayer';

// I play audio
	// Music
		// This isn't actually any different to a regular sound effect.
	// Sound effects
		// Key inputs
		// Everything else

class AudioManager extends Entity {
	constructor(game) {
		super(game, 'game');

		this.audioLayers = {
			master: new AudioLayer('master', 1, false),
			music: new AudioLayer('music', 1, false),
			sfx: new AudioLayer('sfx', 1, false),
		};

		// Add all the music tracks. We'll only need one at a time.
		// This is a special case because we only need one of these.
		// this.music_menu = this.addAudio('music_menu', 'music', {loop: true});
	}

	updateAudioLayers(key, options) {
		if (this.audioLayers[key]) {
			if (options.hasOwnProperty('volume')) this.audioLayers[key].volume = options.volume;
			if (options.hasOwnProperty('on')) this.audioLayers[key].on = options.on;
		}
	}

	addAudio(key, layer, options={}) {
		const obj = new AudioObject(this.game, key, options);
		this.audioLayers[layer].addObject(obj);
		return obj;
	}

	update() {
		_.each(this.audioLayers, (val, key) => {
			val.update();
		});
	}

	render() {

	}
}

export default AudioManager;