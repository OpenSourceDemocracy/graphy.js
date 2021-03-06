/*eslint indent:0*/
const assert = require('assert');
const deq = assert.deepEqual;

const graphy = require('../../dist/main/graphy.js');
const parse_trig = graphy.trig.parse;



const P_IRI_RDF = 'http://www.w3.org/1999/02/22-rdf-syntax-ns#';
const P_IRI_RDF_FIRST = P_IRI_RDF+'first';
const P_IRI_RDF_REST = P_IRI_RDF+'rest';
const P_IRI_RDF_NIL = P_IRI_RDF+'nil';

const P_IRI_XSD = 'http://www.w3.org/2001/XMLSchema#';
const P_IRI_XSD_BOOLEAN = P_IRI_XSD+'boolean';
const P_IRI_XSD_INTEGER = P_IRI_XSD+'integer';
const P_IRI_XSD_DECIMAL = P_IRI_XSD+'decimal';
const P_IRI_XSD_DOUBLE = P_IRI_XSD+'double';


const R_WANTS_PREFIX = /^\s*[(:_\[]/;
const S_AUTO_PREFIX = '@prefix : <#>.\n';


const as_quad = function(a_this) {
	let s_subject = a_this[0];
	let s_predicate = a_this[1];
	let z_object = a_this[2];
	let s_graph = a_this[3];
	return {
		subject: {
			value: ' ' === s_subject[0]
				? s_subject.substr(1)
				: s_subject,
		},
		predicate: {
			value: '->' === s_predicate
				? P_IRI_RDF_FIRST
				: ('>>' === s_predicate
					? P_IRI_RDF_REST
					: s_predicate),
		},
		object: 'string' === typeof z_object
			? (' ' === z_object[0]
				? {value: z_object.substr(1)}
				: ('.' === z_object
					? {value: P_IRI_RDF_NIL}
					: {value: z_object}))
			: ('number' === typeof z_object
				? {value: z_object+''}
				: z_object),
		graph: s_graph
			?{
				value: ' ' === s_graph[0]
					? s_graph.substr(1)
					: s_graph,
			}
			: {},
	};
};

const allow = function(s_test, s_trig, a_pattern) {
	let a_quads = [];
	it(s_test, () => {
		if(R_WANTS_PREFIX.test(s_trig)) {
			s_trig = S_AUTO_PREFIX + s_trig;
		}
		parse_trig(s_trig, {
			data: a_quads.push.bind(a_quads),
			error(e_parse) {
				assert.ifError(e_parse);
			},
			end() {
				deq(a_quads, a_pattern.map(as_quad));
			},
		});
	});
};


const err = (s_test, s_trig, s_err_char, s_err_state) => {
	it(s_test, () => {
		if(R_WANTS_PREFIX.test(s_trig)) {
			s_trig = S_AUTO_PREFIX + s_trig;
		}
		parse_trig(s_trig, {
			data() {},
			error(e_parse) {
				assert.notStrictEqual(e_parse, undefined);
				let s_match = 'failed to parse a valid token starting at '+(s_err_char? '"'+s_err_char+'"': '<EOF>');
				assert.notStrictEqual(-1, e_parse.indexOf(s_match));
				if(s_err_state) {
					assert.strictEqual(/expected (\w+)/.exec(e_parse)[1], s_err_state);
				}
			},
			end() {},
		});
	});
};

const survive = (s_test, s_trig, a_pattern) => {
	let a_quads = [];
	if(R_WANTS_PREFIX.test(s_trig)) {
		s_trig = S_AUTO_PREFIX + s_trig;
	}
	let a_trig = s_trig.split('');
	it(s_test, (f_done) => {
		(new require('stream').Readable({
			read() {
				this.push(a_trig.shift() || null);
			},
		})).pipe(parse_trig({
			error(e_parse) {
				throw e_parse;
			},
			data(h_quad) {
				a_quads.push(h_quad);
			},
			end() {
				deq(a_quads, a_pattern.map(as_quad));
				f_done();
			},
		}));
	});
};


describe('trig parser:', () => {

	describe('empty:', () => {

		allow('blank', '', []);

		allow('whitespace', ' \t \n', []);

	});


	describe('iris & prefixed names w/o graph:', () => {

		const abc = [['z://a', 'z://b', 'z://c']];

		allow('iris', '<z://a> <z://b> <z://c> .', abc);

		allow('iris w/ base', '@base <z://>. <a> <b> <c> .', abc);

		allow('iris w/ unicode escapes', '<\\u2713> <like> <\\U0001F5F8> .', [
			['\u2713', 'like', '\ud83d\uddf8', ''],
		]);

		allow('prefixed names w/ empty prefix id', '@prefix : <z://>. :a :b :c .', abc);

		allow('prefixed names w/ non-empty prefix id', '@prefix p: <z://>. p:a p:b p:c .', abc);

		allow('prefixed names w/ empty suffix', '@prefix pa: <z://a>. @prefix pb: <z://b>. @prefix pc: <z://c>. pa: pb: pc: .', abc);
	});


	describe('iris & prefixed names w/ default graph:', () => {

		const abc = [['z://a', 'z://b', 'z://c']];

		allow('iris', '{ <z://a> <z://b> <z://c> . }', abc);

		allow('iris w/ base', '@base <z://>. { <a> <b> <c> . }', abc);

		allow('iris w/ unicode escapes', '{ <\\u2713> <like> <\\U0001F5F8> . }', [
			['\u2713', 'like', '\ud83d\uddf8', ''],
		]);

		allow('prefixed names w/ empty prefix id', '@prefix : <z://>. { :a :b :c . }', abc);

		allow('prefixed names w/ non-empty prefix id', '@prefix p: <z://>. { p:a p:b p:c . }', abc);

		allow('prefixed names w/ empty suffix', '@prefix pa: <z://a>. @prefix pb: <z://b>. @prefix pc: <z://c>. { pa: pb: pc: . }', abc);
	});


	describe('iris & prefixed names w/ named graph:', () => {

		const abcd = [['z://a', 'z://b', 'z://c', 'z://d']];

		allow('iris', '<z://d> { <z://a> <z://b> <z://c> . }', abcd);

		allow('iris w/ base', '@base <z://>. <z://d> { <a> <b> <c> . }', abcd);

		allow('iris w/ unicode escapes', '<z://d> { <\\u2713> <like> <\\U0001F5F8> . }', [
			['\u2713', 'like', '\ud83d\uddf8', 'z://d'],
		]);

		allow('prefixed names w/ empty prefix id', '@prefix : <z://>. <z://d> { :a :b :c . }', abcd);

		allow('prefixed names w/ non-empty prefix id', '@prefix p: <z://>. <z://d> { p:a p:b p:c . }', abcd);

		allow('prefixed names w/ empty suffix', '@prefix pa: <z://a>. @prefix pb: <z://b>. @prefix pc: <z://c>. <z://d> { pa: pb: pc: . }', abcd);
	});


	describe('graphs:', () => {

		allow('multiple iri named', '@prefix : <#>. <#g1> { :a :b :c .} <#g2> { :d :e :f . }',
			[
				['#a', '#b', '#c', '#g1'],
				['#d', '#e', '#f', '#g2'],
			]);

		allow('multiple prefixed named', ':g1 { :a :b :c. } :g2 { :d :e :f. }',
			[
				['#a', '#b', '#c', '#g1'],
				['#d', '#e', '#f', '#g2'],
			]);

		allow('multiple labeled blank', '_:g1 { :a :b :c. } _:g2 { :d :e :f. }',
			[
				['#a', '#b', '#c', ' g1'],
				['#d', '#e', '#f', ' g2'],
			]);

		allow('multiple anonymous blank', '[] { :a :b :c. } [] { :d :e :f. }',
			[
				['#a', '#b', '#c', ' g0'],
				['#d', '#e', '#f', ' g1'],
			]);

		allow('mixed', '[] { :a :b :c .} _:g1 { :d :e :f. } :g2 { :g :h :i. } <#g3> { :k :l :m. }',
			[
				['#a', '#b', '#c', ' g0'],
				['#d', '#e', '#f', ' g1'],
				['#g', '#h', '#i', '#g2'],
				['#k', '#l', '#m', '#g3'],
			]);


		allow('mixed w/ multiple statements & nesting', `
			[] {
				:a :b :c, :d;
					:e "f"^^:g ;
					:h [
						:i _:j ;
						:k (:l "m" [:n :o])
					] .
			}
			_:g10 {
				:a :b :c, :d;
					:e "f"^^:g ;
					:h [
						:i _:j ;
						:k (:l "m" [:n :o])
					] .
			}
			:g20 {
				:a :b :c, :d;
					:e "f"^^:g ;
					:h [
						:i _:j ;
						:k (:l "m" [:n :o])
					] .
			}
			<#g30> {
				:a :b :c, :d;
					:e "f"^^:g ;
					:h [
						:i _:j ;
						:k (:l "m" [:n :o])
					] .
			}`, [
				['#a', '#b', '#c', ' g0'],
				['#a', '#b', '#d', ' g0'],
				['#a', '#e', {value: 'f', datatype: '#g'}, ' g0'],
				['#a', '#h', ' g1', ' g0'],
					[' g1', '#i', ' j', ' g0'],
					[' g1', '#k', ' g2', ' g0'],
						[' g2', '->', '#l', ' g0'],
						[' g2', '>>', ' g3', ' g0'],
						[' g3', '->', {value: 'm'}, ' g0'],
						[' g3', '>>', ' g4', ' g0'],
						[' g4', '->', ' g5', ' g0'],
						[' g5', '#n', '#o', ' g0'],
						[' g4', '>>', '.', ' g0'],
				['#a', '#b', '#c', ' g10'],
				['#a', '#b', '#d', ' g10'],
				['#a', '#e', {value: 'f', datatype: '#g'}, ' g10'],
				['#a', '#h', ' g6', ' g10'],
					[' g6', '#i', ' j', ' g10'],
					[' g6', '#k', ' g7', ' g10'],
						[' g7', '->', '#l', ' g10'],
						[' g7', '>>', ' g8', ' g10'],
						[' g8', '->', {value: 'm'}, ' g10'],
						[' g8', '>>', ' g9', ' g10'],
						[' g9', '->', ' g11', ' g10'],
						[' g11', '#n', '#o', ' g10'],
						[' g9', '>>', '.', ' g10'],
				['#a', '#b', '#c', '#g20'],
				['#a', '#b', '#d', '#g20'],
				['#a', '#e', {value: 'f', datatype: '#g'}, '#g20'],
				['#a', '#h', ' g12', '#g20'],
					[' g12', '#i', ' j', '#g20'],
					[' g12', '#k', ' g13', '#g20'],
						[' g13', '->', '#l', '#g20'],
						[' g13', '>>', ' g14', '#g20'],
						[' g14', '->', {value: 'm'}, '#g20'],
						[' g14', '>>', ' g15', '#g20'],
						[' g15', '->', ' g16', '#g20'],
						[' g16', '#n', '#o', '#g20'],
						[' g15', '>>', '.', '#g20'],
				['#a', '#b', '#c', '#g30'],
				['#a', '#b', '#d', '#g30'],
				['#a', '#e', {value: 'f', datatype: '#g'}, '#g30'],
				['#a', '#h', ' g17', '#g30'],
					[' g17', '#i', ' j', '#g30'],
					[' g17', '#k', ' g18', '#g30'],
						[' g18', '->', '#l', '#g30'],
						[' g18', '>>', ' g19', '#g30'],
						[' g19', '->', {value: 'm'}, '#g30'],
						[' g19', '>>', ' g20', '#g30'],
						[' g20', '->', ' g21', '#g30'],
						[' g21', '#n', '#o', '#g30'],
						[' g20', '>>', '.', '#g30'],
			]);
	});
});



