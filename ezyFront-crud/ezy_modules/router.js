import * as utils from './utils.js';

export class Router {

    constructor(){
        /** 
         routes =
            [
                {
                    path: ,
                    url: ,
                    redirectTo: 
                }
            ]
        */
        this.routes = [];
        this.route = {};
        this.outlet = "#out";
        this.authenticateRoute = (route) => {
          return true;
        }
    }

    /**
     * routes to new path
     * @param {string} path -> e.g #user or /#user
     */
    redirectTo(path){
      let hash = path;

      if(path.charAt(0) === '/'){
        hash = path.slice(1);
      }

      location.hash = hash;
    }

    /**
     * loads the content of a url from a matched route for a path
     * @param {string} path -> e.g /#user
     */
    loadRoute(path){
        let route = this._matchPathToRoute(path);
     
        // route not found
        if(!route){
            //this must only happen in development
            throw new Error(`Route for path ${path} not found`);
        }

        // redirects if redirectTo is provided
        if(!utils.isEmpty(route.redirectTo)){
            this.redirectTo(route.redirectTo);
            return;
        }

        // empty url, do nothing
        if(utils.isEmpty(route.url)){
            return;
        }

        let routeCopy = Object.assign({}, route);

        if(this.authenticateRoute(routeCopy)){
          utils.load(this.outlet, route.url);
          this.route = route;
        }else{
          if(utils.isEmpty(routeCopy.redirectTo)){
            //this must only happen in development
            throw new Error(`Redirect path is not provided`);
          }

          this.redirectTo(routeCopy.redirectTo);
        }
    }

    _matchPathToRoute(path) {

        if(this.routes.length === 0){
          return false;
        }

        let pathSegments = path.split('/');

        if(path.charAt(0) === '/'){
          pathSegments = path.split('/').slice(1);
        }

        // Try and match the path to a route.
        const routeParams = {};

        // for each route
        const matchedRoute = this.routes.find(route => {
          
          let routePathSegments = route.path.split('/');
          if(route.path.charAt(0) === '/'){
            routePathSegments = route.path.split('/').slice(1);
          }
    
          // If there are different numbers of segments, then the route does not match the URL.
          if (routePathSegments.length !== pathSegments.length) {
            return false;
          }
    
          // If each segment in the path matches the corresponding segment in the route path, 
          // or the route path segment starts with a ':' then the route is matched.
          const match = routePathSegments.every((routePathSegment, i) => {
            return routePathSegment === pathSegments[i] || routePathSegment[0] === ':';
          });
    
          // If the route matches the path, pull out any params from the path.
          if (match) {
            routePathSegments.forEach((segment, i) => {
              if (segment[0] === ':') {
                const propName = segment.slice(1);
                routeParams[propName] = decodeURIComponent(pathSegments[i]);
              }
            });
          }
          return match;
        });

        if(!matchedRoute){
          return false;
        }
    
        let route = {
          params: routeParams
        };
        route = Object.assign(route, matchedRoute);
        
        // return { ...matchedRoute, params: routeParams };
        return route;
      }
 }
