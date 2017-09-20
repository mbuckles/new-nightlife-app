(function() {

  var app = angular.module('app', ['ngRoute', 'angular-jwt']);
  //new
  app.run(function($rootScope, $location, $window, $http) {

    // Add default Authorization Bearer header to be validated with each request

    $http.defaults.headers.common['Authorization'] = 'Bearer ' + $window.localStorage.token

    $rootScope.$on('$routeChangeStart', function(event, nextRoute, currentRoute) {
      if (nextRoute.access !== undefined && nextRoute.access.restricted === true && !$window.localStorage.token) {
        event.preventDefault();
        $location.path('/');
      }
      if ($window.localStorage.token && nextRoute.access.restricted === true) {

        $http.post('/api/verify-token', {
            token: $window.localStorage.token
          })
          .then(function(response) {}, function(err) {
            // invalid token. delete token in local storage to prevent further inauthentic requests to API
            delete $window.localStorage.token;
            $location.path('/profile')
          })
      }
    });
  })
  //old
  app.config(function($routeProvider, $locationProvider) {

    $locationProvider.html5Mode(true);


    $routeProvider.when('/', {
      templateUrl: 'bars.html',
      controller: 'BarsController',
      controllerAs: 'vm',
      access: {
        restricted: false
      }
    });
    $routeProvider.when('/profile', {
      templateUrl: 'profile.html',
      controller: 'ProfileController',
      controllerAs: 'vm',
      access: {
        restricted: true
      }
    });
    $routeProvider.when('/register', {
      templateUrl: 'register.html',
      controller: 'RegisterController',
      controllerAs: 'vm',
      access: {
        restricted: false
      }
    });
    $routeProvider.when('/login', {
      templateUrl: 'login.html',
      controller: 'LoginController',
      controllerAs: 'vm',
      access: {
        restricted: false
      }
    });

    $routeProvider.otherwise('/')

  })

  app.controller('BarsController', BarsController);

  function BarsController($location, $http, $window, $timeout, $scope) {
    const vm = this;
    vm.title = "Bars";
    const deleteBars = function() {
      $http.delete('/api/bars').then(function(response) {
        console.log(response);
      })
    }
    vm.bars = function() {
      //deleteBars();
      $http.post('/api/bars', vm.location).then(function(response) {
        console.log(response);
      })
      $http.get('/api/bars').then(function(response) {
        console.log(response);
        $scope.bars = response.data;
        deleteBars();
      })
    }
  }

  app.controller('ProfileController', ProfileController);

  function ProfileController(jwtHelper, $window, $location, $http, $timeout) {
    const vm = this;
    vm.title = "Profile";
    vm.currentUser = null;
    vm.polls = [];
    const token = $window.localStorage.token;
    vm.getPollsByUser = function() {
      $http.get('/api/user-polls/' + vm.currentUser.name)
        .then(function(response) {
          vm.polls = response.data;
        }, function(err) {
          console.log(err)
        })
    }

    if (token) {
      vm.currentUser = jwtHelper.decodeToken(token).data;
      if (vm.currentUser !== null) {
        vm.getPollsByUser();
      }
    }

    vm.logOut = function() {
      $window.localStorage.removeItem('token');
      vm.message = 'Logging you out...'
      $timeout(function() {
        vm.message = '';
        $location.path('/');
      }, 2000)
    }

  }

  app.controller('RegisterController', RegisterController);

  function RegisterController($location, $http, $window, $timeout) {
    const vm = this;
    vm.title = "Register";
    vm.user = {
      name: '',
      password: '',
      city: '',
      state: ''
    }
    vm.register = function() {
      if (vm.user) {
        $http.post('/api/register', vm.user).then(onSuccess, onError);
        $timeout(function() {
          vm.error = ''
        }, 5000)
      } else {
        $location.path('/register');
      }
    }

    const onSuccess = function(response) {
      $window.localStorage.token = response.data;
      console.log(response);
      $location.path('/profile');
    }
    const onError = function(err) {
      if (err.data.code === 11000) {
        vm.error = "This user already exists";
      }
      vm.user = null;
      $location.path('/register');
    }
  }

  app.controller('LoginController', LoginController);

  function LoginController($http, $window, $location, $timeout) {
    const vm = this;
    vm.title = "Login";
    vm.user = {
      name: '',
      password: ''
    }
    console.log(vm.user);
    vm.login = function() {
      if (vm.user) {
        $http.post('/api/login', vm.user).then(onSuccess, onError);
      } else {
        vm.user = null;
        $location.path('/login');
      }
    }
    const onSuccess = function(response) {
      $window.localStorage.token = response.data;
      $location.path('/profile');
    }
    const onError = function(error) {
      console.log(error)
    }
  }

}());

