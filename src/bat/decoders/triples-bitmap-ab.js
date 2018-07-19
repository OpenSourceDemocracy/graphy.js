const bkit = require('bkit');
const bat_structure = require('@graphy/content.bat.structure');

module.exports = class triples_bitmap_ab extends bat_structure.dataset.triples {
	constructor(kbd, k_decoders) {
		super();

		// which order
		let s_index = kbd.ntu8_string();

		// pairs bitmap
		let km_a_b = k_decoders.auto(kbd);

		// triples bitmap
		let km_ab_c = k_decoders.auto(kbd);

		// // number of pairs
		// let n_pairs = kbd.vuint();

		// // number of triples
		// let n_triples = kbd.vuint();

		// // pairs adjacency list
		// let at_adj_a_b = kbd.typed_array();

		// // triples adjacency list
		// let at_adj_ab_c = kbd.typed_array();

		// // pairs bitsequence
		// let kbs_a_b = bkit.bitsequence_reader(kbd.grab((n_pairs + 7) >> 3));

		// // triples bitsequence
		// let kbs_ab_c = bkit.bitsequence_reader(kbd.grab((n_triples + 7) >> 3));

		// // redundancy checks
		// if(n_pairs !== at_adj_a_b.length || n_triples !== at_adj_ab_c.length) {
		// 	throw new Error('quad bitmap lengths do not match. fatal read error');
		// }

		Object.assign(this, {
			pair_count: km_a_b.count_keys(),
			triple_count: km_ab_c.count_keys(),

			bm_a_b: km_a_b,
			bm_ab_c: km_ab_c,
		});

		debugger;
	}

	* each_a() {
		for(let i_a=1, nl_a=this.pair_count; i_a<nl_a; i_a++) {
			yield i_a;
		}
	}

	* each_b(i_a) {
		yield* this.bm_a_b.ids_offsets(i_a);
	}

	* each_c(i_a, c_off_b) {
		let i_idx_ab_c_top = this.bm_a_b.rank(i_a-1) + c_off_b;

		yield* this.bm_ab_c.ids(i_idx_ab_c_top+1);
	}

	find_b(i_a, i_b) {

	}
};
