##############################################################################
#
# Copyright (c) 2009 Zope Foundation and Contributors.
# All Rights Reserved.
#
# This software is subject to the provisions of the Zope Public License,
# Version 2.1 (ZPL).  A copy of the ZPL should accompany this distribution.
# THIS SOFTWARE IS PROVIDED "AS IS" AND ANY AND ALL EXPRESS OR IMPLIED
# WARRANTIES ARE DISCLAIMED, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
# WARRANTIES OF TITLE, MERCHANTABILITY, AGAINST INFRINGEMENT, AND FITNESS
# FOR A PARTICULAR PURPOSE.
#
##############################################################################
"""

$Id$
"""
import simplejson
from zope import interface
from zope.proxy import removeAllProxies
from zope.security import checkPermission
from zope.component import getUtility
from zope.app.component.hooks import getSite
from zope.app.intid.interfaces import IIntIds
from zope.traversing.browser import absoluteURL

from z3c.form import interfaces, converter
from z3c.form.browser import textarea

from zojax.personal.space.interfaces import IPersonalSpace
from zojax.resourcepackage.library import include, includeInplaceSource

from zojax.richtext.field import RichTextData
from zojax.richtext.interfaces import IRichTextData
from zojax.richtext.interfaces import IRichTextWidget, IRichTextWidgetFactory

from interfaces import IExtJsEditor

jssource = """<script type="text/javascript">
Ext.EventManager.onDocumentReady(function(){
   Ext.QuickTips.init();
    var htmlEditor = new Ext.ux.HTMLEditor({
       width: %(width)s, height: %(height)s, applyTo: '%(id)s',
       enableLinks: false,
       plugins: [new Ext.ux.HTMLEditorLink(%(linkConfig)s),
       new Ext.ux.HTMLEditorImage('%(url1)s', '%(url2)s'),
       new Ext.ux.HTMLEditorMedia(%(mediaConfig)s)]})
    });
</script>"""


class ExtJSEditorWidget(textarea.TextAreaWidget):
    interface.implements(IRichTextWidget)

    style_width = 600
    style_height = 300

    klass = 'widget-extjs-richtext'

    def render(self):
        if self.mode == interfaces.DISPLAY_MODE:
            if IRichTextData.providedBy(self.value):
                self.value = removeAllProxies(self.value).cooked
            return super(ExtJSEditorWidget, self).render()

        if IRichTextData.providedBy(self.value):
            value = removeAllProxies(self.value).text
        else:
            value = unicode(self.value)

        url1 = ''
        url2 = ''
        mediaUrl1 = ''
        mediaUrl2 = ''
        contentUrl = ''
        site = getSite()
        ids = getUtility(IIntIds)
        siteUrl = absoluteURL(site, self.request)

        contextId = ids.queryId(removeAllProxies(self.context))
        if contextId and checkPermission('zojax.AddContentAttachment', self.context):
            url1 = '%s/@@content.attachments/%s/imageManagerAPI/'%(siteUrl, contextId)
            mediaUrl1 = '%s/@@content.attachments/%s/mediaManagerAPI/'%(siteUrl, contextId)

        space = IPersonalSpace(self.request.principal, None)
        if space is not None and    checkPermission('zojax.AddContentAttachment', space):
            url2 = '%s/@@content.attachments/%s/imageManagerAPI/'%(
                siteUrl, ids.getId(space))
            mediaUrl2 = '%s/@@content.attachments/%s/mediaManagerAPI/'%(
                siteUrl, ids.getId(space))
        if contextId:
            contentUrl = '%s/@@content.browser/%s/contentManagerAPI/'%(siteUrl, contextId)
        configlet = getUtility(IExtJsEditor)
        includeInplaceSource('<script type="text/javascript" src="http://apis.kaltura.org/kalturaJsClient/kaltura.min.js.php"></script>', ('extjs-widgets',))
        includeInplaceSource(jssource%{
                'id': self.id,
                'width': repr(self.style_width),
                'height': repr(self.style_height),
                'url1': url1,
                'url2': url2,
                'mediaConfig': simplejson.dumps(dict(mediaUrl1=mediaUrl1,
                                                     mediaUrl2=mediaUrl2,
                                                     mediaAPIUrl=configlet.mediaAPIURL,
                                                     kaltura=dict(partnerId=configlet.kalturaPartnerId,
                                                                  userSecret=configlet.kalturaUserSecret,
                                                                  adminSecret=configlet.kalturaAdminSecret,
                                                                  serviceUrl=configlet.kalturaServiceUrl,
                                                                  serviceBase=configlet.kalturaServiceBase,
                                                                  userId=configlet.kalturaUserId)
                                                     )),
                'linkConfig': simplejson.dumps(dict(contentUrl=contentUrl)),
                }, ('extjs-widgets',))

        html = """<div><textarea id="%(id)s" name="%(name)s" class="%(klass)s"
style="height: %(height)spx; width: %(width)spx">%(value)s</textarea></div>"""%{
            'id': self.id,
            'name': self.name,
            'value': value.strip(),
            'klass': self.klass,
            'width': repr(self.style_width),
            'height': repr(self.style_height),
            }

        return html

    def extract(self, default=interfaces.NOVALUE):
        textarea = self.request.get(self.name, default)

        if textarea is default:
            return default

        textarea = textarea.strip()
        if textarea == '<br>':
            textarea = u''

        return RichTextData(textarea.strip(), u'zope.source.html')


class ExtjsWidgetFactory(object):
    interface.implements(IRichTextWidgetFactory)

    title = u'ExtJS editor'

    def __call__(self, request):
        return ExtJSEditorWidget(request)
