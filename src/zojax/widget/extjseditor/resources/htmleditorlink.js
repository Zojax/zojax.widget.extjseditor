// Ext.ux.HTMLEditorLink
// a plugin to handle links in the Ext.ux.HtmlEditor
Ext.ux.HTMLEditorLink = function(config) {

    // pointer to Ext.ux.HTMLEditor
    var editor;

    // pointer to Ext.Window
    var win;

    // pointer to Ext.FormPanel
    var linkUrl;
    
    var contentBrowserSite;
    var baseUrl = config.contentUrl;

    // return the selected link (if an link is selected)
    var getSelectedLink = function() {
  if (Ext.isIE) {
      // ie specific code
      return function() {
    var selection = editor.doc.selection;
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

    // set link details to data passed from link browser
    var setLinkDetails = function(data, insert) {
    	linkUrl.form.findField('src').setValue(data.url);
  linkUrl.form.findField('alt').setValue(data.description);
  linkUrl.form.findField('title').setValue(data.text);
  linkUrl.form.findField('target').setValue(data.target);
  sourceChanged();

  if (insert) {
      win.hide();
      insertLink();
  }
    };
    
    var getSelection = function() {
     
        if (Ext.isIE) {
            // ie-specific code
          var selection = editor.doc.selection;
          var range = selection.createRange();
          return range.text
        }
        else {
            var selection = editor.win.getSelection();
            return selection.getRangeAt(0)
        }
    }

    // create new link node from link details
    var createLink = function() {
  var thumbTemplate = new Ext.XTemplate(
      '<tpl>',
      '<a href="{src}" class="z-link" title="{alt}" target="{target}">',
      '{label}',
      '</a>',
      '</tpl>'
        );
  thumbTemplate.compile();
  var element = editor.win.document.createElement("span");
  element.innerHTML = thumbTemplate.apply(
      {'label': linkUrl.form.findField('title').getValue() || linkUrl.form.findField('src').getValue(),
       'alt': linkUrl.form.findField('alt').getValue(),
       'src': linkUrl.form.findField('src').getValue(),
       'target': linkUrl.form.findField('target').getValue()
      });
  return element;
    }

    // insert the link into the editor (browser-specific)
    var insertLinkByBrowser = function() {
  if (Ext.isIE) {
      // ie-specific code
      return function() {
    // get selected text/range
    var selection = editor.doc.selection;
    var range = selection.createRange();

    // insert the link over the selected text/range
    range.pasteHTML(createLink().outerHTML);
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

    // insert the link
    selection.getRangeAt(0).insertNode(createLink());
      };
  }
    }();

    // insert the link into the editor
    var insertLink = function() {
  // focus on the editor to regain selection
  editor.win.focus();

  // insert the link
  insertLinkByBrowser();

  // perform required toolbar operations
  editor.updateToolbar();
  editor.deferFocus();
    };

    // enable insert button when link source has been entered
    var sourceChanged = function() {
  var disabled = (linkUrl.form.findField('src').getValue() == "");
  Ext.getCmp('insert-btn').setDisabled(disabled);
    };

    // open/show the link details window
    var openLinkWindow = function() {
  if (!win) {
      // create Ext.FormPanel if not previously created
      linkUrl = new Ext.FormPanel({
    title: 'Insert link',
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
      fieldLabel: 'URL',
      name: 'src',
      value: 'http://',
      allowBlank: false,
      listeners: {
          'change': {fn: sourceChanged, scope: this}
      }
        }, {
      xtype: 'textfield',
      fieldLabel: 'Title',
      name: 'title',
      emptyText: 'Enter link title'
        }, {
      xtype: 'textfield',
      fieldLabel: 'Description',
      emptyText: 'Enter link description',
      name: 'alt'
        }, {
            xtype: 'combo',
            displayField:'name',
            valueField:'id',
            store: new Ext.data.SimpleStore({
                 fields:['id', 'name'],
                 data:[['_self', 'Current window'], ['_blank', 'New window']]
            }),
            triggerAction:'all',
            mode:'local',
            fieldLabel: 'Target',
            forceSelection: true,
            value: '_blank',
            disableKeyFilter: true,
            allowBlank: false,
            name: 'target'
              }]
    }
      });

      if (baseUrl) {
    	    contentBrowserSite = new Ext.ux.ContentBrowser({
    	              frame: false,
    	              border: false,
    	              autoWidth: true,
    	              title: 'Contents',

    	              // medias api
    	              listUrl: baseUrl + 'listing',
    	              // set the callback from the content browser
    	              callback: setLinkDetails
    	    });
    	      }


      var items = [];
      if (contentBrowserSite) {items[items.length] = contentBrowserSite;}
      items[items.length] = linkUrl;

      var tabs = new Ext.TabPanel({
    margins: '3 3 3 0',
    activeTab: 0,
    layoutOnTabChange: true,
    items: items
      });

      // create Ext.Window if not previously created
      win = new Ext.Window({
    title: 'Insert/Edit Link',
    closable: true,
          modal: true,
    closeAction: 'hide',
    width: 460,
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
      if (linkUrl.form.isValid()) {
          win.hide();
          insertLink();
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
      linkUrl.show();
      linkUrl.form.reset();
      var element = getSelectedLink();
      if (element) {
          // still working on this!!!
          // need to fix link source as it is changed
          // from a relative url to an absolute url
          var $el = $(element);
          linkUrl.form.findField('src').setValue(element.src);
          linkUrl.form.findField('alt').setValue(element.alt);
          linkUrl.form.findField('title').setValue(element.title);
          linkUrl.form.findField('target').setValue(element.target);
      }
      else {
          var selection = getSelection();
          if (selection) {
              linkUrl.form.findField('title').setValue(selection);
          }
      }
            }
        }
      });
  }

  // show the window
  win.show(this);
  	linkUrl.form.findField('src').focus();
    }

    // PUBLIC
    return {
  init: function(htmlEditor) {
      editor = htmlEditor;

      // append the insert link icon to the toolbar
      editor.tb.insertToolsBefore('insertorderedlist', {
    itemId: 'link',
    cls: 'x-btn-icon x-edit-link',
    handler: openLinkWindow,
    scope: this,
    clickEvent: 'mousedown',
    tooltip: {
        title: 'Link',
        text: 'Insert/edit a link.',
        cls: 'x-html-editor-tip'
    }
      });
  }
    }
}

