Ext.ns('Ext.ux.form.HtmlEditor');

Ext.ux.form.HtmlEditor.HR = Ext.extend(Ext.util.Observable, {

    init:function (cmp) {
        this.cmp = cmp;
        var changeFont = function (combo) {
            var font_size = combo.getValue();
            var selection = this.getWin().getSelection();
            if (selection.rangeCount > 0) {
                var range = selection.getRangeAt(0);
                var content = range.extractContents();
                var fontEl = this.getWin().document.createElement("span");
                fontEl.style.fontSize = font_size + 'px';
                fontEl.setAttribute("class", "font_size");
                fontEl.appendChild(content);
                range.insertNode(fontEl);
                if (fontEl.parentNode.nodeName == "SPAN" && fontEl.parentNode.getAttribute("class") == "font_size") {
                    fontEl.parentNode.parentNode.replaceChild(fontEl, fontEl.parentNode)
                }
                selection.selectAllChildren(fontEl);
            }
        };
        // create the combo instance
        this.combo = new Ext.form.ComboBox({
            typeAhead:true,
            enableKeyEvents:true,
            triggerAction:'all',
            lazyRender:true,
            mode:'local',
            store:[8, 10, 12, 14, 16, 18, 20, 24, 26, 28, 32, 36, 40, 48],
            width:50,
            listeners:{
                scope:cmp,
                'select':changeFont,
                'keypress':changeFont

            }

        });
        this.cmp.on('render', this.onRender, this);
    },
    onRender:function () {
        this.cmp.getToolbar().add(this.combo);
    }

});






