
angular.module('app', ['ngMaterial', 'ngMessages'])
    .controller("MainController", function ($scope, $mdDialog, $http, $interval) {

        $scope.status = '  ';
        $scope.loading = false;
        $scope.customFullscreen = false;
        $scope.eventos = [];

        $scope.requestLicense = function (notForce) {
            var confirm = $mdDialog.prompt()
                .title('Iniciar sistema de sincronización')
                .textContent('Indique el número de licencia suministrado por su distribuidor')
                .placeholder('XXXX-XXXX-XXXX-XXXX')
                .ariaLabel('Lincencia')
                .required(true)
                .cancel('Cancelar')
                .clickOutsideToClose(false)
                .ok('Registar licencia');

            $mdDialog.show(confirm).then(function (result) {
                if (!result) {
                    $scope.requestLicense();
                    return;
                }
                $scope.loading = true;


                $http.post('api', {
                    action: 'checkAndRegisterLicense',
                    license: result
                }).then(res => {

                    $scope.loading = false;
                    if (res.data.success) {

                        $scope.init();

                    } else {

                        $mdDialog.show(
                            $mdDialog.alert()
                                .clickOutsideToClose(false)
                                .title('Error')
                                .textContent('Licencia inválida. Intente nuevamnete')
                                .ariaLabel('Licencia inválida')
                                .ok('Entendido')
                        ).then(res => {
                            $scope.requestLicense();
                        });

                    }
                    $scope.init();
                });

            }, function () {
                if (!notForce)
                    $scope.requestLicense();
            });
        }

        $scope.init = function () {

            $http.post('api', {
                action: 'getServiceInfo'
            }).then(res => {
                $scope.info = res.data;
                if ($scope.info.data.licencias.length == 0) {
                    $scope.requestLicense();
                } else {
                    $interval($scope.startLogEvents, 1000);
                }
            });

        }

        $scope.startLogEvents = function () {

            $http.post('api', {
                action: 'getServiceInfo'
            }).then(res => {
                $scope.info = res.data;
            });

        }


        $scope.init();


    });