const bat = require('bat');
const bkit = require('bkit');

module.exports = class bitsequence_plain {
	constructor(g_config) {
		Object.assign(this, g_config);
	}

	close() {
		// payload components
		let {
			raw: atu8_bs,
		} = this;

		// payload size estimate
		let nb_payload = atu8_bs.byteLength;

		// create payload
		let kbe_payload = new bkit.buffer_encoder({size:nb_payload});

		// write to payload: bitsequence
		kbe_payload.buffer.append(atu8_bs);

		// serialize payload
		let at_payload = kbe_payload.close();


		// create section header
		let kbe_header = new bkit.buffer_encoder({size:512});

		// encoding scheme
		kbe_header.ntu8_string(bat.PE_DATASET_QUADS_TRIPLES_BITMAP_BITSEQUENCE_PLAIN);

		// payload byte count
		kbe_header.vuint(at_payload.byteLength);

		// serialize header
		let at_header = kbe_header.close();


		// estimate bundle size
		let nb_bundle = at_header.byteLength + at_payload.byteLength;

		// create bundle
		let kbe_bundle = new bkit.buffer_writer({size:nb_bundle});

		// write to bundle: header
		kbe_bundle.append(at_header);

		// write to bundle: payload
		kbe_bundle.append(at_payload);

		// serialize bundle
		return kbe_bundle.close();
	}
};
