
// package tree
module.exports = {
	api: {
		class: {
			writable: () => ({
				links: ['api.data.factory'],
				description: 'Produce quads using nestable concise term string objects',
			}),
		},
		data: {
			factory: () => ({
				description: 'Create instances of Terms and Triples/Quads. Implements @RDFJS DataFactory',
			}),
			set: () => ({
				links: ['api.iso.stream', 'api.data.factory'],
				description: 'Create a mathematical set of triples for comparison and operations such as union, intersection, difference, etc.',
			}),
		},
		iso: {
			stream: () => ({
				description: 'Provides isomorphic stream interface for node.js / browser and adds `.until`, a promisified version of the `.on` event listener',
			}),
		},
		ui: {
			viz: () => ({
				description: 'Create graphviz visualizations of triples and quads',
			}),
		},
	},
};
