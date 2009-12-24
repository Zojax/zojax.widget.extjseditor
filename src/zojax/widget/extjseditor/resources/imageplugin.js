Ext.namespace('Ext.ux', 'Ext.ux.plugins');

Ext.ux.plugins.HtmlEditorImageInsert = function(config) {

    config = config || {};

    Ext.apply(this, config);

    this.init = function(htmlEditor) {
        this.editor = htmlEditor;
        this.editor.on('render', onRender, this);
    };

    this.imageInsert = function() {
	var range;
	if (Ext.isIE)
	    range = this.editor.doc.selection.createRange();

	var images = new Ext.data.Store({
            proxy: new Ext.data.HttpProxy({
                url: 'getImages.php',
                method: 'POST'
            }),
	    reader:  new Ext.data.JsonReader({
		totalProperty: 'total',
		root: 'data',
		id: 'id',
		fields: ['id','name','caption','ext','fullname']
	    })
	});
        images.load();

        var imagesGrid = new Ext.grid.GridPanel({
            store: images, // use the datasource

            cm: new Ext.grid.ColumnModel([
        	{id: 'fullname',
		 header: "Picture",
		 sortable: true, 
		 dataIndex: 'fullname',
		 width: 50,
		 renderer: renderImages},
		{id: 'name',
		 header: "Name",
		 sortable: true,
		 dataIndex: 'name'},
		{id:'caption',
		 header: "Caption",
		 sortable: true,
		 dataIndex: 'caption'}
            ]),
            viewConfig: {
        	forceFit:true
            },
	    
            //plugins: expander,
            collapsible: true,
            animCollapse: false,
	    scope: this,
            height:300,
            width:600,
            stripeRows:true,
            title:'Images',
            iconCls:'icon-grid',
            autoScroll: true
	});
        	    
        imagesGrid.on("rowclick", function (imagesGrid, row, e) {
            var record = imagesGrid.getStore ().getAt (row);
            
            var id = record.get ("id");
            var name = record.get ("name");
            var ext = record.get ("ext");
	    var fullname = record.get ("fullname");
	    
	    if (Ext.isIE)
		range.select();
	    this.editor.relayCmd('insertimage', fullname);
	    
	    window.close();
        }, this);

        var window = new Ext.Window({
            title: '',
            width: 600,
            height:400,
            minWidth: 300,
            minHeight: 200,
	    scope: this,
            //layout: 'border',
            plain:true,
            bodyStyle:'padding:5px;',
            buttonAlign:'right',
            items: [imagesGrid],
            buttons:[{
                text: 'Close',
                handler:function(){
                    window.close();
                }
            }]
	    
        });
	
        window.show.defer(200, window);
    }
    
    function onRender() {
        if (!Ext.isSafari2) {
            this.editor.tb.insertButton(
		17, new Ext.Toolbar.Button({
                    itemId : 'htmlEditorImage',
                    cls : 'z-btn-icon z-widgets-insertimage',
                    enableToggle: false,
                    scope: this,
                    handler:function() {this.imageInsert();},
                    clickEvent: 'mousedown',
		    tooltip: 'Insert image',
                    tabIndex: -1
		})
	    );
        }
    }

    function showImages() {
        var images = new Ext.data.Store({
            proxy: new Ext.data.HttpProxy({
                url: 'getImages.php',
                method: 'POST'
            }),

            reader:  new Ext.data.JsonReader({
		totalProperty: 'total',
		root: 'data',
		id: 'id',
		fields: ['id','name','caption','ext','fullname']
	    })
	});
        images.load();

        var imagesGrid = new Ext.grid.GridPanel({
            store: images, // use the datasource
	    
	    cm: new Ext.grid.ColumnModel([
        	{id: 'fullname',
		 header: "Picture",  
		 sortable: true,
		 dataIndex: 'fullname',
		 width:50,
		 renderer: renderImages},
		{id: 'name',
		 header: "Name",
		 sortable: true,
		 dataIndex: 'name'},
		{id: 'caption',
		 header: "Caption",
		 sortable: true,
		 dataIndex: 'caption'}
            ]),
        	
            viewConfig: {
        	forceFit:true
            },
        	
            //plugins: expander,
            collapsible: true,
            animCollapse: false,
            height:300,
            width:600,
            stripeRows:true,
            title:'Images',
            iconCls:'icon-grid',
            autoScroll: true
	});
        
        imagesGrid.on("rowclick", function (imagesGrid, row, e) {
            var record = imagesGrid.getStore ().getAt (row);
            
            var id = record.get ("id");
            var name = record.get ("name");
            var ext = record.get ("ext");
	    var fullname = record.get ("fullname");

	    if (Ext.isIE)
		range.select();
	    this.editor.relayCmd('insertimage', fullname);

	    window.close();
        });

        var window = new Ext.Window({
            title: '',
            width: 600,
            height:400,
            minWidth: 300,
            minHeight: 200,
            //layout: 'border',
            plain:true,
            bodyStyle:'padding:5px;',
            buttonAlign:'right',
            items: [imagesGrid],
            buttons:[{
                text: 'Close',
                handler:function(){
                    window.close();
                }
            }]
        });

        return window;
    }

    function renderImages(fullname) {
	return '<img src=articleImages/'+fullname+' height=100 width=100>';
    }

}
