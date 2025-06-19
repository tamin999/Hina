module.exports = function (grunt) {
  grunt.initConfig({
    nodemon: {
      dev: {
        script: 'index.js',
        options: {
          watch: ['commands', 'events', 'index.js'],
          delay: 1000,
          env: {
            NODE_ENV: 'development'
          }
        }
      }
    }
  });

  grunt.loadNpmTasks('grunt-nodemon');
  grunt.registerTask('default', ['nodemon']);
};
