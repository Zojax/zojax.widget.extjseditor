Ext.ns('Ext.ux.form.HtmlEditor');

Ext.ux.form.HtmlEditor.HR = Ext.extend(Ext.util.Observable, {

    init: function(cmp) {
        this.cmp = cmp;
        var changeFont = function(combo) {
            font_size = combo.getValue();
            selection = this.getWin().getSelection().getRangeAt(0);
            if (selection==null || selection=='')
                return false;
            //get selection content
            content = selection.extractContents();
            //create span and wrap it around selection
            fontEl = document.createElement ("span");
            fontEl.style.fontSize=font_size+'px';
            fontEl.appendChild(content);
            mod_text = fontEl.outerHTML;
            old_text=fontEl.innerHTML;
            selection.insertNode(fontEl);

        }
        // create the combo instance
        this.combo = new Ext.form.ComboBox({
            typeAhead: true,
            enableKeyEvents: true,
            triggerAction: 'all',
            lazyRender: true,
            mode: 'local',
            store: [8, 10, 12, 14, 16, 18, 20, 24, 26, 28, 32, 36, 40, 48],
            width: 50,
            listeners: {
                scope: cmp,
                'select': changeFont,
                'keypress': changeFont

            }

        });
        this.cmp.on('render', this.onRender, this);
    },
    onRender: function() {
        this.cmp.getToolbar().add(this.combo);
    }

});







