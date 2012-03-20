// Ext.ux.HTMLEditorMedia
// a plugin to handle medias in the Ext.ux.HtmlEditor
Ext.ux.HTMLEditorMedia = function(config) {

    // pointer to Ext.ux.HTMLEditor
    var editor;

    // base urls
    var baseUrl1 = config.mediaUrl1;
    var baseUrl2 = config.mediaUrl2;
    var mediaAPIUrl = config.mediaAPIUrl;
    
    // pointer to Ext.Window
    var win;

    // pointer to Ext.FormPanel
    var mediaUrl;

    // pointer to Ext.ux.MediaBrowser
    var mediaBrowserSite;
    var mediaBrowserDocument;
    var mediaBrowserAPI;
    var mediaBrowserKaltura;
    var mediaBrowserWistia;

    // other private variables
    var constrained = false;
    var originalWidth = 0;
    var originalHeight = 0;

    // return the selected media (if an media is selected)
    var getSelectedMedia = function() {
  if (Ext.isIE) {
      // ie specific code
      return function() {
          var doc = editor.getDoc();
          var selection = doc.selection;
        if (selection.type == "Control") {
            var element = selection.createRange()(0);
            if (element.nodeName.toLowerCase() == 'a') {
          return element;
            }
        }
        return null;
      }
  } else {
      // firefox specific code
      return function() {
    var selection = editor.win.getSelection();
    if (selection.focusOffset == selection.anchorOffset + 1) {
        var element = selection.focusNode.childNodes[selection.focusOffset - 1];
        if (element.nodeName.toLowerCase() == 'a') {
      return element;
        }
    }
    return null;
      }
  }
    }();

    // set media details to data passed from media browser
    var setMediaDetails = function(data, insert) {
  mediaUrl.form.reset();
  mediaUrl.form.findField('src').setValue(data.url);
  mediaUrl.form.findField('alt').setValue(data.description);
  mediaUrl.form.findField('title').setValue(data.title);
  if (data.width)
      mediaUrl.form.findField('width').setValue(data.width);
  if (data.height)
      mediaUrl.form.findField('height').setValue(data.height);
  mediaUrl.form.findField('type').setValue(data.type);
  mediaUrl.form.findField('preview').setValue(data.preview);
  mediaUrl.form.findField('constrain').setValue(true);
  mediaUrl.form.findField('embed').setValue(data.embed);
  mediaUrl.form.findField('id').setValue(data.media_id);
  sourceChanged();

  if (insert) {
      win.hide();
      insertMedia();
  }
    };

    // create new media node from media details
    var createMedia = function() {
      var thumbTemplate = new Ext.XTemplate(
          '<tpl for=".">',
          '<div class="inline-thumb-wrap">',
          '<div class="thumb">',
          '<a href="{src}" class="z-media {width: \'{width}\', height: \'{height}\', type: \'{type}\', preview: \'{preview}\', autoplay: {autoplay}, params:{allowfullscreen: true}, flashvars: {type: \'{type}\', config: \'{config}\', autostart: \'{autoplay}\'}}">',
          '<img alt="{alt}" src="{preview}" />',
          '<span>{label}</span>',
          '</a>',
          '</div>',
          '</div>',
          '</tpl>',
          {
              compiled: true,      // compile immediately

              disableFormats: true // reduce apply time since no formatting
          }
          );
        var wistiaTemplate = new Ext.XTemplate(
            '<tpl for=".">',
            '<div class="inline-thumb-wrap">',
            '<div class="thumb">',
            '<a href="{src}" class="z-media {width: \'{width}\', height: \'{height}\', type: \'{type}\', preview: \'{preview}\', autoplay: {autoplay}, params:{allowfullscreen: true}, flashvars: {autoPlay: \'{autoplay}\', stillUrl: \'{stillUrl}\', accountKey: \'{accountKey}\', mediaID: \'wistia-production_{mediaID}\', embedServiceURL: \'{embedServiceURL}\', mediaDuration: \'{mediaDuration}\' }}">',
            '<img alt="{alt}" src="{preview}" />',
            '<span>{label}</span>',
            '</a>',
            '</div>',
            '</div>',
            '</tpl>',
            {
                compiled: true,      // compile immediately

                disableFormats: true // reduce apply time since no formatting
            }
        );

  var element = editor.win.document.createElement("div");
    var wistia = mediaUrl.form.findField('type').getValue().startsWith("wistia");
    var embed = mediaUrl.form.findField('embed').getValue() || "", accountKey = "";
    var embedServiceURL = "", stillUrl = "", mediaDuration = "";

    function getUrlParam(text, param) {
        var matchObj = text.match(RegExp("[?|&]"+param+"=(.*?)[&|$|\'|\"]"));
        if (matchObj != null)
            return matchObj[1]
        else
            return ""
    }

    if (wistia)
        template = wistiaTemplate;
    else
        template = thumbTemplate;

    element.innerHTML = template.apply(
      {'label': mediaUrl.form.findField('title').getValue(),
       'alt': mediaUrl.form.findField('alt').getValue(),
       'preview': mediaUrl.form.findField('preview').getValue(),
       'src': mediaUrl.form.findField('src').getValue(),
       'config': "{\\\'clip\\\': {\\\'url\\\':\\\'"+encodeURI(mediaUrl.form.findField('src').getValue())+"\\\', \\\'autoPlay\\\': "+mediaUrl.form.findField('autoplay').getValue()+", \\\'autoBuffering\\\': true } }",
       'width': mediaUrl.form.findField('width').getValue(),
       'height': mediaUrl.form.findField('height').getValue(),
       'type': mediaUrl.form.findField('type').getValue(),
       'mediaID': mediaUrl.form.findField('id').getValue(),
       'accountKey': getUrlParam(embed,"accountKey"),
       'embedServiceURL': getUrlParam(embed,"embedServiceURL"),
       'stillUrl': getUrlParam(embed,"stillUrl"),
       'mediaDuration': getUrlParam(embed,"mediaDuration"),
       'autoplay': mediaUrl.form.findField('autoplay').getValue()});
  return element;
    }

    // insert the media into the editor (browser-specific)
    var insertMediaByBrowser = function() {
  if (Ext.isIE) {
      // ie-specific code
      return function() {
    // get selected text/range
    var doc = editor.getDoc();
    var selection = doc.selection;
    var range = selection.createRange();

    // insert the media over the selected text/range
    range.pasteHTML(createMedia().outerHTML);
      };
  } else {
      // firefox-specific code
      return function() {
    // get selected text/range
    var selection = editor.win.getSelection();

    // delete selected text/range
    if (!selection.isCollapsed) {
        selection.deleteFromDocument();
    }

    // insert the media
    selection.getRangeAt(0).insertNode(createMedia());
      };
  }
    }();

    // insert the media into the editor
    var insertMedia = function() {
  // focus on the editor to regain selection
  editor.win.focus();

  // insert the media
  insertMediaByBrowser();

  // perform required toolbar operations
  editor.updateToolbar();
  editor.deferFocus();
    };

    // enable insert button when media source has been entered
    var sourceChanged = function() {
  var disabled = (mediaUrl.form.findField('src').getValue() == "");
  Ext.getCmp('insert-btn').setDisabled(disabled);
    };

    // if constraining size ratio then adjust height if width changed
    var widthChanged = function() {
  if (constrained) {
      mediaUrl.form.findField('height').setValue(
    Math.round(mediaUrl.form.findField('width').getValue()
         / originalWidth * originalHeight)
      );
  }
    };

    // if constraining size ratio then adjust width if height changed
    var heightChanged = function() {
  if (constrained) {
      mediaUrl.form.findField('width').setValue(
    Math.round(mediaUrl.form.findField('height').getValue()
         / originalHeight * originalWidth)
      );
  }
    };

    // record original media size when constrain is checked
    var constrain = function(checkbox, checked) {
  constrained = checked;
  if (constrained) {
      originalWidth = mediaUrl.form.findField('width').getValue();
      originalHeight = mediaUrl.form.findField('height').getValue();
      if (!originalWidth || !originalHeight) {
    checkbox.setValue(false);
      }
  }
    };

    // open/show the media details window
    var openMediaWindow = function() {
  if (!win) {
      // create Ext.FormPanel if not previously created
      mediaUrl = new Ext.FormPanel({
    title: 'Insert url',
    frame: false,
    header: false,
    border: false,
    autoScroll: true,
    items: {
        xtype: 'fieldset',
        border: false,
        autoWidth: true,
        autoHeight: true,
        bodyStyle: 'padding: 5px',
        items: [{
      xtype: 'textfield',
      fieldLabel: 'Source',
      name: 'src',
      allowBlank: false,
      listeners: {
          'change': {fn: sourceChanged, scope: this}
      }
        }, {
      xtype: 'textfield',
      fieldLabel: 'Preview',
      name: 'preview',
      allowBlank: false
        }, {
      xtype: 'textfield',
      fieldLabel: 'Title',
      name: 'title'
        }, {
      xtype: 'textfield',
      fieldLabel: 'Description',
      name: 'alt'
        }, {
      xtype: 'combo',
      store:$.fn.media.defaults.types,
      fieldLabel: 'Type',
      forceSelection: true,
      disableKeyFilter: true,
      name: 'type'
        }, {
      xtype: "checkbox",
      fieldLabel: "Autoplay",
      name: 'autoplay',
      checked: true
        },
        {
            xtype: 'textarea',
            fieldLabel: 'EmbedCode',
            name: 'embed',
            allowBlank: true
        },
        {
            xtype: 'hidden',
            name: 'id',
            allowBlank: false
        },
        {
      layout: "column",
      autoWidth: true,
      border: false,
      defaults: {layout: 'form', border: false},
      hideLabel: true,
      items: [{
          items: [{
        xtype: "numberfield",
        fieldLabel: 'Dimensions',
        name: 'width',
        value: '300',
        width: 50,
        allowBlank: false,
        allowDecimals: false,
        allowNegative: false,
        listeners: {
            'change': {fn: widthChanged, scope: this}
        }
          }]
      }, {
          items: [{
        xtype: "statictextfield",
        submitValue: false,
        hideLabel: true,
        value: 'x'
          }]
      }, {
          items: [{
        xtype: "numberfield",
        hideLabel: true,
        name: 'height',
        value: '200',
        allowBlank: false,
        width: 50,
        allowDecimals: false,
        allowNegative: false,
        listeners: {
            'change': {fn: heightChanged, scope: this}
        }
          }]
      }, {
          items: [{
        xtype: "statictextfield",
        hideLabel: true,
        value: '',
        width: 15
          }]
      }]
        }, {
      xtype: "checkbox",
      fieldLabel: "Constrain Proportions",
      name: 'constrain',
      checked: false,
      listeners: {
          'check': {fn: constrain, scope: this}
      }
        }]
    }
      });

      if (baseUrl2) {
    mediaBrowserSite = new Ext.ux.MediaBrowser({
              frame: false,
              border: false,
              autoWidth: true,
              title: 'My media',

              // medias api
              listURL: baseUrl2 + 'listing',
              uploadURL: baseUrl2 + 'upload',
              deleteURL: baseUrl2 + 'remove',

              // set the callback from the media browser
              callback: setMediaDetails
    });
      }

      if (baseUrl1) {
    mediaBrowserDocument = new Ext.ux.MediaBrowser({
              frame: false,
              border: false,
              autoWidth: true,
              title: 'Document media',

              // medias api
              listURL: baseUrl1 + 'listing',
              uploadURL: baseUrl1 + 'upload',
              deleteURL: baseUrl1 + 'remove',

              // set the callback from the media browser
              callback: setMediaDetails
    });
      }
      
      if (mediaAPIUrl) {
          mediaBrowserAPI = new Ext.ux.MediaBrowser({
                    frame: false,
                    border: false,
                    autoWidth: true,
                    title: 'External media',

                    // medias api
                    apiURL: mediaAPIUrl,
                    // set the callback from the media browser
                    callback: setMediaDetails
          });
      }

      if (config.kaltura.partnerId && config.kaltura.adminSecret && typeof KalturaSessionType != "undefined"
          ) {
          mediaBrowserKaltura = new Ext.ux.MediaBrowser({
                    frame: false,
                    border: false,
                    autoWidth: true,
                    title: 'Kaltura media',

                    // kaltura settings
                    kaltura: config.kaltura,
                    // set the callback from the media browser
                    callback: setMediaDetails
          });
      }

      if (config.wistia ) {
          mediaBrowserWistia = new Ext.ux.MediaBrowser({
              frame: false,
              border: false,
              autoWidth: true,
              title: 'Wistia media',

              // kaltura settings
              wistia: config.wistia,
              // set the callback from the media browser
              callback: setMediaDetails
          });
      }


      var items = [];
      if (mediaBrowserSite) {items[items.length] = mediaBrowserSite;}
      if (mediaBrowserDocument) {items[items.length] = mediaBrowserDocument;}
      if (mediaBrowserAPI) {items[items.length] = mediaBrowserAPI;}
      if (mediaBrowserKaltura) {items[items.length] = mediaBrowserKaltura;}
      if (mediaBrowserWistia) {items[items.length] = mediaBrowserWistia;}
      items[items.length] = mediaUrl;

      var tabs = new Ext.TabPanel({
    margins: '3 3 3 0',
    activeTab: 0,
    layoutOnTabChange: true,
    items: items
      });

      // create Ext.Window if not previously created
      win = new Ext.Window({
    title: 'Insert/Edit Media',
    closable: true,
          modal: true,
    closeAction: 'hide',
    width: 600,
    height: 350,
    plain: true,
    layout: 'fit',
    border: false,
    items: tabs,
    buttons: [{
              text: 'Insert',
              id: 'insert-btn',
              disabled: true,
              handler: function() {
        tabs.activate(items.length-1);
        if (mediaUrl.form.isValid()) {
        win.hide();
        insertMedia()
        }
              }
    }, {
              text: 'Close',
              handler: function() {
      win.hide();
              }
    }],
          listeners: {
              'show': function() {
      mediaUrl.show();
      mediaUrl.form.reset();
      var element = getSelectedMedia();
      if (element) {
          // still working on this!!!
          // need to fix media source as it is changed
          // from a relative url to an absolute url
          var $el = $(element);
          var meta = $.metadata ? $el.metadata() : $.meta ? $el.data() : {};
          mediaUrl.form.findField('src').setValue(element.src);
          mediaUrl.form.findField('alt').setValue(element.alt);
          mediaUrl.form.findField('title').setValue(element.title);
          mediaUrl.form.findField('width').setValue(meta.width);
          mediaUrl.form.findField('height').setValue(meta.height);
          mediaUrl.form.findField('type').setValue(meta.type);
          mediaUrl.form.findField('constrain').setValue(true)
          mediaUrl.form.findField('preview').setValue(meta.preview);
      }
      if (mediaBrowserDocument) {mediaBrowserDocument.show();}
      if (mediaBrowserSite) {mediaBrowserSite.show();}
            }
        }
      });
  }

  // show the window
  win.show(this);
    }

    // PUBLIC
    return {
  init: function(htmlEditor) {
      editor = htmlEditor;
      editor.on('render', this.onRender, this);
  },
  onRender: function() {
      // append the insert media icon to the toolbar
	  var btn = editor.getToolbar().addButton({
    itemId: 'media',
    cls: 'x-btn-icon x-edit-media',
    handler: openMediaWindow,
    scope: this,
    clickEvent: 'mousedown',
    tooltip: {
        title: 'Media',
        text: 'Insert/edit a media.',
        cls: 'x-html-editor-tip'
    }
      });
  }
    }
}

