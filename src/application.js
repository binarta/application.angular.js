(function() {'use strict';
    angular.module('application', ['binarta-applicationjs-angular1'])
        .service('applicationDataService', ['$q', '$log', 'binarta', 'binartaApplicationIsInitialised', ApplicationDataService]);

    function ApplicationDataService($q, $log, binarta, binartaApplicationIsInitialised) {
        var d = $q.defer();
        this.commonApplicationData = d.promise;
        binartaApplicationIsInitialised.then(function() {
            d.resolve(binarta.application.profile());
        });

        this.$log = $log;
    }

    ApplicationDataService.prototype.then = function(listener) {
        this.$log.warn('@deprecated ApplicationDataService.then() - use binarta.application.profile() instead!');
        return this.commonApplicationData.then(listener);
    };

    ApplicationDataService.prototype.isTrial = function() {
        this.$log.warn('@deprecated ApplicationDataService.isTrial() - use binarta.application.profile() instead!');
        return this.commonApplicationData.then(function(data) {
            return data.trial !== undefined;
        });
    };

    ApplicationDataService.prototype.isExpired = function() {
        this.$log.warn('@deprecated ApplicationDataService.isExpired() - use binarta.application.profile() instead!');
        return this.commonApplicationData.then(function(data) {
            return data.trial && data.trial.expired;
        });
    };

    ApplicationDataService.prototype.getExpirationDate = function() {
        this.$log.warn('@deprecated ApplicationDataService.getExpirationDate() - use binarta.application.profile() instead!');
        return this.commonApplicationData.then(function(data) {
            return data.trial && moment(data.trial.expirationDate);
        });
    }
})();