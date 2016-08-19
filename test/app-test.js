'use strict';

var path = require('path');
var rimraf = require('rimraf');
var assert = require('yeoman-assert');
var helpers = require('yeoman-generator').test;
var mockery = require('mockery');

describe('generator-rna:app', function () {

      mockery.enable({
          warnOnReplace: false,
          warnOnUnregistered: false
      });

      mockery.registerMock('github', function () {
        return {
          user: {
            authenticate: function (data, cb) {
              cb(null, JSON.stringify({
                type: 'basic',
                username: 'gonzalovazquez',
                password: 'supersecretpassword'
              }));
            }
          },
          repos: {
            create: function (data, cb) {
              cb(null, JSON.stringify({
                name: 'testAppFromTest',
                description: 'my super app'
              }));
            }
          }
        };
      });

    describe('Starting a new project', function() {
        before(function(done) {
          helpers.run(path.join(__dirname, '../app'))
            .inDir(path.join(__dirname, 'testApp'))
            .withOptions({ skipInstall: true })
            .withPrompts(
              { action: 'Starting a new project' },
              { appName: 'testApp' },
              { appType: 'AngularJS' }
            )
            .withPrompts({ appName: 'testApp' })
            .withPrompts({ appType: 'AngularJS' })
            .on('end', done);
        });

        it('should create proper scaffolding', function () {
            assert.file([
              'bower.json',
              'package.json',
              '.gitignore',
              'src/js/app.js',
              'src/styles/main.css'
            ]);
        });

        it('should not create .git directory', function() {
            assert.noFile('.git')
        });

        after(function() {
          rimraf.sync(__dirname +  '/testApp/');
        });
    });

    describe('Starting a new project With Github using Angular project', function() {

      before(function (done) {

        helpers.run(path.join(__dirname, '../app'))
          .inDir(path.join(__dirname, 'testAppAngular'))
          .withOptions({ skipInstall: true })
          .withPrompts({ action: 'Starting a new project With Github' })
          .withPrompts({ username: 'gonzalovazquez' })
          .withPrompts({ email: 'gonzalovazquez010@gmail.com' })
          .withPrompts({ password: 'supersecretpassword' })
          .withPrompts({ appName: 'testAppAngular' })
          .withPrompts({ appType: 'AngularJS' })
          .on('end', done);
      });

      it('can be required without throwing', function() {
        this.app = require('../app');
      });

      it('should create .git respository', function() {
          assert.file('.git');
      })

      it('should create proper scaffolding', function () {
          assert.file([
            'bower.json',
            'package.json',
            '.gitignore',
            'src/js/app.js',
            'src/styles/main.css'
          ]);
      });

      it('should print out app name in bower and package', function() {
        assert.fileContent('bower.json',  /"name": "testAppAngular"/);
        assert.fileContent('package.json',  /"name": "testAppAngular"/);
      });

      it('should install angular dependency in bower.json', function() {
        assert.fileContent('bower.json', new RegExp('"angular"'));
      });

      it('should include angular dependency in index.html', function() {
        assert.fileContent('src/index.html', new RegExp('<script type="text/javascript" src="/bower_components/angular/angular.js"></script>'));
      });

      after(function() {
        rimraf.sync(__dirname +  '/testAppAngular/');
      });

    });

    describe('Starting a new project With Github using a ReactJS project', function() {

        before(function (done) {

        helpers.run(path.join(__dirname, '../app'))
            .inDir(path.join(__dirname, 'testAppReact'))
            .withOptions({ skipInstall: true })
            .withPrompts({ action: 'Starting a new project With Github' })
            .withPrompts({ username: 'gonzalovazquez' })
            .withPrompts({ email: 'gonzalovazquez010@gmail.com' })
            .withPrompts({ password: 'supersecretpassword' })
            .withPrompts({ appName: 'testAppReact' })
            .withPrompts({ appType: 'ReactJS' })
            .on('end', done);
        });

        it('should create .git respository', function() {
            assert.file('.git');
        })

        it('should print out app name in bower and package', function() {
            assert.fileContent('bower.json',  /"name": "testAppReact"/);
            assert.fileContent('package.json',  /"name": "testAppReact"/);
        });

         it('should install react dependency in bower.json', function() {
           assert.fileContent('bower.json', new RegExp('"react"'));
        });

        it('should include react dependency in index.html', function() {
            assert.fileContent('src/index.html', new RegExp('<script type="text/javascript" src="/bower_components/react/react.js"></script>'));
        });

        after(function() {
          rimraf.sync(__dirname +  '/testAppReact/');
        });

      });

      describe('Just create a Github repository', function() {
          //@TODO: Write test for creating a Github repository
      });

});
