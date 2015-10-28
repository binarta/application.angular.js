(function() {'use strict';
    angular.module('application', [])
        .service('applicationDataService', ['restServiceHandler', 'config', ApplicationDataService]);

    function ApplicationDataService(rest, config) {
        this.rest = rest;
        this.config = config;
    }

    Object.defineProperty(ApplicationDataService.prototype, 'commonApplicationData', {
        get:function() {
            if (this.commonApplicationDataPromise == undefined) {
                this.commonApplicationDataPromise = this.rest({
                    params: {
                        method:'GET',
                        url: this.config.baseUri + 'api/application/' + this.config.namespace + '/data/common'
                    }
                }).then(function(rsp) {return rsp.data;})
            }
            return this.commonApplicationDataPromise;
        }
    });

    ApplicationDataService.prototype.isTrial = function() {
        return this.commonApplicationData.then(function(data) {
            return data.trial !== undefined;
        });
    };

    ApplicationDataService.prototype.isExpired = function() {
        return this.commonApplicationData.then(function(data) {
            return data.trial && data.trial.expired;
        });
    };

    ApplicationDataService.prototype.getExpirationDate = function() {
        return this.commonApplicationData.then(function(data) {
            return data.trial && moment(data.trial.expirationDate);
        });
    }
})();