// Ext.ux.HTMLEditorImage
// a plugin to handle images in the Ext.ux.HtmlEditor
Ext.ux.HTMLEditorImage = function(url1, url2, imgmax, autoUpload) {

    // pointer to Ext.ux.HTMLEditor
    var editor;

    // base urls
    var baseUrl1 = url1;
    var baseUrl2 = url2;

    // pointer to Ext.Window
    var win;

    // pointer to Ext.FormPanel
    var imageUrl;

    // pointer to Ext.ux.ImageBrowser
    var imageBrowserSite;
    var imageBrowserDocument;

    // other private variables
    var constrained = false;
    var originalWidth = 0;
    var originalHeight = 0;
    var activateOrgButton = false;
    var noPreview = false;

    // return the selected image (if an image is selected)
    var getSelectedImage = function () {
        if (Ext.isIE) {
            // ie specific code
            return function () {
                var doc = editor.getDoc();
                var selection = doc.selection;
                if (selection.type == "Control") {
                    var element = selection.createRange()(0);
                    if (element.nodeName.toLowerCase() == 'img') {
                        return element;
                    }
                }
                return null;
            }
        } else {
            // firefox specific code
            return function () {
                var selection = editor.win.getSelection();
                if (selection.focusOffset == selection.anchorOffset + 1) {
                    var element = selection.focusNode.childNodes[selection.focusOffset - 1];
                    if (element.nodeName.toLowerCase() == 'img') {
                        return element;
                    }
                }
                return null;
            }
        }
    }();

    // set image details to data passed from image browser
    var setImageDetails = function (data, insert) {
        // check maximum dimensions exceeding
        var width = data.width > imgmax.width ? imgmax.width : data.width;
        var height = data.height > imgmax.height ? imgmax.height : data.height;

        if (data.width < imgmax.width && data.height < imgmax.height)
            imageUrl.form.findField('disableEnlarging').setValue(true);
        else
            imageUrl.form.findField('disableEnlarging').setValue(false);

        imageUrl.form.findField('src').setValue(data.url);
        imageUrl.form.findField('alt').setValue(data.title);
        imageUrl.form.findField('width').setValue(width);
        imageUrl.form.findField('height').setValue(height);
        imageUrl.form.findField('constrain').setValue(true);
        sourceChanged();

        if (insert) {
            win.hide();
            insertImage();
        }
    };

    // create new image node from image details
    var createImage = function () {

        var element = editor.win.document.createElement("img");
        var thumbPath = '/preview/' + imageUrl.form.findField('width').getValue() +
                          'x' + imageUrl.form.findField('height').getValue();
        if (noPreview) {
            element.src = imageUrl.form.findField('src').getValue();
        } else {
            element.src = imageUrl.form.findField('src').getValue() + thumbPath;
        }

        element.alt = imageUrl.form.findField('alt').getValue();
        //element.style.width = imageUrl.form.findField('width').getValue() + "px";
        //element.style.height = imageUrl.form.findField('height').getValue() + "px";

        return element;
    }

    // create new image with lightbox
    var createLightbox = function () {
        var thumbTemplate = new Ext.XTemplate(
            '<tpl>',
            '<a href="{path}" title="{alt}" target="_blank" rel="prettyPhoto[pp_gal]">',
            '<img alt="{alt}" src="{path}/preview/{width}x{height}">',
            '</a>',
            '</tpl>');
        thumbTemplate.compile();
        var element = editor.win.document.createElement("span");
        element.innerHTML = thumbTemplate.apply({
            'path': imageUrl.form.findField('src').getValue(),
            'alt': imageUrl.form.findField('alt').getValue(),
            'width': imageUrl.form.findField('width').getValue(),
            'height': imageUrl.form.findField('height').getValue()
        });
        return element;
    }

    // create new image with lightbox
    var selectImageInsert = function () {
        if (noPreview)
            return createImage();

        if (imageUrl.form.findField('disableEnlarging').getValue())
            return createImage();
        else
            return createLightbox();
    }

    // insert the image into the editor (browser-specific)
    var insertImageByBrowser = function () {
        if (Ext.isIE) {
            // ie-specific code
            return function () {
                // get selected text/range
                var doc = editor.getDoc();
                var selection = doc.selection;
                var range = selection.createRange();

                // insert the image over the selected text/range
                range.pasteHTML(selectImageInsert().outerHTML);
            };
        } else {
            // firefox-specific code
            return function () {
                // get selected text/range
                var selection = editor.win.getSelection();

                // delete selected text/range
                if (!selection.isCollapsed) {
                    selection.deleteFromDocument();
                }

                // insert the image
                selection.getRangeAt(0).insertNode(selectImageInsert());
            };
        }
    }();

    // insert the image into the editor
    var insertImage = function () {
        // focus on the editor to regain selection
        editor.win.focus();

        // insert the image
        insertImageByBrowser();

        // perform required toolbar operations
        editor.updateToolbar();
        editor.deferFocus();
    };

    // enable insert button when image source has been entered
    var sourceChanged = function () {
        var disabled = (imageUrl.form.findField('src').getValue() == "");
        Ext.getCmp('insert-btn').setDisabled(disabled);

        if (activateOrgButton) {
            Ext.getCmp('insert-original-btn').setDisabled(disabled);
        }
    };

    var activateButton = function () {
        activateOrgButton = true;
        ChangeButton();
    };

    var deactivateButton = function () {
        activateOrgButton = false;
        ChangeButton();
    };

    var ChangeButton = function () {
        Ext.getCmp('insert-original-btn').setVisible(activateOrgButton);
    };

    // if constraining size ratio then adjust height if width changed
    var widthChanged = function () {
        if (constrained) {
            imageUrl.form.findField('height').setValue(
            Math.round(imageUrl.form.findField('width').getValue() / originalWidth * originalHeight));
        }
    };

    // if constraining size ratio then adjust width if height changed
    var heightChanged = function () {
        if (constrained) {
            imageUrl.form.findField('width').setValue(
            Math.round(imageUrl.form.findField('height').getValue() / originalHeight * originalWidth));
        }
    };

    // record original image size when constrain is checked
    var constrain = function (checkbox, checked) {
        constrained = checked;
        if (constrained) {
            originalWidth = imageUrl.form.findField('width').getValue();
            originalHeight = imageUrl.form.findField('height').getValue();
            if (!originalWidth || !originalHeight) {
                checkbox.setValue(false);
            }
        }
    };

    // open/show the image details window
    var openImageWindow = function () {

        if (!win) {
            // create Ext.FormPanel if not previously created
            imageUrl = new Ext.FormPanel({
                title: 'Insert url',
                frame: false,
                header: false,
                border: false,
                autoScroll: true,
                listeners: {activate: deactivateButton},
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
                            'change': {
                                fn: sourceChanged,
                                scope: this
                            }
                        }
                    }, {
                        xtype: 'textfield',
                        fieldLabel: 'Description',
                        name: 'alt'
                    }, {
                        xtype: 'textfield',
                        fieldLabel: 'Title',
                        name: 'title'
                    }, {
                        layout: "column",
                        autoWidth: true,
                        border: false,
                        defaults: {
                            layout: 'form',
                            border: false
                        },
                        hideLabel: true,
                        items: [{
                            items: [{
                                xtype: "numberfield",
                                fieldLabel: 'Dimensions',
                                name: 'width',
                                width: 50,
                                allowDecimals: false,
                                allowNegative: false,
                                listeners: {
                                    'change': {
                                        fn: widthChanged,
                                        scope: this
                                    }
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
                                width: 50,
                                allowDecimals: false,
                                allowNegative: false,
                                listeners: {
                                    'change': {
                                        fn: heightChanged,
                                        scope: this
                                    }
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
                        fieldLabel: "Disable Enlarging",
                        name: 'disableEnlarging',
                        checked: false
                    }, {
                        xtype: "checkbox",
                        fieldLabel: "Constrain Proportions",
                        name: 'constrain',
                        checked: false,
                        listeners: {
                            'check': {
                                fn: constrain,
                                scope: this
                            }
                        }
                    }]
                }
            });

            if (baseUrl2) {
                imageBrowserSite = new Ext.ux.ImageBrowser({
                    frame: false,
                    border: false,
                    autoWidth: true,
                    title: 'My images',

                    // images api
                    listURL: baseUrl2 + 'listing',
                    uploadURL: baseUrl2 + 'upload',
                    deleteURL: baseUrl2 + 'remove',
                    autoUpload: autoUpload,

                    listeners: {activate: activateButton},

                    // set the callback from the image browser
                    callback: setImageDetails
                });
            }

            if (baseUrl1) {
                imageBrowserDocument = new Ext.ux.ImageBrowser({
                    frame: false,
                    border: false,
                    autoWidth: true,
                    title: 'Document images',

                    // images api
                    listURL: baseUrl1 + 'listing',
                    uploadURL: baseUrl1 + 'upload',
                    deleteURL: baseUrl1 + 'remove',

                    listeners: {activate: activateButton},

                    // set the callback from the image browser
                    callback: setImageDetails
                });
            }

            var items = [];
            if (imageBrowserSite) {
                items[items.length] = imageBrowserSite;
            }
            if (imageBrowserDocument) {
                items[items.length] = imageBrowserDocument;
            }
            items[items.length] = imageUrl;

            var tabs = new Ext.TabPanel({
                margins: '3 3 3 0',
                activeTab: 0,
                layoutOnTabChange: true,
                items: items
            });

            // create Ext.Window if not previously created
            win = new Ext.Window({
                title: 'Insert/Edit Image',
                closable: true,
                modal: true,
                closeAction: 'hide',
                width: 500,
                height: 350,
                plain: true,
                layout: 'fit',
                border: false,
                items: tabs,
                buttons: [{
                    text: 'Insert Original',
                    id: 'insert-original-btn',
                    disabled: true,
                    hidden: true,
                    handler: function () {
                        win.hide();
                        noPreview = true;
                        insertImage();
                    }
                }, {
                    text: 'Insert',
                    id: 'insert-btn',
                    disabled: true,
                    handler: function () {
                        win.hide();
                        noPreview = false;
                        insertImage();
                    }
                }, {
                    text: 'Close',
                    handler: function () {
                        win.hide();
                    }
                }],
                listeners: {
                    'show': function () {
                        imageUrl.show();
                        imageUrl.form.reset();
                        var element = getSelectedImage();
                        if (element) {
                            // still working on this!!!
                            // need to fix image source as it is changed
                            // from a relative url to an absolute url
                            imageUrl.form.findField('src').setValue(element.src);
                            imageUrl.form.findField('alt').setValue(element.alt);
                            imageUrl.form.findField('width').setValue(element.style.width);
                            imageUrl.form.findField('height').setValue(element.style.height);
                            imageUrl.form.findField('constrain').setValue(true);
                        }
                        if (imageBrowserDocument) {
                            imageBrowserDocument.show();
                        }
                        if (imageBrowserSite) {
                            imageBrowserSite.show();
                        }
                    }
                }
            });
        }

        // show the window
        win.show(this);
    }

    // PUBLIC
    return {
        init: function (htmlEditor) {
            editor = htmlEditor;

            var onsync = function (editor, html) {
                var base = document.getElementsByTagName('HEAD')[0].getAttribute('base') + '@@content.attachment/';
                html = html.replace(base, '@@content.attachment/');
                base = document.getElementsByTagName('HEAD')[0].getAttribute('base').replace(/(.+)\/.+\/$/, '$1/') + '@@content.attachment/';
                html = html.replace(base, '@@content.attachment/');
                this.el.dom.value = html
            }
            editor.on('sync', onsync);
            editor.on('render', this.onRender, this);
        },
        onRender: function () {
            // append the insert image icon to the toolbar
            var btn = editor.getToolbar().addButton({
                itemId: 'image',
                cls: 'x-btn-icon x-edit-image',
                handler: openImageWindow,
                scope: this,
                clickEvent: 'mousedown',
                tooltip: {
                    title: 'Image',
                    text: 'Insert/edit an image.',
                    cls: 'x-html-editor-tip'
                }
            });
        }
    }
}
