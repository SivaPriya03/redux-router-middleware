/**
two way to update state

1. action("push|replace")->historyapi("push|replace")->historychangelistener->dispatch->updateState

2. historychange -> historychangelistener->dispatch->updateState

*/

import { URL_CHANGE, URL_CHANGE_BLOCK,URL_CHANGE_UNBLOCK } from './constants';
import { queryStringToJSON, jsonToQueryString } from './utils';
import {routing} from './reducer';

export const reduxRouter=(history,urls,onUrlChange)=>{
  var routingReducer = routing(urls)
  function historyMiddleware( history ) {
    return ( store )=>{
       var preUrlChangeReject=null;
       var onChange=( location, action) => {
        var search=location.search;
        if(search){
          location.query=queryStringToJSON(search);
        }
        var newRoutingState = routingReducer(store.getState().routing,{
          type:URL_CHANGE,
          from:"history",data:{location}
        })
        if(preUrlChangeReject){
          preUrlChangeReject();
          preUrlChangeReject=null;
        }
        new Promise((res,rej)=>{
          onUrlChange(newRoutingState,res,{dispatch:store.dispatch,getState:store.getState});
          preUrlChangeReject=rej
        }).then(()=>{
          preUrlChangeReject=null;
          store.dispatch({
            type:URL_CHANGE,
            from:"history",data:{location}
          })  
        }).catch(()=>{
          store.dispatch({
            type:"URL_CHANGE_Failure",
            from:"history",data:{location}
          }) 
        })
        
    }
    /* init dispatch*/
      setTimeout(()=>onChange(history.getCurrentLocation ? history.getCurrentLocation() : history.location),1)
      
      /*store.dispatch({
        type:URL_CHANGE,
        from:"history",data:{
          location:history.getCurrentLocation ? history.getCurrentLocation() : history.location // only works history ^3.0.0 
        }
      })*/
     
    var unlisten = history.listen(onChange)
    var unblock = null;
    return ( next ) => ( action ) => {
      if(action.type==URL_CHANGE && action.from=="history"){
        if(unblock){
          unblock();
          unblock = null;
          next({type:URL_CHANGE_UNBLOCK})
        } 
        return next(Object.assign(action,{from:null})) //from is a flag used for update url only via history api 
      }
      else if(action.type==URL_CHANGE){
        if(action.data.location.action=="POP"){
          history.go(-1);
        }
        else{
          var location=Object.assign({},action.data.location);
          var query=location.query;
          location.search=jsonToQueryString(location.query || {})
          history[action.data.location.action.toLowerCase()](location) 

        }
      }
      else if(action.type==URL_CHANGE_BLOCK){
        unblock = history.block(action.data.msg || 'Are you sure to leave the page?')//i18n miss
        next(action);
      }
       else if(action.type==URL_CHANGE_UNBLOCK){
        if(unblock){
          unblock()
          unblock = null;
        } 
        next(action);
      }
      else{
        return next(action)
      }
    }
  }
}
  return {
    historyMiddleware:historyMiddleware(history) ,
    routing:routingReducer

  }
}

export const historyMiddleware = ( history ) => ( store )=>{
  /* init dispatch*/
  store.dispatch({
    type:URL_CHANGE,
    from:"history",data:{
    	location:history.getCurrentLocation ? history.getCurrentLocation() : history.location /* only works history ^3.0.0 */
    }
  })
  var unlisten = history.listen( ( location, action) => {
      var search=location.search;
      if(search)
      location.query=queryStringToJSON(search);
      store.dispatch({
        type:URL_CHANGE,
        from:"history",data:{location}
      })
  })
  var unblock = null;
  return ( next ) => ( action ) => {
    if(action.type==URL_CHANGE && action.from=="history"){
      if(unblock){
        unblock();
        unblock = null;
        next({type:URL_CHANGE_UNBLOCK})
      } 
      return next(Object.assign(action,{from:null})) //from is a flag used for update url only via history api 
    }
    else if(action.type==URL_CHANGE){
      if(action.data.location.action=="POP"){
        history.go(-1);
      }
      else{
        var location=Object.assign({},action.data.location);
          var query=location.query;
          location.search=jsonToQueryString(location.query || {})
        history[action.data.location.action.toLowerCase()](location) 

      }
    }
    else if(action.type==URL_CHANGE_BLOCK){
      unblock = history.block(action.data.msg || 'Are you sure to leave the page?')//i18n miss
      next(action);
    }
     else if(action.type==URL_CHANGE_UNBLOCK){
      if(unblock){
        unblock()
        unblock = null;
      } 
      next(action);
    }
    else{
      return next(action)
    }
  }
}
