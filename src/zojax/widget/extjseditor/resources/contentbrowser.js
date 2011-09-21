// Ext.ux.MediaBrowser
// an media browser for the Ext.ux.HtmlEditorMedia plugin
Ext.ux.ContentBrowser = function(config) {

    // PRIVATE

    // cache data by media name for easy lookup
    var lookup = {};

    // currently selected media data
    var data;

    // this id
    var myid = Ext.id();
    var filterId = Ext.id();
    var sortId = Ext.id();
    var indicatorId = Ext.id();
    var uploadwin;

    // turn indicator on to indicate content list is loading
    var indicatorOn = function() {
  if (Ext.getCmp(myid) && Ext.getCmp(myid).getTopToolbar().items) {
      Ext.getCmp(myid).getTopToolbar().disable();
    }
    };

    // turn indicator off
    var indicatorOff = function() {
  if (Ext.getCmp(myid) && Ext.getCmp(myid).getTopToolbar().items) {
	  Ext.getCmp(myid).getTopToolbar().enable();
    }
    };

    // format loaded media data
    var formatData = function(data) {
    	data.attributes.target='_blank';
    	lookup[data.id] = data;
    	return data;
    };

    var doClick = function(selNode, e) {
  if (selNode) {
	  formatData(selNode);
      data = lookup[selNode.id];
      this.callback(data.attributes);
  } else {
      this.callback({});
  }
    };

    // perform callback to parent function
    var doCallback = function(selNode, e) {
  if (this.callback) {
	  formatData(selNode);
	  data = lookup[selNode.id];
	  this.callback(data.attributes, true);
  }
    };

    // content load exception
    var onLoadException = function(v,o) {
  view.getEl().update('<div style="padding:10px;">Error loading medias.</div>');
    };

  var loader = new Ext.tree.TreeLoader({dataUrl:config.listUrl,
	  requestMethod:'get',
	  listeners: {
	        loadexception: function(tl, node, response) {
	            if (response)
	            	console.log(response)
	        }
	    }});
    // create Ext.DataView to display content items
  var view = new Ext.tree.TreePanel({
  autoHeight: true,
  singleSelect: true,
  cls: "z-media-browser-view",
        overClass: "x-view-over",
  itemSelector: 'div.thumb-wrap',
  emptyText : '<div style="padding:10px;">No medias match the specified filter</div>',
  autoScroll: true,
  loader: loader,
  root: {
      nodeType: 'async',
      text: config.rootTitle,
      draggable: false,
      id: 'root'
 },
  enableDD: false,
  containerScroll: true,
  listeners: {
      'click': {fn: doClick, scope: this},
      'dblclick': {fn: doCallback, scope: this},
      'loadexception': {fn: onLoadException, scope: this},
  },
    });
  view.getLoader().load(view.root);
    // create filter to easily search medias
    var filterView = function() {
  var filter = Ext.getCmp(filterId);
  //view.store.filter('name', filter.getValue());
  };
    
    var sortContent = function(){
        var v = Ext.getCmp(sortId).getValue();
        //view.store.sort(v, v == 'title' ? 'asc' : 'desc');
    }

    // apply additional config values
    Ext.applyIf(config, {
  layout: 'fit',
  frame: false,
  border:  false,
  items: [{
      id: myid,
      autoScroll: true,
      items: [view],
      tbar: ['Filter:', ' ',
       {
                 xtype: 'textfield',
                 id: filterId,
                 selectOnFocus: true,
                 width: 100,
                 listeners: {
               'render': {fn: function() {
                   Ext.getCmp(filterId).getEl().on('keyup', function() {
                 filterView();
                     }, this, {buffer:500});
               }, scope: this}
           }
       }, ' ', '-', {
           text: 'Sort By:'
       }, {
           id: sortId,
           xtype: 'combo',
           typeAhead: true,
           triggerAction: 'all',
           width: 100,
           editable: false,
           mode: 'local',
           displayField: 'desc',
           valueField: 'name',
           lazyInit: false,
           value: 'modified',
           store: new Ext.data.SimpleStore({
               fields: ['name', 'desc'],
               data : [['title', 'Title'],
                       ['modified', 'Last Modified']]
           }),
           listeners: {
               'select': {fn:function(){sortImages()}, scope:this}
           }
       }, ' ', '-']
   }]
    });

    // call Ext.Window constructor passing config
    Ext.ux.ContentBrowser.superclass.constructor.call(this, config);

    // refresh the media list
    this.reset = function() {
  view.getEl().dom.parentNode.scrollTop = 0;
  Ext.getCmp(filterId).reset();
    };
}

// Ext.ux.ContentBrowser
// extension of Ext.Window
Ext.extend(Ext.ux.ContentBrowser, Ext.Panel, {

  // overrides Ext.Window.show
  show: function(animateTarget, cb, scope) {
      // reset view if previously used
      if (this.rendered) {
    this.reset();
      }

      // call Ext.Window.show
      Ext.ux.ContentBrowser.superclass.show.call(this, animateTarget, cb, scope);
  }
});
