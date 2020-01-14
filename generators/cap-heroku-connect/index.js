'use strict';
const Generator = require('yeoman-generator');
const chalk = require('chalk');
const Parser = require('ts-simple-ast').default;
var exec = require('child-process-promise').exec;
const cp = require('child_process');
const heroku = require('./heroku-connect');
const herokuDeploy = require('./heroku-deploy');
const loopback = require('./loopback-build');
const loopbackConfig = require('./loopback-configuration');

module.exports = class extends Generator {
  /**
   * @description Ask the user the configuration information for Heroku Connect
   * @author leninEmmanuel <lenin_emmanuel@softwareallies.com>
   * @returns
   */

  prompting() {
    this.log(`=========================================\n
    Now lets configure the ${chalk.blue('HEROKU CONNECT MODULE')}
    \n==========================================`);
    const prompts = [
      {
        type: 'list',
        name: 'sync',
        message: 'Choose a data synchronizer model',
        choices: [
          {
            name: `HerokuConnect`,
            value: 'HerokuConnect'
          },
          {
            name: `CustomSync`,
            value: 'CustomSync'
          }
        ]
      },
      {
        type: 'input',
        name: 'path',
        message: "What's the name of your API?",
        default: this.options.name + '-api',
        when: ctx => ctx.sync === 'HerokuConnect'
      },
      {
        type: 'input',
        name: 'deploy',
        message: `Do you want to deploy on Heroku? [y/n]`,
        default: 'n',
        when: ctx => ctx.sync === 'HerokuConnect'
      }
    ];
    return this.prompt(prompts).then(props => {
      this.props = props;
    });
  }

  /**
   * @description Once we get the information update the module to include the configuration.
   * @author leninEmmanuel <lenin_emmanuel@sofwareallies.com>
   * @returns
   */
  writing () {

    function yesNoValidation (value) {
      return value.toLowerCase() === 'yes' || value.toLowerCase() === 'y' ? true : false;
    }

    switch (this.props.sync) {
      case 'CustomSync':
        console.log('We are working on it');
      break;

      case 'HerokuConnect':
        exec('lb --version', async (error, stdout) => {

          if (error) {
            console.log('error: you dont have loopback installed, wait a moment we will proceed to install loopback');
            await loopback.loopbackCLI(this.props.path, true);
          } else {
            await loopback.loopbackCLI(this.props.path, false);
          }

          let urlDataBase = await heroku.herokuCLI(this.props.path, this.templatePath('cap-heroku-connect-api/mapping'));

          this.fs.copyTpl(
            this.templatePath('cap-heroku-connect-api/models/**'),
            this.destinationPath(`${this.props.path}`),
            {}
          );
          this.fs.copyTpl(
            this.templatePath('cap-heroku-connect-api/auth/**'),
            this.destinationPath(`${this.props.path}/server/`),
            {
              domain: this.options.AuthDomain
            }
          );
          this.fs.copyTpl(
            this.templatePath('cap-heroku-connect-web/**'),
            this.destinationPath(`${this.options.name}/src/app/modules/`),
            {
              deployed: yesNoValidation(this.props.deploy),
              apiName: this.props.path
            }
          );

          await loopbackConfig.loopbackConfiguration(this.props.path, this.destinationPath(`${this.props.path}`), urlDataBase.postgresURL);

          await herokuDeploy.herokuCLI(this.props.path);

        }).catch(function (err) {
          console.error('ERROR: ', err);
        });
      break;
    }
  }
};
