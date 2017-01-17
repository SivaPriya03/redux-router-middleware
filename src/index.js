import React from 'react';
import { connect } from 'react-redux';
import { createBrowserHistory } from 'history';
import { normalize, arrayOf,schema } from 'simple-normalizr';

var urlsSchema = arrayOf(schema("urls",{id:"name"}));

function escapeRegExp(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}
const CompiledPatternsCache = Object.create(null)
function _compilePattern(pattern) {
  let regexpSource = ''
  const paramNames = []
  const tokens = []

  let match, lastIndex = 0, matcher = /:([a-zA-Z_$][a-zA-Z0-9_$]*)|\*\*|\*|\(|\)/g
  while ((match = matcher.exec(pattern))) {
    if (match.index !== lastIndex) {
      tokens.push(pattern.slice(lastIndex, match.index))
      regexpSource += escapeRegExp(pattern.slice(lastIndex, match.index))
    }

    if (match[1]) {
      regexpSource += '([^/]+)'
      paramNames.push(match[1])
    } else if (match[0] === '**') {
      regexpSource += '(.*)'
      paramNames.push('splat')
    } else if (match[0] === '*') {
      regexpSource += '(.*?)'
      paramNames.push('splat')
    } else if (match[0] === '(') {
      regexpSource += '(?:'
    } else if (match[0] === ')') {
      regexpSource += ')?'
    }

    tokens.push(match[0])

    lastIndex = matcher.lastIndex
  }

  if (lastIndex !== pattern.length) {
    tokens.push(pattern.slice(lastIndex, pattern.length))
    regexpSource += escapeRegExp(pattern.slice(lastIndex, pattern.length))
  }

  return {
    pattern,
    regexpSource,
    paramNames,
    tokens
  }
}
function compilePattern(pattern) {
  if (!CompiledPatternsCache[pattern])
    CompiledPatternsCache[pattern] = _compilePattern(pattern)

  return CompiledPatternsCache[pattern]
}
function matchPattern(pattern, pathname) {
  // Ensure pattern starts with leading slash for consistency with pathname.
  if (pattern.charAt(0) !== '/') {
    pattern = `/${pattern}`
  }
  let { regexpSource, paramNames, tokens } = compilePattern(pattern)
  
  if (pattern.charAt(pattern.length - 1) !== '/') {
    regexpSource += '/?' // Allow optional path separator at end.
  }

  // Special-case patterns like '*' for catch-all routes.
  if (tokens[tokens.length - 1] === '*') {
    regexpSource += '$'
  }
  
  const match = pathname.match(new RegExp(`^${regexpSource}`, 'i'))
  if (match == null) {
    return null
  }

  const matchedPath = match[0]
  let remainingPathname = pathname.substr(matchedPath.length)

  if (remainingPathname) {
    // Require that the match ends at a path separator, if we didn't match
    // the full path, so any remaining pathname is a new path segment.
    if (matchedPath.charAt(matchedPath.length - 1) !== '/') {
      return null
    }

    // If there is a remaining pathname, treat the path separator as part of
    // the remaining pathname for properly continuing the match.
    remainingPathname = `/${remainingPathname}`
  }
    var paramMap={};
    match.slice(1).forEach((v,i) => paramMap[paramNames[i]] = v && decodeURIComponent(v))
  return {
    remainingPathname,
    paramMap
  }
}

        /*
          routing:{
            location:{
              pathname:,
              state,
              query,
            },
            urls:{
              entity:{
                "url1":{
                  name:
                  pattern:
                  match:
                  tokens:
                }
              },
              order:["url1",..],
            },
            currentParams:{
              
            }
          }
          */
const MATCH=1;
const EXACT_MATCH=2;
const NOT_MATCH=0;


var initialStateWithTokens = (initialState)=>{
  return Object.keys(initialState).reduce((result,next)=>{
    result[next]= Object.assign({},initialState[next],
      {
        tokens:compilePattern(initialState[next].pattern).tokens
      })
    return result;
  },{})
}


export const routing=(urls)=>{
  var urlNormalizer = normalize(urls, urlsSchema)
  var urls = initialStateWithTokens(urlNormalizer.entities.urls);
  var order = urlNormalizer.result;

  return (state={urls:urls,order:order,location},action)=>{
    var currentParams;
     if(action.type == "URL_CHANGE"){
   return {
      urls:state.order.reduce((result, next)=>{
        var obj = matchPattern(state.urls[next].pattern,action.data.location.pathname);
        var match=NOT_MATCH;
        if(obj){
          currentParams=obj;
          if(obj.remainingPathname == ""){
            match=EXACT_MATCH;
          }
          else{
            match=MATCH;
          }
        }
        result[next] = url(state.urls[next],action,match);
       return result;
   },{}),
      order:state.order,
      paramMap:currentParams && currentParams.paramMap || {},
      location:location(state.location,action),//old location and new location are diff deep compare
  }
}
return state;
}
}

