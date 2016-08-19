var Nodegit = require('nodegit');
var path = require('path');
var promisify = require('promisify-node');
var fse = promisify(require('fs-extra'));
var Promise = require('promise');
fse.ensureDir = promisify(fse.ensureDir);

var repository, oid, remote, index, author, committer;
var directory, url, username, email, password, options;


/* Sets working directory */
var setWorkingDirectory = function (name) {
  if (!name) {
    throw new Error('Please specify directory name' + name);
  }
  directory = name;
};

/* Create Author and Commiter */
var createAuthor = function (setUsername, setEmail) {
  return new Promise(function (fulfill, reject) {
    username = setUsername;
    email = setEmail;
    author = Nodegit.Signature.now(username, email);
    committer = Nodegit.Signature.now(username, email);
    if (!author || !committer) {
      reject(author);
    } else {
      fulfill('Author created ' + author);
    }
  });
};

var setUrl = function (setUrl) {
  if (!setUrl) {
    throw new Error('Please specify a url');
  }
  url = setUrl;
};

var setCredentials = function(setPassword) {
  if (!setPassword) {
    throw new Error('Please specify a password');
  }
  password = setPassword;
};


var initializeReposity = function () {
  return new Promise(function (fulfill, reject) {
    Nodegit.Repository.init(path.resolve(__dirname, directory), 0)
    .then(function(repo) {
      repository = repo;
      return repository.openIndex();
    })
    // Create commit
    .then(function(indexResult) {
      index = indexResult;
      return index.read(1);
    })
    .then(function(cb) {
      return index.addAll();
    })
    .then(function() {
      return index.write();
    })
    .then(function(cb) {
      return index.writeTree();
    })
    .then(function(oidResult) {
      oid = oidResult;
      return repository.createCommit('HEAD', author, committer, 'First commit', oid, []);
    })
    // Added new remote
    .then(function (commitId) {
      remote =  Nodegit.Remote.create(repository, 'origin', url);
    })
    .then(function() {
        return repository.getRemote("origin");
    })
    // Push
    .then(function(remoteResult) {
      remote = remoteResult;
      return remote.push(
              ["refs/heads/master:refs/heads/master"],
              {
                callbacks: {
                  credentials: function() {
                    return Nodegit.Cred.userpassPlaintextNew(username, password);
                  },
                  certificateCheck: function() {
                    return 1;
                  }
                }
              },
              repository.defaultSignature(),
              "Push to master");
    })
    .then(function() {
      fulfill('remote Pushed!');
    })
    .catch(function(err) {
      console.log(err);
      reject(err);
    });
  });
};

exports.createAuthor = createAuthor;
exports.setWorkingDirectory = setWorkingDirectory;
exports.setUrl = setUrl;
exports.setCredentials = setCredentials;
exports.initializeReposity = initializeReposity;
