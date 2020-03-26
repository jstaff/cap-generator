const { exec } = require('promisify-child-process');
const https = require('https');
const opsys = process.platform;
const loading = require('loading-cli');

let load = null;

let versionCommand = '';
let installJQCommand = '';
let jwtCommand = `curl -s 'https://www.googleapis.com/service_accounts/v1/metadata/x509/securetoken@system.gserviceaccount.com' | jq '[ to_entries | .[] | {alg: "RS256", kty: "RSA", use: "sig", kid: .key, x5c: [(.value | sub(".*"; "") | sub("\n"; ""; "g") | sub("-.*"; "")) ] } ] | {"keys": .}'`;

const createJWTFirebase = async () => {
  try {
    load = loading('Creating a JSON to Firebase auth...'.blue).start();
    let jwt = await exec(jwtCommand);
    let jsonJWT = JSON.stringify(JSON.parse(jwt.stdout));
    load.stop();
    load.succeed('The JSON was successful generated.');
    return jsonJWT;
  } catch (error) {
    load.stop();
    load.fail('Error trying to generate the JSON.');
    console.log('error: ', error);
  }
};

const installJq = async command => {
  try {
    load = loading('Installing jq...'.blue).start();
    let installationStatus = await exec(command);
    if (installationStatus.stdout.includes('Already downloaded')) {
      load.stop();
      load.succeed('Installation finished');
      createJWTFirebase();
    }
  } catch (error) {
    load.stop();
    load.fail('Error trying to install jq.');
    console.log('error: ', error);
  }
};

const verifyJqVersion = async (versionCommand, installatioCommand) => {
  try {
    if (versionCommand === '') {
      console.log('its a windows machine');
      installJq(installatioCommand);
    } else {
      let version = await exec(versionCommand);
      if (version.stdout !== '') {
        return createJWTFirebase();
      }
    }
  } catch (error) {
    let errorStatus = {
      code: error.code,
      message: error.stderr
    };
    installJq(installatioCommand);
    return errorStatus;
  }
};

if (opsys === 'darwin' || opsys === 'linux') {
  versionCommand = 'jq --version';
  installJQCommand = 'brew install jq';
  verifyJqVersion(versionCommand, installJQCommand);
} else {
  console.log('Windows');
  installJQCommand = 'npm i node-jq -g';
  versionCommand = '';
  verifyJqVersion(versionCommand, installJQCommand);
}