var url=(state={},action,matchType)=>{
    return Object.assign({},state,{match:matchType})
}
var location = (state={},action) => {
  if(action.type == "URL_CHANGE"){
    return action.data.location;
  }
  return state;
}
const historyAction = (action)=>  (location) =>{
  return {type:"URL_CHANGE",data:{location:Object.assign({},location,{action:action})}}
}

export const push= historyAction("PUSH")
export const replace = historyAction("REPLACE")


export var historyMiddleWare = ( history ) => ( store )=>{
  
  store.dispatch({
    type:"URL_CHANGE",
    from:"history",data:{location:history.getCurrentLocation()}
  })
  var unlisten = history.listen( ( location, action) => {
      var search=location.search;
      function queryStringToJSON(queryString) {
        if(queryString.indexOf('?') > -1){
          queryString = queryString.split('?')[1];
        }
        var pairs = queryString.split('&');
        var result = {};
        pairs.forEach(function(pair) {
          pair = pair.split('=');
          result[pair[0]] = decodeURIComponent(pair[1] || '');
        });
        return result;
      }
      var query = queryStringToJSON(search);
      location.query=query;
      store.dispatch({
        type:"URL_CHANGE",
        from:"history",data:{location}
      })
  })
  return ( next ) => ( action ) => {
    if(action.type=="URL_CHANGE" && action.from=="history"){
      return next(Object.assign(action,{from:null}))
    }
    else if(action.type=="URL_CHANGE"){
      if(action.data.location.action=="POP"){//no idea some issue there
        history.go(-1);
      }
      else{
        history[action.data.location.action.toLowerCase()](action.data.location)
      }
    }
    else{
      return next(action)
    }
  }
}


export class RouterProvider extends React.Component{
  constructor(props) {
    super(props);
    this.action = this.action.bind(this);
  }
  getChildContext(){
    return {
      action: this.action
    }
  }
  
  action(name,params={},query={},state={},action="PUSH",isDispatch=true){
      var { paramMap,urls } = this.props.routing;
      var { push, replace } = this.props;
      var url=urls[name];
      var tokens=url.tokens;
      var href=tokens.reduce((result,next)=>{
        if(!next.startsWith(":"))
        result+=next;
        else{
          var key=next.substring(1);
          result+=params[key] || paramMap[key];
        }
        return result;
      },"")
    if(isDispatch){  
      if(action == "PUSH"){
        this.props.push({
          pathname:href,
          state,
          query,
        })
      }else if(action == "REPLACE"){
        replace({
          pathname:href,
          state,
          query
        })
      }
    }
    return href
  }
  render(){
    var { children } = this.props;
    return React.Children.only(children)
  }
}
RouterProvider.childContextTypes={
  action:React.PropTypes.func
}
RouterProvider=connect((state)=>{
  return {
    routing:state.routing
  }
},{push,replace})(RouterProvider)

export class Link extends React.Component{
  constructor(props) {
    super(props);
    this.onClick = this.onClick.bind(this);
  }
  onClick(e){
    var { push, replace, action,pathname,state,query } = this.props;
    if(!this.props.isReload){
      e.preventDefault();
       if(action == "PUSH"){
        this.props.push({
          pathname:pathname,
          state,
          query,
        })
      }else if(action == "REPLACE"){
        replace({
          pathname:pathname,
          state,
          query
        })
      }
    }
    //var {name,params,query,state,action} = this.props;
    //this.context.action(name,params,query,state,action)
  }

  render(){
    var { children,href,isActive,isReload=false } = this.props;
     
    return <a href={href} onClick={this.onClick} className={isActive?"active":""}>{children}</a>
  }

}
Link.defaultProps= {
  isReload:false,
  action:"PUSH"
}

Link.contextTypes={
  action:React.PropTypes.func
}
Link = connect((state,props)=>{
  var { paramMap,urls,location } = state.routing;
  var url=urls[props.name];
  var tokens=url.tokens;
  var href=tokens.reduce((result,next)=>{
    if(!next.startsWith(":"))
    result+=next;
    else{
      var key=next.substring(1);
      result+=props.params[key] || paramMap[key];
    }
    return result;
  },"")
  function jsonToQueryString(json) {
    return '?' + 
        Object.keys(json).map(function(key) {
            return encodeURIComponent(key) + '=' +
                encodeURIComponent(json[key]);
        }).join('&');
  }
  var qStr=jsonToQueryString(props.query || {})
  return {
    pathname:href,
    href:href+qStr,
    isActive:href == location.pathname
  }
},{push,replace})(Link)

export class Match extends React.Component{
  render(){
    var { children, isMatch } = this.props;
    return isMatch && React.Children.only(children) || null;
  }
}

Match = connect((state,props)=>{
   var url =state.routing.urls[props.name];
  return {
    isMatch:  (props.isExactly && url.match == 2) || (!props.isExactly && url.match)
  }
})(Match)

