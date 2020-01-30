const { exec, spawn } = require('promisify-child-process');
var request = require('request');

const herokuInstallation = async () => exec('npm install -g heroku');
const herokuVersionSpawn = async () => spawn('heroku --version');
const herokuVersion = async () => exec('heroku --version');
const herokuConnectVerification = async () => exec('heroku plugins');
const herokuConnectInstallation = async () =>
  exec('heroku plugins:install heroku-connect-plugin');

const checkUser = async () => exec('heroku whoami');

const login = async () => {
  const child = exec('heroku login');
  child.stdin.write('\n');
  child.stderr.on('data');
  child.stdin.end();
  return child;
};

const herokuCreateApp = async name => exec(`heroku apps:create ${name}`);
const hrkCreatePostgreSql = async name =>
  exec(`heroku addons:create heroku-postgresql -a ${name}`);

const herokuCredentials = async name =>
  exec(`heroku pg:credentials:url DATABASE_URL -a ${name}`);

const herokuConnectCreation = async name =>
  exec(`heroku addons:create herokuconnect -a ${name}`);

const setUpConnect = async command => exec(`${command}`);

const authConnection = async name =>
  exec(`heroku authorizations:create --description "For use with ${name}"`);

const tokenApplication = async () => exec(`heroku auth:token`);

const curlPost = async data => {
  var options = {
    url: `https://hc-central.heroku.com/auth/${data.name}`,
    headers: {
      ContentType: 'application/json',
      Authorization: `Bearer ${data.token}`
    }
  };

  function callback(error, response, body) {
    if (!error && response.statusCode === 200) {
      if (error) return error;
      var info = JSON.parse(body);
      console.log(info.stargazers_count + ' Stars');
      console.log(info.forks_count + ' Forks');
    }
  }

  return request(options, callback);
};

const schemaConnection = async name =>
  exec(`heroku connect:db:set --schema salesforce --db DATABASE_URL -a ${name}`);

const salesforceAuth = async name => exec(`heroku connect:sf:auth -a ${name}`);

const mapping = async data => {
  exec(`heroku connect:import ${data.path}/heroku-config.json -a ${data.name}`);
};

module.exports = {
  herokuVersionSpawn,
  herokuVersion,
  herokuInstallation,
  herokuConnectVerification,
  herokuConnectInstallation,
  checkUser,
  login,
  herokuCreateApp,
  hrkCreatePostgreSql,
  herokuCredentials,
  herokuConnectCreation,
  setUpConnect,
  authConnection,
  tokenApplication,
  curlPost,
  schemaConnection,
  salesforceAuth,
  mapping
};
