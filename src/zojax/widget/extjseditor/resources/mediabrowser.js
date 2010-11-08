// Ext.ux.MediaBrowser
// an media browser for the Ext.ux.HtmlEditorMedia plugin

KalturaProxy = function (conn)
           {
                KalturaProxy.superclass.constructor.call(this);
                Ext.apply(this, conn);
           };

Ext.extend(KalturaProxy, Ext.data.DataProxy, 
{

     ensureSession: function (callback)
     {
        var proxyWrapper = this;
        if (proxyWrapper.kConfig && proxyWrapper.kConfig.ks)
            return callback();
        
        function startSession(){
            proxyWrapper.kConfig = new KalturaConfiguration(parseInt(proxyWrapper.partnerId));
            proxyWrapper.kConfig.serviceUrl = proxyWrapper.serviceUrl;
            proxyWrapper.kConfig.serviceBase = proxyWrapper.serviceBase;
            proxyWrapper.kClient = new KalturaClient(proxyWrapper.kConfig);
            proxyWrapper.kClient.session.start(sessionStarted, proxyWrapper.secret, proxyWrapper.kalturaUserId, proxyWrapper.sessionType);
        }
        function sessionStarted(success, data) {
            if (!success)
                return proxyWrapper.handleErrorResponse(data);
            proxyWrapper.kClient.setKs(data);
            return callback()
        }
        startSession();

     },
    
     load : function (params, reader, callback, scope, arg)
            {
               var userContext = {
                                    callback: callback, 
                                    reader: reader, 
                                    arg: arg, 
                                    scope: scope
                                 };
               var proxyWrapper = this;

               var kalturaCallback = function(success, data) 
                { 
                   if (!success)
                       return proxyWrapper.handleErrorResponse(data, userContext)
                   proxyWrapper.loadResponse(data, userContext); 
                }
                   
               function listEntries(start, limit, filterKey, filterValue, orderBy, success, error) {
                   var entryFilter = new KalturaBaseEntryFilter();
                   if (filterKey && filterKey != '' && filterValue != '')
                       entryFilter[filterKey] = filterValue;
                   entryFilter.statusEqual = KalturaEntryStatus.READY;
                   if (orderBy)
                       entryFilter.orderBy = orderBy;
                   entryFilter.typeIn = KalturaEntryType.MEDIA_CLIP;
                   var kalturaPager = new KalturaFilterPager();
                   if (limit) {
                       kalturaPager.pageSize = limit;
                       if (start)
                           kalturaPager.pageIndex = start/limit + 1;
                   }
                   proxyWrapper.kClient.media.listAction(kalturaCallback, entryFilter, kalturaPager);
               }
               
               this.ensureSession(function() {
                   //Handles the response we get back from the web service call
                   listEntries(params.start, params.limit, params.filterKey, params.filterValue, (params.dir == 'ASC') ? '':'-' + params.sort )
               })
            },
            
     handleErrorResponse : function(response, userContext)
                           {
                              alert("Error while calling web service method:" + $.toJSON(response));
                           },
 
     loadResponse : function (response, userContext, methodName)
                    {
                        var result = userContext.reader.readRecords(response);
                        userContext.callback.call(userContext.scope, result, userContext.arg, true);
                    }
        
}); 

