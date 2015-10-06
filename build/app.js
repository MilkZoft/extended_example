(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

module.exports = require('./src/eXtended');

},{"./src/eXtended":2}],2:[function(require,module,exports){
'use strict';

module.exports = require('./lib/eXtended');

},{"./lib/eXtended":4}],3:[function(require,module,exports){
'use strict';

var utils = require('./utils');

function Directives() {
  // Properties
  var directives = {};

  // Methods
  this.createDirective = createDirective;
  this.getAllDirectives = getAllDirectives;
  this.getDirective = getDirective;
  this.getDirectiveProps = getDirectiveProps;
  this.removeDirective = removeDirective;
  this.setDirective = setDirective;

  return this;

  /**
   * Creates a new directive object
   *
   * @param {string} directive
   * @param {object} obj
   * @returns {obj} directive object
   * @public
   */
  function createDirective(directive, obj) {
    setDirective(directive, obj);

    return obj;
  }

  /**
   * Get all existing directives
   *
   * @returns {obj} directives object
   * @public
   */
  function getAllDirectives() {
    return directives;
  }

  /**
   * Get a existing directive
   *
   * @param {string} directive
   * @returns {obj} directive object
   * @public
   */
  function getDirective(directive) {
    return utils.isDefined(directives[directive]) ? directives[directive] : false;
  }

  /**
   * Returns the props of a given directive
   *
   * @param {string} element
   * @returns {object} props
   * @protected
   */
  function getDirectiveProps(element) {
    var attributes = {};
    var attributesSplit;
    var directiveMatch;
    var selfClosingDirective = utils.isSelfClosingDirective(element);
    var values;

    directiveMatch = !selfClosingDirective ? utils.getRegexMatch(element, utils.getRegex('directive')) : [];

    attributes.$directiveName = directiveMatch[2] || selfClosingDirective;

    if (utils.isDefined(directiveMatch[4])) {
      attributes.$content = directiveMatch[4];
    }

    if (utils.isDefined(directiveMatch[3])) {
      attributes.$allAttributes = directiveMatch[3];
      attributesSplit = directiveMatch[3].replace(utils.getRegex('removeQuotes'), '').split(' ');

      utils.forEach(attributesSplit, attribute => {
        values = attribute.split('=');

        attributes[values[0]] = values[1];
      });
    }

    return {
      props: attributes
    };
  }

  /**
   * Get all existing directives
   *
   * @returns {obj} directives object
   * @public
   */
  function removeDirective(directive) {
    if (utils.isDefined(directives[directive])) {
      delete directives[directive];
    }
  }

  /**
   * Save a new directive
   *
   * @param {string} directive
   * @param {object} obj
   * @returns {obj} directive object
   * @public
   */
  function setDirective(directive, obj) {
    if (!utils.isDefined(directives[directive])) {
      directives[directive] = obj;
    }
  }
}

// Exporting object
module.exports = new Directives();

},{"./utils":7}],4:[function(require,module,exports){
'use strict';

var elements = require('./elements');
var directives = require('./directives');

function Extended() {
  // Methods from elements
  this.create = elements.create;
  this.element = elements.element;
  this.render = elements.render;

  // Methods from directives
  this.createDirective = directives.createDirective;

  return this;
}

// Exporting object
module.exports = new Extended();

},{"./directives":3,"./elements":5}],5:[function(require,module,exports){
'use strict';

var utils = require('./utils');
var directives = require('./directives');
var templates = require('./templates');

function Elements() {
  // Methods
  this.create = create;
  this.element = element;
  this.getElement = getElement;
  this.getElementNameAndType = getElementNameAndType;
  this.getElementType = getElementType;
  this.getProperty = getProperty;
  this.newElement = newElement;
  this.render = render;

  return this;

  /**
   * Creates a new element (with or without id & class).
   *
   * @param {string} tag
   * @param {object || string || boolean} props = false
   * @param {string} content
   * @return {object} element with properties.
   * @public
   */
  function create(tag, props, content) {
    var element = getElementNameAndType(tag);
    var el = newElement(element.name);
    var value;
    var property;
    var type;

    // Get properties for class or id and default attributes
    var getProps = (element, props) => {
      var newProps = utils.isSpecialTag(tag, props);

      if (element.id || element.class) {
        props = !props ? {} : props;
      }

      if (element.id) {
        props.id = element.id;
      }

      if (element.class) {
        props.class = element.class;
      }

      return newProps ? utils.merge(props, newProps) : props;
    };

    // Builds the object
    var buildElement = () => {
      props = getProps(element, props);

      if (content) {
        el.innerHTML = content;
      }

      if (utils.isObject(props)) {
        utils.forEach(props, key => {
          value = props[key] || '';
          property = getProperty(key);
          el[property] = value;
        });
      } else if (props) {
        type = getElementType(props, true);
        value = type !== 'tag' ? props.substring(1) : props;
        property = getProperty(type);
        el[property] = value;
      }

      return el;
    };

    return buildElement();
  }

  /**
   * Get an element object.
   *
   * @param {string} elementName
   * @return {object} element
   * @public
   */
  function element(elementName) {
    return getElement(elementName);
  }

  /**
   * Return an element object depends on type (id, class or tag)
   *
   * @param {string} elementName
   * @param {boolean} getType = false
   * @returns {object} element object depends on type
   * @protected
   */
  function getElement(elementName, getType = false) {
    var type = elementName[0];
    var query = type === '.' ? document.querySelectorAll(elementName) : document.querySelector(elementName);
    var types = {
      '.': 'class',
      '#': 'id'
    };

    return !getType ? query : utils.inObject(type, types) ? types[type] : 'tag';
  }

  /**
   * Return the type and name of the element (id, class or tag).
   *
   * @param {string} tag
   * @returns {object} element with properties.
   * @protected
   */
  function getElementNameAndType(tag) {
    var hasId = tag.split('#');
    var hasClasses = tag.split('.');
    var name = hasClasses.shift();
    var element = {
      name: tag
    };

    // Returns the object element with the name, id and class
    var getElementObject = (element, name, id, hasClass) => {
      var className = hasClass.length > 1 ? hasClass.join(' ') : hasClass[0];

      if (utils.isDefined(name, false)) {
        element.name = name;
      }

      if (utils.isDefined(id, false)) {
        element.id = id;
      }

      if (utils.isDefined(className, false)) {
        element.class = className;
      }

      return element;
    };

    // Returns the id and class values for an element
    var getIdAndClassValues = (hasId, hasClasses, element) => {
      if (hasId.length > 1 && hasClasses.length >= 1) {
        element = getElementObject(
          element,
          hasId[0],
          hasId[1].substring(0, hasId[1].indexOf('.')),
          hasClasses
        );
      } else if (hasId.length === 2 || hasClasses.length >= 1) {
        element = getElementObject(
          element,
          hasId.length === 2 ? hasId[0] : name,
          hasId.length === 2 ? hasId[1] : false,
          hasId.length === 2 ? false : hasClasses
        );
      }

      return element;
    };

    return getIdAndClassValues(hasId, hasClasses, element);
  }

  /**
   * Return the type of the element (id, class or tag)
   *
   * @param {string} elementName
   * @returns {string} type of the element (id, class or tag)
   * @protected
   */
  function getElementType(elementName) {
    return getElement(elementName, true);
  }

  /**
   * Short cuts for some properties
   *
   * @param {string} property
   * @returns {string} element property.
   * @protected
   */
  function getProperty(property) {
    var properties = {
      'class': 'className',
      'tag': 'className',
      'text': 'innerHTML',
      'content': 'innerHTML'
    };

    return properties[property] || property;
  }

  /**
   * Creates a new element
   *
   * @param {string} element
   * @returns {object} new element
   * @protected
   */
  function newElement(element) {
    return document.createElement(element);
  }

  /**
   * Render elements.
   *
   * @param {string} target
   * @param {array} elements
   * @public
   */
  function render(target, ...elements) {
    if (!target || elements.length === 0) {
      utils.log('You must specify a target and element to render');
      return;
    }

    var el = element(target);
    var directiveProps;
    var directiveClass;
    var html;
    var properties = {};

    if (utils.isDirective(elements[0])) {
      if (utils.isObject(elements[1])) {
        properties = elements[1];
      }

      directiveProps = directives.getDirectiveProps(elements[0]);
      directiveProps.props = utils.merge(directiveProps.props, properties);
      directiveClass = directives.getDirective(directiveProps.props.$directiveName);
      html = templates.getCompiledHTML(directiveClass.render(), directiveProps);
      directives.removeDirective(directiveProps.props.$directiveName);

      el.innerHTML = html;
    } else {
      utils.forEach(elements, element => {
        if (utils.isObject(element)) {
          el.appendChild(element);
        }
      });
    }
  }
}

// Exporting object
module.exports = new Elements();

},{"./directives":3,"./templates":6,"./utils":7}],6:[function(require,module,exports){
'use strict';

var utils = require('./utils');

function Templates() {
  // Methods
  this.getCompiledHTML = getCompiledHTML;

  return this;

  /**
   * Get compiled HTML (with variables values)
   *
   * @param {string} html
   * @param {object} directiveProps
   * @returns {string} compiled HTML
   * @protected
   */
  function getCompiledHTML(html, directiveProps) {
    var variablesMatch = utils.getRegexMatch(html, utils.getRegex('curlyBrackets'));
    var variableName;
    var propsStr;
    var newVariable;

    utils.forEach(variablesMatch, variable => {
      variableName = variable.replace('{{', '').replace('}}', '').trim();
      propsStr = variableName.substring(0, 11);

      if (variableName === 'this.props.attributes') {
        html = html.replace(variable, directiveProps.props.rawAttributes);
      } else if (propsStr === 'this.props.') {
        newVariable = variableName.substring(11);

        if (utils.isDefined(directiveProps.props[newVariable])) {
          html = html.replace(variable, directiveProps.props[newVariable]);
        }
      }
    });

    return html;
  }
}

// Exporting object
module.exports = new Templates();

},{"./utils":7}],7:[function(require,module,exports){
'use strict';

function Utils() {
  // Constants
  const SPECIAL_TAGS = ['link', 'script'];
  const REGEX = {
    directive: /(<(.+)(?:\s([^>]+))*>)(.*)<\/\2>/,
    selfClosingDirective: /<[^>]+?\/[ ]*>/,
    removeQuotes: /["']/g,
    curlyBrackets: /\{\{(\s*?.*?)*?\}\}/g
  };

  // Methods
  this.forEach = forEach;
  this.getDefaultAttrs = getDefaultAttrs;
  this.getRegex = getRegex;
  this.getRegexMatch = getRegexMatch;
  this.inArray = inArray;
  this.inObject = inObject;
  this.isArray = isArray;
  this.isDefined = isDefined;
  this.isDirective = isDirective;
  this.isFunction = isFunction;
  this.isNull = isNull;
  this.isObject = isObject;
  this.isSelfClosingDirective = isSelfClosingDirective;
  this.isSpecialTag = isSpecialTag;
  this.isString = isString;
  this.log = log;
  this.merge = merge;

  return this;

  /**
   * Easy way to iterate over arrays and objects.
   *
   * @param {array || object} items
   * @param {function} callback
   * @protected
   */
  function forEach(items, callback) {
    if (isArray(items)) {
      for (var i = 0; i < items.length; i++) {
        callback(items[i]);
      }
    } else {
      Object.keys(items).forEach(callback);
    }
  }

  /**
   * Get default attributes for special tags (like link or script).
   *
   * @param {string} element
   * @param {string} url
   * @returns {object} default properties
   * @protected
   */
  function getDefaultAttrs(element, url) {
    var properties = {
      link: {
        rel: 'stylesheet',
        type: 'text/css',
        href:  url || 'someStyle.css',
        media: 'all'
      },
      script: {
        type: 'application/javascript',
        src: url || 'someScript.js'
      }
    };

    return properties[element] || {};
  }

  /**
   * Get a stored regular expression.
   *
   * @param {string} regex
   * @returns {regex} from REGEX constant
   * @protected
   */
  function getRegex(regex) {
    return REGEX[regex] || false;
  }

  /**
   * Get match from passed regular expression.
   *
   * @param {string} element
   * @param {regex} pattern
   * @returns {array} matches
   * @protected
   */
  function getRegexMatch(element, regex) {
    var match = element.match(new RegExp(regex));

    return !isNull(match) ? match : false;
  }

/**
   * Validates if an item exists into an array.
   *
   * @param {string} item
   * @param {array} obj
   * @returns {boolean} true if the item exists, false if not.
   * @protected
   */
  function inArray(item, array) {
    return array instanceof Array && array.indexOf(item) >= 0;
  }

  /**
   * Validates if an item exists into an object.
   *
   * @param {string} item
   * @param {object} obj
   * @returns {boolean} true if the item exists, false if not.
   * @protected
   */
  function inObject(item, obj) {
    return typeof obj[item] !== 'undefined';
  }

  /**
   * Validates if a passed variable is an array
   *
   * @param {array} array
   * @returns {boolean} true if is Array
   * @protected
   */
  function isArray(array) {
    return array instanceof Array;
  }

  /**
   * Validates if a passed value is defined
   *
   * @param {mixed} value
   * @param {boolean} isNot
   * @returns {boolean} true if is defined
   * @protected
   */
  function isDefined(value, isNot) {
    if (typeof isNot === 'undefined') {
      return typeof value !== 'undefined';
    } else {
      return typeof value !== 'undefined' && value !== isNot;
    }
  }

  /**
   * Returns true if an element is a directive
   *
   * @param {string} element
   * @returns {boolean} true if is a directive
   * @protected
   */
  function isDirective(element) {
    if (isString(element) && getRegexMatch(element, getRegex('directive'))) {
      return true;
    } else if (isString(element)) {
      return !!getRegexMatch(element, getRegex('selfClosingDirective'));
    }

    return false;
  }

  /**
   * Validates if a passed variable is function
   *
   * @param {function} func
   * @returns {boolean} true if is function
   * @protected
   */
  function isFunction(func) {
    return typeof func === 'function';
  }

  /**
   * Validates if a passed value is null
   *
   * @param {mixed} value
   * @returns {boolean} true if is null
   * @protected
   */
  function isNull(value) {
    return value === null;
  }

  /**
   * Validates if a passed variable is an object
   *
   * @param {object} obj
   * @returns {boolean} true if is Object
   * @protected
   */
  function isObject(obj) {
    return obj instanceof Object && !isArray(obj) && typeof obj !== 'function';
  }

  /**
   * Returns true if an element is a self closing directive
   *
   * @param {string} element
   * @returns {boolean} true if is a self closing directive
   * @protected
   */
  function isSelfClosingDirective(element) {
    var match = getRegexMatch(element, getRegex('selfClosingDirective'));
    var directiveName;

    if (match) {
      directiveName = match[0].replace('<', '').replace('/', '').replace('>', '').trim();

      return directiveName;
    }

    return false;
  }

  /**
   * Validates if a given tag is a special tag.
   *
   * @param {string} tag
   * @param {object} props
   * @returns {object} props with default attributes.
   * @protected
   */
  function isSpecialTag(tag, props) {
    if (inArray(tag, SPECIAL_TAGS) && props) {
      return getDefaultAttrs(tag, props);
    }

    return false;
  }

  /**
   * Validates if a value is String
   *
   * @param {string} value
   * @returns {boolean} true if is String
   * @protected
   */
  function isString(value) {
    return typeof value === 'string';
  }

  /**
   * Logs a message.
   *
   * @param {string} message
   * @returns {void}
   * @internal
   */
  function log(message) {
    console.log('eXtended:', message);
  }

  /**
   * Easy way to merge two objects.
   *
   * @param {object} obj1
   * @param {object} obj2
   * @returns {object} merged obj1
   * @protected
   */
  function merge(obj1, obj2) {
    if (isFunction(Object.assign)) {
      return Object.assign(obj1, obj2);
    } else {
      for (var key in obj2) {
        if (obj2.hasOwnProperty(key)) {
          obj1[key] = obj2[key];
        }
      }

      return obj1;
    }
  }
}

// Exporting object
module.exports = new Utils();

},{}],8:[function(require,module,exports){
'use strict';

(function () {
  'use strict';

  var eX = require('extendedjs');

  var h1 = eX.create('h1#myId.myClass', {
    text: 'Hello World!'
  });

  eX.render('body', h1);
})();

},{"extendedjs":1}]},{},[8]);
