// Ext.ux.ImageBrowser
// an image browser for the Ext.ux.HtmlEditorImage plugin
Ext.ux.ImageBrowser = function(config) {

    // PRIVATE

    // cache data by image name for easy lookup
    var lookup = {};

    // currently selected image data
    var data;

    // this id
    var myid = Ext.id();
    var filterId = Ext.id();
    var indicatorId = Ext.id();
    var sortSelectId = Ext.id();

    // turn indicator on to indicate image list is loading
    var indicatorOn = function() {
	if (Ext.getCmp(myid)) {
	    Ext.getCmp(indicatorId).disable();
  	}
    };

    // turn indicator off
    var indicatorOff = function() {
	if (Ext.getCmp(myid)) {
		Ext.getCmp(indicatorId).enable();
  	}
    };

    // format loaded image data
    var formatData = function(data) {
	data.label = (data.title.length > 15)
	    ? data.name.substr(0, 12) + '...' : data.title;
  	data.tip = "Name: " + data.title +
  	    "<br>Dimensions: " + data.width + " x " + data.height +
  	    "<br>Size: " + ((data.size < 1024) ? data.size + " bytes"
  			    : (Math.round(((data.size * 10) / 1024)) / 10) + " KB");
  	if (data.width > data.height) {
  	    if (data.width < 80) {
    		data.thumbwidth = data.width;
    		data.thumbheight = data.height;
  	    } else {
    		data.thumbwidth = 80;
    		data.thumbheight = 80 / data.width * data.height;
    	    }
  	} else {
  	    if (data.height < 80) {
    		data.thumbwidth = data.width;
    		data.thumbheight = data.height;
  	    } else {
    		data.thumbwidth = 80 / data.height * data.width;
    		data.thumbheight = 80;
    	    }
  	}
	data.thumbleft = (Math.round((90 - data.thumbwidth) / 2)) + "px";
	data.thumbtop = "5px";
	data.thumbwidth = Math.round(data.thumbwidth) + "px";
	data.thumbheight = Math.round(data.thumbheight) + "px";
  	lookup[data.name] = data;
  	return data;
    };

    // create the image upload form
    var form = Ext.getBody().createChild({
	tag: 'form',
	cls: 'x-hidden'
    });

    // called if image was uploaded successfully
    var uploadSuccess = function(dialog, filename, response) {
    	indicatorOff();
    	dialog.hide();
    	store.reload({callback: function() {view.select(store.find('name', response.file))}})
    };

    // called if image was not uploaded successfully
    var uploadFailure = function(dialog, filename) {
    	indicatorOff();
    	Ext.MessageBox.alert("Upload Failed", filename);
    };

    // upload a new image file
    var uploadFile = function(record) {
    	indicatorOff();
    	var d = new Ext.ux.UploadDialog.Dialog({url: this.uploadURL, upload_autostart: config.autoUpload});
    	d.on('uploadsuccess', uploadSuccess);
    	d.on('uploadfailed', uploadFailure);
    	d.show();
    };

    // delete an image file
    var deleteImage = function(doDelete) {
	indicatorOn();
	if (doDelete === "yes") {
	    Ext.Ajax.request({
		method: 'post',
		url: this.deleteURL,
		params: "image=" + data.name,
		success: function(response) {
		    indicatorOff();
	 	    this.reset();
		},
		scope: this
	    });
	}
    };

    // confirm if ok to delete image
    var confirmDelete = function() {
	Ext.MessageBox.confirm("Delete Image",
			       "Are you sure that you wish to delete " +
			       data.name + "?", deleteImage, this);
    };

    // create template for image thumbnails
    var thumbTemplate = new Ext.XTemplate(
	'<tpl for=".">',
	'<div class="thumb-wrap" id="{name}">',
	'<div class="thumb"><img src="{preview}" ext:qtip="{tip}" style="top:{thumbtop}; left:{thumbleft}"></div>',
	'<span>{label}</span>',
	'</div>',
	'</tpl>'
    );
    thumbTemplate.compile();

    // create json store for loading image data
    var store = new Ext.data.JsonStore({
	url: config.listURL,
	baseParams:{pw:80, ph:80},
	root: 'images',
	remoteSort:true,
	fields: [
	    'id', 'name', 'title', 'modified',
	    {name: 'width', type: 'float'},
	    {name: 'height', type: 'float'},
	    {name: 'size', type: 'float'},
	    'url', 'preview'
	],
	listeners: {
	    'beforeload': {fn: indicatorOn, scope: this},
	    'load': {fn: function() {indicatorOff()}, scope: this},
	    'loadexception': {fn: indicatorOff, scope: this}
	}
    });
    store.load({            params: {
            // specify params for the first page load if using paging
            start: 0,
            limit: 30
}});

    // called when image selection is changed
    var selectionChanged = function() {
	var selNode = view.getSelectedNodes();
	if (selNode && selNode.length > 0) {
	    selNode = selNode[0];
	    data = lookup[selNode.id];
	    this.callback(data);
	} else {
	    this.callback({});
	}
    };

    // perform callback to parent function
    var doCallback = function() {
	if (this.callback) {
	    this.callback(data, true);
	}
    };

    // image load exception
    var onLoadException = function(v,o) {
	view.getEl().update('<div style="padding:10px;">Error loading images.</div>');
    };

    // create Ext.DataView to display thumbnails
    var view = new Ext.DataView({
	tpl: thumbTemplate,
	autoHeight: true,
	singleSelect: true,
	cls: "z-img-browser-view",
        overClass: "x-view-over",
	itemSelector: 'div.thumb-wrap',
	emptyText : '<div style="padding:10px;">No images match the specified filter</div>',
	store: store,
	listeners: {
	    'selectionchange': {fn: selectionChanged, scope: this, buffer: 100},
	    'dblclick': {fn: doCallback, scope: this},
	    'loadexception': {fn: onLoadException, scope: this},
	    'beforeselect': {fn: function(view) {
		return view.store.getRange().length > 0;
	    }}
	},
	prepareData: formatData.createDelegate(this)
    });

    // create filter to easily search images
    var filterView = function() {
	var filter = Ext.getCmp(filterId);
	var f = [];
	if (filter.getValue())
		f = {property:'name', value:filter.getValue()}
	view.store.filter(f);
	};

    var sortImages = function(){
        var v = Ext.getCmp(sortSelectId).getValue();
        view.store.sort(v, v == 'title' ? 'asc' : 'desc');
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
		   }, ' ', {
	           text: 'Sort By:'
	       }, {
	           id: sortSelectId,
	           xtype: 'combo',
	           lazyRender: true,
	           typeAhead: true,
	           triggerAction: 'all',
	           width: 100,
	           editable: false,
	           mode: 'local',
	           displayField: 'desc',
	           valueField: 'name',
	           lazyInit: false,
	           value: 'modified',
	           ctCls: 'x-bar-filter',
	           store: new Ext.data.SimpleStore({
	               fields: ['name', 'desc'],
	               data : [['title', 'Title'],
	                       ['size', 'File Size'],
	                       ['modified', 'Last Modified']]
	           }),
	           listeners: {
	               'select': {fn:function(){sortImages()}, scope:this}
	           }
	       },'-', {
		       xtype: 'button',
		       iconCls: 'z-img-browser-addimage',
		       text: 'Upload',
		       handler: uploadFile.createDelegate(this),
		       scope: this
		   }, ' ', {
		       iconCls: 'z-img-browser-deleteimage',
		       text:'Delete',
		       handler: confirmDelete,
		       scope: this
		   }, '->', {
		       xtype: 'tbindicator',
		       id: indicatorId,
		       ctCls: 'x-tbar-loading'
		   }, ' '],
		bbar: [new Ext.PagingToolbar({
	           store: store,       // grid and PagingToolbar using same store
	           displayInfo: false,
	           pageSize: 30,
	           prependButtons: true
	       })]
	}]
    });
    // call Ext.Window constructor passing config
    Ext.ux.ImageBrowser.superclass.constructor.call(this, config);

    // refresh the image list
    this.reset = function() {
	view.getEl().dom.parentNode.scrollTop = 0;
	store.reload();
	Ext.getCmp(filterId).reset();
    };
}

// Ext.ux.ImageBrowser
// extension of Ext.Window
Ext.extend(Ext.ux.ImageBrowser, Ext.Panel, {

  // overrides Ext.Window.show
  show: function(animateTarget, cb, scope) {
	  // reset view if previously used
	  if (this.rendered) {
	  this.reset();
      }

      // call Ext.Window.show
      Ext.ux.ImageBrowser.superclass.show.call(this, animateTarget, cb, scope);
  }
});
