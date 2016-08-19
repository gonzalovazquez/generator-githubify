/*jshint strict:false */
'use strict';

var GitHubApi = require('github');
var Promise = require('promise');
var colors = require('colors');

/* Initialize Github */
var github = new GitHubApi({
		// required
		version: "3.0.0",
		// optional
		debug: true,
		protocol: "https",
		host: "api.github.com", // should be api.github.com for GitHub
		timeout: 5000,
		headers: {
				"user-agent": "generator-rna" // GitHub is happy with a unique user agent
		}
});

/* Authentication of user */
var authenticateUser = function(type, credentials) {
	return new Promise(function (fulfill, reject) {
		github.authenticate({
		    type: type,
		    username: credentials.username,
		    password: credentials.password
		}, function(err, result) {
				if (err) {
					console.log('Wrong credentials'.red);
					reject(err);
				} else {
					console.log('Successfully authenticated with Github'.green);
					fulfill(result);
				}
		});
	});
};

/* Creates repository and returns a promise */
var createRepo = function(appMeta){
	return new Promise(function (fulfill, reject){
		github.repos.create({
		'name': appMeta.app_name,
		'description': appMeta.description
	}, function(err, result) {
			if (err) {
				console.log('Failed to create repository'.red);
				reject(err);
			} else {
				console.log('Successfully created repository on Github account'.green);
				fulfill(result);
			}
		});
	});
};

exports.authenticateUser = authenticateUser;
exports.createRepo = createRepo;
