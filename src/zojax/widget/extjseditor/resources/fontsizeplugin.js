(function(a){a.extend(a.fn,{livequery:function(e,d,c){var b=this,f;if(a.isFunction(e)){c=d,d=e,e=undefined}a.each(a.livequery.queries,function(g,h){if(b.selector==h.selector&&b.context==h.context&&e==h.type&&(!d||d.$lqguid==h.fn.$lqguid)&&(!c||c.$lqguid==h.fn2.$lqguid)){return(f=h)&&false}});f=f||new a.livequery(this.selector,this.context,e,d,c);f.stopped=false;f.run();return this},expire:function(e,d,c){var b=this;if(a.isFunction(e)){c=d,d=e,e=undefined}a.each(a.livequery.queries,function(f,g){if(b.selector==g.selector&&b.context==g.context&&(!e||e==g.type)&&(!d||d.$lqguid==g.fn.$lqguid)&&(!c||c.$lqguid==g.fn2.$lqguid)&&!this.stopped){a.livequery.stop(g.id)}});return this}});a.livequery=function(b,d,f,e,c){this.selector=b;this.context=d;this.type=f;this.fn=e;this.fn2=c;this.elements=[];this.stopped=false;this.id=a.livequery.queries.push(this)-1;e.$lqguid=e.$lqguid||a.livequery.guid++;if(c){c.$lqguid=c.$lqguid||a.livequery.guid++}return this};a.livequery.prototype={stop:function(){var b=this;if(this.type){this.elements.unbind(this.type,this.fn)}else{if(this.fn2){this.elements.each(function(c,d){b.fn2.apply(d)})}}this.elements=[];this.stopped=true},run:function(){if(this.stopped){return}var d=this;var e=this.elements,c=a(this.selector,this.context),b=c.not(e);this.elements=c;if(this.type){b.bind(this.type,this.fn);if(e.length>0){a.each(e,function(f,g){if(a.inArray(g,c)<0){a.event.remove(g,d.type,d.fn)}})}}else{b.each(function(){d.fn.apply(this)});if(this.fn2&&e.length>0){a.each(e,function(f,g){if(a.inArray(g,c)<0){d.fn2.apply(g)}})}}}};a.extend(a.livequery,{guid:0,queries:[],queue:[],running:false,timeout:null,checkQueue:function(){if(a.livequery.running&&a.livequery.queue.length){var b=a.livequery.queue.length;while(b--){a.livequery.queries[a.livequery.queue.shift()].run()}}},pause:function(){a.livequery.running=false},play:function(){a.livequery.running=true;a.livequery.run()},registerPlugin:function(){a.each(arguments,function(c,d){if(!a.fn[d]){return}var b=a.fn[d];a.fn[d]=function(){var e=b.apply(this,arguments);a.livequery.run();return e}})},run:function(b){if(b!=undefined){if(a.inArray(b,a.livequery.queue)<0){a.livequery.queue.push(b)}}else{a.each(a.livequery.queries,function(c){if(a.inArray(c,a.livequery.queue)<0){a.livequery.queue.push(c)}})}if(a.livequery.timeout){clearTimeout(a.livequery.timeout)}a.livequery.timeout=setTimeout(a.livequery.checkQueue,20)},stop:function(b){if(b!=undefined){a.livequery.queries[b].stop()}else{a.each(a.livequery.queries,function(c){a.livequery.queries[c].stop()})}}});a.livequery.registerPlugin("append","prepend","after","before","wrap","attr","removeAttr","addClass","removeClass","toggleClass","empty","remove","html");a(function(){a.livequery.play()})})(jQuery);
Ext.ns('Ext.ux.form.HtmlEditor');
var saved_range = null;
var saved_selection = null;
window.onload = function () {
    $('iframe').livequery(function () {
        body = $(this).contents().find('body');
        $(body).mouseup(function () {
            doc = $('iframe').contents()[0];
            saved_range = doc.selection.createRange();
            if (saved_range.text) {
                saved_selection = saved_range.text;
            }
            else {
                saved_selection = null;
            }
        });
    })
};
Ext.ux.form.HtmlEditor.HR = Ext.extend(Ext.util.Observable, {
    init:function (cmp) {
        this.cmp = cmp;
        var changeFont = function (combo) {
            var font_size = combo.getValue();
            var fontEl = this.getWin().document.createElement("span");
            fontEl.style.fontSize = font_size + 'px';
            fontEl.setAttribute("class", "font_size");
            if (Ext.isIE) {
                //Internet Explorer logic
                if (saved_selection) {
                    fontEl.innerHTML = saved_selection;
                    var html = fontEl.outerHTML;
                    setTimeout(function () {
                        saved_range.text = "";
                        saved_range.pasteHTML(html);
                    }, 100);

                }

            } else {
                //opera, ff, chrome logic
                var selection = this.getWin().getSelection();
                var text = selection.toString();
                if (selection.rangeCount > 0) {
                    var range = selection.getRangeAt(0);
                    var content = range.extractContents();

                    fontEl.innerHTML = text;
                    range.insertNode(fontEl);
                    selection.selectAllChildren(fontEl);
                }
            }
        };
        var saveSelection = function (area) {
            alert('area is alive!!!');
            var range = document.selection.createRange();
            alert(range.text)
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
                select:changeFont
            }

        });
        this.cmp.on('render', this.onRender, this);
    },
    onRender:function () {
        this.cmp.getToolbar().add(this.combo);
    }

});