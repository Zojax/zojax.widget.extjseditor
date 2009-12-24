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
import re
from zope import component, interface
from zope.component import getUtility
from zope.proxy import removeAllProxies
from zope.security.management import queryInteraction
from zope.app.intid.interfaces import IIntIds
from zope.copypastemove.interfaces import IObjectCopier

from zojax.richtext.interfaces import IRichTextDataModified
from zojax.richtext.interfaces import IContentEditorPreference
from zojax.content.attachment.interfaces import IAttachmentsAware
from zojax.content.attachment.interfaces import IAttachmentsExtension


splitText = re.compile('(src="@@content.attachment/[-0-9]+")')

@component.adapter(IAttachmentsAware, IRichTextDataModified)
def CopyAttachments(object, obevent):
    request = getRequest()
    if request is None:
        return

    if IContentEditorPreference(request.principal).editor != 'extjs':
        return

    data = obevent.data
    if data.format != 'zope.source.html':
        return

    ids = getUtility(IIntIds)
    if ids.queryId(object) is None:
        return

    res = splitText.split(data.text)
    if len(res) <= 1:
        return

    extension = IAttachmentsExtension(object)

    for idx in range(1, len(res)-1, 2):
        try:
            content = ids.queryObject(int(res[idx][26:-1]))
            if content is None:
                continue
        except:
            continue

        if content is \
                removeAllProxies(extension.get(content.__name__)):
            continue

        copier = IObjectCopier(content)
        newName = copier.copyTo(extension)
        newContent = extension[newName]

        res[idx] = '%s%s"'%(res[idx][:26], ids.queryId(newContent))

    data.text = u''.join(res)


def getRequest():
    interaction = queryInteraction()
    if interaction is None:
        return

    for part in interaction.participations:
        if part is not None:
            return part
