angular.module('binarta-applicationjs-gateways-angular1', ['binarta-applicationjs-inmem-angular1'])
    .provider('binartaApplicationGateway', ['inmemBinartaApplicationGatewayProvider', function (it) {
        return it;
    }]);

describe('application', function () {
    var binarta, applicationGateway;

    beforeEach(module('application'));

    beforeEach(inject(function (_binarta_, binartaApplicationGateway) {
        binarta = _binarta_;
        applicationGateway = binartaApplicationGateway;
    }));

    describe('applicationDataService', function () {
        var service, $rootScope;

        beforeEach(inject(function (_applicationDataService_, _$rootScope_, binartaGatewaysAreInitialised) {
            applicationGateway.clear();
            service = _applicationDataService_;
            $rootScope = _$rootScope_;
        }));

        function triggerBinartaSchedule() {
            binarta.application.refresh();
            binarta.application.adhesiveReading.read('-');
        }

        it('the application profile has been loaded', function () {
            triggerBinartaSchedule();
            expect(binarta.application.profile()).toBeDefined();
            expect(binarta.application.profile()).not.toEqual({});
        });

        it('then returns a promise which provides the application profile', function () {
            triggerBinartaSchedule();
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
                applicationGateway.updateApplicationProfile({trial: true});
                triggerBinartaSchedule();
                $rootScope.$digest();
                expect(isTrial).toBeTruthy();
            });

            it('when app is not a trial', function () {
                triggerBinartaSchedule();
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
                triggerBinartaSchedule();
                $rootScope.$digest();
                expect(isExpired).toBeFalsy();
            });

            it('when app is a trial and not expired', function () {
                applicationGateway.updateApplicationProfile({trial: {expired: false}});
                triggerBinartaSchedule();
                $rootScope.$digest();
                expect(isExpired).toBeFalsy();
            });

            it('when app is a trial and expired', function () {
                applicationGateway.updateApplicationProfile({trial: {expired: true}});
                triggerBinartaSchedule();
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
                triggerBinartaSchedule();
                $rootScope.$digest();
                expect(expirationDate).toBeFalsy();
            });

            it('when app is a trial', function () {
                var now = moment();
                applicationGateway.updateApplicationProfile({trial: {expirationDate: now.toISOString()}});
                triggerBinartaSchedule();
                $rootScope.$digest();
                expect(expirationDate.toObject()).toEqual(now.toObject());
            });
        });
    });
});
