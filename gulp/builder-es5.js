const es = require('event-stream');
const Builder = require('Builder');
const builder = new Builder();

// runs Builder.js' preprocessor on macros
const f_builder = (s_prepend) => {
	return (h_file, t) => {
		h_file.contents = new Buffer(
			builder.machine.execute(s_prepend+'\n'+h_file.contents.toString())
				.replace(/\/\*+\s*whitespace\s*\*+\/\s*/g, '')
		);
	};
};

// 
module.exports = function(gulp, $, p_src, p_dest) {

	// load source files
	let ds_built = gulp.src(p_src+'/**/*.js')

		// handle uncaught exceptions thrown by any of the plugins that follow
		.pipe($.plumber())

		// do not recompile unchanged files
		.pipe($.cached(this.task));


	// make stream parser es5
	let ds_stream_parser = ds_built

		// clone unprocessed parser src
		.pipe($.clone())

		// set macro variables and then apply Builder.js
		.pipe($.tap(f_builder(`@set STREAM true\n@set NETWORK false`)))

		// beautify
		.pipe($.beautify({indent_with_tabs: true}))

		// preserve mappings to beautified source file for debugging
		.pipe($.sourcemaps.init())

			// transpile
			.pipe($.babel())

			// uglify
			.pipe($.uglify())
		.pipe($.sourcemaps.write())

		// rename
		.pipe($.rename(h => {
			h.basename = 'stream-'+h.basename;
		}));


	// // make static parser es5
	// let ds_static_parser = ds_built

	// 	// clone unprocessed parser src
	// 	.pipe($.clone())

	// 	// set macro variables and then apply Builder.js
	// 	.pipe($.tap(f_builder(`@set STREAM false\n@set NETWORK true`)))

	// 	// rename
	// 	.pipe($.rename(h => {
	// 		h.basename = 'static-'+h.basename;
	// 	}));


	// output both parsers
	return es.merge(ds_stream_parser)
		.pipe(gulp.dest(p_dest));

};
