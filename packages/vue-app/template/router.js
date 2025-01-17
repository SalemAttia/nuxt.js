import Vue from 'vue'
import Router from 'vue-router'
import { interopDefault } from './utils'<%= isTest ? '// eslint-disable-line no-unused-vars' : '' %>
import scrollBehavior from './router.scrollBehavior.js'

<% function recursiveRoutes(routes, tab, components, indentCount) {
  let res = ''
  const baseIndent = tab.repeat(indentCount)
  const firstIndent = '\n' + tab.repeat(indentCount + 1)
  const nextIndent = ',' + firstIndent
  routes.forEach((route, i) => {
    let resMap = ''
    // If need to handle named views
    if (route.components) {
      let _name = '_' + hash(route.components.default)
      if (splitChunks.pages) {
        resMap += `${firstIndent}${tab}default: ${_name}`
      } else {
        resMap += `${firstIndent}${tab}default: () => ${_name}.default || ${_name}`
      }
      for (const k in route.components) {
        _name = '_' + hash(route.components[k])
        const component = { _name, component: route.components[k] }
        if (k === 'default') {
          components.push({
            ...component,
            name: route.name,
            chunkName: route.chunkName
          })
        } else {
          components.push({
            ...component,
            name: `${route.name}-${k}`,
            chunkName: route.chunkNames[k]
          })
          if (splitChunks.pages) {
            resMap += `${nextIndent}${tab}${k}: ${_name}`
          } else {
            resMap += `${nextIndent}${tab}${k}: () => ${_name}.default || ${_name}`
          }
        }
      }
      route.component = false
    } else {
      route._name = '_' + hash(route.component)
      components.push({ _name: route._name, component: route.component, name: route.name, chunkName: route.chunkName })
    }
    // @see: https://router.vuejs.org/api/#router-construction-options
    res += '{'
    res += firstIndent + 'path: ' + JSON.stringify(route.path)
    res += (route.components) ? nextIndent + 'components: {' + resMap + '\n' + baseIndent + tab + '}' : ''
    res += (route.component) ? nextIndent + 'component: ' + (splitChunks.pages ? route._name : `() => ${route._name}.default || ${route._name}`) : ''
    res += (route.redirect) ? nextIndent + 'redirect: ' + JSON.stringify(route.redirect) : ''
    res += (route.meta) ? nextIndent + 'meta: ' + JSON.stringify(route.meta) : ''
    res += (typeof route.props !== 'undefined') ? nextIndent + 'props: ' + (typeof route.props === 'function' ? serialize(route.props) : JSON.stringify(route.props)) : ''
    res += (typeof route.caseSensitive !== 'undefined') ? nextIndent + 'caseSensitive: ' + JSON.stringify(route.caseSensitive) : ''
    res += (route.alias) ? nextIndent + 'alias: ' + JSON.stringify(route.alias) : ''
    res += (route.pathToRegexpOptions) ? nextIndent + 'pathToRegexpOptions: ' + JSON.stringify(route.pathToRegexpOptions) : ''
    res += (route.name) ? nextIndent + 'name: ' + JSON.stringify(route.name) : ''
    if (route.beforeEnter) {
      if(isTest) { res += ',\n/* eslint-disable indent, semi */' }
      res += (isTest ? firstIndent : nextIndent) + 'beforeEnter: ' + serialize(route.beforeEnter)
      if(isTest) { res += firstIndent + '/* eslint-enable indent, semi */' }
    }
    res += (route.children) ? nextIndent + 'children: [' + recursiveRoutes(routes[i].children, tab, components, indentCount + 1) + ']' : ''
    res += '\n' + baseIndent + '}' + (i + 1 === routes.length ? '' : ', ')
  })
  return res
}
const _components = []
const _routes = recursiveRoutes(router.routes, '  ', _components, 2)
%><%= uniqBy(_components, '_name').map((route) => {
  if (!route.component) return ''
  const path = relativeToBuild(route.component)
  const chunkName = wChunk(route.chunkName)
  const name = route._name

  if (splitChunks.pages) {
    return `const ${name} = () => interopDefault(import('${path}' /* webpackChunkName: "${chunkName}" */))`
  } else {
    return `import ${name} from '${path}'`
  }
}).join('\n')%>

Vue.use(Router)

export function createRouter() {
  return new Router({
    mode: '<%= router.mode %>',
    base: decodeURI('<%= router.base %>'),
    linkActiveClass: '<%= router.linkActiveClass %>',
    linkExactActiveClass: '<%= router.linkExactActiveClass %>',
    scrollBehavior,
    <%= isTest ? '/* eslint-disable quotes, object-curly-spacing, key-spacing */' : '' %>
    routes: [<%= _routes %>],
    <%= isTest ? '/* eslint-enable quotes, object-curly-spacing, key-spacing */' : '' %>
    <% if (router.parseQuery) { %>parseQuery: <%= serializeFunction(router.parseQuery) %>,<% } %>
    <% if (router.stringifyQuery) { %>stringifyQuery: <%= serializeFunction(router.stringifyQuery) %>,<% } %>
    fallback: <%= router.fallback %>
  })
}
