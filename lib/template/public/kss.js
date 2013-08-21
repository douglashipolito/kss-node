;(function (global, document) {

    var defaults = {
          debug : true
        },

        _appName = 'KSS';

    function App(options) {
      var app = this;

      app.firstLoad();

      loadScript('public/prettify.js', function () {
        app.init();
      });
    };

    App.prototype.firstLoad = function () {
      document.querySelector('html').className = document.querySelector('html').className + ' js-kss-loaded';
      this.stateGenerator();
    };

    App.prototype.init = function (options) {
      var app = this,
          script = document.querySelector('#main-script');

      loadScript(script.getAttribute('data-dependency'), function () {
        app.settings = $.extend({}, defaults, options);

        app.styleKssExample= $('#style-kss-example').html();
        
        app.setDom();

        _onLoad.call(app, [
          app.startPrettyPrint,
          app.processContent,
          app.windowResizeStart
        ]);
      });
    };

    App.prototype.setDom = function () {
      this.dom = this.dom || {};
      this.dom.window = $(global);
      this.dom.kssMain = $('#kss-main');
      this.dom.kssNav = $('#kss-nav');
      this.dom.modExample = $('.kss-mod-example').find('td');
      this.dom.modContent = this.dom.modExample.find('.kss-mod-example-content');
    }

    App.prototype.processContent = function () {
      var app = this,
          dom = app.dom,
          promiseIframes = [];

      $.map(dom.modExample, function (element) {
        var content = '';
        element = $(element);

        content = element.find('.kss-mod-example-content').html();

        promiseIframes.push(app.loadIframe($(element), content));
      });

      $.when.apply(promiseIframes).then(function() {
        if(app.settings.debug) {
          console.log("All Iframes has successfully loaded!");
        }
      });
    };

    App.prototype.windowResizeStart = function () {
      var app = this;

      app.dom.window.on('resize scroll', function () {
        app.sidebarAdjust();
      });

      app.sidebarAdjust();
    };

    App.prototype.sidebarAdjust = function () {
      // Match footer/body height
      var dom = this.dom,
          height = dom.window.width() <= 768 ? 'auto' : Math.max(dom.window.height(), dom.kssMain.height());

      dom.kssMain.height(height);    
      dom.kssNav.height(height);    
    };

    App.prototype.startPrettyPrint = function () {
      // Ensure code blocks are highlighted properly...
      $('pre>code').addClass('prettyprint');
      prettyPrint();
    };

    App.prototype.loadIframe = function (appendTo, content) {
       var app = this,
           deferred = $.Deferred(),
           iframe = $("<iframe />").attr({
             class : 'iframe-content',
             frameborder : 0
           });

       iframe.load(deferred.resolve);
       iframe.appendTo(appendTo);

       deferred.done(function() {
          var contents = iframe.contents(),
              mainContent = {};

          contents.find('head').append('<style type="text/css">' + app.styleKssExample + ' html, body { margin: 0; padding: 0; overflow: hidden; }</style>');
          contents.find('body').append('<div id="main-content">' + content + '</div>');
          
          iframe.height(contents.find('#main-content').height());

          if(app.settings.debug) {
            console.log( "The iframe for " + appendTo.data('name') + ' has successfully loaded');
          }

          app.dom.window.on('resize.iframe', function () {
            iframe.height(contents.find('#main-content').height());
          });
       });

       return deferred.promise();
    }
  
    App.prototype.stateGenerator = function () {
      var idx, idxs, pseudos, replaceRule, rule, stylesheet, _i, _len, _len2, _ref, _ref2;
      pseudos = /(\:hover|\:disabled|\:active|\:visited|\:focus)/g;
      try {
        _ref = document.styleSheets;
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          stylesheet = _ref[_i];
          idxs = [];
          _ref2 = stylesheet.cssRules || [];
          for (idx = 0, _len2 = _ref2.length; idx < _len2; idx++) {
            rule = _ref2[idx];
            if ((rule.type === CSSRule.STYLE_RULE) && pseudos.test(rule.selectorText)) {
              replaceRule = function(matched, stuff) {
                return ".pseudo-class-" + matched.replace(':', '');
              };
              this.insertRule(rule.cssText.replace(pseudos, replaceRule));
            }
          }
        }
      } catch (_error) {console.log(_error.message);}
    }

    App.prototype.insertRule = function(rule) {
      var headEl, styleEl;
      headEl = document.getElementsByTagName('head')[0];
      styleEl = document.createElement('style');
      styleEl.type = 'text/css';
      if (styleEl.styleSheet) {
        styleEl.styleSheet.cssText = rule;
      } else {
        styleEl.appendChild(document.createTextNode(rule));
      }
      return headEl.appendChild(styleEl);
    };

    function loadScript(url, callback) {
        var script = document.createElement("script");
        script.type = "text/javascript";

        if(script.readyState) {
            script.onreadystatechange = function () {
                if (script.readyState == "loaded" ||
                        script.readyState == "complete"){
                    script.onreadystatechange = null;
                    callback();
                }
            };
        } else { 
            script.onload = function () {
                callback();
            };
        }

        script.src = url;
        document.querySelector("head").appendChild(script);
    }

    function _onLoad(functions) {
      var app = this;

      functions.map(function (fn) {
        fn.call(app);
      });
    };

    global[_appName] = function (options) {
      return new App(options);
    };

}(window, document));