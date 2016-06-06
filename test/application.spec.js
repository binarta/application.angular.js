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

        beforeEach(inject(function(_applicationDataService_, $q) {
            service = _applicationDataService_;
            commonApplicationDataDeferred = $q.defer();
            rest.and.returnValue(commonApplicationDataDeferred.promise);
        }));

        describe('isTrial', function() {
            var isTrial;

            beforeEach(function() {
                service.isTrial().then(function(yes) {
                    isTrial = yes;
                });
            });

            it('common data is retrieved', inject(function(config) {
                expect(rest.calls.first().args[0].params).toEqual({
                    method:'GET',
                    url:config.baseUri + 'api/application/' + config.namespace + '/data/common'
                });
            }));

            it('subsequent calls do not perform additional rest calls', function() {
                service.isTrial();
                expect(rest.calls.count()).toEqual(1);
            });

            it('when app is trial', inject(function($rootScope) {
                commonApplicationDataDeferred.resolve({data: {trial:{}}});
                $rootScope.$digest();
                expect(isTrial).toBeTruthy();
            }));

            it('when app is not a trial', inject(function($rootScope) {
                commonApplicationDataDeferred.resolve({data:{}});
                $rootScope.$digest();
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
                expect(rest.calls.first().args[0].params).toEqual({
                    method:'GET',
                    url:config.baseUri + 'api/application/' + config.namespace + '/data/common'
                })
            }));

            it('subsequent calls do not perform additional rest calls', function() {
                service.isTrial();
                expect(rest.calls.count()).toEqual(1);
            });

            it('when app is not a trial', inject(function($rootScope) {
                commonApplicationDataDeferred.resolve({data: {}});
                $rootScope.$digest();
                expect(isExpired).toBeFalsy();
            }));

            it('when app is a trial and not expired', inject(function($rootScope) {
                commonApplicationDataDeferred.resolve({data:{trial:{expired:false}}});
                $rootScope.$digest();
                expect(isExpired).toBeFalsy();
            }));

            it('when app is a trial and expired', inject(function($rootScope) {
                commonApplicationDataDeferred.resolve({data:{trial:{expired:true}}});
                $rootScope.$digest();
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
                expect(rest.calls.first().args[0].params).toEqual({
                    method:'GET',
                    url:config.baseUri + 'api/application/' + config.namespace + '/data/common'
                })
            }));

            it('subsequent calls do not perform additional rest calls', function() {
                service.isTrial();
                expect(rest.calls.count()).toEqual(1);
            });

            it('when app is not a trial', inject(function($rootScope) {
                commonApplicationDataDeferred.resolve({data: {}});
                $rootScope.$digest();
                expect(expirationDate).toBeFalsy();
            }));

            it('when app is a trial', inject(function($rootScope) {
                var now = moment();
                commonApplicationDataDeferred.resolve({data:{trial:{expirationDate:now.toISOString()}}});
                $rootScope.$digest();
                expect(expirationDate.toObject()).toEqual(now.toObject());
            }));
        });
    });
});