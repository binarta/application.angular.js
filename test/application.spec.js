angular.module('binarta-applicationjs-gateways-angular1', ['binarta-applicationjs-inmem-angular1'])
    .provider('binartaApplicationGateway', ['inmemBinartaApplicationGatewayProvider', function (it) {
        return it;
    }]);

describe('application', function () {
    var rest, binarta;

    beforeEach(module('application'));

    beforeEach(inject(function (_binarta_) {
        binarta = _binarta_;
    }));

    describe('applicationDataService', function () {
        var service, $rootScope;

        beforeEach(inject(function (_applicationDataService_, _$rootScope_, binartaGatewaysAreInitialised) {
            service = _applicationDataService_;
            $rootScope = _$rootScope_;
            binartaGatewaysAreInitialised.resolve();
            $rootScope.$digest();
        }));

        it('the application profile has been loaded', function () {
            expect(binarta.application.profile()).toBeDefined();
            expect(binarta.application.profile()).not.toEqual({});
        });

        it('then returns a promise which provides the application profile', function () {
            var config;
            service.then(function (it) {
                config = it;
            });
            $rootScope.$digest();
            expect(config).toEqual(binarta.application.profile());
        });

        describe('isTrial', function () {
            var isTrial;

            beforeEach(function () {
                service.isTrial().then(function (yes) {
                    isTrial = yes;
                });
            });

            it('when app is trial', function () {
                binarta.application.profile().trial = true;
                $rootScope.$digest();
                expect(isTrial).toBeTruthy();
            });

            it('when app is not a trial', function () {
                $rootScope.$digest();
                expect(isTrial).toBeFalsy();
            });
        });

        describe('isExpired', function () {
            var isExpired;

            beforeEach(function () {
                service.isExpired().then(function (yes) {
                    isExpired = yes;
                })
            });

            it('when app is not a trial', function () {
                $rootScope.$digest();
                expect(isExpired).toBeFalsy();
            });

            it('when app is a trial and not expired', function () {
                binarta.application.profile().trial = {expired: false};
                $rootScope.$digest();
                expect(isExpired).toBeFalsy();
            });

            it('when app is a trial and expired', function () {
                binarta.application.profile().trial = {expired: true};
                $rootScope.$digest();
                expect(isExpired).toBeTruthy();
            });
        });

        describe('getExpirationDate', function () {
            var expirationDate;

            beforeEach(function () {
                service.getExpirationDate().then(function (date) {
                    expirationDate = date;
                });
            });

            it('when app is not a trial', function () {
                $rootScope.$digest();
                expect(expirationDate).toBeFalsy();
            });

            it('when app is a trial', function () {
                var now = moment();
                binarta.application.profile().trial = {expirationDate: now.toISOString()};
                $rootScope.$digest();
                expect(expirationDate.toObject()).toEqual(now.toObject());
            });
        });
    });
});