/*(function() {

    var app = angular.module('app', ['ngRoute', 'angular-jwt']);

    app.run(function($rootScope, $location, $window, $http) {

        // Add default Authorization Bearer header to be validated with each request

        $http.defaults.headers.common['Authorization'] = 'Bearer ' + $window.localStorage.token

        $rootScope.$on('$routeChangeStart', function(event, nextRoute, currentRoute) {
            if(nextRoute.access !== undefined && nextRoute.access.restricted === true  &&  !$window.localStorage.token) {
                event.preventDefault();
                $location.path('/');
            }
            if($window.localStorage.token && nextRoute.access.restricted === true) {

                $http.post('/api/verify-token', { token: $window.localStorage.token })
                     .then(function(response) {
                      }, function(err) {
                         // invalid token. delete token in local storage to prevent further inauthentic requests to API
                         delete $window.localStorage.token;
                         $location.path('/login')
                     })
            }
        });
    })

    app.config(function($routeProvider, $locationProvider) {

        $locationProvider.html5Mode(true);

        $routeProvider.when('/', {
            templateUrl: 'bars.html',
            controller: 'BarsController',
            controllerAs: 'vm',
            access: {
                restricted: false
            }
        });
        $routeProvider.when('/profile', {
            templateUrl: 'profile.html',
            controller: 'ProfileController',
            controllerAs: 'vm',
            access: {
                restricted: true
            }
        });
        $routeProvider.when('/register', {
            templateUrl: 'register.html',
            controller: 'RegisterController',
            controllerAs: 'vm',
            access: {
                restricted: false
            }
        });
        $routeProvider.when('/login', {
            templateUrl: 'login.html',
            controller: 'LoginController',
            controllerAs: 'vm',
            access: {
                restricted: false
            }
        });

        $routeProvider.otherwise('/')

    })

    app.controller('BarsController', BarsController);

    function BarsController($location, $http, $window, $timeout,$scope) {
      const vm = this;
      vm.title = "Bars";
      const deleteBars = function(){
        $http.delete('/api/bars').then(function(response) {
          console.log(response);
        })
      }
      vm.bars = function() {
        //deleteBars();
        $http.post('/api/bars', vm.location).then(function(response) {
          console.log(response);
        })
        $http.get('/api/bars').then(function(response){
          console.log(response);
          $scope.bars = response.data;
          deleteBars();
        })
      }
    }

    app.controller('ProfileController', ProfileController);

    function ProfileController(jwtHelper, $window, $location, $http, $timeout) {
        const vm = this;
        vm.title = "Profile";
        vm.currentUser =null;
        vm.polls = [];
        const token = $window.localStorage.token;
       vm.getPollsByUser = function() {
            $http.get('/api/user-polls/'+ vm.currentUser.name)
                 .then(function(response) {
                     vm.polls = response.data;
                 }, function(err) {
                     console.log(err)
                 })
        }

        if(token) {
           vm.currentUser = jwtHelper.decodeToken(token).data;
           if(vm.currentUser !== null )  {
               vm.getPollsByUser();
           }
        }

        vm.logOut = function() {
            $window.localStorage.removeItem('token');
            vm.message = 'Logging you out...'
            $timeout(function() {
                vm.message = '';
                 $location.path('/');
            }, 2000)
        }

    }

    app.controller('RegisterController', RegisterController);

    function RegisterController($location, $http, $window, $timeout) {
        const vm = this;
        vm.title = "Register";
        vm.user = {
            name: '',
            password: '',
            city: '',
            state: ''
        }
        vm.register = function() {
            if(vm.user) {
                $http.post('/api/register', vm.user).then(onSuccess, onError);
                $timeout(function() {
                    vm.error = ''
                }, 5000)
            }
            else {
                $location.path('/register');
            }
        }

        const onSuccess = function(response) {
            $window.localStorage.token = response.data;
            console.log(response);
            $location.path('/profile');
        }
        const onError = function(err){
            if(err.data.code === 11000) {
                vm.error = "This user already exists";
            }
            vm.user = null;
            $location.path('/register');
        }
    }

    app.controller('LoginController', LoginController);

    function LoginController($http, $window, $location, $timeout) {
        const vm = this;
        vm.title = "Login";
        vm.user = {
            name: '',
            password: ''
        }
        vm.login = function() {
            if(vm.user) {
                $http.post('/api/login', vm.user).then(onSuccess, onError);
            }
            else {
                vm.user = null;
                $location.path('/login');
            }
        }
        const onSuccess = function(response) {
            $window.localStorage.token = response.data;
            $location.path('/profile');
        }
        const onError = function(error) {
            console.log(error)
        }
    }


});
*/
