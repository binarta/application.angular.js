describe('application', function() {
    var rest;

    beforeEach(module('config'));
    beforeEach(module('rest.client'));
    beforeEach(module('application'));

    beforeEach(inject(function(restServiceHandler, config) {
        rest = restServiceHandler;
        config.baseUri = 'base-uri/';
        config.namespace = 'app';
    }));

    describe('applicationDataService', function() {
        var service, commonApplicationDataDeferred;

        beforeEach(inject(function(_applicationDataService_, $q, $rootScope) {
            service = _applicationDataService_;
            commonApplicationDataDeferred = $q.defer();
            var d = commonApplicationDataDeferred.resolve;
            commonApplicationDataDeferred.resolve = function(args) {
                d(args);
                $rootScope.$digest();
            };
            rest.and.returnValue(commonApplicationDataDeferred.promise);
        }));

        describe('then', function() {
            var config;

            beforeEach(function() {
                service.then(function(it) {
                    config = it;
                });
            });

            it('common data is retrieved', inject(function(config) {
                expect(rest.calls.argsFor(0)[0].params).toEqual({
                    method:'GET',
                    url:config.baseUri + 'api/application/' + config.namespace + '/data/common'
                })
            }));

            it('subsequent calls do not perform additional rest calls', function() {
                service.then(function() {});
                expect(rest.calls.count()).toEqual(1);
            });

            it('when app is trial', inject(function($rootScope) {
                commonApplicationDataDeferred.resolve({data: {k:'v'}});
                expect(config).toEqual({k:'v'});
            }));
        });

        describe('isTrial', function() {
            var isTrial;

            beforeEach(function() {
                service.isTrial().then(function(yes) {
                    isTrial = yes;
                });
            });

            it('common data is retrieved', inject(function(config) {
                expect(rest.calls.argsFor(0)[0].params).toEqual({
                    method:'GET',
                    url:config.baseUri + 'api/application/' + config.namespace + '/data/common'
                })
            }));

            it('subsequent calls do not perform additional rest calls', function() {
                service.isTrial();
                expect(rest.calls.count()).toEqual(1);
            });

            it('when app is trial', inject(function($rootScope) {
                commonApplicationDataDeferred.resolve({data: {trial:{}}});
                expect(isTrial).toBeTruthy();
            }));

            it('when app is not a trial', inject(function($rootScope) {
                commonApplicationDataDeferred.resolve({data:{}});
                expect(isTrial).toBeFalsy();
            }));
        });

        describe('isExpired', function() {
            var isExpired;

            beforeEach(function() {
                service.isExpired().then(function(yes) {
                    isExpired = yes;
                })
            });

            it('common data is retrieved', inject(function(config) {
                expect(rest.calls.argsFor(0)[0].params).toEqual({
                    method:'GET',
                    url:config.baseUri + 'api/application/' + config.namespace + '/data/common'
                })
            }));

            it('subsequent calls do not perform additional rest calls', function() {
                service.isTrial();
                expect(rest.calls[1]).toBeUndefined();
            });

            it('when app is not a trial', inject(function($rootScope) {
                commonApplicationDataDeferred.resolve({data: {}});
                expect(isExpired).toBeFalsy();
            }));

            it('when app is a trial and not expired', inject(function($rootScope) {
                commonApplicationDataDeferred.resolve({data:{trial:{expired:false}}});
                expect(isExpired).toBeFalsy();
            }));

            it('when app is a trial and expired', inject(function($rootScope) {
                commonApplicationDataDeferred.resolve({data:{trial:{expired:true}}});
                expect(isExpired).toBeTruthy();
            }));
        });

        describe('getExpirationDate', function() {
            var expirationDate;

            beforeEach(function() {
                service.getExpirationDate().then(function(date) {
                    expirationDate = date;
                });
            });

            it('common data is retrieved', inject(function(config) {
                expect(rest.calls.argsFor(0)[0].params).toEqual({
                    method:'GET',
                    url:config.baseUri + 'api/application/' + config.namespace + '/data/common'
                })
            }));

            it('subsequent calls do not perform additional rest calls', function() {
                service.isTrial();
                expect(rest.calls[1]).toBeUndefined();
            });

            it('when app is not a trial', inject(function($rootScope) {
                commonApplicationDataDeferred.resolve({data: {}});
                expect(expirationDate).toBeFalsy();
            }));

            it('when app is a trial', inject(function($rootScope) {
                var now = moment();
                commonApplicationDataDeferred.resolve({data:{trial:{expirationDate:now.toISOString()}}});
                expect(expirationDate.toObject()).toEqual(now.toObject());
            }));
        });
    });
});