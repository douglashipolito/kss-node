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

          contents.find('head').append('<base target="_parent" /><style type="text/css">' + app.styleKssExample + '</style>');
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