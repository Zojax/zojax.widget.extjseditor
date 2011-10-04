Ext.namespace('Ext.ux.Toolbar');

Ext.ux.Toolbar.LoadingIndicator = Ext.extend(Ext.Toolbar.Spacer, {
  constructor: function(config){
	  Ext.ux.Toolbar.LoadingIndicator.superclass.constructor.call(this, Ext.isString(config) ? {text: config} : config);
	  // call Ext.Toolbar.Spacer constructor
	  Ext.ux.Toolbar.LoadingIndicator.superclass.constructor.call(this);
	  // set id to 'indicator'
	  this.id = config.id ||'indicator';
	  this.ctCls = config.ctCls || "x-tbar-loading";
  },

  onRender : function(ct, position){
      this.el = ct.createChild({tag:'div', id:this.id, cls:this.ctCls, style: this.width?'width:'+this.width+'px':''}, position);
  }
});

// register Ext.ux.Toolbar.LoadingIndicator as a new component

Ext.reg('tbindicator', Ext.ux.Toolbar.LoadingIndicator);