/*jshint strict:false */
'use strict';

var yeoman = require('yeoman-generator');
var yosay = require('yosay');
var github = require('./libs/github.js');
var gitAuto = require('./libs/repo-automation.js');
var async = require('async');
var colors = require('colors');
var path = require("path");
var self = this;


function automateRepo(self) {
		console.log('Trying to initialize your repository'.green);

		gitAuto.setWorkingDirectory(self.destination);
		gitAuto.setUrl(self.context.git_repo);
		gitAuto.setCredentials(self.context.password);

		try {
			async.series(
				[
					function (callback) {
						var createAuthor = gitAuto.createAuthor(self.context.username, self.context.email);
						callback(null, createAuthor);
						console.log('Created your Github Author'.green);
					},
					function (callback) {
						var initializeReposity = gitAuto.initializeReposity()
						callback(null, initializeReposity);
						console.log('Successfully initialized your respository'.green);
					}
				],
				function (err, result) {
					if (err) {
						console.log('An error occurred' + err);
						return;
					}
				});
		} catch (error) {
			console.log(error);
			console.log('Unable to initialize your respository'.red);
		}
}

module.exports = yeoman.Base.extend({

	constructor: function () {
		yeoman.Base.apply(this, arguments);

		this.option('skip-install', {
			desc: 'Whether dependencies should be installed',
			type: Boolean,
			defaults: false
		});
	},

	askFor: function () {
		var done = this.async();

		this.log(yosay('Let\'s create an awesome project!'));


    //this.log('In order to authenticate with Gihub, you need to provide your credentials'.green);

		var prompt = [
				{
					type		: 'list',
					name		: 'action',
					message : 'What do you want to do today?',
					choices : [
							'Starting a new project',
							'Starting a new project With Github',
							'Just create a Github repository'
						]
				},
				{
					type    : 'input',
					name    : 'username',
					message : 'What\'s your Github username?',
					when		: function(answers) {
										return answers.action !== 'Starting a new project';
					}
				},
				{
					type    : 'input',
					name    : 'email',
					message : 'What is your email on Github?',
					when		: function(answers) {
										return answers.action !== 'Starting a new project';
					}
				},
				{
					type    : 'password',
					name    : 'password',
					message : 'What\'s your Github password?',
					when		: function(answers) {
										return answers.action !== 'Starting a new project';
					}
				},
				{
					type    : 'input',
					name    : 'appName',
					message : 'Your project name',
					default :  process.cwd().split(path.sep).pop(), // Default to current folder name,
					when    : function(answers) {
										return answers.action !== 'Just create a Github repository'
					}
				},
			 	{
					type    : 'list',
					name    : 'appType',
					message : 'Select a type of app you will build today',
					choices : [
						'AngularJS',
						'ReactJS',
						'NodeJS'
					],
					when    : function(answers) {
										return answers.action !== 'Just create a Github repository'
					}
				},
				{
					type    : 'input',
					name    : 'description',
					message : 'What are you building?',
				}
			];

			this.prompt(prompt, function (response) {
				var defaultAppName = process.cwd().split(path.sep).pop() //Using current directory for app name;
				this.action = response.action;
        this.username = response.username;
        this.password = response.password;
				this.appName = response.appName || defaultAppName;
				this.appType = response.appType;
				this.gitRepo = 'https://github.com/' + response.username + '/' + this.appName + '.git';
				this.description = response.description;
				this.email = response.email;
				done();
			}.bind(this));
	},

	writing: {

		app: function () {

			if (this.action === 'Just create a Github repository') {
					self.destination = this.destinationRoot();
			} else {
					self.destination = this.destinationRoot(this.appName);
			}

			console.log(self.destination);

			self.context = {
				action: this.action,
				app_type: this.appType,
				app_name: this.appName,
				git_repo: this.gitRepo,
				description: this.description,
        username: this.username,
        password: this.password,
				email: this.email
			};

			if (self.context.action !== 'Starting a new project') {
				async.series(
					[
						function (callback) {
							var authenticate = github.authenticateUser('basic', self.context);
							callback(null, authenticate);
							console.log('Successfully authenticated with Github'.green);
						},
						function (callback) {
							var createRepository = github.createRepo(self.context);
							callback(null, createRepository);
							console.log('Repository created'.green);
						}
					],
					function (err, result) {
						if (err) {
							console.log('An error occurred' + err);
							return;
						}
					});
			}

			this.template('_README.md', this.destinationPath('README.md'), self.context);

			if (this.action  !== 'Just create a Github repository') {
				this.template('_package.json', this.destinationPath('package.json'), self.context);
				this.template('_bower.json', this.destinationPath('bower.json'), self.context);
				this.template('_src/index.html', this.destinationPath('src/index.html'), self.context);
			}

			this.directory(this.appName, './');
		},

		projectfiles: function () {
			this.fs.copy(
				this.templatePath('gitignore'),
				this.destinationPath('.gitignore')
			);

			if (this.appType === 'AngularJS' && this.action !== 'Just create a Github repository' ) {
				this.template('_src/js/app.js', this.destinationPath('src/js/app.js'), self.context);
			} else if (this.appType === 'ReactJS' && this.action !== 'Just create a Github repository' ) {
				this.fs.copy(
					this.templatePath('_src/js/app_jsx.js'),
					this.destinationPath('src/js/app.js')
				);
			}

			if (this.action  !== 'Just create a Github repository') {
				this.fs.copy(
					this.templatePath('_src/styles/main.css'),
					this.destinationPath('src/styles/main.css')
				);
			}
		}
	},

	install: function () {
		this.config.save();

		if (this.action !== 'Just create a Github repository') {
			this.installDependencies({
				bower: true,
				npm: false,
				skipInstall: this.options['skip-install'],
				callback: function () {
					console.log('Dependencies have been installed!'.green);
					if (self.context.action !== 'Starting a new project') {
							automateRepo(self);
					}
				}
			});
		} else {
			automateRepo(self);
		}
	}
});