Ext.ux.MediaBrowser = function(config) {

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

    // turn indicator on to indicate media list is loading
    var indicatorOn = function() {
  if (Ext.getCmp(myid) && Ext.getCmp(myid).getTopToolbar().items) {
      Ext.getCmp(myid).getTopToolbar().items.map.indicator.disable();
    }
    };

    // turn indicator off
    var indicatorOff = function() {
  if (Ext.getCmp(myid) && Ext.getCmp(myid).getTopToolbar().items) {
      Ext.getCmp(myid).getTopToolbar().items.map.indicator.enable();
    }
    };

    // format loaded media data
    var formatData = function(data) {
  data.label = (data.title.length > 15)
      ? data.name.substr(0, 12) + '...' : data.title;
    data.tip = "Title: " + data.title +
        "<br/>Description: " + data.alt +
        "<br/>Dimensions: " + data.width + " x " + data.height +
        "<br/>Size: " + ((data.size < 1024) ? data.size + " bytes"
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

    // create the media upload form
    var form = Ext.getBody().createChild({
  tag: 'form',
  cls: 'x-hidden'
    });

    // called if media was uploaded successfully
    var uploadSuccess = function(frm, response) {
  indicatorOff();
  var response = Ext.util.JSON.decode(response.response.responseText);
  if (response.success == 'true') {
      frm.reset();
      this.reset();
      view.refresh();
      view.select(response.file);
      uploadwin.hide();
  } else {
      Ext.MessageBox.alert("Upload Error", response.message + ' ' + response.success);
  }
    };

    // called if media was not uploaded successfully
    var uploadFailure = function(frm, response) {
	indicatorOff();
	var response = Ext.util.JSON.decode(response.response.responseText);
	Ext.MessageBox.alert("Upload Failed", response.responseText);
    };

    var uploadFileForm = function(record) {
    var fp = new Ext.FormPanel({
        fileUpload: true,
        autowidth: true,
        frame: true,
        title: 'Media Upload Form',
        autoHeight: true,
        bodyStyle: 'padding: 10px 10px 0 10px;',
        labelWidth: 80,
        defaults: {
            anchor: '95%',
            allowBlank: false,
            msgTarget: 'side'
        },
        items: [{
            xtype: 'textfield',
            fieldLabel: 'Title',
            name: 'title'
        },{
            xtype: 'textfield',
            fieldLabel: 'Description',
            allowBlank: true,
            name: 'description'
        },{
            xtype: 'combo',
            store: $.fn.media.defaults.types,
            fieldLabel: 'Media Type',
            allowBlank: true,
            name: 'type',
            forceSelection: true,
            disableKeyFilter: true
        },{
            xtype: 'checkbox',
            fieldLabel: 'Autoplay',
            checked: true,
            name: 'autoplay'
        },{
            xtype: 'fileuploadfield',
            id: 'form-file',
            emptyText: 'Select a media',
            fieldLabel: 'Media',
            name: 'image',
            buttonCfg: {
                text: '',
                iconCls: 'upload-icon'
            }
        }],
        buttons: [{
            text: 'Save',
            scope:this,
            handler: function(){
                if(fp.getForm().isValid()){
                    fp.getForm().submit({
                        url: config.uploadURL,
			waitMsg: 'Uploading your media...',
			success: uploadSuccess.createDelegate(this),
                        failure: uploadFailure.createDelegate(this),
                        score: this
                    });
		    
                }}},{
		    text: 'Reset',
		    scope: this,
		    handler: function(){
			fp.getForm().reset();
                    }
                },{
		    text: 'Cancel',
		    scope: this,
		    handler: function(){
			uploadwin.hide();
                    }
                }]
    });
    if (!uploadwin)
        uploadwin = new Ext.Window({
	    title: 'Upload Media',
	    closable: true,
            modal: true,
	    closeAction: 'hide',
	    width: 460,
	    height: 350,
	    plain: true,
	    layout: 'fit',
	    border: false,
	    items: fp});
	uploadwin.show(this);
  };


    // delete an media file
    var deleteMedia = function(doDelete) {
  indicatorOn();
  if (doDelete === "yes") {
      Ext.Ajax.request({
    method: 'post',
    url: this.deleteURL,
    params: "media=" + data.name,
    success: function(response) {
        indicatorOff();
         this.reset();
    },
    scope: this
      });
  }
    };

    // confirm if ok to delete media
    var confirmDelete = function() {
  Ext.MessageBox.confirm("Delete Media",
             "Are you sure that you wish to delete " +
             data.name + "?", deleteMedia, this);
    };

    // create template for media thumbnails
    var thumbTemplate = new Ext.XTemplate(
  '<tpl for=".">',
  '<div class="thumb-wrap" id="{name}">',
  '<div class="thumb" ext:qtip="{tip}"><img src="{preview}" style="top:{thumbtop}; left:{thumbleft}; width:{thumbwidth}; height:{thumbheight}" /></div>',
  '<span>{label}</span>',
  '</div>',
  '</tpl>'
    );
    thumbTemplate.compile();

    // create json store for loading media data
    var store;
    if (config.listURL) {
     store = new Ext.data.JsonStore({
      url: config.listURL + '?pw=80&ph=80',
      root: 'medias',
      autoLoad: false,
      fields: [
               'id', 'name', 'title','description','type', 'autoplay',
               'modified',
          {name: 'width', type: 'float', defaultValue: 320},
          {name: 'height', type: 'float', defaultValue: 240},
          {name: 'size', type: 'float'},
          'url', 'preview'
      ],
      listeners: {
          'beforeload': {fn: indicatorOn, scope: this},
          'load': {fn: function() {indicatorOff(); sortImages()}, scope: this},
          'loadexception': {fn: indicatorOff, scope: this}
      }
        });
     store.load();

    }
    else if (config.apiURL) {
        store = new Ext.data.JsonStore({
            url: config.apiURL + 'browseFiles.php',
            root: 'images',
            autoLoad: false,
            fields: [
                     {name:'id', mapping:'name'}, 
                     'name', {name:'title', mapping:'name'},
                     {name:'description', mapping:'name'},
                     {name:'type', defaultValue:'flv'},
                     {name:'autoplay', defaultValue: false},
                     {name:'modified', mapping:'lastmod'},
                {name: 'width', type: 'float', defaultValue: 320},
                {name: 'height', type: 'float', defaultValue: 240},
                {name: 'size', type: 'float'},
                {name:'url', mapping:'flv'}, {name:'preview', mapping:'url'}
            ],
            listeners: {
                'beforeload': {fn: indicatorOn, scope: this},
                'load': {fn: function() {indicatorOff(); sortImages()}, scope: this},
                'loadexception': {fn: indicatorOff, scope: this}
            }
              });
        store.load();

    }
    else if (config.kaltura.partnerId && config.kaltura.adminSecret) {
        
        store = new Ext.data.JsonStore({
            proxy: new KalturaProxy({partnerId: config.kaltura.partnerId,
                                 secret: config.kaltura.adminSecret,
                                 serviceUrl: config.kaltura.serviceUrl,
                                 serviceBase: config.kaltura.serviceBase,
                                 sessionType: KalturaSessionType.ADMIN
                                }),
            idProperty: 'id',
            root: 'objects',
            autoLoad: false,
            fields: ['id', 
                     'name', 
                     {name:'title', mapping:'name'},
                     {name:'description', defaultValue:''},
                     {name:'type', mapping:'dummy', defaultValue:'flv'},
                     {name:'autoplay', defaultValue: false},
                     {name:'modified', mapping:'lastmod'},
                {name: 'width', type: 'float', defaultValue: 320},
                {name: 'height', type: 'float', defaultValue: 240},
                {name: 'size', type: 'float', mapping: 'duration'},
                {name:'url', mapping:'dataUrl'}, {name:'preview', mapping:'thumbnailUrl'}
            ],
            listeners: {
                'beforeload': {fn: indicatorOn, scope: this},
                'load': {fn: function() {indicatorOff(); sortImages()}, scope: this},
                'loadexception': {fn: indicatorOff, scope: this}
            }
              });
        store.load({
            params: {
            // specify params for the first page load if using paging
            start: 0,          
            limit: 30
        }
    })
    }

    // called when media selection is changed
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

    // media load exception
    var onLoadException = function(v,o) {
  view.getEl().update('<div style="padding:10px;">Error loading medias.</div>');
    };

    // create Ext.DataView to display thumbnails
    var view = new Ext.DataView({
  tpl: thumbTemplate,
  autoHeight: true,
  singleSelect: true,
  cls: "z-media-browser-view",
        overClass: "x-view-over",
  itemSelector: 'div.thumb-wrap',
  emptyText : '<div style="padding:10px;">No medias match the specified filter</div>',
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

    // create filter to easily search medias
    var filterView = function() {
  var filter = Ext.getCmp(filterId);
  if (typeof view.store.proxy== 'object' && view.store.proxy.constructor == KalturaProxy) {
      view.store.load({params:{filterKey:'searchTextMatchAnd', filterValue:filter.getValue(),
                               start: 0,          
                               limit: 30}});
  }
  else {
  view.store.filter('name', filter.getValue());
  }  
  };
    
    var sortImages = function(){
        var v = Ext.getCmp(sortId).getValue();
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
                       ['size', 'File Size'],
                       ['modified', 'Last Modified']]
           }),
           listeners: {
               'select': {fn:function(){sortImages()}, scope:this}
           }
       }, new Ext.PagingToolbar({
           store: store,       // grid and PagingToolbar using same store
           displayInfo: false,
           pageSize: 30,
           prependButtons: true,
       }), ' ', '-'].concat((config.uploadURL ? [{
           xtype: 'button',
           iconCls: 'z-media-browser-addmedia',
           text: 'Upload',
           handler: uploadFileForm.createDelegate(this),
           scope: this
       }, {
           iconCls: 'z-media-browser-deletemedia',
           text:'Delete',
           handler: confirmDelete,
           scope: this
       }] : []),['->', {
           xtype: 'tbindicator',
           id: indicatorId
       }, ' '])
   }]
    });

    // call Ext.Window constructor passing config
    Ext.ux.MediaBrowser.superclass.constructor.call(this, config);

    // refresh the media list
    this.reset = function() {
  view.getEl().dom.parentNode.scrollTop = 0;
  store.reload();
  Ext.getCmp(filterId).reset();
    };
}

// Ext.ux.MediaBrowser
// extension of Ext.Window
Ext.extend(Ext.ux.MediaBrowser, Ext.Panel, {

  // overrides Ext.Window.show
  show: function(animateTarget, cb, scope) {
      // reset view if previously used
      if (this.rendered) {
    this.reset();
      }

      // call Ext.Window.show
      Ext.ux.MediaBrowser.superclass.show.call(this, animateTarget, cb, scope);
  }
});
