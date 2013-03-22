# requiring packages
ConfigurationController = require('../lib/controllers/configuration-controller').ConfigurationController;

module.exports = (app) =>
        app.get '/configuration/oldestversion', (request, response) =>
                new ConfigurationController().setOldestVersion request, response