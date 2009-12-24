Ext.namespace('Ext.ux.Toolbar');

// Ext.ux.Toolbar.LoadingIndicator
Ext.ux.Toolbar.LoadingIndicator = function() {
  
  // call Ext.Toolbar.Spacer constructor
  Ext.ux.Toolbar.LoadingIndicator.superclass.constructor.call(this);

  // set id to 'indicator'
  this.el.id = 'indicator';
  this.id = this.el.id;

  // change className to loading indicator
  this.el.className = "x-tbar-loading";
}

// Ext.ux.Toolbar.LoadingIndicator
// extension of Ext.Toolbar.Spacer
Ext.extend(Ext.ux.Toolbar.LoadingIndicator, Ext.Toolbar.Spacer, {});

// register Ext.ux.Toolbar.LoadingIndicator as a new component
Ext.ComponentMgr.registerType('tbindicator', Ext.ux.Toolbar.LoadingIndicator);
