// Ext.ux.FileUploadButton
// extension of Ext.Button to act as a substitute for the text box and
// browse button of the file upload object, i.e. <input type="file">.
// this is a modified version of Ext.ux.BrowseButton class created
// by JamesC, see http://extjs.com/forum/showthread.php?t=28489
Ext.ux.FileUploadButton = Ext.extend(Ext.Button, {

  // default button text
	text: "Browse",

  // overrides Ext.Button.onRender
  onRender: function(ct, position) {
    
    // call Ext.Button.onRender
    Ext.ux.FileUploadButton.superclass.onRender.call(this, ct, position);

    // wrap button
    var btnCt = this.el.wrap({
      tag: "div",
      style: "position:absolute; right:0;"
    });

    // calculate width of button (as IE reports this.el.getWidth incorrectly)
    var width = btnCt.child("td.x-btn-left").getWidth() +
      btnCt.child("button.x-btn-text").getWidth() +
      btnCt.child("td.x-btn-center").getPadding("lr") +
      btnCt.child("td.x-btn-right").getWidth();

    // wrap button container in a root container
    // this root container will also wrap the file upload container
    var rootCt = btnCt.wrap({
      tag: "div",
      style: "position:relative; height:21px; overflow:hidden; width:" +
        width + "px;"
    });

    // create the file upload container and put it in the root container.
    // this will appear in front of the button container but since it is
    // transparent the button will be seen through it
    this.fileCt = Ext.DomHelper.append(rootCt, {
      tag: "div",
      style: "position:absolute; opacity:0.0; -moz-opacity:0.0;" +
        " filter:alpha(opacity=0); right:0; height:21px;"
    }, true);

    // create the file upload object
    this.createFileUpload();
  },

  // create the file upload object
  createFileUpload: function() {

    // create the file upload object and put it in the file upload container
    this.fileUpload = Ext.DomHelper.append(this.fileCt, {
      tag: "input",
      name: "image",
      type: "file",
      size: 1,
      style: "top:0; height:21px; font-size:14px; cursor:pointer;" +
        " -moz-user-focus:ignore; border:0px none transparent; overflow:hidden;"
    }, true);

    // register the button tooltip with the file upload object.
    // this needs to be done as the file upload object is in front
    // of the button and will capture all mouse events
    if (this.tooltip) {
      Ext.QuickTips.register({
        target: this.fileUpload,
        text: this.tooltip
      });
    }

    // if mouse is over the transparent file upload object then
    // simulate the mouse being over the button
    this.fileUpload.on("mouseover", function() {
      if (!this.disabled) {
        this.el.addClass("x-btn-over");
      }
    }, this);

    // if mouse leaves the transparent file upload object then
    // simulate the mouse leaving the button
    this.fileUpload.on("mouseout", function() {
      this.el.removeClass("x-btn-over");
    }, this);

    // if mouse button is pressed while over the transparent file
    // upload object then simulate the mouse button being pressed
    // over the button
    this.fileUpload.on("mousedown", this.onMouseDown, this);

    // if user clicks on the transparent file upload object then
    // simulate clicking on the button
    this.fileUpload.on("click", function(e) {
      e.stopPropagation();
    });

    // if user selects a file in the file upload dialog box and
    // clicks the Open button then run the button's click handler.
    // also remove the old file upload object and create a fresh one
    this.fileUpload.on("change", function() {
      this.handler(this.fileUpload);
      this.fileUpload.remove();
      this.createFileUpload();
    }, this);
  }
});

// register Ext.ux.FileUploadButton as a new component
Ext.reg('fileuploadbutton', Ext.ux.FileUploadButton);
