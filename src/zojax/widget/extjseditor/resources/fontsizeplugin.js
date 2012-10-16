Ext.ns('Ext.ux.form.HtmlEditor');
var saved_selection = null;
var saveSelection, restoreSelection;
//var textarea1=document.getElementById('content-widgets-text');

if (window.getSelection) {
    // IE 9 and non-IE
    saveSelection = function (win) {
        var sel = win.getSelection(), ranges = [];
        if (sel.rangeCount) {
            for (var i = 0, len = sel.rangeCount; i < len; ++i) {
                ranges.push(sel.getRangeAt(i));
            }
        }

        saved_selection = ranges;
        return ranges;
    };

    restoreSelection = function (win, savedSelection) {
        var sel = win.getSelection();
        sel.removeAllRanges();
        for (var i = 0, len = savedSelection.length; i < len; ++i) {
            sel.addRange(savedSelection[i]);
        }
    };
} else if (document.selection && document.selection.createRange) {
    // IE <= 8
    saveSelection = function (win) {
        var sel = win.document.selection;
        saved_selection = (sel.type != "None") ? sel.createRange() : null;
        return saved_selection

    };

    restoreSelection = function (win, savedSelection) {
        if (savedSelection) {
            savedSelection.select();
        }
    };
}
function getSelectionText() {
    var text = restoreSelection(this.getWin(), saved_selection);
    return text;

}
function getSelText() {
    var txt = '';
    if (window.getSelection) {
        txt = window.getSelection();
    }
    else if (document.getSelection) {
        txt = document.getSelection();
    }
    else if (document.selection) {
        txt = document.selection.createRange().text;
    }
    else return;
    return txt;
}
Ext.ux.form.HtmlEditor.HR = Ext.extend(Ext.util.Observable, {

    init:function (cmp) {

        this.cmp = cmp;
        var changeFont = function (combo) {
            var font_size = combo.getValue();
            var selection = this.getWin().getSelection();
            if (Ext.isIE) {//Internet Explorer logic
                //range = document.selection.createRange();
                //alert(range.text) //nothing..
            } else { //opera, ff, chrome logic
                var text = selection.toString();
                if (selection.rangeCount > 0) {
                    var range = selection.getRangeAt(0);
                    var content = range.extractContents();
                    var fontEl = this.getWin().document.createElement("span");
                    fontEl.style.fontSize = font_size + 'px';
                    fontEl.setAttribute("class", "font_size");
                    fontEl.innerHTML = text;
                    range.insertNode(fontEl);
                    selection.selectAllChildren(fontEl);
                }
            }
        };
        // create the combo instance
        this.combo = new Ext.form.ComboBox({
            typeAhead:true,
            enableKeyEvents:false,
            triggerAction:'all',
            lazyRender:true,
            mode:'local',
            store:[8, 10, 12, 14, 16, 18, 20, 24, 26, 28, 32, 36, 40, 48, 54, 60, 72],
            width:50,
            listeners:{
                scope:cmp,
                'select':changeFont
            }

        });
        this.cmp.on('render', this.onRender, this);
    },
    onRender:function () {
        this.cmp.getToolbar().add(this.combo);
    }

});