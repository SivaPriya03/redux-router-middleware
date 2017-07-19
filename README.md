# react-router-redux

##Just my thought.
1. History object is a side-effect. If you are using redux then handle history object inside middleware. Don't flow over component. In react-router, histroy object flow over component via context. All Link(withRouter) component more couple with router. It breaks some reusablity.  
2. Connect(React-Redux) has subscriber model for state changes UI changes. If we sync URL state into app state then we may use same connect component for URL changes also.

I tried some example

```
npm install
npm run example
http://localhost:9090
```

# 1.0.0-beta.16
  Match - props support array name={['page1','page2']}
